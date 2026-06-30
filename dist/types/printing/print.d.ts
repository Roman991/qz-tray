import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { PrintConfig } from './config.js';
import type { PrintPayload } from '../types.js';
export type PrintFn = (configs: PrintConfig | PrintConfig[], data: PrintPayload[] | PrintPayload[][], resumeOnError?: boolean, signatures?: string | string[], signingTimestamps?: number | number[]) => Promise<void>;
export declare function createPrint(ctx: Context, transport: Transport): PrintFn;
