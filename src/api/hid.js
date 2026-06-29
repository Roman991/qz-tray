import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to interaction with HID USB devices<br/>
 * Many of these calls can be accomplished from the <code>qz.usb</code> namespace,
 * but HID allows for simpler interaction
 * @namespace qz.hid
 * @since 2.0.1
 */
qz.hid = {
    /**
     * List of available HID devices. Includes (hexadecimal) vendor ID and (hexadecimal) product ID.
     * If available, also returns manufacturer and product descriptions.
     *
     * @returns {Promise<Array<Object>|Error>} Array of JSON objects containing information on connected HID devices.
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    listDevices: function () {
        return _qz.websocket.dataPromise('hid.listDevices');
    },

    /**
     * Start listening for HID device actions, such as attach / detach events.
     * Reported under the ACTION type in the streamEvent on callbacks.
     *
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @see qz.hid.setHidCallbacks
     *
     * @memberof qz.hid
     */
    startListening: function () {
        return _qz.websocket.dataPromise('hid.startListening');
    },

    /**
     * Stop listening for HID device actions.
     *
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @see qz.hid.setHidCallbacks
     *
     * @memberof qz.hid
     */
    stopListening: function () {
        return _qz.websocket.dataPromise('hid.stopListening');
    },

    /**
     * List of functions called for any response from open usb devices.
     * Event data will contain <code>{string} vendorId</code> and <code>{string} productId</code> for all types.
     *  For RECEIVE types, <code>{Array} output</code> (in hexadecimal format).
     *  For ERROR types, <code>{string} exception</code>.
     *  For ACTION types, <code>{string} actionType</code>.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Object} eventData)</code> calls.
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    setHidCallbacks: function (calls) {
        _qz.hid.hidCallbacks = calls;
    },

    /**
     * Claim a HID device to enable sending/reading data across.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    claimDevice: function (deviceInfo) {
        if (typeof deviceInfo !== 'object') {
            deviceInfo = { vendorId: arguments[0], productId: arguments[1] };
        } //backwards compatibility

        return _qz.websocket.dataPromise('hid.claimDevice', deviceInfo);
    },

    /**
     * Check the current claim state of a HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     * @returns {Promise<boolean|Error>}
     *
     * @since 2.0.2
     * @memberOf qz.hid
     */
    isClaimed: function (deviceInfo) {
        if (typeof deviceInfo !== 'object') {
            deviceInfo = { vendorId: arguments[0], productId: arguments[1] };
        } //backwards compatibility

        return _qz.websocket.dataPromise('hid.isClaimed', deviceInfo);
    },

    /**
     * Send data to a claimed HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     *  @param deviceInfo.data Bytes to send over specified endpoint.
     *  @param deviceInfo.endpoint=0x00 First byte of the data packet signifying the HID report ID.
     *                             Must be 0x00 for devices only supporting a single report.
     *  @param deviceInfo.reportId=0x00 Alias for <code>deviceInfo.endpoint</code>. Not used if endpoint is provided.
     *  @param {string} [deviceInfo.type='PLAIN'] Valid values <code>[FILE | PLAIN | HEX | BASE64]</code>
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    sendData: function (deviceInfo) {
        //backwards compatibility
        if (typeof deviceInfo !== 'object') {
            deviceInfo = {
                vendorId: arguments[0],
                productId: arguments[1],
                data: arguments[2],
                endpoint: arguments[3],
            };
        }

        if (_qz.tools.versionCompare(2, 1, 0, 12) >= 0) {
            if (typeof deviceInfo.data !== 'object') {
                deviceInfo.data = {
                    data: deviceInfo.data,
                    type: 'PLAIN',
                };
            }

            if (deviceInfo.data.type && deviceInfo.data.type.toUpperCase() == 'FILE') {
                deviceInfo.data.data = _qz.tools.absolute(deviceInfo.data.data);
            }
        } else {
            if (typeof deviceInfo.data === 'object') {
                if (deviceInfo.data.type.toUpperCase() !== 'PLAIN' || typeof deviceInfo.data.data !== 'string') {
                    return _qz.tools.reject(
                        new Error(
                            'Data format is not supported with connected ' +
                                _qz.TITLE +
                                ' version ' +
                                _qz.websocket.connection.version
                        )
                    );
                }

                deviceInfo.data = deviceInfo.data.data;
            }
        }

        return _qz.websocket.dataPromise('hid.sendData', deviceInfo);
    },

    /**
     * Read data from a claimed HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     *  @param deviceInfo.responseSize Size of the byte array to receive a response in.
     * @returns {Promise<Array<string>|Error>} List of (hexadecimal) bytes received from the HID device.
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    readData: function (deviceInfo) {
        //backwards compatibility
        if (typeof deviceInfo !== 'object') {
            deviceInfo = {
                vendorId: arguments[0],
                productId: arguments[1],
                responseSize: arguments[2],
            };
        }

        return _qz.websocket.dataPromise('hid.readData', deviceInfo);
    },

    /**
     * Send a feature report to a claimed HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     *  @param deviceInfo.data Bytes to send over specified endpoint.
     *  @param deviceInfo.endpoint=0x00 First byte of the data packet signifying the HID report ID.
     *                             Must be 0x00 for devices only supporting a single report.
     *  @param deviceInfo.reportId=0x00 Alias for <code>deviceInfo.endpoint</code>. Not used if endpoint is provided.
     *  @param {string} [deviceInfo.type='PLAIN'] Valid values <code>[FILE | PLAIN | HEX | BASE64]</code>
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.hid
     */
    sendFeatureReport: function (deviceInfo) {
        return _qz.websocket.dataPromise('hid.sendFeatureReport', deviceInfo);
    },

    /**
     * Get a feature report from a claimed HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     *  @param deviceInfo.responseSize Size of the byte array to receive a response in.
     * @returns {Promise<Array<string>|Error>} List of (hexadecimal) bytes received from the HID device.
     *
     * @memberof qz.hid
     */
    getFeatureReport: function (deviceInfo) {
        return _qz.websocket.dataPromise('hid.getFeatureReport', deviceInfo);
    },

    /**
     * Provides a continuous stream of read data from a claimed HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     *  @param deviceInfo.responseSize Size of the byte array to receive a response in.
     *  @param deviceInfo.interval=100 Frequency to send read data back, in milliseconds.
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @see qz.hid.setHidCallbacks
     *
     * @memberof qz.hid
     */
    openStream: function (deviceInfo) {
        //backwards compatibility
        if (typeof deviceInfo !== 'object') {
            deviceInfo = {
                vendorId: arguments[0],
                productId: arguments[1],
                responseSize: arguments[2],
                interval: arguments[3],
            };
        }

        return _qz.websocket.dataPromise('hid.openStream', deviceInfo);
    },

    /**
     * Stops the stream of read data from a claimed HID device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    closeStream: function (deviceInfo) {
        if (typeof deviceInfo !== 'object') {
            deviceInfo = { vendorId: arguments[0], productId: arguments[1] };
        } //backwards compatibility

        return _qz.websocket.dataPromise('hid.closeStream', deviceInfo);
    },

    /**
     * Release a claimed HID device to free resources after sending/reading data.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of HID device's vendor ID.
     *  @param deviceInfo.productId Hex string of HID device's product ID.
     *  @param deviceInfo.usagePage Hex string of HID device's usage page when multiple are present.
     *  @param deviceInfo.serial Serial ID of HID device.
     * @returns {Promise<null|Error>}
     * @since 2.0.1
     *
     * @memberof qz.hid
     */
    releaseDevice: function (deviceInfo) {
        if (typeof deviceInfo !== 'object') {
            deviceInfo = { vendorId: arguments[0], productId: arguments[1] };
        } //backwards compatibility

        return _qz.websocket.dataPromise('hid.releaseDevice', deviceInfo);
    },
};
