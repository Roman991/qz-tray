// Pure, instance-agnostic helpers. None of these reference client state, so
// they stay trivially unit-testable (the legacy `helpers.js` + the pure parts
// of `tools.js`).

import type { Printer, PrinterInput, PrintData, PrintPayload } from '../types.js';

/** Ensure a value is an array, wrapping a single value. */
export function ensureArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

/** A bare value becomes a `{ data, type: 'PLAIN' }` envelope; objects pass through. */
export function normalizeData(data: unknown): PrintData {
    if (typeof data !== 'object' || data === null) {
        return { data: data as string, type: 'PLAIN' };
    }
    return data as PrintData;
}

/** A printer string becomes `{ name }`; an object passes through. */
export function normalizePrinter(printer: PrinterInput): Printer {
    return typeof printer === 'string' ? { name: printer } : printer;
}

/**
 * Backwards-compat shim for USB/HID device methods: if the first argument is
 * already a device-info object, return it; otherwise build one from positional
 * arguments using the provided key order.
 */
export function normalizeDeviceInfo(args: ArrayLike<unknown>, keys: string[]): Record<string, unknown> {
    if (typeof args[0] === 'object' && args[0] !== null) {
        return args[0] as Record<string, unknown>;
    }
    const info: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i++) info[keys[i]] = args[i];
    return info;
}

/** JSON stringify that skips `promise` keys and neutralizes Prototype.js's Array#toJSON. */
export function stringify(object: unknown): string {
    const pjson = (Array.prototype as { toJSON?: unknown }).toJSON;
    delete (Array.prototype as { toJSON?: unknown }).toJSON;
    const result = JSON.stringify(object, (key, value) => (key === 'promise' ? undefined : value));
    if (pjson) (Array.prototype as { toJSON?: unknown }).toJSON = pjson;
    return result;
}

/** Deep-merge sources into target (in place), cloning nested plain objects. */
export function deepExtend<T extends Record<string, unknown>>(target: T, ...sources: Array<Partial<T> | undefined>): T {
    const out = (typeof target === 'object' && target !== null ? target : {}) as Record<string, unknown>;
    for (const source of sources) {
        if (!source) continue;
        for (const key of Object.keys(source)) {
            const value = (source as Record<string, unknown>)[key];
            if (out === value) continue;
            if (value && (value as { constructor?: unknown }).constructor === Object) {
                const clone = (out[key] as Record<string, unknown>) || (Array.isArray(value) ? [] : {});
                out[key] = deepExtend(clone as Record<string, unknown>, value as Record<string, unknown>);
            } else if (value !== undefined) {
                out[key] = value;
            }
        }
    }
    return out as T;
}

const HEX = (i: number): string => i.toString(16).padStart(2, '0');

export function uint8ToHex(uint8: Uint8Array): string {
    return Array.from(uint8).map(HEX).join('');
}

const B64 = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'];

export function uint8ToBase64(uint8: Uint8Array): string {
    // Adapted from Egor Nepomnyaschih's code (MIT, 2020).
    let result = '';
    let i: number;
    const l = uint8.length;
    for (i = 2; i < l; i += 3) {
        result += B64[uint8[i - 2] >> 2];
        result += B64[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
        result += B64[((uint8[i - 1] & 0x0f) << 2) | (uint8[i] >> 6)];
        result += B64[uint8[i] & 0x3f];
    }
    if (i === l + 1) {
        result += B64[uint8[i - 2] >> 2];
        result += B64[(uint8[i - 2] & 0x03) << 4];
        result += '==';
    }
    if (i === l) {
        result += B64[uint8[i - 2] >> 2];
        result += B64[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
        result += B64[(uint8[i - 1] & 0x0f) << 2];
        result += '=';
    }
    return result;
}

/** True if a hostname is fully qualified (so the "surf" tld should not be appended). */
export function isQualified(host: string): boolean {
    return host.toLowerCase() === 'localhost' || host.indexOf('.') !== -1 || host.indexOf(':') !== -1;
}

export function appendSurf(host: string, surfDomain: string): string {
    return isQualified(host) ? host : `${host}.${surfDomain}`;
}

/** Generate a short unique id used to map a websocket response to its call. */
export function newUID(): string {
    const len = 6;
    return (new Array(len + 1).join('0') + ((Math.random() * Math.pow(36, len)) << 0).toString(36)).slice(-len);
}

/** Resolve a possibly-relative resource path to an absolute one (browser or node). */
export function absolute(loc: string): string {
    const g = globalThis as { document?: Document; require?: (id: string) => { resolve(p: string): string } };
    if (typeof g.document !== 'undefined' && typeof g.document.createElement === 'function') {
        const a = g.document.createElement('a');
        a.href = loc;
        return a.href;
    }
    if (typeof g.require === 'function') {
        try {
            return g.require('path').resolve(loc);
        } catch {
            /* fall through */
        }
    }
    return loc;
}

/** Rewrite known file/image payloads to absolute paths, in place. */
export function makeRelativePathsAbsolute(data: PrintPayload[]): void {
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (typeof item !== 'object' || item === null) continue;
        let isAbsolute = false;
        const raw = item.data;

        if (typeof raw === 'string' && raw.search(/data:image\/\w+;base64,/) === 0) {
            item.flavor = 'base64';
            item.data = raw.replace(/^data:image\/\w+;base64,/, '');
        } else if (item.flavor) {
            if (['FILE', 'XML'].indexOf(item.flavor.toUpperCase()) > -1) isAbsolute = true;
        } else if (item.format && ['HTML', 'IMAGE', 'PDF', 'FILE', 'XML'].indexOf(item.format.toUpperCase()) > -1) {
            isAbsolute = true;
        } else if (
            item.type &&
            ((['PIXEL', 'IMAGE', 'PDF'].indexOf(item.type.toUpperCase()) > -1 && !item.format) ||
                (['HTML', 'PDF'].indexOf(item.type.toUpperCase()) > -1 &&
                    (!item.format || item.format.toUpperCase() === 'FILE')))
        ) {
            isAbsolute = true;
        }

        if (isAbsolute && typeof item.data === 'string') {
            item.data = absolute(item.data);
        }
        const overlay = item.options?.overlay;
        if (item.options && typeof overlay === 'string') {
            item.options.overlay = absolute(overlay);
        }
    }
}
