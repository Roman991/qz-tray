import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Promiser, Hasher, WebSocketCtor } from '../types.js';
/** Misc compatibility/diagnostic calls (legacy `qz.api`). */
export declare function createApi(ctx: Context, transport: Transport): {
    showDebug: (show: boolean) => boolean;
    getTitle: () => string;
    setTitle: (title: string) => void;
    getVersion: () => Promise<string>;
    isVersion: (major?: number, minor?: number, patch?: number, build?: number) => boolean;
    isVersionGreater: (major?: number, minor?: number, patch?: number, build?: number) => boolean;
    isVersionLess: (major?: number, minor?: number, patch?: number, build?: number) => boolean;
    setPromiseType: (promiser: Promiser) => void;
    setSha256Type: (hasher: Hasher) => void;
    setWebSocketType: (ws: WebSocketCtor) => void;
};
