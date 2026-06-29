import { _qz } from './core.js';
import { dispatch } from './helpers.js';

_qz.printers = {
    /** List of functions called when receiving data from printer connection. */
    printerCallbacks: [],
    /** Calls all functions registered to listen for printer events. */
    callPrinter: function (streamEvent) {
        dispatch(_qz.printers.printerCallbacks, streamEvent);
    },
};
