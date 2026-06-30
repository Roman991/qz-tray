import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
export interface ListenOptions {
    jobData?: boolean;
    maxJobData?: number;
    flavor?: string;
}
export declare function createPrinters(ctx: Context, transport: Transport): {
    getDefault: (signature?: string, signingTimestamp?: number) => Promise<string>;
    find: (query?: string, signature?: string, signingTimestamp?: number) => Promise<string | string[]>;
    details: () => Promise<object[]>;
    startListening: (printers: null | string | string[], options?: ListenOptions) => Promise<void>;
    clearQueue: (options?: string | {
        printerName?: string;
        jobId?: number;
    }) => Promise<void>;
    stopListening: () => Promise<void>;
    getStatus: () => Promise<void>;
    setPrinterCallbacks: (calls: Callbacks) => void;
};
