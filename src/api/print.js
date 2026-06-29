import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Send data to selected config for printing.
 * The promise for this method will resolve when the document has been sent to the printer. Actual printing may not be complete.
 * <p/>
 * Optionally, print requests can be pre-signed:
 * Signed content consists of a JSON object string containing no spacing,
 * following the format of the "call" and "params" keys in the API call, with the addition of a "timestamp" key in milliseconds
 * ex. <code>'{"call":"<callName>","params":{...},"timestamp":1450000000}'</code>
 *
 * @param {Object<Config>|Array<Object<Config>>} configs Previously created config object or objects.
 * @param {Array<Object|string>|Array<Array<Object|string>>} data Array of data being sent to the printer.<br/>
 *      String values are interpreted as <code>{type: 'raw', format: 'command', flavor: 'plain', data: &lt;string>}</code>.
 *  @param {string} data.data
 *  @param {string} data.type Printing type. Valid types are <code>[pixel | raw*]</code>. *Default
 *  @param {string} data.format Format of data type used. *Default per type<p/>
 *      For <code>[pixel]</code> types, valid formats are <code>[html | image* | pdf]</code>.<p/>
 *      For <code>[raw]</code> types, valid formats are <code>[command* | html | image | pdf]</code>.
 *  @param {string} data.flavor Flavor of data format used. *Default per format<p/>
 *      For <code>[command]</code> formats, valid flavors are <code>[base64 | file | hex | plain* | xml]</code>.<p/>
 *      For <code>[html]</code> formats, valid flavors are <code>[file* | plain]</code>.<p/>
 *      For <code>[image]</code> formats, valid flavors are <code>[base64 | file*]</code>.<p/>
 *      For <code>[pdf]</code> formats, valid flavors are <code>[base64 | file*]</code>.
 *  @param {Object} [data.options]
 *   @param {string} [data.options.language] Required with <code>[raw]</code> type + <code>[html|image|pdf]</code> format. Printer language.
 *   @param {string} [data.options.quantization="alpha"] Optional with <code>[raw]</code> type + <code>[html|image|pdf]</code> format. The "black pixel" quantization method used.  Valid values are <code>[alpha* | black | luma | dither]</code>.
 *   @param {number} [data.options.threshold=127] Optional with <code>[raw]</code> type + <code>[html|image|pdf]</code> format. The "black pixel" threshold used for quantization.  Default is <code>127</code>.
 *   @param {number} [data.options.x=0] Optional with <code>[raw]</code> type + <code>[html|image|pdf]</code> format for language(s) <code>[cpcl|epl]</code>. The X position of the image.
 *   @param {number} [data.options.y=0] Optional with <code>[raw]</code> type + <code>[html|image|pdf]</code> format for language(s) <code>[cpcl|epl]</code>. The Y position of the image.
 *   @param {string|number} [data.options.dotDensity="single"] Optional with <code>[raw]</code> type + <code>[html|image|pdf]</code> format for language(s) <code>[escpos]</code>.  Valid values are <code>[single* | double | triple | single-legacy | double-legacy]</code> or the escpos "decimal" equivalent
 *   @param {string} [data.options.imageEncoding="esc_asterisk"] Optional with <code>[raw]</code> type + <code>[html|image|pdf]</code> format for language(s) <code>[escpos]</code> and imageEncoding(s) <code>esc_asterisk</code>.  Valid values are <code>[esc_asterisk* | gs_l | gs_v_0]</code>.
 *   @param {number} [data.options.precision=128] Optional with <code>[raw]</code> type <code>[html|image|pdf]</code> format for language(s) <code>[evolis]</code>. Bit precision of the ribbons.
 *   @param {boolean|string|Array<Array<number>>} [data.options.overlay=false] Optional with <code>[raw]</code> type <code>[html|image|pdf]</code> format for language(s) <code>[evolis]</code>.  Instructions for printing the "clear" overlay ribbon.
 *       Boolean sets entire layer, string sets mask image, Array sets array of rectangles in format <code>[x1,y1,x2,y2]</code>.
 *   @param {string} [data.options.logoId] Mandatory with <code>[raw]</code> type <code>[html|image|pdf]</code> format for language(s) <code>[pgl]</code>. Logo identifier to append for storing in the printer's memory.
 *   @param {boolean} [data.options.igpDots=false] Optional with <code>[raw]</code> type <code>[html|image|pdf]</code> format for language(s) <code>[pgl]</code>. When set to <code>true</code> instructs printer to fallback to legacy 60x72 dpi when printing graphics
 *   @param {string} [data.options.xmlTag] Required with <code>[xml]</code> flavor. Tag name containing base64 formatted data.
 *   @param {number} [data.options.pageWidth] Optional with <code>[html | pdf]</code> formats. Width of the rendering.
 *       Defaults to paper width.
 *   @param {number} [data.options.pageHeight] Optional with <code>[html | pdf]</code> formats. Height of the rendering.
 *       Defaults to paper height for <code>[pdf]</code>, or auto sized for <code>[html]</code>.
 *   @param {string} [data.options.pageRanges] Optional with <code>[pdf]</code> formats. Comma-separated list of page ranges to include.
 *   @param {boolean} [data.options.ignoreTransparency=false] Optional with <code>[pdf]</code> formats. Instructs transparent PDF elements to be ignored.
 *       Transparent PDF elements are known to degrade performance and quality when printing.
 *   @param {boolean} [data.options.altFontRendering=false] Optional with <code>[pdf]</code> formats. Instructs PDF to be rendered using PDFBOX 1.8 techniques.
 *       Drastically improves low-DPI PDF print quality on Windows.
 * @param {...*} [arguments] Additionally three more parameters can be specified:<p/>
 *     <code>{boolean} [resumeOnError=false]</code> Whether the chain should continue printing if it hits an error on one the the prints.<p/>
 *     <code>{string|Array<string>} [signature]</code> Pre-signed signature(s) of the JSON string for containing <code>call</code>, <code>params</code>, and <code>timestamp</code>.<p/>
 *     <code>{number|Array<number>} [signingTimestamps]</code> Required to match with <code>signature</code>. Timestamps for each of the passed pre-signed content.
 *
 * @returns {Promise<null|Error>}
 *
 * @see qz.configs.create
 *
 * @memberof qz
 */
