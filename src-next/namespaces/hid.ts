import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { Callbacks } from '../internal/streams.js';
import { STREAMS } from '../internal/streams.js';
import { absolute, normalizeData, normalizeDeviceInfo } from '../internal/util.js';
import { versionCompare } from '../core/state.js';

type DeviceArg = Record<string, unknown> | string;

export function createHid(ctx: Context, transport: Transport) {
    return {
        listDevices: () => transport.dataPromise<object[]>('hid.listDevices'),
        startListening: () => transport.dataPromise<void>('hid.startListening'),
        stopListening: () => transport.dataPromise<void>('hid.stopListening'),

        setHidCallbacks: (calls: Callbacks) => {
            ctx.streamCallbacks[STREAMS.hid] = calls;
        },

        claimDevice: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'hid.claimDevice',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),

        isClaimed: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<boolean>(
                'hid.isClaimed',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),

        sendData: (deviceInfo: DeviceArg, ...rest: unknown[]) => {
            const info = normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'data', 'endpoint']);
            if ((versionCompare(ctx, 2, 1, 0, 12) ?? 0) >= 0) {
                const normalized = normalizeData(info.data);
                if (normalized.type?.toUpperCase() === 'FILE' && typeof normalized.data === 'string') {
                    normalized.data = absolute(normalized.data);
                }
                info.data = normalized;
            } else if (typeof info.data === 'object' && info.data !== null) {
                const d = info.data as { type?: string; data?: unknown };
                if (d.type?.toUpperCase() !== 'PLAIN' || typeof d.data !== 'string') {
                    return ctx.promise<void>((_resolve, reject) =>
                        reject(
                            new Error(
                                `Data format is not supported with connected ${ctx.TITLE} version ${ctx.connection?.version}`
                            )
                        )
                    );
                }
                info.data = d.data;
            }
            return transport.dataPromise<void>('hid.sendData', info);
        },

        readData: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<string[]>(
                'hid.readData',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'responseSize'])
            ),

        sendFeatureReport: (deviceInfo: Record<string, unknown>) =>
            transport.dataPromise<void>('hid.sendFeatureReport', deviceInfo),

        getFeatureReport: (deviceInfo: Record<string, unknown>) =>
            transport.dataPromise<string[]>('hid.getFeatureReport', deviceInfo),

        openStream: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'hid.openStream',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId', 'responseSize', 'interval'])
            ),

        closeStream: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'hid.closeStream',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),

        releaseDevice: (deviceInfo: DeviceArg, ...rest: unknown[]) =>
            transport.dataPromise<void>(
                'hid.releaseDevice',
                normalizeDeviceInfo([deviceInfo, ...rest], ['vendorId', 'productId'])
            ),
    };
}
