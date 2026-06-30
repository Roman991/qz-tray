import type { Context } from './context.js';
import type { Security } from './security.js';
import type { ConnectOptions } from '../types.js';
import { isQualified } from '../internal/util.js';
export interface Transport {
    isActive(): boolean;
    connect(options?: ConnectOptions): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionInfo(): {
        socket: string;
        host: string;
        port: number;
    } | undefined;
    setErrorCallbacks(calls: Context['errorCallbacks']): void;
    setClosedCallbacks(calls: Context['closedCallbacks']): void;
    setUsingSurf(usingSurf: boolean): void;
    setSurfDomain(domain: string): void;
    /** Send an API call and resolve with its response. */
    dataPromise<T = unknown>(call: string, params?: unknown, signature?: string, timestamp?: number): Promise<T>;
}
export declare function createTransport(ctx: Context, security: Security): Transport;
export { isQualified };
