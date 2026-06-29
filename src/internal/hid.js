import { _qz } from './core.js';
import { dispatch } from './helpers.js';

_qz.hid = {
    /** List of functions called when receiving data from hid connection. */
    hidCallbacks: [],
    /** Calls all functions registered to listen for hid events. */
    callHid: function (streamEvent) {
        dispatch(_qz.hid.hidCallbacks, streamEvent);
    },
};