qz.print = function (configs, data) {
    var resumeOnError = false,
        signatures = [],
        signaturesTimestamps = [];

    //find optional parameters
    if (arguments.length >= 3) {
        if (typeof arguments[2] === 'boolean') {
            resumeOnError = arguments[2];

            if (arguments.length >= 5) {
                signatures = arguments[3];
                signaturesTimestamps = arguments[4];
            }
        } else if (arguments.length >= 4) {
            signatures = arguments[2];
            signaturesTimestamps = arguments[3];
        }

        //ensure values are arrays for consistency
        if (signatures && !Array.isArray(signatures)) {
            signatures = [signatures];
        }
        if (signaturesTimestamps && !Array.isArray(signaturesTimestamps)) {
            signaturesTimestamps = [signaturesTimestamps];
        }
    }

    if (!Array.isArray(configs)) {
        configs = [configs];
    } //single config -> array of configs
    if (!Array.isArray(data[0])) {
        data = [data];
    } //single data array -> array of data arrays

    //clean up data formatting
    for (var d = 0; d < data.length; d++) {
        _qz.tools.relative(data[d]);
        _qz.compatible.data(data[d]);
    }

    var sendToPrint = function (mapping) {
        var params = {
            printer: mapping.config.getPrinter(),
            options: mapping.config.getOptions(),
            data: mapping.data,
        };

        return _qz.websocket.dataPromise('print', params, mapping.signature, mapping.timestamp);
    };

    //chain instead of Promise.all, so resumeOnError can collect each error
    var chain = [];
    for (var i = 0; i < configs.length || i < data.length; i++) {
        (function (i_) {
            var map = {
                config: configs[Math.min(i_, configs.length - 1)],
                data: data[Math.min(i_, data.length - 1)],
                signature: signatures[i_],
                timestamp: signaturesTimestamps[i_],
            };

            chain.push(function () {
                return sendToPrint(map);
            });
        })(i);
    }

    //setup to catch errors if needed
    var fallThrough = null;
    if (resumeOnError) {
        var fallen = [];
        fallThrough = function (err) {
            fallen.push(err);
        };

        //final promise to reject any errors as a group
        chain.push(function () {
            return _qz.tools.promise(function (resolve, reject) {
                fallen.length ? reject(fallen) : resolve();
            });
        });
    }

    var last = null;
    chain.reduce(
        function (sequence, link) {
            last = sequence.catch(fallThrough).then(link); //catch is ignored if fallThrough is null
            return last;
        },
        _qz.tools.promise(function (r) {
            r();
        })
    ); //an immediately resolved promise to start off the chain

    //return last promise so users can chain off final action or catch when stopping on error
    return last;
};
