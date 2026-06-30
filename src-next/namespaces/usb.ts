import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
import { STREAMS } from '../internal/streams.js';
import { absolute, normalizeData, normalizeDeviceInfo } from '../internal/util.js';
import { versionCompare } from '../core/state.js';

type DeviceArg = Record<string, unknown> | string;

export function createUsb(ctx: Context, transport: Transport) {
    return {
        listDevices: (includeHubs?: boolean) => transport.dataPromise<object[]>('usb.listDevices', { includeHubs }),

        listInterfaces: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<string[]>(
                'usb.listInterfaces',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),

        listEndpoints: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<string[]>(
                'usb.listEndpoints',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'interface'])
            ),

        setUsbCallbacks: (calls: Callbacks) => {
            ctx.streamCallbacks[STREAMS.usb] = calls;
        },

        claimDevice: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'usb.claimDevice',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'interface'])
            ),

        isClaimed: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<boolean>(
                'usb.isClaimed',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),

        sendData: (deviceInfo: DeviceArg, ...rest: unknown[]) => {
            const info = normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'endpoint', 'data']);
            if ((versionCompare(ctx, 2, 1, 0, 12) ?? 0) >= 0) {
                const normalized = normalizeData(info.data);
                if (normalized.type?.toUpperCase() === 'FILE' && typeof normalized.data === 'string') {
                    normalized.data = absolute(normalized.data);
                }
                info.data = normalized;
            }
            return transport.dataPromise<void>('usb.sendData', info);
        },

        readData: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<string[]>(
                'usb.readData',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'endpoint', 'responseSize'])
            ),

        openStream: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'usb.openStream',
                normalizeDeviceInfo(
                    [deviceInfo, ...rest],
                    ['vendorId', 'productId', 'endpoint', 'responseSize', 'interval']
                )
            ),

        closeStream: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'usb.closeStream',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'endpoint'])
            ),

        releaseDevice: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'usb.releaseDevice',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),
    };
}
