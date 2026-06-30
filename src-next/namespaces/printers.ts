import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
import { STREAMS } from '../internal/streams.js';
import { ensureArray } from '../internal/util.js';

export interface ListenOptions {
    jobData?: boolean;
    maxJobData?: number;
    flavor?: string;
}

export function createPrinters(ctx: Context, transport: Transport) {
    return {
        getDefault: (signature?: string, signingTimestamp?: number) =>
            transport.dataPromise<string>('printers.getDefault', null, signature, signingTimestamp),

        find: (query?: string, signature?: string, signingTimestamp?: number) =>
            transport.dataPromise<string | string[]>('printers.find', { query }, signature, signingTimestamp),

        details: () => transport.dataPromise<object[]>('printers.detail'),

        startListening: (printers: null | string | string[], options?: ListenOptions) => {
            const params: Record<string, unknown> = { printerNames: ensureArray(printers) };
            if (options?.jobData) params.jobData = true;
            if (options?.maxJobData) params.maxJobData = options.maxJobData;
            if (options?.flavor) params.flavor = options.flavor;
            return transport.dataPromise<void>('printers.startListening', params);
        },

        clearQueue: (options?: string | { printerName?: string; jobId?: number }) => {
            const params = typeof options !== 'object' ? { printerName: options } : options;
            return transport.dataPromise<void>('printers.clearQueue', params);
        },

        stopListening: () => transport.dataPromise<void>('printers.stopListening'),
        getStatus: () => transport.dataPromise<void>('printers.getStatus'),

        setPrinterCallbacks: (calls: Callbacks) => {
            ctx.streamCallbacks[STREAMS.printer] = calls;
        },
    };
}
