import { _qz } from './core.js';

_qz.printing = {
    /** Default options used for new printer configs. Can be overridden using {@link qz.configs.setDefaults}. */
    defaultConfig: {
        //value purposes are explained in the qz.configs.setDefaults docs

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
    },
};
