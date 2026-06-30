import type { QzOptions, PrinterInput, PrintOptions } from './types.js';
import { type PrintConfig } from './printing/config.js';
import { type PrintFn } from './printing/print.js';
/** A PrintConfig with a bound `.print()` convenience and chainable builders. */
export type BoundConfig = PrintConfig & {
    print(data: Parameters<PrintFn>[1], resumeOnError?: boolean, signatures?: string | string[], signingTimestamps?: number | number[]): Promise<void>;
    with(patch: PrintOptions): BoundConfig;
    withPrinter(printer: PrinterInput): BoundConfig;
};
export declare function createQz(options?: QzOptions): {
    version: string;
    connect: (options?: import("./types.js").ConnectOptions) => Promise<void>;
    disconnect: () => Promise<void>;
    isActive: () => boolean;
    getConnectionInfo: () => {
        socket: string;
        host: string;
        port: number;
    } | undefined;
    setErrorCallbacks: (calls: import("./core/context.js").Context["errorCallbacks"]) => void;
    setClosedCallbacks: (calls: import("./core/context.js").Context["closedCallbacks"]) => void;
    setUsingSurf: (usingSurf: boolean) => void;
    setSurfDomain: (domain: string) => void;
    config: (printer: PrinterInput, opts?: PrintOptions) => BoundConfig;
    setDefaults: (opts: PrintOptions) => Record<string, unknown>;
    print: PrintFn;
    security: {
        setCertificatePromise: (handler: unknown, options?: {
            rejectOnFailure?: boolean;
        }) => void;
        setSignaturePromise: (factory: unknown) => void;
        setSignatureAlgorithm: (algorithm: string) => void;
        getSignatureAlgorithm: () => import("./types.js").SignatureAlgorithm;
    };
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
    /** Escape hatch: the underlying context (for advanced/testing use). */
    _ctx: import("./core/context.js").Context;
};
export type Qz = ReturnType<typeof createQz>;
