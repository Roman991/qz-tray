import { _qz } from './core.js';
import { dispatch } from './helpers.js';

_qz.socket = {
    /** List of functions called when receiving data from network socket connection. */
    socketCallbacks: [],
    /** Calls all functions registered to listen for network socket events. */
    callSocket: function (socketEvent) {
        dispatch(_qz.socket.socketCallbacks, socketEvent);
    },
};
