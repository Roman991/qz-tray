import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import { isVersion, versionCompare } from '../core/state.js';

export interface DeviceInfo {
    ip?: string;
    mac?: string;
    ipAddress?: string;
    macAddress?: string;
    hostname?: string;
}

/** Networking info calls (legacy `qz.networking`), with 2.0/2.1 version shims. */
export function createNetworking(ctx: Context, transport: Transport) {
    const legacy = (hostname?: string, port?: number) =>
        transport.dataPromise<DeviceInfo>('websocket.getNetworkInfo', { hostname, port });

    return {
        device: (hostname?: string, port?: number) => {
            if (isVersion(ctx, 2, 0)) {
                return legacy(hostname, port).then((d) => ({ ip: d.ipAddress, mac: d.macAddress }));
            }
            return transport.dataPromise<DeviceInfo>('networking.device', { hostname, port });
        },

        devices: (hostname?: string, port?: number) => {
            if (isVersion(ctx, 2, 0)) {
                return legacy(hostname, port).then((d) => [{ ip: d.ipAddress, mac: d.macAddress }]);
            }
            return transport.dataPromise<DeviceInfo[]>('networking.devices', { hostname, port });
        },

        hostname: (hostname?: string, port?: number) => {
            if ((versionCompare(ctx, 2, 2, 2) ?? 0) < 0) {
                return transport
                    .dataPromise<DeviceInfo>('networking.device', { hostname, port })
                    .then((device) => device.hostname);
            }
            return transport.dataPromise<string>('networking.hostname');
        },
    };
}
