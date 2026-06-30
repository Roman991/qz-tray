import type { Printer, PrinterInput, PrintData, PrintPayload } from '../types.js';
/** Ensure a value is an array, wrapping a single value. */
export declare function ensureArray<T>(value: T | T[]): T[];
/** A bare value becomes a `{ data, type: 'PLAIN' }` envelope; objects pass through. */
export declare function normalizeData(data: unknown): PrintData;
/** A printer string becomes `{ name }`; an object passes through. */
export declare function normalizePrinter(printer: PrinterInput): Printer;
/**
 * Backwards-compat shim for USB/HID device methods: if the first argument is
 * already a device-info object, return it; otherwise build one from positional
 * arguments using the provided key order.
 */
export declare function normalizeDeviceInfo(args: ArrayLike<unknown>, keys: string[]): Record<string, unknown>;
/** JSON stringify that skips `promise` keys and neutralizes Prototype.js's Array#toJSON. */
export declare function stringify(object: unknown): string;
/** Deep-merge sources into target (in place), cloning nested plain objects. */
export declare function deepExtend<T extends Record<string, unknown>>(target: T, ...sources: Array<Partial<T> | undefined>): T;
export declare function uint8ToHex(uint8: Uint8Array): string;
export declare function uint8ToBase64(uint8: Uint8Array): string;
/** True if a hostname is fully qualified (so the "surf" tld should not be appended). */
export declare function isQualified(host: string): boolean;
export declare function appendSurf(host: string, surfDomain: string): string;
/** Generate a short unique id used to map a websocket response to its call. */
export declare function newUID(): string;
/** Resolve a possibly-relative resource path to an absolute one (browser or node). */
export declare function absolute(loc: string): string;
/** Rewrite known file/image payloads to absolute paths, in place. */
export declare function makeRelativePathsAbsolute(data: PrintPayload[]): void;
