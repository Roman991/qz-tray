// Signing/certificate handling for one client instance. Holds what used to be
// the mutable global `_qz.security` state inside the instance, and accepts both
// the modern provider shape (`() => value | Promise`) and the legacy
// resolver/async-factory shapes used by `setSignaturePromise` etc.

import type { Context } from './context.js';
import type { SecurityOptions, SignatureAlgorithm } from '../types.js';
import { compatAlgorithm } from './compatible.js';

const UNDIALOGED = new Set<string>([
    'printers.getStatus',
    'printers.stopListening',
    'usb.isClaimed',
    'usb.closeStream',
    'usb.releaseDevice',
    'hid.stopListening',
    'hid.isClaimed',
    'hid.closeStream',
    'hid.releaseDevice',
    'file.stopListening',
    'getVersion',
]);

const isAsyncFunction = (fn: unknown): boolean =>
    typeof fn === 'function' && (fn as { constructor?: { name?: string } }).constructor?.name === 'AsyncFunction';

const isThenable = (v: unknown): v is Promise<unknown> =>
    typeof v === 'object' && v !== null && typeof (v as { then?: unknown }).then === 'function';

export interface Security {
    /** Resolve the site certificate. Used by the transport on connect. */
    certProvider(): Promise<string>;
    /** Sign a hashed payload. Used by the transport before privileged calls. */
    signProvider(toSign: string): Promise<string>;
    algorithm: SignatureAlgorithm;
    rejectOnCertFailure: boolean;
    needsSigned(callName: string | null): boolean;

    // Public API (also backs the legacy `qz.security.*` surface).
    setCertificatePromise(handler: unknown, options?: { rejectOnFailure?: boolean }): void;
    setSignaturePromise(factory: unknown): void;
    setSignatureAlgorithm(algorithm: string): void;
    getSignatureAlgorithm(): SignatureAlgorithm;
}

export function createSecurity(ctx: Context, opts: SecurityOptions = {}): Security {
    let certProvider: () => Promise<string> = () => ctx.promise<string>((_resolve, reject) => reject());
    let signProvider: (toSign: string) => Promise<string> = () => ctx.promise<string>((resolve) => resolve(''));

    const security: Security = {
        algorithm: opts.algorithm ?? 'SHA1',
        rejectOnCertFailure: opts.rejectOnCertFailure ?? false,

        certProvider: () => certProvider(),
        signProvider: (toSign) => signProvider(toSign),

        needsSigned: (callName) => callName != null && !UNDIALOGED.has(callName),

        setCertificatePromise(handler, options) {
            security.rejectOnCertFailure = !!options?.rejectOnFailure;
            if (isThenable(handler)) {
                certProvider = () => handler as Promise<string>;
            } else if (isAsyncFunction(handler)) {
                certProvider = () => (handler as () => Promise<string>)();
            } else {
                // Legacy resolver: `Function(resolve, reject)`.
                certProvider = () =>
                    ctx.promise<string>(
                        handler as (resolve: (v: string) => void, reject: (e?: unknown) => void) => void
                    );
            }
        },

        setSignaturePromise(factory) {
            if (isAsyncFunction(factory)) {
                signProvider = (toSign) => (factory as (s: string) => Promise<string>)(toSign);
            } else {
                // Legacy: factory(toSign) returns a resolver `Function(resolve, reject)`.
                const make = factory as (
                    s: string
                ) => (resolve: (v: string) => void, reject: (e?: unknown) => void) => void;
                signProvider = (toSign) => ctx.promise<string>(make(toSign));
            }
        },

        setSignatureAlgorithm(algorithm) {
            if (!compatAlgorithm(ctx)) return;
            const upper = algorithm.toUpperCase();
            if (['SHA1', 'SHA256', 'SHA512'].indexOf(upper) < 0) {
                ctx.log.error(`Signing algorithm '${algorithm}' is not supported.`);
            } else {
                security.algorithm = upper as SignatureAlgorithm;
            }
        },

        getSignatureAlgorithm: () => security.algorithm,
    };

    // Modern provider options translate directly into resolved promises.
    if (opts.certificate) {
        const provide = opts.certificate;
        certProvider = () => Promise.resolve(provide());
    }
    if (opts.sign) {
        const sign = opts.sign;
        signProvider = (toSign) => Promise.resolve(sign(toSign));
    }

    return security;
}
