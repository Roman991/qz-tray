import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to interactions with the filesystem
 * @namespace qz.file
 * @since 2.1
 */
qz.file = {
    /**
     * List of files available at the given directory.<br/>
     * Due to security reasons, paths are limited to the qz data directory unless overridden via properties file.
     *
     * @param {string} path Relative or absolute directory path. Must reside in qz data directory or a white-listed location.
     * @param {Object} [params] Object containing file access parameters
     *  @param {boolean} [params.sandbox=true] If relative location from root is only available to the certificate's connection, otherwise all connections
     *  @param {boolean} [params.shared=true] If relative location from root is accessible to all users on the system, otherwise just the current user
     * @returns {Promise<Array<String>|Error>} Array of files at the given path
     *
     * @memberof qz.file
     */
    list: function (path, params) {
        var param = _qz.tools.extend({ path: path }, params);
        return _qz.websocket.dataPromise('file.list', param);
    },

    /**
     * Reads contents of file at the given path.<br/>
     * Due to security reasons, paths are limited to the qz data directory unless overridden via properties file.
     *
     * @param {string} path Relative or absolute file path. Must reside in qz data directory or a white-listed location.
     * @param {Object} [params] Object containing file access parameters
     *  @param {boolean} [params.sandbox=true] If relative location from root is only available to the certificate's connection, otherwise all connections
     *  @param {boolean} [params.shared=true] If relative location from root is accessible to all users on the system, otherwise just the current user
     *  @param {string} [params.flavor='plain'] Flavor of data format used, valid flavors are <code>[base64 | hex | plain]</code>.
     * @returns {Promise<String|Error>} String containing the file contents
     *
     * @memberof qz.file
     */
    read: function (path, params) {
        var param = _qz.tools.extend({ path: path }, params);
        return _qz.websocket.dataPromise('file.read', param);
    },

    /**
     * Writes data to the file at the given path.<br/>
     * Due to security reasons, paths are limited to the qz data directory unless overridden via properties file.
     *
     * @param {string} path Relative or absolute file path. Must reside in qz data directory or a white-listed location.
     * @param {Object} params Object containing file access parameters
     *  @param {string} params.data File data to be written
     *  @param {boolean} [params.sandbox=true] If relative location from root is only available to the certificate's connection, otherwise all connections
     *  @param {boolean} [params.shared=true] If relative location from root is accessible to all users on the system, otherwise just the current user
     *  @param {boolean} [params.append=false] Appends to the end of the file if set, otherwise overwrites existing contents
     *  @param {string} [params.flavor='plain'] Flavor of data format used, valid flavors are <code>[base64 | file | hex | plain]</code>.
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.file
     */
    write: function (path, params) {
        var param = _qz.tools.extend({ path: path }, params);
        return _qz.websocket.dataPromise('file.write', param);
    },

    /**
     * Deletes a file at given path.<br/>
     * Due to security reasons, paths are limited to the qz data directory unless overridden via properties file.
     *
     * @param {string} path Relative or absolute file path. Must reside in qz data directory or a white-listed location.
     * @param {Object} [params] Object containing file access parameters
     *  @param {boolean} [params.sandbox=true] If relative location from root is only available to the certificate's connection, otherwise all connections
     *  @param {boolean} [params.shared=true] If relative location from root is accessible to all users on the system, otherwise just the current user
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.file
     */
    remove: function (path, params) {
        var param = _qz.tools.extend({ path: path }, params);
        return _qz.websocket.dataPromise('file.remove', param);
    },

    /**
     * Provides a continuous stream of events (and optionally data) from a local file.
     *
     * @param {string} path Relative or absolute directory path. Must reside in qz data directory or a white-listed location.
     * @param {Object} [params] Object containing file access parameters
     *  @param {boolean} [params.sandbox=true] If relative location from root is only available to the certificate's connection, otherwise all connections
     *  @param {boolean} [params.shared=true] If relative location from root is accessible to all users on the system, otherwise just the current user
     *  @param {Object} [params.listener] If defined, file data will be returned on events
     *   @param {number} [params.listener.bytes=-1] Number of bytes to return or -1 for all
     *   @param {number} [params.listener.lines=-1] Number of lines to return or -1 for all
     *   @param {boolean} [params.listener.reverse] Controls whether data should be returned from the bottom of the file.  Default value is true for line mode and false for byte mode.
     *   @param {string|Array<string>} [params.include] File patterns to match.  Blank values will be ignored.
     *   @param {string|Array<string>} [params.exclude] File patterns to exclude.  Blank values will be ignored.  Takes priority over <code>params.include</code>.
     *   @param {boolean} [params.ignoreCase=true] Whether <code>params.include</code> or <code>params.exclude</code> are case-sensitive.
     * @returns {Promise<null|Error>}
     * @since 2.1.0
     *
     * @see qz.file.setFileCallbacks
     *
     * @memberof qz.file
     */
    startListening: function (path, params) {
        if (params && typeof params.include !== 'undefined' && !Array.isArray(params.include)) {
            params.include = [params.include];
        }
        if (params && typeof params.exclude !== 'undefined' && !Array.isArray(params.exclude)) {
            params.exclude = [params.exclude];
        }
        var param = _qz.tools.extend({ path: path }, params);
        return _qz.websocket.dataPromise('file.startListening', param);
    },

    /**
     * Closes listeners with the provided settings. Omitting the path parameter will result in all listeners closing.
     *
     * @param {string} [path] Previously opened directory path of listener to close, or omit to close all.
     * @param {Object} [params] Object containing file access parameters
     *  @param {boolean} [params.sandbox=true] If relative location from root is only available to the certificate's connection, otherwise all connections
     *  @param {boolean} [params.shared=true] If relative location from root is accessible to all users on the system, otherwise just the current user
     * @returns {Promise<null|Error>}
     *
     * @memberof qz.file
     */
    stopListening: function (path, params) {
        var param = _qz.tools.extend({ path: path }, params);
        return _qz.websocket.dataPromise('file.stopListening', param);
    },

    /**
     * List of functions called for any response from a file listener.
     *  For ERROR types event data will contain, <code>{string} message</code>.
     *  For ACTION types event data will contain, <code>{string} file {string} eventType {string} [data]</code>.
     *
     * @param {Function|Array<Function>} calls Single or array of <code>Function({Object} eventData)</code> calls.
     * @since 2.1.0
     *
     * @memberof qz.file
     */
    setFileCallbacks: function (calls) {
        _qz.file.fileCallbacks = calls;
    },
};
