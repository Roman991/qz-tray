import type { Promiser, Hasher, WebSocketCtor, PrintOptions, LnaShim } from '../types.js';
import { type Logger } from '../internal/log.js';
import { STREAMS } from '../internal/streams.js';
import type { Callbacks } from '../internal/streams.js';
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
    position?: {
        x: number;
        y: number;
    };
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
    protocol: {
        secure: string;
        insecure: string;
    };
    port: {
        secure: number[];
        insecure: number[];
        portIndex: number;
    };
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
export interface ContextInit {
    webSocket?: WebSocketCtor;
    promiser?: Promiser;
    hasher?: Hasher;
    title?: string;
    debug?: boolean;
    defaults?: PrintOptions;
    lna?: LnaShim;
}
export declare function createContext(init?: ContextInit): Context;
