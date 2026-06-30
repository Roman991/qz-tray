import type { PrintOptions, Printer, PrinterInput } from '../types.js';
export interface PrintConfig {
    readonly printer: Printer;
    readonly options: Readonly<PrintOptions>;
    /** Keys explicitly set by the caller (drives version-compat shims). */
    readonly dirty: Readonly<Record<string, boolean>>;
    /** Return a new config with `patch` merged over the current options. */
    with(patch: PrintOptions): PrintConfig;
    /** Return a new config targeting a different printer. */
    withPrinter(printer: PrinterInput): PrintConfig;
}
export declare function createConfig(printer: PrinterInput, options: PrintOptions | undefined, defaults: PrintOptions): PrintConfig;
