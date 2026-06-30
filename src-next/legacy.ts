// Backwards-compatible singleton. Reconstructs the legacy global `qz` API
// surface on top of a single default `createQz()` instance, so existing code
// (`qz.security.setSignaturePromise(...)`, `qz.configs.create(...)`,
// `qz.print(...)`) keeps working unchanged. New code should prefer `createQz`.

import { createQz, type Qz } from './client.js';
import { createConfig, type PrintConfig } from './printing/config.js';
import { compatConfig } from './core/compatible.js';
import type { PrinterInput, PrintOptions, PrintPayload } from './types.js';

const instance: Qz = createQz();
const ctx = instance._ctx;

/** Mutable façade matching the legacy `Config` object (setPrinter/reconfigure/...). */
export interface LegacyConfig {
    setPrinter(printer: PrinterInput): void;
    getPrinter(): PrintConfig['printer'];
    reconfigure(opts: PrintOptions): void;
    getOptions(): PrintOptions;
    print(data: PrintPayload[], signature?: string, signingTimestamp?: number): Promise<void>;
    /** @internal current immutable snapshot, read by `qz.print`. */
    readonly _current: PrintConfig;
}

function makeLegacyConfig(printer: PrinterInput, opts?: PrintOptions): LegacyConfig {
    let current = createConfig(printer, opts, ctx.defaultConfig);
    return {
        setPrinter: (p) => {
            current = current.withPrinter(p);
        },
        getPrinter: () => current.printer,
        reconfigure: (newOpts) => {
            current = current.with(newOpts);
        },
        getOptions: () => compatConfig(ctx, current.options, current.dirty),
        print: (data, signature, signingTimestamp) => instance.print(current, data, false, signature, signingTimestamp),
        get _current() {
            return current;
        },
    };
}

const isLegacyConfig = (c: unknown): c is LegacyConfig => typeof c === 'object' && c !== null && '_current' in c;

export const qz = {
    version: instance.version,

    websocket: {
        isActive: instance.isActive,
        connect: instance.connect,
        disconnect: instance.disconnect,
        getConnectionInfo: instance.getConnectionInfo,
        setErrorCallbacks: instance.setErrorCallbacks,
        setClosedCallbacks: instance.setClosedCallbacks,
        setUsingSurf: instance.setUsingSurf,
        setSurfDomain: instance.setSurfDomain,
        /** @deprecated since 2.1.0 — use `qz.networking.device()`. */
        getNetworkInfo: (hostname?: string, port?: number) => instance.networking.device(hostname, port),
    },

    configs: {
        create: (printer: PrinterInput, opts?: PrintOptions): LegacyConfig => makeLegacyConfig(printer, opts),
        setDefaults: (opts: PrintOptions) => instance.setDefaults(opts),
    },

    print: (
        configs: LegacyConfig | PrintConfig | Array<LegacyConfig | PrintConfig>,
        data: PrintPayload[] | PrintPayload[][],
        ...rest: unknown[]
    ) => {
        const list = Array.isArray(configs) ? configs : [configs];
        const snapshots = list.map((c) => (isLegacyConfig(c) ? c._current : c));
        // Preserve the legacy positional optional args (resumeOnError | signatures, timestamps).
        return (instance.print as (...args: unknown[]) => Promise<void>)(
            Array.isArray(configs) ? snapshots : snapshots[0],
            data,
            ...rest
        );
    },

    printers: instance.printers,
    networking: instance.networking,
    serial: instance.serial,
    socket: instance.socket,
    usb: instance.usb,
    hid: instance.hid,
    file: instance.file,
    api: instance.api,
    security: instance.security,
};

export type LegacyQz = typeof qz;
