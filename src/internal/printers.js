import { _qz } from './core.js';

_qz.printers = {
    /** List of functions called when receiving data from printer connection. */
    printerCallbacks: [],
    /** Calls all functions registered to listen for printer events. */
    callPrinter: function (streamEvent) {
        if (Array.isArray(_qz.printers.printerCallbacks)) {
            for (var i = 0; i < _qz.printers.printerCallbacks.length; i++) {
                _qz.printers.printerCallbacks[i](streamEvent);
            }
        } else {
            _qz.printers.printerCallbacks(streamEvent);
        }
    },
};
