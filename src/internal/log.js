import { _qz } from './core.js';

_qz.log = {
    /** Debugging messages */
    trace: function () {
        if (_qz.DEBUG) {
            console.log.apply(console, arguments);
        }
    },
    /** General messages */
    info: function () {
        console.info.apply(console, arguments);
    },
    /** General warnings */
    warn: function () {
        console.warn.apply(console, arguments);
    },
    /** Debugging errors */
    allay: function () {
        if (_qz.DEBUG) {
            console.warn.apply(console, arguments);
        }
    },
    /** General errors */
    error: function () {
        console.error.apply(console, arguments);
    },
};
