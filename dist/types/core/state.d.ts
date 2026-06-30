import type { Context } from './context.js';
export declare function isActive(ctx: Context): boolean;
export declare function assertActive(ctx: Context): boolean;
/**
 * Compare the connected QZ version against a target. Returns a signed number
 * (connected − target) for the first differing component, or 0 if equal/unknown.
 */
export declare function versionCompare(ctx: Context, major?: number, minor?: number, patch?: number, build?: number): number | undefined;
export declare function isVersion(ctx: Context, major?: number, minor?: number, patch?: number, build?: number): boolean;
