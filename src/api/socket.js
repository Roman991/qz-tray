import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to interaction with communication sockets.
 * @namespace qz.socket
 */
qz.socket = {
    /**
     * Opens a network port for sending and receiving data.
     *
     * @param {string} host The connection hostname.
     * @param {number} port The connection port number.
     * @param {Object} [options] Network socket configuration.
     *  @param {string} [options.encoding='UTF-8'] Character set for communications.
     *
     * @memberof qz.socket
     */
    open: function (host, port, options) {
        var params = {
            host: host,
            port: port,
            options: options,
        };
        return _qz.websocket.dataPromise('socket.open', params);
    },

    /**
     * @param {string} host The connection hostname.
     * @param {number} port The connection port number.
     *
     * @memberof qz.socket
     */
    close: function (host, port) {
        var params = {
            host: host,
            port: port,
        };
        return _qz.websocket.dataPromise('socket.close', params);
    },

    /**
     * Send data over an open socket.
     *
     * @param {string} host The connection hostname.
     * @param {number} port The connection port number.
     * @param {string|Object} data Data to be sent over the port.
     *  @param {string} [data.type='PLAIN'] Valid values <code>[PLAIN]</code>
     *  @param {string} data.data Data to be sent over the port.
     *
     * @memberof qz.socket
     */
    sendData: function (host, port, data) {
        if (typeof data !== 'object') {
            data = {
                data: data,
                type: 'PLAIN',
            };
        }

        var params = {
            host: host,
            port: port,
            data: data,
        };
        return _qz.websocket.dataPromise('socket.sendData', params);
    },

    /**
     * List of functions called for any response from open network sockets.
     * Event data will contain <code>{string} host</code> and <code>{number} port</code> for all types.
     *  For RECEIVE types, <code>{string} response</code>.
     *  For ERROR types, <code>{string} exception</code>.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Object} eventData)</code> calls.
     *
     * @memberof qz.socket
     */
    setSocketCallbacks: function (calls) {
        _qz.socket.socketCallbacks = calls;
    },
};
