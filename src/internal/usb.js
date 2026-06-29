import { _qz } from './core.js';
import { dispatch } from './helpers.js';

_qz.usb = {
    /** List of functions called when receiving data from usb connection. */
    usbCallbacks: [],
    /** Calls all functions registered to listen for usb events. */
    callUsb: function (streamEvent) {
        dispatch(_qz.usb.usbCallbacks, streamEvent);
    },
};
