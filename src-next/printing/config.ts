// Immutable print configuration. Replaces the legacy `Config` constructor
// (which mutated `this.config` / `this._dirtyOpts` in place) with a plain,
// readonly value plus `.with()` / `.withPrinter()` that return new configs.

import type { PrintOptions, Printer, PrinterInput } from '../types.js';
import { normalizePrinter } from '../internal/util.js';

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

function dirtyKeys(options: PrintOptions | undefined): Record<string, boolean> {
    const dirty: Record<string, boolean> = {};
    for (const key of Object.keys(options ?? {})) {
        if ((options as Record<string, unknown>)[key] !== undefined) dirty[key] = true;
    }
    return dirty;
}

/**
 * Build a config from already-effective options. `.with()` extends the
 * effective options (so prior overrides survive) and only newly-passed keys are
 * added to `dirty` — defaults pulled in at creation never count as dirty.
 */
function build(printer: PrinterInput, options: PrintOptions, dirty: Record<string, boolean>): PrintConfig {
    const resolvedPrinter: Printer = normalizePrinter(printer);
    return {
        printer: resolvedPrinter,
        options,
        dirty,
        with: (patch) => build(resolvedPrinter, { ...options, ...patch }, { ...dirty, ...dirtyKeys(patch) }),
        withPrinter: (next) => build(next, options, dirty),
    };
}

export function createConfig(
    printer: PrinterInput,
    options: PrintOptions | undefined,
    defaults: PrintOptions
): PrintConfig {
    return build(printer, { ...defaults, ...options }, dirtyKeys(options));
}
