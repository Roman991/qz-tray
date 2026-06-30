import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
import { STREAMS } from '../internal/streams.js';
import { deepExtend, ensureArray } from '../internal/util.js';

type FileParams = Record<string, unknown> & { include?: string | string[]; exclude?: string | string[] };

export function createFile(ctx: Context, transport: Transport) {
    const withPath = (path: string | undefined, params?: Record<string, unknown>) =>
        deepExtend({ path } as Record<string, unknown>, params);

    return {
        list: (path: string, params?: Record<string, unknown>) =>
            transport.dataPromise<string[]>('file.list', withPath(path, params)),

        read: (path: string, params?: Record<string, unknown>) =>
            transport.dataPromise<string>('file.read', withPath(path, params)),

        write: (path: string, params: Record<string, unknown>) =>
            transport.dataPromise<void>('file.write', withPath(path, params)),

        remove: (path: string, params?: Record<string, unknown>) =>
            transport.dataPromise<void>('file.remove', withPath(path, params)),

        startListening: (path: string, params?: FileParams) => {
            if (params && typeof params.include !== 'undefined') params.include = ensureArray(params.include);
            if (params && typeof params.exclude !== 'undefined') params.exclude = ensureArray(params.exclude);
            return transport.dataPromise<void>('file.startListening', withPath(path, params));
        },

        stopListening: (path?: string, params?: Record<string, unknown>) =>
            transport.dataPromise<void>('file.stopListening', withPath(path, params)),

        setFileCallbacks: (calls: Callbacks) => {
            ctx.streamCallbacks[STREAMS.file] = calls;
        },
    };
}
