import { _qz } from './core.js';

_qz.hid = {
    /** List of functions called when receiving data from hid connection. */
    hidCallbacks: [],
    /** Calls all functions registered to listen for hid events. */
    callHid: function (streamEvent) {
        if (Array.isArray(_qz.hid.hidCallbacks)) {
            for (var i = 0; i < _qz.hid.hidCallbacks.length; i++) {
                _qz.hid.hidCallbacks[i](streamEvent);
            }
        } else {
            _qz.hid.hidCallbacks(streamEvent);
        }
    },
};
