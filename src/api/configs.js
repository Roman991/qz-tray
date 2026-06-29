import { _qz } from '../internal/core.js';
import { qz } from './registry.js';
import { Config } from '../config.js';

/**
 * Calls related to setting up new printer configurations.
 * @namespace qz.configs
 */
qz.configs = {
    /**
     * Default options used by new configs if not overridden.
     * Setting a value to NULL will use the printer's default options.
     * Updating these will not update the options on any created config.
     *
     * @param {Object} options Default options used by printer configs if not overridden.
     *
     *  @param {Object} [options.bounds=null] Bounding box rectangle.
     *   @param {number} [options.bounds.x=0] Distance from left for bounding box starting corner
     *   @param {number} [options.bounds.y=0] Distance from top for bounding box starting corner
     *   @param {number} [options.bounds.width=0] Width of bounding box
     *   @param {number} [options.bounds.height=0] Height of bounding box
     *  @param {string} [options.colorType='color'] Valid values <code>[color | grayscale | blackwhite | default]</code>
     *  @param {number} [options.copies=1] Number of copies to be printed.
     *  @param {number|Array<number>|Object|Array<Object>|string} [options.density=0] Pixel density (DPI, DPMM, or DPCM depending on <code>[options.units]</code>).
     *      If provided as an array, uses the first supported density found (or the first entry if none found).
     *      If provided as a string, valid values are <code>[best | draft]</code>, corresponding to highest or lowest reported density respectively.
     *  @param {number} [options.density.cross=0] Asymmetric pixel density for the cross feed direction.
     *  @param {number} [options.density.feed=0] Asymmetric pixel density for the feed direction.
     *  @param {boolean|string} [options.duplex=false] Double sided printing, Can specify duplex style by passing a string value: <code>[one-sided | duplex | long-edge | tumble | short-edge]</code>
     *  @param {number} [options.fallbackDensity=null] Value used when default density value cannot be read, or in cases where reported as "Normal" by the driver, (in DPI, DPMM, or DPCM depending on <code>[options.units]</code>).
     *  @param {string} [options.interpolation='bicubic'] Valid values <code>[bicubic | bilinear | nearest-neighbor]</code>. Controls how images are handled when resized.
     *  @param {string} [options.jobName=null] Name to display in print queue.
     *  @param {boolean} [options.legacy=false] If legacy style printing should be used.
     *  @param {Object|number} [options.margins=0] If just a number is provided, it is used as the margin for all sides.
     *   @param {number} [options.margins.top=0]
     *   @param {number} [options.margins.right=0]
     *   @param {number} [options.margins.bottom=0]
     *   @param {number} [options.margins.left=0]
     *  @param {string} [options.orientation=null] Valid values <code>[portrait | landscape | reverse-landscape | null]</code>.
     *                                             If set to <code>null</code>, orientation will be determined automatically.
     *  @param {number} [options.paperThickness=null]
     *  @param {string|number} [options.printerTray=null] Printer tray to pull from. The number N assumes string equivalent of 'Tray N'. Uses printer default if NULL.
     *  @param {boolean} [options.rasterize=false] Whether documents should be rasterized before printing.
     *                                             Specifying <code>[options.density]</code> for PDF print formats will set this to <code>true</code>.
     *  @param {number} [options.rotation=0] Image rotation in degrees.
     *  @param {boolean} [options.scaleContent=true] Scales print content to page size, keeping ratio.
     *  @param {Object} [options.size=null] Paper size.
     *   @param {number} [options.size.width=null] Page width.
     *   @param {number} [options.size.height=null] Page height.
     *   @param {boolean} [options.size.custom=false] If the provided page size is not included in the driver.
     *  @param {string} [options.units='in'] Page units, applies to paper size, margins, and density. Valid value <code>[in | cm | mm]</code>
     *
     *  @param {boolean} [options.forceRaw=false] Print the specified raw data using direct method, skipping the driver.  Not yet supported on Windows.
     *  @param {string|Object} [options.encoding=null] Character set for commands. Can be provided as an object for converting encoding types for RAW types.
     *   @param {string} [options.encoding.from] If this encoding type is provided, RAW type commands will be parsed from this for the purpose of being converted to the <code>encoding.to</code> value.
     *   @param {string} [options.encoding.to] Encoding RAW type commands will be converted into. If <Code>encoding.from</code> is not provided, this will be treated as if a string was passed for encoding.
     *  @param {string} [options.endOfDoc=null] DEPRECATED Raw only: Character(s) denoting end of a page to control spooling.
     *  @param {number} [options.perSpool=1] DEPRECATED: Raw only: Number of pages per spool.
     *  @param {boolean} [options.retainTemp=false] Retain any temporary files used.  Ignored unless <code>forceRaw</code> <code>true</code>.
     *  @param {Object} [options.spool=null] Advanced spooling options.
     *   @param {number} [options.spool.size=null] Number of pages per spool.  Default is no limit.  If <code>spool.end</code> is provided, defaults to <code>1</code>
     *   @param {string} [options.spool.end=null] Raw only: Character(s) denoting end of a page to control spooling.
     *
     * @memberof qz.configs
     */
    setDefaults: function (options) {
        _qz.tools.extend(_qz.printing.defaultConfig, options);
    },

    /**
     * Creates new printer config to be used in printing.
     *
     * @param {string|object} printer Name of printer. Use object type to specify printing to file or host.
     *  @param {string} [printer.name] Name of printer to send printing.
     *  @param {string} [printer.file] Name of file to send printing.
     *  @param {string} [printer.host] IP address or host name to send printing.
     *  @param {string} [printer.port] Port used by &lt;printer.host>.
     * @param {Object} [options] Override any of the default options for this config only.
     *
     * @returns {Config} The new config.
     *
     * @see configs.setDefaults
     *
     * @memberof qz.configs
     */
    create: function (printer, options) {
        return new Config(printer, options);
    },
};
