import { _qz } from './internal/core.js';
import { qz } from './api/registry.js';
import { normalizePrinter } from './internal/helpers.js';

/** Object to handle configured printer options. */
export function Config(printer, opts) {
    this.config = _qz.tools.extend({}, _qz.printing.defaultConfig); //create a copy of the default options
    this._dirtyOpts = {}; //track which config options have changed from the defaults

    /**
     * Set the printer assigned to this config.
     * @param {string|Object} newPrinter Name of printer. Use object type to specify printing to file or host.
     *  @param {string} [newPrinter.name] Name of printer to send printing.
     *  @param {string} [newPrinter.file] DEPRECATED: Name of file to send printing.
     *  @param {string} [newPrinter.host] IP address or host name to send printing.
     *  @param {string} [newPrinter.port] Port used by &lt;printer.host>.
     */
    this.setPrinter = function (newPrinter) {
        this.printer = normalizePrinter(newPrinter);
    };

    /**
     *  @returns {Object} The printer currently assigned to this config.
     */
    this.getPrinter = function () {
        return this.printer;
    };

    /**
     * Alter any of the printer options currently applied to this config.
     * @param newOpts {Object} The options to change. See <code>qz.configs.setDefaults</code> docs for available values.
     *
     * @see qz.configs.setDefaults
     */
    this.reconfigure = function (newOpts) {
        // newOpts may be undefined (e.g. qz.configs.create(printer) with no opts);
        // the original `for…in` was a no-op on undefined, so guard to match.
        Object.keys(newOpts || {}).forEach((key) => {
            if (newOpts[key] !== undefined) {
                this._dirtyOpts[key] = true;
            }
        });

        _qz.tools.extend(this.config, newOpts);
    };

    /**
     * @returns {Object} The currently applied options on this config.
     */
    this.getOptions = function () {
        return _qz.compatible.config(this.config, this._dirtyOpts);
    };

    // init calls for new config object
    this.setPrinter(printer);
    this.reconfigure(opts);
}

/**
 * Shortcut method for calling <code>qz.print</code> with a particular config.
 * @param {Array<Object|string>} data Array of data being sent to the printer. See <code>qz.print</code> docs for available values.
 * @param {boolean} [signature] Pre-signed signature of JSON string containing <code>call</code>, <code>params</code>, and <code>timestamp</code>.
 * @param {number} [signingTimestamp] Required with <code>signature</code>. Timestamp used with pre-signed content.
 *
 * @example
 * qz.print(myConfig, ...); // OR
 * myConfig.print(...);
 *
 * @see qz.print
 */
Config.prototype.print = function (data, signature, signingTimestamp) {
    qz.print(this, data, signature, signingTimestamp);
};
