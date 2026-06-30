// Per-instance state container. This is the single object that replaces BOTH
// legacy module singletons (`_qz` internal + `qz` public). Each `createQz()`
// call gets its own Context, so two clients (e.g. two certificates or two QZ
// hosts) can coexist on one page — impossible with the old globals.

import type { Promiser, Hasher, WebSocketCtor, PrintOptions, LnaShim } from '../types.js';
import { createLogger, type Logger } from '../internal/log.js';
import { STREAMS } from '../internal/streams.js';
import type { Callbacks } from '../internal/streams.js';
import { sha256 } from '../internal/sha.js';
import { DEFAULT_PRINT_OPTIONS } from '../printing/defaults.js';

export interface PromiseHandlers {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}

export interface WsMessage {
    call?: string;
    params?: unknown;
    promise?: PromiseHandlers;
    signature?: string;
    timestamp?: number;
    uid?: string;
    certificate?: string | null;
    signAlgorithm?: string;
    position?: { x: number; y: number };
}

/** A live WebSocket plus the bookkeeping fields the transport attaches to it. */
export type QzConnection = WebSocket & {
    interval?: ReturnType<typeof setInterval>;
    version?: string;
    semver?: Array<number | string>;
    promise?: PromiseHandlers;
    sendData?: (obj: WsMessage) => void;
};

export interface ConnectConfig {
    host: string[];
    hostIndex: number;
    usingSecure: boolean;
    usingSurf: boolean;
    surfDomain: string;
    protocol: { secure: string; insecure: string };
    port: { secure: number[]; insecure: number[]; portIndex: number };
    keepAlive: number;
    retries: number;
    delay: number;
}

export interface Context {
    TITLE: string;
    VERSION: string;
    DEBUG: boolean;
    log: Logger;

    ws: WebSocketCtor | null;
    promise: Promiser;
    hash: Hasher;
    lna: LnaShim | null;

    connection: QzConnection | null;
    shutdown: boolean;
    pendingCalls: Record<string, PromiseHandlers>;
    connectConfig: ConnectConfig;

    errorCallbacks: Callbacks;
    closedCallbacks: Callbacks;
    streamCallbacks: Partial<Record<(typeof STREAMS)[keyof typeof STREAMS], Callbacks>>;

    defaultConfig: PrintOptions;
}

const VERSION = '2.2.6';

export interface ContextInit {
    webSocket?: WebSocketCtor;
    promiser?: Promiser;
    hasher?: Hasher;
    title?: string;
    debug?: boolean;
    defaults?: PrintOptions;
    lna?: LnaShim;
}

const defaultPromiser: Promiser = (resolver) => new Promise(resolver);

function detectWebSocket(): WebSocketCtor | null {
    return typeof WebSocket !== 'undefined' ? (WebSocket as unknown as WebSocketCtor) : null;
}

function detectLna(explicit?: LnaShim): LnaShim | null {
    if (explicit) return explicit;
    const self = globalThis as { lna?: LnaShim };
    if (self.lna && typeof self.lna.detectLna === 'function') return self.lna;
    return null;
}

export function createContext(init: ContextInit = {}): Context {
    const ctx = {
        TITLE: init.title ?? 'QZ Tray',
        VERSION,
        DEBUG: init.debug ?? false,
        ws: init.webSocket ?? detectWebSocket(),
        promise: init.promiser ?? defaultPromiser,
        hash: init.hasher ?? sha256,
        lna: detectLna(init.lna),

        connection: null,
        shutdown: false,
        pendingCalls: {},
        connectConfig: {
            host: ['localhost', 'localhost.qz.io'],
            hostIndex: 0,
            usingSecure: true,
            usingSurf: true,
            surfDomain: 'qz.surf',
            protocol: { secure: 'wss://', insecure: 'ws://' },
            port: { secure: [8181, 8282, 8383, 8484], insecure: [8182, 8283, 8384, 8485], portIndex: 0 },
            keepAlive: 60,
            retries: 0,
            delay: 0,
        },

        errorCallbacks: [],
        closedCallbacks: [],
        streamCallbacks: {},

        defaultConfig: { ...DEFAULT_PRINT_OPTIONS, ...init.defaults },
    } as unknown as Context;

    ctx.log = createLogger(() => ctx.DEBUG);
    return ctx;
}
