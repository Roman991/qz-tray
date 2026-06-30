// Print dispatch. Faithful port of legacy `qz.print`, operating on immutable
// PrintConfig values and the injected transport.

import type { Context } from '../core/context.js';
import type { Transport } from '../core/transport.js';
import type { PrintConfig } from './config.js';
import type { PrintPayload } from '../types.js';
import { compatConfig, compatData } from '../core/compatible.js';
import { makeRelativePathsAbsolute } from '../internal/util.js';

export type PrintFn = (
    configs: PrintConfig | PrintConfig[],
    data: PrintPayload[] | PrintPayload[][],
    resumeOnError?: boolean,
    signatures?: string | string[],
    signingTimestamps?: number | number[]
) => Promise<void>;

export function createPrint(ctx: Context, transport: Transport): PrintFn {
    return function print(configs, data, resumeOnError = false, signatures = [], signingTimestamps = []) {
        const configList = Array.isArray(configs) ? configs : [configs];
        const dataList = (Array.isArray((data as PrintPayload[][])[0]) ? data : [data]) as PrintPayload[][];
        const sigs = Array.isArray(signatures) ? signatures : [signatures];
        const stamps = Array.isArray(signingTimestamps) ? signingTimestamps : [signingTimestamps];

        for (const set of dataList) {
            makeRelativePathsAbsolute(set);
            compatData(ctx, set);
        }

        const sendToPrint = (config: PrintConfig, payload: PrintPayload[], signature?: string, timestamp?: number) => {
            const params = {
                printer: config.printer,
                options: compatConfig(ctx, config.options, config.dirty),
                data: payload,
            };
            return transport.dataPromise<void>('print', params, signature, timestamp);
        };

        // Chain (rather than Promise.all) so resumeOnError can collect each error.
        const chain: Array<() => Promise<void>> = [];
        for (let i = 0; i < configList.length || i < dataList.length; i++) {
            const config = configList[Math.min(i, configList.length - 1)];
            const payload = dataList[Math.min(i, dataList.length - 1)];
            const signature = sigs[i];
            const timestamp = stamps[i];
            chain.push(() => sendToPrint(config, payload, signature, timestamp));
        }

        const fallen: unknown[] = [];
        const fallThrough = resumeOnError ? (err: unknown) => void fallen.push(err) : null;
        if (resumeOnError) {
            chain.push(() =>
                ctx.promise<void>((resolve, reject) => {
                    fallen.length ? reject(fallen) : resolve();
                })
            );
        }

        let last: Promise<void> = ctx.promise<void>((r) => r());
        for (const link of chain) {
            last = fallThrough ? last.catch(fallThrough).then(link) : last.then(link);
        }
        return last;
    };
}
