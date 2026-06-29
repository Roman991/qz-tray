import { _qz } from './core.js';

_qz.serial = {
    /** List of functions called when receiving data from serial connection. */
    serialCallbacks: [],
    /** Calls all functions registered to listen for serial events. */
    callSerial: function (streamEvent) {
        if (Array.isArray(_qz.serial.serialCallbacks)) {
            for (var i = 0; i < _qz.serial.serialCallbacks.length; i++) {
                _qz.serial.serialCallbacks[i](streamEvent);
            }
        } else {
            _qz.serial.serialCallbacks(streamEvent);
        }
    },
};
