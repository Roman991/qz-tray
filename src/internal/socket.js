import { _qz } from './core.js';

_qz.socket = {
    /** List of functions called when receiving data from network socket connection. */
    socketCallbacks: [],
    /** Calls all functions registered to listen for network socket events. */
    callSocket: function (socketEvent) {
        if (Array.isArray(_qz.socket.socketCallbacks)) {
            for (var i = 0; i < _qz.socket.socketCallbacks.length; i++) {
                _qz.socket.socketCallbacks[i](socketEvent);
            }
        } else {
            _qz.socket.socketCallbacks(socketEvent);
        }
    },
};
