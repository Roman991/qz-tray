import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to getting printer information from the connection.
 * @namespace qz.printers
 */
qz.printers = {
    /**
     * @param {string} [signature] Pre-signed signature of hashed JSON string containing <code>call='printers.getDefault</code>, <code>params</code>, and <code>timestamp</code>.
     * @param {number} [signingTimestamp] Required with <code>signature</code>. Timestamp used with pre-signed content.
     *
     * @returns {Promise<string|Error>} Name of the connected system's default printer.
     *
     * @memberof qz.printers
     */
    getDefault: function (signature, signingTimestamp) {
        return _qz.websocket.dataPromise('printers.getDefault', null, signature, signingTimestamp);
    },

    /**
     * @param {string} [query] Search for a specific printer. All printers are returned if not provided.
     * @param {string} [signature] Pre-signed signature of hashed JSON string containing <code>call='printers.find'</code>, <code>params</code>, and <code>timestamp</code>.
     * @param {number} [signingTimestamp] Required with <code>signature</code>. Timestamp used with pre-signed content.
     *
     * @returns {Promise<Array<string>|string|Error>} The matched printer name if <code>query</code> is provided.
     *                                                Otherwise an array of printer names found on the connected system.
     *
     * @memberof qz.printers
     */
    find: function (query, signature, signingTimestamp) {
        return _qz.websocket.dataPromise('printers.find', { query: query }, signature, signingTimestamp);
    },

    /**
     * Provides a list, with additional information, for each printer available to QZ.
     *
     * @returns {Promise<Array<Object>|Object|Error>}
     *
     * @memberof qz.printers
     */
    details: function () {
        return _qz.websocket.dataPromise('printers.detail');
    },

    /**
     * Start listening for printer status events, such as paper_jam events.
     * Reported under the ACTION type in the streamEvent on callbacks.
     *
     * @returns {Promise<null|Error>}
     * @since 2.1.0
     *
     * @see qz.printers.setPrinterCallbacks
     *
     * @param {null|string|Array<string>} printers Printer or list of printers to listen to, null listens to all.
     * @param {Object|null} [options] Printer listener options
     *  @param {null|boolean} [options.jobData=false] Flag indicating if raw spool file content should be return as well as status information (Windows only)
     *  @param {null|number} [options.maxJobData=-1] Maximum number of bytes to returns for raw spooled file content (Windows only)
     *  @param {null|string} [options.flavor="plain"] Flavor of data format returned. Valid flavors are <code>[base64 | hex | plain*]</code> (Windows only)
     *
     * @memberof qz.printers
     */
    startListening: function (printers, options) {
        if (!Array.isArray(printers)) {
            printers = [printers];
        }
        var params = {
            printerNames: printers,
        };
        if (options && options.jobData == true) params.jobData = true;
        if (options && options.maxJobData) params.maxJobData = options.maxJobData;
        if (options && options.flavor) params.flavor = options.flavor;
        return _qz.websocket.dataPromise('printers.startListening', params);
    },

    /**
     * Clear the queue of a specified printer or printers. Does not delete retained jobs.
     *
     * @param {string|Object} [options] Name of printer to clear
     *  @param {string} [options.printerName] Name of printer to clear
     *  @param {number} [options.jobId] Cancel a job of a specific JobId instead of canceling all. Must include a printerName.
     *
     * @returns {Promise<null|Error>}
     * @since 2.2.4
     *
     * @memberof qz.printers
     */
    clearQueue: function (options) {
        if (typeof options !== 'object') {
            options = {
                printerName: options,
            };
        }
        return _qz.websocket.dataPromise('printers.clearQueue', options);
    },

    /**
     * Stop listening for printer status actions.
     *
     * @returns {Promise<null|Error>}
     * @since 2.1.0
     *
     * @see qz.printers.setPrinterCallbacks
     *
     * @memberof qz.printers
     */
    stopListening: function () {
        return _qz.websocket.dataPromise('printers.stopListening');
    },

    /**
     * Retrieve current printer status from any active listeners.
     *
     * @returns {Promise<null|Error>}
     * @since 2.1.0
     *
     * @see qz.printers.startListening
     *
     * @memberof qz.printers
     */
    getStatus: function () {
        return _qz.websocket.dataPromise('printers.getStatus');
    },

    /**
     * List of functions called for any printer status change.
     * Event data will contain <code>{string} printerName</code> and <code>{string} status</code> for all types.
     *  For RECEIVE types, <code>{Array} output</code> (in hexadecimal format).
     *  For ERROR types, <code>{string} exception</code>.
     *  For ACTION types, <code>{string} actionType</code>.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Object} eventData)</code> calls.
     * @since 2.1.0
     *
     * @memberof qz.printers
     */
    setPrinterCallbacks: function (calls) {
        _qz.printers.printerCallbacks = calls;
    },
};
