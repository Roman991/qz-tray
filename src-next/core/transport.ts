// WebSocket transport for one client instance. This is a faithful port of the
// legacy `_qz.websocket` + `qz.websocket` protocol logic, but every reference
// to the global singleton is replaced by the injected `ctx` and `security`.

import type { Context, ConnectConfig, QzConnection, WsMessage, PromiseHandlers } from './context.js';
import type { Security } from './security.js';
import type { ConnectOptions } from '../types.js';
import { isActive } from './state.js';
import { compatAlgorithm } from './compatible.js';
import { STREAMS, dispatch } from '../internal/streams.js';
import { appendSurf, isQualified, newUID, stringify } from '../internal/util.js';

export interface Transport {
    isActive(): boolean;
    connect(options?: ConnectOptions): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionInfo(): { socket: string; host: string; port: number } | undefined;
    setErrorCallbacks(calls: Context['errorCallbacks']): void;
    setClosedCallbacks(calls: Context['closedCallbacks']): void;
    setUsingSurf(usingSurf: boolean): void;
    setSurfDomain(domain: string): void;
    /** Send an API call and resolve with its response. */
    dataPromise<T = unknown>(call: string, params?: unknown, signature?: string, timestamp?: number): Promise<T>;
}

export function createTransport(ctx: Context, security: Security): Transport {
    function webSocketPromise(address: string): Promise<QzConnection> {
        let ws: QzConnection;
        let onOpen: () => void;
        let onError: (e: Event) => void;
        return ctx
            .promise<QzConnection>((resolve, reject) => {
                ws = new ctx.ws!(address) as QzConnection;
                ctx.connection = ws;
                onOpen = () => resolve(ws);
                onError = (e) => {
                    ctx.connection = null;
                    reject(e);
                };
                ws.addEventListener('open', onOpen);
                ws.addEventListener('error', onError);
                // Older Safari may fire 'close' instead of 'error'.
                ws.addEventListener('close', onError);
            })
            .finally(() => {
                ws.removeEventListener('open', onOpen);
                ws.removeEventListener('error', onError);
                ws.removeEventListener('close', onError);
            });
    }

    function connectToAddress(address: string): Promise<QzConnection> {
        const lna = ctx.lna;
        ctx.log.trace('Attempting connection', address);
        const wsPromise = lna
            ? lna.detectLna(address, webSocketPromise, { isWebSocket: true, defaultAddressSpace: 'public' })
            : webSocketPromise(address);

        return wsPromise.catch((evt: { denied?: boolean; permission?: unknown }) => {
            const msg = evt.denied
                ? 'Connection attempt denied by Local Network Access restrictions'
                : `Unable to establish connection with ${ctx.TITLE}`;
            const err = new Error(msg) as Error & { denied?: boolean; permission?: unknown };
            if (lna && evt instanceof lna.LnaError) {
                err.denied = evt.denied;
                err.permission = evt.permission;
            }
            throw err;
        });
    }

    function findConnection(config: ConnectConfig, resolve: () => void, reject: (e?: unknown) => void): void {
        if (ctx.shutdown) {
            reject(new Error('Connection attempt cancelled by user'));
            return;
        }

        if (!config.port.secure.length) {
            if (!config.port.insecure.length) {
                reject(new Error('No ports have been specified to connect over'));
                return;
            } else if (config.usingSecure) {
                ctx.log.error('No secure ports specified - forcing insecure connection');
                config.usingSecure = false;
            }
        } else if (!config.port.insecure.length && !config.usingSecure) {
            ctx.log.trace('No insecure ports specified - forcing secure connection');
            config.usingSecure = true;
        }

        const deeper = (e: { denied?: boolean }): void => {
            if (ctx.shutdown) {
                reject(new Error('Connection attempt cancelled by user'));
                return;
            }
            if (e.denied) {
                reject(e);
                return;
            }

            config.port.portIndex++;
            if (
                (config.usingSecure && config.port.portIndex >= config.port.secure.length) ||
                (!config.usingSecure && config.port.portIndex >= config.port.insecure.length)
            ) {
                if (config.hostIndex >= config.host.length - 1) {
                    reject(e);
                    return;
                }
                config.hostIndex++;
                config.port.portIndex = 0;
            }
            findConnection(config, resolve, reject);
        };

        const address = config.usingSecure
            ? config.protocol.secure + config.host[config.hostIndex] + ':' + config.port.secure[config.port.portIndex]
            : config.protocol.insecure +
              config.host[config.hostIndex] +
              ':' +
              config.port.insecure[config.port.portIndex];

        connectToAddress(address).then(
            () => {
                ctx.log.info(`Established connection with ${ctx.TITLE} on ${address}`);
                openConnection({ resolve, reject });

                if (config.keepAlive > 0) {
                    const interval = setInterval(() => {
                        if (!isActive(ctx) || ctx.connection?.interval !== interval) {
                            clearInterval(interval);
                            return;
                        }
                        ctx.connection.send('ping');
                    }, config.keepAlive * 1000);
                    if (ctx.connection) ctx.connection.interval = interval;
                }
            },
            (e: { denied?: boolean }) => {
                ctx.log.trace(e);
                deeper(e);
            }
        );
    }

    function openConnection(openPromise: PromiseHandlers): void {
        const conn = ctx.connection;
        if (!conn) return;

        conn.onclose = (evt) => {
            ctx.log.trace(evt);
            ctx.connection = null;
            dispatch(ctx.closedCallbacks, evt);
            ctx.log.info(`Closed connection with ${ctx.TITLE}`);

            for (const uid of Object.keys(ctx.pendingCalls)) {
                ctx.pendingCalls[uid].reject(new Error('Connection closed before response received'));
            }
            // An explicit disconnect() sets this so the disconnect promise resolves.
            conn.promise?.resolve();
        };

        conn.onerror = (evt) => dispatch(ctx.errorCallbacks, evt);

        conn.sendData = (obj: WsMessage) => {
            ctx.log.trace('Preparing object for websocket', obj);

            if (obj.timestamp == null) obj.timestamp = Date.now();
            if (obj.promise != null) {
                obj.uid = newUID();
                ctx.pendingCalls[obj.uid] = obj.promise;
            }

            const scr = typeof screen !== 'undefined' ? screen : undefined;
            obj.position = {
                x: scr ? (scr.availWidth || scr.width) / 2 + ((scr as Screen & { left?: number }).left ?? 0) : 0,
                y: scr ? (scr.availHeight || scr.height) / 2 + ((scr as Screen & { top?: number }).top ?? 0) : 0,
            };

            try {
                if (obj.call != null && obj.signature == null && security.needsSigned(obj.call)) {
                    const signObj = { call: obj.call, params: obj.params, timestamp: obj.timestamp };
                    Promise.resolve(ctx.hash(stringify(signObj)))
                        .then((hashed) => security.signProvider(hashed))
                        .then((signature) => {
                            ctx.log.trace('Signature for call', signature);
                            obj.signature = signature || '';
                            obj.signAlgorithm = security.algorithm;
                            conn.send(stringify(obj));
                        })
                        .catch((err) => {
                            ctx.log.error('Signing failed', err);
                            if (obj.promise != null) {
                                obj.promise.reject(new Error('Failed to sign request'));
                                if (obj.uid) delete ctx.pendingCalls[obj.uid];
                            }
                        });
                } else {
                    ctx.log.trace('Signature for call', obj.signature);
                    conn.send(stringify(obj));
                }
            } catch (err) {
                ctx.log.error(err);
                if (obj.promise != null) {
                    obj.promise.reject(err);
                    if (obj.uid) delete ctx.pendingCalls[obj.uid];
                }
            }
        };

        conn.onmessage = (evt) => {
            const returned = JSON.parse(evt.data as string);

            if (returned.uid == null) {
                if (returned.type == null) {
                    conn.close(4003, `Connected to incompatible ${ctx.TITLE} version`);
                    return;
                }
                routeStream(returned);
                return;
            }

            ctx.log.trace('Received response from websocket', returned);
            const promise = ctx.pendingCalls[returned.uid];
            if (promise == null) {
                ctx.log.allay('No promise found for returned response');
            } else if (returned.error != null) {
                promise.reject(new Error(returned.error));
            } else {
                promise.resolve(returned.result);
            }
            delete ctx.pendingCalls[returned.uid];
        };

        const sendCert = (cert: string | null = null): void => {
            dataPromise<string>('getVersion')
                .then((version) => {
                    conn.version = version;
                    conn.semver = parseSemver(version);
                    compatAlgorithm(ctx, true);
                })
                .then(() => {
                    conn.sendData?.({ certificate: cert, promise: openPromise });
                });
        };

        security
            .certProvider()
            .then((cert) => sendCert(cert ?? null))
            .catch((error) => {
                ctx.log.warn('Failed to get certificate:', error);
                if (security.rejectOnCertFailure) openPromise.reject(error);
                else sendCert(null);
            });
    }

    function routeStream(returned: { type: string; key?: unknown; data?: unknown; event?: string }): void {
        switch (returned.type) {
            case STREAMS.serial: {
                const event = returned.event ?? JSON.stringify({ portName: returned.key, output: returned.data });
                dispatch(ctx.streamCallbacks[STREAMS.serial], JSON.parse(event));
                break;
            }
            case STREAMS.socket:
                dispatch(ctx.streamCallbacks[STREAMS.socket], JSON.parse(returned.event!));
                break;
            case STREAMS.usb: {
                const key = returned.key as [unknown, unknown] | undefined;
                const event =
                    returned.event ??
                    JSON.stringify({ vendorId: key?.[0], productId: key?.[1], output: returned.data });
                dispatch(ctx.streamCallbacks[STREAMS.usb], JSON.parse(event));
                break;
            }
            case STREAMS.hid:
                dispatch(ctx.streamCallbacks[STREAMS.hid], JSON.parse(returned.event!));
                break;
            case STREAMS.printer:
                dispatch(ctx.streamCallbacks[STREAMS.printer], JSON.parse(returned.event!));
                break;
            case STREAMS.file:
                dispatch(ctx.streamCallbacks[STREAMS.file], JSON.parse(returned.event!));
                break;
            default:
                ctx.log.allay('Cannot determine stream type for callback', returned);
        }
    }

    function parseSemver(version: string): Array<number | string> {
        const semver: Array<number | string> = version
            .toLowerCase()
            .replace(/-rc\./g, '-rc')
            .split(/[\\+.-]/g);
        for (let i = 0; i < semver.length; i++) {
            try {
                if (i === 3 && semver[i].toString().toLowerCase().indexOf('rc') === 0) {
                    semver[i] = -parseInt(semver[i].toString().replace(/\D/g, ''), 10);
                    continue;
                }
                semver[i] = parseInt(semver[i] as string, 10);
            } catch {
                /* ignore */
            }
            if (semver.length < 4) semver[3] = 0;
        }
        return semver;
    }

    function dataPromise<T = unknown>(
        call: string,
        params?: unknown,
        signature?: string,
        timestamp?: number
    ): Promise<T> {
        return ctx.promise<T>((resolve, reject) => {
            ctx.connection?.sendData?.({
                call,
                promise: { resolve: resolve as (v?: unknown) => void, reject },
                params,
                signature,
                timestamp,
            });
        });
    }

    // ---- public API ---------------------------------------------------------

    function connect(options: ConnectOptions = {}): Promise<void> {
        return ctx.promise<void>((resolve, reject) => {
            if (ctx.connection && ctx.ws) {
                const state = ctx.connection.readyState;
                if (state === ctx.ws.OPEN) {
                    reject(new Error(`An open connection with ${ctx.TITLE} already exists`));
                    return;
                } else if (state === ctx.ws.CONNECTING) {
                    reject(new Error('The current connection attempt has not returned yet'));
                    return;
                } else if (state === ctx.ws.CLOSING) {
                    reject(new Error('Waiting for previous disconnect request to complete'));
                    return;
                }
            }
            if (!ctx.ws) {
                reject(new Error('WebSocket not supported by this browser'));
                return;
            }

            const opts: ConnectOptions = { ...options };

            // Disable secure ports on an insecure page unless explicitly forced.
            if (typeof location === 'undefined' || location.protocol !== 'https:') {
                if (typeof opts.usingSecure === 'undefined') {
                    ctx.log.trace('Disabling secure ports due to insecure page');
                    opts.usingSecure = false;
                }
            }

            // Normalize hosts to an array, optionally appending the surf tld.
            let hosts: string[] | undefined;
            if (typeof opts.host !== 'undefined') {
                hosts = Array.isArray(opts.host) ? [...opts.host] : [opts.host];
                if (ctx.connectConfig.usingSurf) {
                    hosts = hosts.map((h) => appendSurf(h, ctx.connectConfig.surfDomain));
                }
            }

            ctx.shutdown = false;
            const retries = opts.retries ?? 0;
            const delay = opts.delay ?? 0;

            const attempt = (count: number): void => {
                let tried = false;
                const nextAttempt = (err?: unknown): void => {
                    if (tried) return;
                    tried = true;
                    if (count < retries) {
                        attempt(count + 1);
                    } else {
                        ctx.connection = null;
                        reject(err);
                    }
                };
                const run = (): void => {
                    const config = mergeConnectConfig(ctx.connectConfig, opts, hosts);
                    findConnection(config, resolve, nextAttempt);
                };
                if (count === 0) run();
                else setTimeout(run, delay * 1000);
            };
            attempt(0);
        });
    }

    function disconnect(): Promise<void> {
        return ctx.promise<void>((resolve, reject) => {
            if (ctx.connection != null) {
                if (isActive(ctx)) {
                    ctx.shutdown = true;
                    ctx.connection.promise = { resolve: resolve as () => void, reject };
                    ctx.connection.close();
                } else {
                    reject(new Error('Current connection is still closing'));
                }
            } else {
                reject(new Error(`No open connection with ${ctx.TITLE}`));
            }
        });
    }

    function getConnectionInfo(): { socket: string; host: string; port: number } | undefined {
        if (!isActive(ctx) || !ctx.connection) return undefined;
        const url = ctx.connection.url.split(/[:/]+/g);
        return { socket: url[0], host: url[1], port: +url[2] };
    }

    return {
        isActive: () => isActive(ctx),
        connect,
        disconnect,
        getConnectionInfo,
        setErrorCallbacks: (calls) => {
            ctx.errorCallbacks = calls;
        },
        setClosedCallbacks: (calls) => {
            ctx.closedCallbacks = calls;
        },
        setUsingSurf: (usingSurf) => {
            ctx.connectConfig.usingSurf = usingSurf;
        },
        setSurfDomain: (domain) => {
            ctx.connectConfig.surfDomain = domain.indexOf('.') === 0 ? domain.substring(1) : domain;
        },
        dataPromise,
    };
}

/** Clone the base connect config and overlay per-call options + normalized hosts. */
function mergeConnectConfig(base: ConnectConfig, opts: ConnectOptions, hosts?: string[]): ConnectConfig {
    return {
        ...base,
        host: hosts ?? [...base.host],
        hostIndex: 0,
        usingSecure: opts.usingSecure ?? base.usingSecure,
        protocol: { ...base.protocol },
        port: {
            secure: opts.port?.secure ?? [...base.port.secure],
            insecure: opts.port?.insecure ?? [...base.port.insecure],
            portIndex: 0,
        },
        keepAlive: opts.keepAlive ?? base.keepAlive,
        retries: opts.retries ?? base.retries,
        delay: opts.delay ?? base.delay,
    };
}

// `isQualified` is re-exported for parity/testing of host normalization.
export { isQualified };
