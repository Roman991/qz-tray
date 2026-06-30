import type { Context } from './context.js';
import type { PrintOptions, PrintPayload } from '../types.js';
/** Convert print payloads to the format expected by older QZ versions (in place). */
export declare function compatData(ctx: Context, printData: PrintPayload[]): void;
/** Convert config options to match an older QZ version (operates on a clone). */
export declare function compatConfig(ctx: Context, config: PrintOptions, dirty: Record<string, boolean>): PrintOptions;
/** Warn (unless quiet) if the connected version cannot honor a custom algorithm. */
export declare function compatAlgorithm(ctx: Context, quiet?: boolean): boolean;
