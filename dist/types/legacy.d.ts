import { type PrintConfig } from './printing/config.js';
import type { PrinterInput, PrintOptions, PrintPayload } from './types.js';
/** Mutable façade matching the legacy `Config` object (setPrinter/reconfigure/...). */
export interface LegacyConfig {
    setPrinter(printer: PrinterInput): void;
    getPrinter(): PrintConfig['printer'];
    reconfigure(opts: PrintOptions): void;
    getOptions(): PrintOptions;
    print(data: PrintPayload[], signature?: string, signingTimestamp?: number): Promise<void>;
    /** @internal current immutable snapshot, read by `qz.print`. */
    readonly _current: PrintConfig;
}
export declare const qz: {
    version: string;
    websocket: {
        isActive: () => boolean;
        connect: (options?: import("./types.js").ConnectOptions) => Promise<void>;
        disconnect: () => Promise<void>;
        getConnectionInfo: () => {
            socket: string;
            host: string;
            port: number;
        } | undefined;
        setErrorCallbacks: (calls: import("./core/context.js").Context["errorCallbacks"]) => void;
        setClosedCallbacks: (calls: import("./core/context.js").Context["closedCallbacks"]) => void;
        setUsingSurf: (usingSurf: boolean) => void;
        setSurfDomain: (domain: string) => void;
        /** @deprecated since 2.1.0 — use `qz.networking.device()`. */
        getNetworkInfo: (hostname?: string, port?: number) => Promise<import("./namespaces/networking.js").DeviceInfo> | Promise<{
            ip: string | undefined;
            mac: string | undefined;
        }>;
    };
    configs: {
        create: (printer: PrinterInput, opts?: PrintOptions) => LegacyConfig;
        setDefaults: (opts: PrintOptions) => Record<string, unknown>;
    };
    print: (configs: LegacyConfig | PrintConfig | Array<LegacyConfig | PrintConfig>, data: PrintPayload[] | PrintPayload[][], ...rest: unknown[]) => Promise<void>;
    printers: {
        getDefault: (signature?: string, signingTimestamp?: number) => Promise<string>;
        find: (query?: string, signature?: string, signingTimestamp?: number) => Promise<string | string[]>;
        details: () => Promise<object[]>;
        startListening: (printers: null | string | string[], options?: import("./namespaces/printers.js").ListenOptions) => Promise<void>;
        clearQueue: (options?: string | {
            printerName?: string;
            jobId?: number;
        }) => Promise<void>;
        stopListening: () => Promise<void>;
        getStatus: () => Promise<void>;
        setPrinterCallbacks: (calls: import("./internal/streams.js").Callbacks) => void;
    };
    networking: {
        device: (hostname?: string, port?: number) => Promise<import("./namespaces/networking.js").DeviceInfo> | Promise<{
            ip: string | undefined;
            mac: string | undefined;
        }>;
        devices: (hostname?: string, port?: number) => Promise<{
            ip: string | undefined;
            mac: string | undefined;
        }[]> | Promise<import("./namespaces/networking.js").DeviceInfo[]>;
        hostname: (hostname?: string, port?: number) => Promise<string | undefined>;
    };
    serial: {
        findPorts: () => Promise<string[]>;
        setSerialCallbacks: (calls: import("./internal/streams.js").Callbacks) => void;
        openPort: (port: string, options?: object) => Promise<void>;
        sendData: (port: string, data: unknown, options?: object) => Promise<void>;
        closePort: (port: string) => Promise<void>;
    };
    socket: {
        open: (host: string, port: number, options?: object) => Promise<void>;
        close: (host: string, port: number) => Promise<void>;
        sendData: (host: string, port: number, data: unknown) => Promise<void>;
        setSocketCallbacks: (calls: import("./internal/streams.js").Callbacks) => void;
    };
    usb: {
        listDevices: (includeHubs?: boolean) => Promise<object[]>;
        listInterfaces: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<string[]>;
        listEndpoints: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<string[]>;
        setUsbCallbacks: (calls: import("./internal/streams.js").Callbacks) => void;
        claimDevice: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        isClaimed: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<boolean>;
        sendData: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        readData: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<string[]>;
        openStream: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        closeStream: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        releaseDevice: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
    };
    hid: {
        listDevices: () => Promise<object[]>;
        startListening: () => Promise<void>;
        stopListening: () => Promise<void>;
        setHidCallbacks: (calls: import("./internal/streams.js").Callbacks) => void;
        claimDevice: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        isClaimed: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<boolean>;
        sendData: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        readData: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<string[]>;
        sendFeatureReport: (deviceInfo: Record<string, unknown>) => Promise<void>;
        getFeatureReport: (deviceInfo: Record<string, unknown>) => Promise<string[]>;
        openStream: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        closeStream: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
        releaseDevice: (deviceInfo: string | Record<string, unknown>, ...rest: unknown[]) => Promise<void>;
    };
    file: {
        list: (path: string, params?: Record<string, unknown>) => Promise<string[]>;
        read: (path: string, params?: Record<string, unknown>) => Promise<string>;
        write: (path: string, params: Record<string, unknown>) => Promise<void>;
        remove: (path: string, params?: Record<string, unknown>) => Promise<void>;
        startListening: (path: string, params?: Record<string, unknown> & {
            include?: string | string[];
            exclude?: string | string[];
        }) => Promise<void>;
        stopListening: (path?: string, params?: Record<string, unknown>) => Promise<void>;
        setFileCallbacks: (calls: import("./internal/streams.js").Callbacks) => void;
    };
    api: {
        showDebug: (show: boolean) => boolean;
        getTitle: () => string;
        setTitle: (title: string) => void;
        getVersion: () => Promise<string>;
        isVersion: (major?: number, minor?: number, patch?: number, build?: number) => boolean;
        isVersionGreater: (major?: number, minor?: number, patch?: number, build?: number) => boolean;
        isVersionLess: (major?: number, minor?: number, patch?: number, build?: number) => boolean;
        setPromiseType: (promiser: import("./types.js").Promiser) => void;
        setSha256Type: (hasher: import("./types.js").Hasher) => void;
        setWebSocketType: (ws: import("./types.js").WebSocketCtor) => void;
    };
    security: {
        setCertificatePromise: (handler: unknown, options?: {
            rejectOnFailure?: boolean;
        }) => void;
        setSignaturePromise: (factory: unknown) => void;
        setSignatureAlgorithm: (algorithm: string) => void;
        getSignatureAlgorithm: () => import("./types.js").SignatureAlgorithm;
    };
};
export type LegacyQz = typeof qz;
