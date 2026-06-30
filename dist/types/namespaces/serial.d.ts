import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
export declare function createSerial(ctx: Context, transport: Transport): {
    findPorts: () => Promise<string[]>;
    setSerialCallbacks: (calls: Callbacks) => void;
    openPort: (port: string, options?: object) => Promise<void>;
    sendData: (port: string, data: unknown, options?: object) => Promise<void>;
    closePort: (port: string) => Promise<void>;
};
