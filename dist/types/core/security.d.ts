import type { Context } from './context.js';
import type { SecurityOptions, SignatureAlgorithm } from '../types.js';
export interface Security {
    /** Resolve the site certificate. Used by the transport on connect. */
    certProvider(): Promise<string>;
    /** Sign a hashed payload. Used by the transport before privileged calls. */
    signProvider(toSign: string): Promise<string>;
    algorithm: SignatureAlgorithm;
    rejectOnCertFailure: boolean;
    needsSigned(callName: string | null): boolean;
    setCertificatePromise(handler: unknown, options?: {
        rejectOnFailure?: boolean;
    }): void;
    setSignaturePromise(factory: unknown): void;
    setSignatureAlgorithm(algorithm: string): void;
    getSignatureAlgorithm(): SignatureAlgorithm;
}
export declare function createSecurity(ctx: Context, opts?: SecurityOptions): Security;
