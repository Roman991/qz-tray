import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
import { STREAMS } from '../internal/streams.js';
import { normalizeData } from '../internal/util.js';

export function createSocket(ctx: Context, transport: Transport) {
    return {
        open: (host: string, port: number, options?: object) =>
            transport.dataPromise<void>('socket.open', { host, port, options }),

        close: (host: string, port: number) => transport.dataPromise<void>('socket.close', { host, port }),

        sendData: (host: string, port: number, data: unknown) =>
            transport.dataPromise<void>('socket.sendData', { host, port, data: normalizeData(data) }),

        setSocketCallbacks: (calls: Callbacks) => {
            ctx.streamCallbacks[STREAMS.socket] = calls;
        },
    };
}
