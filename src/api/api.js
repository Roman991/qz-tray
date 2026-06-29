import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to compatibility adjustments
 * @namespace qz.api
 */
qz.api = {
    /**
     * Show or hide QZ api debugging statements in the browser console.
     *
     * @param {boolean} show Whether the debugging logs for QZ should be shown. Hidden by default.
     * @returns {boolean} Value of debugging flag
     * @memberof qz.api
     */
    showDebug: function (show) {
        return (_qz.DEBUG = show);
    },

    /**
     * Get internal branding title used by logs and exceptions (e.g "QZ Tray")
     *
     * @returns {string} Internal title used for logs and exceptions
     *
     * @memberof qz.api
     */
    getTitle: function () {
        return _qz.TITLE;
    },

    /**
     * Get version of connected QZ Tray application.
     *
     * @returns {Promise<string|Error>} Version number of QZ Tray.
     *
     * @memberof qz.api
     */
    getVersion: function () {
        return _qz.websocket.dataPromise('getVersion');
    },

    /**
     * Checks for the specified version of connected QZ Tray application.
     *
     * @param {string|number} [major] Major version to check
     * @param {string|number} [minor] Minor version to check
     * @param {string|number} [patch] Patch version to check
     *
     * @memberof qz.api
     */
    isVersion: _qz.tools.isVersion,

    /**
     * Checks if the connected QZ Tray application is greater than the specified version.
     *
     * @param {string|number} major Major version to check
     * @param {string|number} [minor] Minor version to check
     * @param {string|number} [patch] Patch version to check
     * @param {string|number} [build] Build version to check
     * @returns {boolean} True if connected version is greater than the version specified.
     *
     * @memberof qz.api
     * @since 2.1.0-4
     */
    isVersionGreater: function (major, minor, patch, build) {
        return _qz.tools.versionCompare(major, minor, patch, build) > 0;
    },

    /**
     * Checks if the connected QZ Tray application is less than the specified version.
     *
     * @param {string|number} major Major version to check
     * @param {string|number} [minor] Minor version to check
     * @param {string|number} [patch] Patch version to check
     * @param {string|number} [build] Build version to check
     * @returns {boolean} True if connected version is less than the version specified.
     *
     * @memberof qz.api
     * @since 2.1.0-4
     */
    isVersionLess: function (major, minor, patch, build) {
        return _qz.tools.versionCompare(major, minor, patch, build) < 0;
    },

    /**
     * Change the promise library used by QZ API.
     * Should be called before any initialization to avoid possible errors.
     *
     * @param {Function} promiser <code>Function({function} resolver)</code> called to create new promises.
     *
     * @memberof qz.api
     */
    setPromiseType: function (promiser) {
        _qz.tools.promise = promiser;
    },

    /**
     * Change the SHA-256 hashing function used by QZ API.
     * Should be called before any initialization to avoid possible errors.
     *
     * @param {Function} hasher <code>Function({function} message)</code> called to create hash of passed string.
     *
     * @memberof qz.api
     */
    setSha256Type: function (hasher) {
        _qz.tools.hash = hasher;
    },

    /**
     * Change the internal branding of "QZ Tray" for logs and exceptions
     * Must be called before any connection attempts are made to appear in messaging
     *
     * @param {string} title Internal name to be used in place of "QZ Tray" for logs and exceptions
     *
     * @memberof qz.api
     */
    setTitle: function (title) {
        _qz.TITLE = title;
    },

    /**
     * Change the WebSocket handler.
     * Should be called before any initialization to avoid possible errors.
     *
     * @param {Function} ws <code>Function({function} WebSocket)</code> called to override the internal WebSocket handler.
     *
     * @memberof qz.api
     */
    setWebSocketType: function (ws) {
        _qz.tools.ws = ws;
    },
};
