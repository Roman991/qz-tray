import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
import { STREAMS } from '../internal/streams.js';
import { absolute, normalizeData } from '../internal/util.js';
import { versionCompare } from '../core/state.js';

export function createSerial(ctx: Context, transport: Transport) {
    return {
        findPorts: () => transport.dataPromise<string[]>('serial.findPorts'),

        setSerialCallbacks: (calls: Callbacks) => {
            ctx.streamCallbacks[STREAMS.serial] = calls;
        },

        openPort: (port: string, options?: object) => transport.dataPromise<void>('serial.openPort', { port, options }),

        sendData: (port: string, data: unknown, options?: object) => {
            let payload = data;
            if ((versionCompare(ctx, 2, 1, 0, 12) ?? 0) >= 0) {
                const normalized = normalizeData(data);
                if (normalized.type?.toUpperCase() === 'FILE' && typeof normalized.data === 'string') {
                    normalized.data = absolute(normalized.data);
                }
                payload = normalized;
            }
            return transport.dataPromise<void>('serial.sendData', { port, data: payload, options });
        },

        closePort: (port: string) => transport.dataPromise<void>('serial.closePort', { port }),
    };
}
