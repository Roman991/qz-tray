import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Promiser, Hasher, WebSocketCtor } from '../types.js';
import { isVersion, versionCompare } from '../core/state.js';

/** Misc compatibility/diagnostic calls (legacy `qz.api`). */
export function createApi(ctx: Context, transport: Transport) {
    return {
        showDebug: (show: boolean) => (ctx.DEBUG = show),
        getTitle: () => ctx.TITLE,
        setTitle: (title: string) => {
            ctx.TITLE = title;
        },

        getVersion: () => transport.dataPromise<string>('getVersion'),

        isVersion: (major?: number, minor?: number, patch?: number, build?: number) =>
            isVersion(ctx, major, minor, patch, build),
        isVersionGreater: (major?: number, minor?: number, patch?: number, build?: number) =>
            (versionCompare(ctx, major, minor, patch, build) ?? 0) > 0,
        isVersionLess: (major?: number, minor?: number, patch?: number, build?: number) =>
            (versionCompare(ctx, major, minor, patch, build) ?? 0) < 0,

        setPromiseType: (promiser: Promiser) => {
            ctx.promise = promiser;
        },
        setSha256Type: (hasher: Hasher) => {
            ctx.hash = hasher;
        },
        setWebSocketType: (ws: WebSocketCtor) => {
            ctx.ws = ws;
        },
    };
}
