import { _qz } from '../internal/core.js';
import { qz } from './registry.js';
import { normalizeDeviceInfo, normalizeData } from '../internal/helpers.js';

/**
 * Calls related to interaction with USB devices.
 * @namespace qz.usb
 */
qz.usb = {
    /**
     * List of available USB devices. Includes (hexadecimal) vendor ID, (hexadecimal) product ID, and hub status.
     * If supported, also returns manufacturer and product descriptions.
     *
     * @param includeHubs Whether to include USB hubs.
     * @returns {Promise<Array<Object>|Error>} Array of JSON objects containing information on connected USB devices.
     *
     * @memberof qz.usb
     */
    listDevices: function (includeHubs) {
        return _qz.websocket.dataPromise('usb.listDevices', { includeHubs: includeHubs });
    },

    /**
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     * @returns {Promise<Array<string>|Error>} List of available (hexadecimal) interfaces on a USB device.
     *
     * @memberof qz.usb
     */
    listInterfaces: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId']);

        return _qz.websocket.dataPromise('usb.listInterfaces', deviceInfo);
    },

    /**
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     *  @param deviceInfo.iface Hex string of interface on the USB device to search.
     * @returns {Promise<Array<string>|Error>} List of available (hexadecimal) endpoints on a USB device's interface.
     *
     * @memberof qz.usb
     */
    listEndpoints: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId', 'interface']);

        return _qz.websocket.dataPromise('usb.listEndpoints', deviceInfo);
    },

    /**
     * List of functions called for any response from open usb devices.
     * Event data will contain <code>{string} vendorId</code> and <code>{string} productId</code> for all types.
     *  For RECEIVE types, <code>{Array} output</code> (in hexadecimal format).
     *  For ERROR types, <code>{string} exception</code>.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Object} eventData)</code> calls.
     *
     * @memberof qz.usb
     */
    setUsbCallbacks: function (calls) {
        _qz.usb.usbCallbacks = calls;
    },

    /**
     * Claim a USB device's interface to enable sending/reading data across an endpoint.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     *  @param deviceInfo.interface Hex string of interface on the USB device to claim.
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.usb
     */
    claimDevice: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId', 'interface']);

        return _qz.websocket.dataPromise('usb.claimDevice', deviceInfo);
    },

    /**
     * Check the current claim state of a USB device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     * @returns {Promise<boolean|Error>}
     *
     * @since 2.0.2
     * @memberOf qz.usb
     */
    isClaimed: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId']);

        return _qz.websocket.dataPromise('usb.isClaimed', deviceInfo);
    },

    /**
     * Send data to a claimed USB device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     *  @param deviceInfo.endpoint Hex string of endpoint on the claimed interface for the USB device.
     *  @param deviceInfo.data Bytes to send over specified endpoint.
     *  @param {string} [deviceInfo.type='PLAIN'] Valid values <code>[FILE | PLAIN | HEX | BASE64]</code>
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.usb
     */
    sendData: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId', 'endpoint', 'data']);

        if (_qz.tools.versionCompare(2, 1, 0, 12) >= 0) {
            deviceInfo.data = normalizeData(deviceInfo.data);

            if (deviceInfo.data.type && deviceInfo.data.type.toUpperCase() == 'FILE') {
                deviceInfo.data.data = _qz.tools.absolute(deviceInfo.data.data);
            }
        }

        return _qz.websocket.dataPromise('usb.sendData', deviceInfo);
    },

    /**
     * Read data from a claimed USB device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     *  @param deviceInfo.endpoint Hex string of endpoint on the claimed interface for the USB device.
     *  @param deviceInfo.responseSize Size of the byte array to receive a response in.
     * @returns {Promise<Array<string>|Error>} List of (hexadecimal) bytes received from the USB device.
     *
     * @memberof qz.usb
     */
    readData: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId', 'endpoint', 'responseSize']);

        return _qz.websocket.dataPromise('usb.readData', deviceInfo);
    },

    /**
     * Provides a continuous stream of read data from a claimed USB device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     *  @param deviceInfo.endpoint Hex string of endpoint on the claimed interface for the USB device.
     *  @param deviceInfo.responseSize Size of the byte array to receive a response in.
     *  @param deviceInfo.interval=100 Frequency to send read data back, in milliseconds.
     * @returns {Promise<null|Error>}
     *
     * @see qz.usb.setUsbCallbacks
     *
     * @memberof qz.usb
     */
    openStream: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId', 'endpoint', 'responseSize', 'interval']);

        return _qz.websocket.dataPromise('usb.openStream', deviceInfo);
    },

    /**
     * Stops the stream of read data from a claimed USB device.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     *  @param deviceInfo.endpoint Hex string of endpoint on the claimed interface for the USB device.
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.usb
     */
    closeStream: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId', 'endpoint']);

        return _qz.websocket.dataPromise('usb.closeStream', deviceInfo);
    },

    /**
     * Release a claimed USB device to free resources after sending/reading data.
     *
     * @param {object} deviceInfo Config details of the HID device.
     *  @param deviceInfo.vendorId Hex string of USB device's vendor ID.
     *  @param deviceInfo.productId Hex string of USB device's product ID.
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.usb
     */
    releaseDevice: function (deviceInfo) {
        //backwards compatibility
        deviceInfo = normalizeDeviceInfo(arguments, ['vendorId', 'productId']);

        return _qz.websocket.dataPromise('usb.releaseDevice', deviceInfo);
    },
};
