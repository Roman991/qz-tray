import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to networking information
 * @namespace qz.networking
 * @since 2.1.0
 */
qz.networking = {
    /**
     * @param {string} [hostname] Hostname to try to connect to when determining network interfaces, defaults to "google.com"
     * @param {number} [port] Port to use with custom hostname, defaults to 443
     * @returns {Promise<Object|Error>} Connected system's network information.
     *
     * @memberof qz.networking
     * @since 2.1.0
     */
    device: function (hostname, port) {
        // Wrap 2.0
        if (_qz.tools.isVersion(2, 0)) {
            return _qz.compatible.networking(hostname, port, null, null, function (data) {
                return { ip: data.ipAddress, mac: data.macAddress };
            });
        }
        // Use 2.1
        return _qz.websocket.dataPromise('networking.device', {
            hostname: hostname,
            port: port,
        });
    },

    /**
     * Get computer hostname
     *
     * @param {string} [hostname] DEPRECATED Hostname to try to connect to when determining network interfaces, defaults to "google.com"
     * @param {number} [port] DEPRECATED Port to use with custom hostname, defaults to 443
     * @returns {Promise<string|Error>} Connected system's hostname.
     *
     * @memberof qz.networking
     * @since 2.2.2
     */
    hostname: function (hostname, port) {
        // Wrap < 2.2.2
        if (_qz.tools.versionCompare(2, 2, 2) < 0) {
            return _qz.tools.promise(function (resolve, reject) {
                _qz.websocket
                    .dataPromise('networking.device', { hostname: hostname, port: port })
                    .then(function (device) {
                        console.log(device);
                        resolve(device.hostname);
                    });
            });
        } else {
            return _qz.websocket.dataPromise('networking.hostname');
        }
    },

    /**
     * @param {string} [hostname] Hostname to try to connect to when determining network interfaces, defaults to "google.com"
     * @param {number} [port] Port to use with custom hostname, defaults to 443
     * @returns {Promise<Array<Object>|Error>} Connected system's network information.
     *
     * @memberof qz.networking
     * @since 2.1.0
     */
    devices: function (hostname, port) {
        // Wrap 2.0
        if (_qz.tools.isVersion(2, 0)) {
            return _qz.compatible.networking(hostname, port, null, null, function (data) {
                return [{ ip: data.ipAddress, mac: data.macAddress }];
            });
        }
        // Use 2.1
        return _qz.websocket.dataPromise('networking.devices', {
            hostname: hostname,
            port: port,
        });
    },
};
