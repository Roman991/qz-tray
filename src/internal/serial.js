import { _qz } from './core.js';
import { dispatch } from './helpers.js';

_qz.serial = {
    /** List of functions called when receiving data from serial connection. */
    serialCallbacks: [],
    /** Calls all functions registered to listen for serial events. */
    callSerial: function (streamEvent) {
        dispatch(_qz.serial.serialCallbacks, streamEvent);
    },
};
