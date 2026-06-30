/** Low-level promise resolver, `(resolve, reject) => void`. */
export type PromiseResolver<T> = (resolve: (value: T) => void, reject: (reason?: unknown) => void) => void;
/** Factory used to create promises. Override to swap in a Promise/A+ library. */
export type Promiser = <T>(resolver: PromiseResolver<T>) => Promise<T>;
/** SHA-256 hasher. May be sync (returns hex string) or async. */
export type Hasher = (data: string) => string | Promise<string>;
/** WebSocket constructor (the browser global by default). */
export type WebSocketCtor = {
    new (url: string): WebSocket;
    readonly OPEN: number;
    readonly CONNECTING: number;
    readonly CLOSING: number;
    readonly CLOSED: number;
};
export type SignatureAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';
/** Returns the site's public certificate (string), sync or async. */
export type CertificateProvider = () => string | Promise<string>;
/** Signs the hashed payload and returns the signature, sync or async. */
export type SignProvider = (toSign: string) => string | Promise<string>;
export interface SecurityOptions {
    /** Resolver for the site's public certificate. */
    certificate?: CertificateProvider;
    /** Signs the SHA hash of each privileged call. */
    sign?: SignProvider;
    /** Signature algorithm QZ verifies against. Default `SHA1`. */
    algorithm?: SignatureAlgorithm;
    /** Reject the connection if the certificate provider fails (default: connect anonymously). */
    rejectOnCertFailure?: boolean;
}
export interface ConnectOptions {
    host?: string | string[];
    port?: {
        secure?: number[];
        insecure?: number[];
    };
    usingSecure?: boolean;
    /** Append a "surf" tld (e.g. `.qz.surf`) to non-qualified hosts. */
    usingSurf?: boolean;
    surfDomain?: string;
    keepAlive?: number;
    retries?: number;
    delay?: number;
}
/** Bounding box rectangle. */
export interface Bounds {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
export interface PaperSize {
    width?: number | null;
    height?: number | null;
    custom?: boolean;
}
export interface SpoolOptions {
    size?: number | null;
    end?: string | null;
}
/** Per-config print options. Mirrors the legacy `qz.configs.setDefaults` surface. */
export interface PrintOptions {
    bounds?: Bounds | null;
    colorType?: 'color' | 'grayscale' | 'blackwhite' | 'default';
    copies?: number;
    density?: number | number[] | {
        cross?: number;
        feed?: number;
    } | 'best' | 'draft';
    duplex?: boolean | 'one-sided' | 'duplex' | 'long-edge' | 'tumble' | 'short-edge';
    fallbackDensity?: number | null;
    interpolation?: 'bicubic' | 'bilinear' | 'nearest-neighbor';
    jobName?: string | null;
    legacy?: boolean;
    margins?: number | Margins;
    orientation?: 'portrait' | 'landscape' | 'reverse-landscape' | null;
    paperThickness?: number | null;
    printerTray?: string | number | null;
    rasterize?: boolean;
    rotation?: number;
    scaleContent?: boolean;
    size?: PaperSize | null;
    units?: 'in' | 'cm' | 'mm';
    forceRaw?: boolean;
    encoding?: string | {
        from?: string;
        to?: string;
    } | null;
    endOfDoc?: string | null;
    perSpool?: number;
    retainTemp?: boolean;
    spool?: SpoolOptions | null;
    altPrinting?: boolean;
}
/** Printer target: a name, or an object specifying host/file routing. */
export type PrinterInput = string | {
    name?: string;
    host?: string;
    port?: string;
    file?: string;
};
export interface Printer {
    name?: string;
    host?: string;
    port?: string;
    file?: string;
}
/** Single print payload. A bare string is treated as raw plain command data. */
export interface PrintData {
    data: string | Uint8Array;
    type?: string;
    format?: string;
    flavor?: string;
    options?: Record<string, unknown>;
}
export type PrintPayload = string | PrintData;
export interface QzOptions {
    security?: SecurityOptions;
    /** Default print options applied to every config created by this client. */
    defaults?: PrintOptions;
    /** Default websocket connection options. */
    connect?: ConnectOptions;
    /** Override the WebSocket constructor (defaults to the browser global). */
    webSocket?: WebSocketCtor;
    /** Override the promise factory. */
    promiser?: Promiser;
    /** Override the SHA-256 hasher. */
    hasher?: Hasher;
    /** Internal branding used in logs/exceptions. Default `QZ Tray`. */
    title?: string;
    /** Emit debug logging. */
    debug?: boolean;
    /** Optional Local Network Access shim (browser LNA). */
    lna?: LnaShim;
}
/** Minimal shape of the optional `lna` Local Network Access helper. */
export interface LnaShim {
    detectLna<T>(address: string, connect: (address: string) => Promise<T>, opts: {
        isWebSocket: boolean;
        defaultAddressSpace: string;
    }): Promise<T>;
    LnaError: new (...args: unknown[]) => Error;
}
