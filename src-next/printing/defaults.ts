import type { PrintOptions } from '../types.js';

/** Default options used for new printer configs (legacy `_qz.printing.defaultConfig`). */
export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
    bounds: null,
    colorType: 'color',
    copies: 1,
    density: 0,
    duplex: false,
    fallbackDensity: null,
    interpolation: 'bicubic',
    jobName: null,
    legacy: false,
    margins: 0,
    orientation: null,
    paperThickness: null,
    printerTray: null,
    rasterize: false,
    rotation: 0,
    scaleContent: true,
    size: null,
    units: 'in',

    forceRaw: false,
    encoding: null,
    spool: null,
};
