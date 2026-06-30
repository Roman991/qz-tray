import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
type FileParams = Record<string, unknown> & {
    include?: string | string[];
    exclude?: string | string[];
};
export declare function createFile(ctx: Context, transport: Transport): {
    list: (path: string, params?: Record<string, unknown>) => Promise<string[]>;
    read: (path: string, params?: Record<string, unknown>) => Promise<string>;
    write: (path: string, params: Record<string, unknown>) => Promise<void>;
    remove: (path: string, params?: Record<string, unknown>) => Promise<void>;
    startListening: (path: string, params?: FileParams) => Promise<void>;
    stopListening: (path?: string, params?: Record<string, unknown>) => Promise<void>;
    setFileCallbacks: (calls: Callbacks) => void;
};
export {};
