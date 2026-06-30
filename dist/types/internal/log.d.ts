export interface Logger {
    trace(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    /** Debug-only warning. */
    allay(...args: unknown[]): void;
    error(...args: unknown[]): void;
}
export declare function createLogger(isDebug: () => boolean): Logger;
