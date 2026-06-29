import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to interaction with serial ports.
 * @namespace qz.serial
 */
qz.serial = {
    /**
     * @returns {Promise<Array<string>|Error>} Communication (RS232, COM, TTY) ports available on connected system.
     *
     * @memberof qz.serial
     */
    findPorts: function () {
        return _qz.websocket.dataPromise('serial.findPorts');
    },

    /**
     * List of functions called for any response from open serial ports.
     * Event data will contain <code>{string} portName</code> for all types.
     *  For RECEIVE types, <code>{string} output</code>.
     *  For ERROR types, <code>{string} exception</code>.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({object} streamEvent)</code> calls.
     *
     * @memberof qz.serial
     */
    setSerialCallbacks: function (calls) {
        _qz.serial.serialCallbacks = calls;
    },

    /**
     * Opens a serial port for sending and receiving data
     *
     * @param {string} port Name of serial port to open.
     * @param {Object} [options] Serial port configurations.
     *  @param {number} [options.baudRate=9600] Serial port speed. Set to 0 for auto negotiation.
     *  @param {number} [options.dataBits=8] Serial port data bits. Set to 0 for auto negotiation.
     *  @param {number} [options.stopBits=1] Serial port stop bits. Set to 0 for auto negotiation.
     *  @param {string} [options.parity='NONE'] Serial port parity. Set to AUTO for auto negotiation. Valid values <code>[NONE | EVEN | ODD | MARK | SPACE | AUTO]</code>
     *  @param {string} [options.flowControl='NONE'] Serial port flow control. Set to AUTO for auto negotiation. Valid values <code>[NONE | XONXOFF | XONXOFF_OUT | XONXOFF_IN | RTSCTS | RTSCTS_OUT | RTSCTS_IN | AUTO]</code>
     *  @param {string} [options.encoding='UTF-8'] Character set for communications.
     *  @param {string} [options.start=0x0002] DEPRECATED: Legacy character denoting start of serial response. Use <code>options.rx.start</code> instead.
     *  @param {string} [options.end=0x000D] DEPRECATED: Legacy character denoting end of serial response. Use <code>options.rx.end</code> instead.
     *  @param {number} [options.width] DEPRECATED: Legacy use for fixed-width response serial communication. Use <code>options.rx.width</code> instead.
     *  @param {Object} [options.rx] Serial communications response definitions. If an object is passed but no options are defined, all response data will be sent back as it is received unprocessed.
     *   @param {string|Array<string>} [options.rx.start] Character(s) denoting start of response bytes. Used in conjunction with `end`, `width`, or `lengthbit` property.
     *   @param {string} [options.rx.end] Character denoting end of response bytes. Used in conjunction with `start` property.
     *   @param {number} [options.rx.width] Fixed width size of response bytes (not including header if `start` is set). Used alone or in conjunction with `start` property.
     *   @param {boolean} [options.rx.untilNewline] Returns data between newline characters (`\n` or `\r`) Truncates empty responses.  Overrides `start`, `end`, `width`.
     *   @param {number|Object} [options.rx.lengthBytes] If a number is passed it is treated as the length index. Other values are left as their defaults.
     *    @param {number} [options.rx.lengthBytes.index=0] Position of the response byte (not including response `start` bytes) used to denote the length of the remaining response data.
     *    @param {number} [options.rx.lengthBytes.length=1] Length of response length bytes after response header.
     *    @param {string} [options.rx.lengthBytes.endian='BIG'] Byte endian for multi-byte length values. Valid values <code>[BIG | LITTLE]</code>
     *   @param {number|Object} [options.rx.crcBytes] If a number is passed it is treated as the crc length. Other values are left as their defaults.
     *    @param {number} [options.rx.crcBytes.index=0] Position after the response data (not including length or data bytes) used to denote the crc.
     *    @param {number} [options.rx.crcBytes.length=1] Length of response crc bytes after the response data length.
     *   @param {boolean} [options.rx.includeHeader=false] Whether any of the header bytes (`start` bytes and any length bytes) should be included in the processed response.
     *   @param {string} [options.rx.encoding] Override the encoding used for response data. Uses the same value as <code>options.encoding</code> otherwise.
     *
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.serial
     */
    openPort: function (port, options) {
        var params = {
            port: port,
            options: options,
        };
        return _qz.websocket.dataPromise('serial.openPort', params);
    },

    /**
     * Send commands over a serial port.
     * Any responses from the device will be sent to serial callback functions.
     *
     * @param {string} port An open serial port to send data.
     * @param {string|Array<string>|Object} data Data to be sent to the serial device.
     *  @param {string} [data.type='PLAIN'] Valid values <code>[FILE | PLAIN | HEX | BASE64]</code>
     *  @param {string|Array<string>} data.data Data to be sent to the serial device.
     * @param {Object} options Serial port configuration updates. See <code>qz.serial.openPort</code> `options` docs for available values.
     *     For best performance, it is recommended to only set these values on the port open call.
     *
     * @returns {Promise<null|Error>}
     *
     * @see qz.serial.setSerialCallbacks
     *
     * @memberof qz.serial
     */
    sendData: function (port, data, options) {
        if (_qz.tools.versionCompare(2, 1, 0, 12) >= 0) {
            if (typeof data !== 'object') {
                data = {
                    data: data,
                    type: 'PLAIN',
                };
            }

            if (data.type && data.type.toUpperCase() == 'FILE') {
                data.data = _qz.tools.absolute(data.data);
            }
        }

        var params = {
            port: port,
            data: data,
            options: options,
        };
        return _qz.websocket.dataPromise('serial.sendData', params);
    },

    /**
     * @param {string} port Name of port to close.
     *
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.serial
     */
    closePort: function (port) {
        return _qz.websocket.dataPromise('serial.closePort', { port: port });
    },
};
