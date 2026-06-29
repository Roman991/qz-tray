import { _qz } from './core.js';

_qz.file = {
    /** List of functions called when receiving info regarding file changes. */
    fileCallbacks: [],
    /** Calls all functions registered to listen for file events. */
    callFile: function (streamEvent) {
        if (Array.isArray(_qz.file.fileCallbacks)) {
            for (var i = 0; i < _qz.file.fileCallbacks.length; i++) {
                _qz.file.fileCallbacks[i](streamEvent);
            }
        } else {
            _qz.file.fileCallbacks(streamEvent);
        }
    },
};
