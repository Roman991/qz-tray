import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
type DeviceArg = Record<string, unknown> | string;
export declare function createUsb(ctx: Context, transport: Transport): {
    listDevices: (includeHubs?: boolean) => Promise<object[]>;
    listInterfaces: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<string[]>;
    listEndpoints: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<string[]>;
    setUsbCallbacks: (calls: Callbacks) => void;
    claimDevice: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<void>;
    isClaimed: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<boolean>;
    sendData: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<void>;
    readData: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<string[]>;
    openStream: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<void>;
    closeStream: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<void>;
    releaseDevice: (deviceInfo: DeviceArg, ...rest: unknown[]) => Promise<void>;
};
export {};
