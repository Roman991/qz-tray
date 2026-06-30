import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
export interface DeviceInfo {
    ip?: string;
    mac?: string;
    ipAddress?: string;
    macAddress?: string;
    hostname?: string;
}
/** Networking info calls (legacy `qz.networking`), with 2.0/2.1 version shims. */
export declare function createNetworking(ctx: Context, transport: Transport): {
    device: (hostname?: string, port?: number) => Promise<DeviceInfo> | Promise<{
        ip: string | undefined;
        mac: string | undefined;
    }>;
    devices: (hostname?: string, port?: number) => Promise<{
        ip: string | undefined;
        mac: string | undefined;
    }[]> | Promise<DeviceInfo[]>;
    hostname: (hostname?: string, port?: number) => Promise<string | undefined>;
};
