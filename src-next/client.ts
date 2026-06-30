// The public factory. `createQz()` returns a fully independent client whose
// state lives on its own Context — no module globals. Configuration is supplied
// up front via options (private key/cert, printer defaults, host), replacing the
// legacy "mutate a shared singleton across multiple calls" model.

import type { QzOptions, PrinterInput, PrintOptions } from './types.js';
import { createContext } from './core/context.js';
import { createSecurity } from './core/security.js';
import { createTransport } from './core/transport.js';
import { createConfig, type PrintConfig } from './printing/config.js';
import { createPrint, type PrintFn } from './printing/print.js';
import { deepExtend } from './internal/util.js';
import { createPrinters } from './namespaces/printers.js';
import { createApi } from './namespaces/api.js';
import { createNetworking } from './namespaces/networking.js';
import { createSerial } from './namespaces/serial.js';
import { createSocket } from './namespaces/socket.js';
import { createUsb } from './namespaces/usb.js';
import { createHid } from './namespaces/hid.js';
import { createFile } from './namespaces/file.js';

/** A PrintConfig with a bound `.print()` convenience and chainable builders. */
export type BoundConfig = PrintConfig & {
    print(
        data: Parameters<PrintFn>[1],
        resumeOnError?: boolean,
        signatures?: string | string[],
        signingTimestamps?: number | number[]
    ): Promise<void>;
    with(patch: PrintOptions): BoundConfig;
    withPrinter(printer: PrinterInput): BoundConfig;
};

function bindConfig(config: PrintConfig, print: PrintFn): BoundConfig {
    return {
        ...config,
        print: (data, resumeOnError, signatures, signingTimestamps) =>
            print(config, data, resumeOnError, signatures, signingTimestamps),
        with: (patch) => bindConfig(config.with(patch), print),
        withPrinter: (printer) => bindConfig(config.withPrinter(printer), print),
    };
}

export function createQz(options: QzOptions = {}) {
    const ctx = createContext({
        webSocket: options.webSocket,
        promiser: options.promiser,
        hasher: options.hasher,
        title: options.title,
        debug: options.debug,
        defaults: options.defaults,
        lna: options.lna,
    });

    const security = createSecurity(ctx, options.security);
    const transport = createTransport(ctx, security);
    if (options.connect) {
        deepExtend(
            ctx.connectConfig as unknown as Record<string, unknown>,
            options.connect as unknown as Record<string, unknown>
        );
    }

    const print = createPrint(ctx, transport);

    return {
        version: ctx.VERSION,

        // Connection
        connect: transport.connect,
        disconnect: transport.disconnect,
        isActive: transport.isActive,
        getConnectionInfo: transport.getConnectionInfo,
        setErrorCallbacks: transport.setErrorCallbacks,
        setClosedCallbacks: transport.setClosedCallbacks,
        setUsingSurf: transport.setUsingSurf,
        setSurfDomain: transport.setSurfDomain,

        // Printing
        config: (printer: PrinterInput, opts: PrintOptions = {}): BoundConfig =>
            bindConfig(createConfig(printer, opts, ctx.defaultConfig), print),
        setDefaults: (opts: PrintOptions) =>
            deepExtend(ctx.defaultConfig as unknown as Record<string, unknown>, opts as Record<string, unknown>),
        print,

        // Security (runtime overrides; prefer the `security` option at construction)
        security: {
            setCertificatePromise: security.setCertificatePromise,
            setSignaturePromise: security.setSignaturePromise,
            setSignatureAlgorithm: security.setSignatureAlgorithm,
            getSignatureAlgorithm: security.getSignatureAlgorithm,
        },

        // Namespaces
        printers: createPrinters(ctx, transport),
        api: createApi(ctx, transport),
        networking: createNetworking(ctx, transport),
        serial: createSerial(ctx, transport),
        socket: createSocket(ctx, transport),
        usb: createUsb(ctx, transport),
        hid: createHid(ctx, transport),
        file: createFile(ctx, transport),

        /** Escape hatch: the underlying context (for advanced/testing use). */
        _ctx: ctx,
    };
}

export type Qz = ReturnType<typeof createQz>;
