// Connection-state and version helpers that read live `ctx` state. Kept
// separate from the transport so security/compatibility can use them without a
// circular dependency on the transport module.

import type { Context } from './context.js';

export function isActive(ctx: Context): boolean {
    const ws = ctx.ws;
    const conn = ctx.connection;
    return (
        !ctx.shutdown &&
        conn != null &&
        ws != null &&
        (conn.readyState === ws.OPEN || conn.readyState === ws.CONNECTING)
    );
}

export function assertActive(ctx: Context): boolean {
    if (isActive(ctx)) return true;
    // Throwing here surfaces a clearer error than letting `undefined` propagate.
    throw new Error(`A connection to ${ctx.TITLE} has not been established yet`);
}

/**
 * Compare the connected QZ version against a target. Returns a signed number
 * (connected − target) for the first differing component, or 0 if equal/unknown.
 */
export function versionCompare(
    ctx: Context,
    major?: number,
    minor?: number,
    patch?: number,
    build?: number
): number | undefined {
    if (!assertActive(ctx)) return undefined;
    const semver = ctx.connection?.semver;
    if (!Array.isArray(semver)) return 0;

    if (major != null && semver.length > 0 && semver[0] !== major) return (semver[0] as number) - major;
    if (minor != null && semver.length > 1 && semver[1] !== minor) return (semver[1] as number) - minor;
    if (patch != null && semver.length > 2 && semver[2] !== patch) return (semver[2] as number) - patch;
    if (build != null && semver.length > 3 && semver[3] !== build) {
        return Number.isInteger(semver[3]) && Number.isInteger(build)
            ? (semver[3] as number) - build
            : semver[3].toString().localeCompare(build.toString());
    }
    return 0;
}

export function isVersion(ctx: Context, major?: number, minor?: number, patch?: number, build?: number): boolean {
    return versionCompare(ctx, major, minor, patch, build) === 0;
}
