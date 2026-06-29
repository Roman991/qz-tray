import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related specifically to the web socket connection.
 * @namespace qz.websocket
 */
qz.websocket = {
    /**
     * Check connection status. Active connection is necessary for other calls to run.
     *
     * @returns {boolean} If there is an active connection with QZ Tray.
     *
     * @see connect
     *
     * @memberof  qz.websocket
     */
    isActive: function () {
        return _qz.tools.isActive();
    },

    /**
     * Call to setup connection with QZ Tray on user's system.
     *
     * @param {Object} [options] Configuration options for the web socket connection.
     *  @param {string|Array<string>} [options.host=['localhost', 'localhost.qz.io']] Host running the QZ Tray software.
     *  @param {Object} [options.port] Config options for ports to cycle.
     *   @param {Array<number>} [options.port.secure=[8181, 8282, 8383, 8484]] Array of secure (WSS) ports to try
     *   @param {Array<number>} [options.port.insecure=[8182, 8283, 8384, 8485]] Array of insecure (WS) ports to try
     *  @param {boolean} [options.usingSecure=true] If the web socket should try to use secure ports for connecting.
     *  @param {number} [options.keepAlive=60] Seconds between keep-alive pings to keep connection open. Set to 0 to disable.
     *  @param {number} [options.retries=0] Number of times to reconnect before failing.
     *  @param {number} [options.delay=0] Seconds before firing a connection.  Ignored if <code>options.retries</code> is 0.
     *
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.websocket
     */
    connect: function (options) {
        return _qz.tools.promise(function (resolve, reject) {
            if (_qz.websocket.connection) {
                const state = _qz.websocket.connection.readyState;

                if (state === _qz.tools.ws.OPEN) {
                    reject(new Error('An open connection with ' + _qz.TITLE + ' already exists'));
                    return;
                } else if (state === _qz.tools.ws.CONNECTING) {
                    reject(new Error('The current connection attempt has not returned yet'));
                    return;
                } else if (state === _qz.tools.ws.CLOSING) {
                    reject(new Error('Waiting for previous disconnect request to complete'));
                    return;
                }
            }

            if (!_qz.tools.ws) {
                reject(new Error('WebSocket not supported by this browser'));
                return;
            } else if (!_qz.tools.ws.CLOSED || _qz.tools.ws.CLOSED == 2) {
                reject(new Error('Unsupported WebSocket version detected: HyBi-00/Hixie-76'));
                return;
            }

            //ensure some form of options exists for value checks
            if (options == undefined) {
                options = {};
            }

            //disable secure ports if page is not secure
            if (typeof location === 'undefined' || location.protocol !== 'https:') {
                //respect forcing secure ports if it is defined, otherwise disable
                if (typeof options.usingSecure === 'undefined') {
                    _qz.log.trace('Disabling secure ports due to insecure page');
                    options.usingSecure = false;
                }
            }

            //ensure any hosts are passed to internals as an array
            if (typeof options.host !== 'undefined' && !Array.isArray(options.host)) {
                options.host = [options.host];
                //append "surf" domain if enabled
                if (_qz.websocket.connectConfig.usingSurf) {
                    for (var i = 0; i < options.host.length; i++) {
                        options.host[i] = _qz.tools.appendSurf(options.host[i]);
                    }
                }
            }

            _qz.websocket.shutdown = false; //reset state for new connection attempt
            var attempt = function (count) {
                var tried = false;
                var nextAttempt = function () {
                    if (!tried) {
                        tried = true;

                        if (options && count < options.retries) {
                            attempt(count + 1);
                        } else {
                            _qz.websocket.connection = null;
                            reject.apply(null, arguments);
                        }
                    }
                };

                var delayed = function () {
                    var config = _qz.tools.extend({}, _qz.websocket.connectConfig, options);
                    _qz.websocket.setup.findConnection(config, resolve, nextAttempt);
                };
                if (count == 0) {
                    delayed(); // only retries will be called with a delay
                } else {
                    setTimeout(delayed, options.delay * 1000);
                }
            };

            attempt(0);
        });
    },

    /**
     * Stop any active connection with QZ Tray.
     *
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.websocket
     */
    disconnect: function () {
        return _qz.tools.promise(function (resolve, reject) {
            if (_qz.websocket.connection != null) {
                if (_qz.tools.isActive()) {
                    // handles closing both 'connecting' and 'connected' states
                    _qz.websocket.shutdown = true;
                    _qz.websocket.connection.promise = { resolve: resolve, reject: reject };
                    _qz.websocket.connection.close();
                } else {
                    reject(new Error('Current connection is still closing'));
                }
            } else {
                reject(new Error('No open connection with ' + _qz.TITLE));
            }
        });
    },

    /**
     * List of functions called for any connections errors outside of an API call.<p/>
     * Also called if {@link websocket#connect} fails to connect.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Event} event)</code> calls.
     *
     * @memberof qz.websocket
     */
    setErrorCallbacks: function (calls) {
        _qz.websocket.errorCallbacks = calls;
    },

    /**
     * List of functions called for any connection closing event outside of an API call.<p/>
     * Also called when {@link websocket#disconnect} is called.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Event} event)</code> calls.
     *
     * @memberof qz.websocket
     */
    setClosedCallbacks: function (calls) {
        _qz.websocket.closedCallbacks = calls;
    },

    /**
     * Whether to append the "surf" domain (e.g. "qz.surf") to the end of non-qualified hosts (except "localhost")
     *
     * @param {boolean} usingSurf=true Toggles automatic "surf" domain appending
     * @since 2.2.6
     *
     * @memberof qz.websocket
     */
    setUsingSurf: function (usingSurf) {
        _qz.websocket.connectConfig.usingSurf = usingSurf;
    },

    /**
     * The domain to automagically append to non-qualified hosts, such as "qz.surf", or "example.com"
     *
     * @param {string} surfDomain="qz.surf" The domain to append to non-qualified hosts.
     * @since 2.2.6
     *
     * @memberof qz.websocket
     */
    setSurfDomain: function (surfDomain) {
        if (surfDomain.indexOf('.') === 0) {
            surfDomain = surfDomain.substring(1);
        }
        _qz.websocket.connectConfig.surfDomain = surfDomain;
    },

    /**
     * @deprecated Since 2.1.0.  Please use qz.networking.device() instead
     *
     * @param {string} [hostname] Hostname to try to connect to when determining network interfaces, defaults to "google.com"
     * @param {number} [port] Port to use with custom hostname, defaults to 443
     * @param {string} [signature] Pre-signed signature of hashed JSON string containing <code>call='websocket.getNetworkInfo'</code>, <code>params</code> object, and <code>timestamp</code>.
     * @param {number} [signingTimestamp] Required with <code>signature</code>. Timestamp used with pre-signed content.
     *
     * @returns {Promise<Object<{ipAddress: string, macAddress: string}>|Error>} Connected system's network information.
     *
     * @memberof qz.websocket
     */
    getNetworkInfo: _qz.compatible.networking,

    /**
     * @returns {Object<{socket: String, host: String, port: Number}>} Details of active websocket connection
     *
     * @memberof qz.websocket
     */
    getConnectionInfo: function () {
        if (_qz.tools.assertActive()) {
            var url = _qz.websocket.connection.url.split(/[:\/]+/g);
            return { socket: url[0], host: url[1], port: +url[2] };
        }
    },
};
