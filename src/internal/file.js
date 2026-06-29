import { _qz } from './core.js';
import { dispatch } from './helpers.js';

_qz.file = {
    /** List of functions called when receiving info regarding file changes. */
    fileCallbacks: [],
    /** Calls all functions registered to listen for file events. */
    callFile: function (streamEvent) {
        dispatch(_qz.file.fileCallbacks, streamEvent);
    },
};
