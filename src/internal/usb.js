import { _qz } from './core.js';

_qz.usb = {
    /** List of functions called when receiving data from usb connection. */
    usbCallbacks: [],
    /** Calls all functions registered to listen for usb events. */
    callUsb: function (streamEvent) {
        if (Array.isArray(_qz.usb.usbCallbacks)) {
            for (var i = 0; i < _qz.usb.usbCallbacks.length; i++) {
                _qz.usb.usbCallbacks[i](streamEvent);
            }
        } else {
            _qz.usb.usbCallbacks(streamEvent);
        }
    },
};
