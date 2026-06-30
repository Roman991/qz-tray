// Per-instance logger. `debug` gates the trace/allay levels, matching the
// legacy `_qz.log` behavior but without a module-global DEBUG flag.

export interface Logger {
    trace(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    /** Debug-only warning. */
    allay(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

export function createLogger(isDebug: () => boolean): Logger {
    return {
        trace: (...args) => {
            if (isDebug()) console.log(...args);
        },
        info: (...args) => console.info(...args),
        warn: (...args) => console.warn(...args),
        allay: (...args) => {
            if (isDebug()) console.warn(...args);
        },
        error: (...args) => console.error(...args),
    };
}
