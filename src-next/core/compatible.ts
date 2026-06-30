// Backwards-compatibility transforms applied per connected QZ version. Ported
// from legacy `_qz.compatible`, but each function takes `ctx` explicitly.

import type { Context } from './context.js';
import type { PrintOptions, PrintPayload } from '../types.js';
import { isActive, isVersion, versionCompare } from './state.js';
import { uint8ToBase64, uint8ToHex } from '../internal/util.js';

/** Convert print payloads to the format expected by older QZ versions (in place). */
export function compatData(ctx: Context, printData: PrintPayload[]): void {
    for (const item of printData) {
        if (typeof item === 'object' && item !== null && item.data instanceof Uint8Array && item.flavor) {
            const flavor = item.flavor.toUpperCase();
            if (flavor === 'BASE64') item.data = uint8ToBase64(item.data);
            else if (flavor === 'HEX') item.data = uint8ToHex(item.data);
            else throw new Error(`Uint8Array conversion to '${flavor}' is not supported.`);
        }
    }

    if ((versionCompare(ctx, 2, 2, 4) ?? 0) < 0) {
        for (const item of printData) {
            if (typeof item !== 'object' || item === null) continue;
            const opts = item.options;
            if (opts && typeof opts.dotDensity === 'string') {
                opts.dotDensity = opts.dotDensity.toLowerCase().replace('-legacy', '');
            }
        }
    }

    if (isVersion(ctx, 2, 0)) {
        ctx.log.trace(`Converting print data to v2.0 for ${ctx.connection?.version}`);
        for (const item of printData) {
            if (typeof item !== 'object' || item === null) continue;
            const obj = item as unknown as Record<string, string>;
            if (obj.type?.toUpperCase() === 'RAW' && obj.format?.toUpperCase() === 'IMAGE') {
                if (obj.flavor?.toUpperCase() === 'BASE64') {
                    obj.data = 'data:image/compat;base64,' + obj.data;
                }
                obj.flavor = 'IMAGE';
            }
            if (obj.type?.toUpperCase() === 'RAW' || obj.format?.toUpperCase() === 'COMMAND') {
                obj.format = 'RAW';
            }
            obj.type = obj.format;
            obj.format = obj.flavor;
            delete obj.flavor;
        }
    }
}

/** Convert config options to match an older QZ version (operates on a clone). */
export function compatConfig(ctx: Context, config: PrintOptions, dirty: Record<string, boolean>): PrintOptions {
    const out: PrintOptions & Record<string, unknown> = { ...config };
    if (isVersion(ctx, 2, 0) && !dirty.rasterize) {
        out.rasterize = true;
    }
    if ((versionCompare(ctx, 2, 2) ?? 0) < 0) {
        out.altPrinting = out.forceRaw;
        delete out.forceRaw;
    }
    if ((versionCompare(ctx, 2, 1, 2, 11) ?? 0) < 0 && out.spool) {
        if (out.spool.size) {
            out.perSpool = out.spool.size;
        }
        if (out.spool.end) {
            out.endOfDoc = out.spool.end;
        }
        delete out.spool;
    }
    return out;
}

/** Warn (unless quiet) if the connected version cannot honor a custom algorithm. */
export function compatAlgorithm(ctx: Context, quiet?: boolean): boolean {
    if (isActive(ctx) && ctx.connection?.semver) {
        if (isVersion(ctx, 2, 0)) {
            if (!quiet) {
                ctx.log.warn(
                    `Connected to an older version of ${ctx.TITLE}, alternate signature algorithms are not supported`
                );
            }
            return false;
        }
    }
    return true;
}
