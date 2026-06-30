import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
export declare function createSocket(ctx: Context, transport: Transport): {
    open: (host: string, port: number, options?: object) => Promise<void>;
    close: (host: string, port: number) => Promise<void>;
    sendData: (host: string, port: number, data: unknown) => Promise<void>;
    setSocketCallbacks: (calls: Callbacks) => void;
};
