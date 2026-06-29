import { _qz } from './core.js';

_qz.compatible = {
    /** Converts message format to a previous version's */
    data: function (printData) {
        // special handling for Uint8Array
        for (var i = 0; i < printData.length; i++) {
            if (printData[i].constructor === Object && printData[i].data instanceof Uint8Array) {
                if (printData[i].flavor) {
                    var flavor = printData[i].flavor.toString().toUpperCase();
                    switch (flavor) {
                        case 'BASE64':
                            printData[i].data = _qz.tools.uint8ArrayToBase64(printData[i].data);
                            break;
                        case 'HEX':
                            printData[i].data = _qz.tools.uint8ArrayToHex(printData[i].data);
                            break;
                        default:
                            throw new Error("Uint8Array conversion to '" + flavor + "' is not supported.");
                    }
                }
            }
        }

        if (_qz.tools.versionCompare(2, 2, 4) < 0) {
            for (var i = 0; i < printData.length; i++) {
                if (printData[i].constructor === Object) {
                    // dotDensity: "double-legacy|single-legacy" since 2.2.4.  Fallback to "double|single"
                    if (printData[i].options && typeof printData[i].options.dotDensity === 'string') {
                        printData[i].options.dotDensity = printData[i].options.dotDensity
                            .toLowerCase()
                            .replace('-legacy', '');
                    }
                }
            }
        }

        if (_qz.tools.isVersion(2, 0)) {
            /*
                    2.0.x conversion
                    -----
                    type=pixel -> use format as 2.0 type (unless 'command' format, which forces 2.0 'raw' type)
                    type=raw -> 2.0 type has to be 'raw'
                                if format is 'image' -> force 2.0 'image' format, ignore everything else (unsupported in 2.0)

                     flavor translates straight to 2.0 format (unless forced to 'raw'/'image')
                     */
            _qz.log.trace('Converting print data to v2.0 for ' + _qz.websocket.connection.version);
            for (var i = 0; i < printData.length; i++) {
                if (printData[i].constructor === Object) {
                    if (
                        printData[i].type &&
                        printData[i].type.toUpperCase() === 'RAW' &&
                        printData[i].format &&
                        printData[i].format.toUpperCase() === 'IMAGE'
                    ) {
                        if (printData[i].flavor && printData[i].flavor.toUpperCase() === 'BASE64') {
                            //special case for raw base64 images
                            printData[i].data = 'data:image/compat;base64,' + printData[i].data;
                        }
                        printData[i].flavor = 'IMAGE'; //forces 'image' format when shifting for conversion
                    }
                    if (
                        (printData[i].type && printData[i].type.toUpperCase() === 'RAW') ||
                        (printData[i].format && printData[i].format.toUpperCase() === 'COMMAND')
                    ) {
                        printData[i].format = 'RAW'; //forces 'raw' type when shifting for conversion
                    }

                    printData[i].type = printData[i].format;
                    printData[i].format = printData[i].flavor;
                    delete printData[i].flavor;
                }
            }
        }
    },

    /* Converts config defaults to match previous version */
    config: function (config, dirty) {
        if (_qz.tools.isVersion(2, 0)) {
            if (!dirty.rasterize) {
                config.rasterize = true;
            }
        }
        if (_qz.tools.versionCompare(2, 2) < 0) {
            if (config.forceRaw !== 'undefined') {
                config.altPrinting = config.forceRaw;
                delete config.forceRaw;
            }
        }
        if (_qz.tools.versionCompare(2, 1, 2, 11) < 0) {
            if (config.spool) {
                if (config.spool.size) {
                    config.perSpool = config.spool.size;
                    delete config.spool.size;
                }
                if (config.spool.end) {
                    config.endOfDoc = config.spool.end;
                    delete config.spool.end;
                }
                delete config.spool;
            }
        }
        return config;
    },

    /** Compat wrapper with previous version **/
    networking: function (hostname, port, signature, signingTimestamp, mappingCallback) {
        // Use 2.0
        if (_qz.tools.isVersion(2, 0)) {
            return _qz.tools.promise(function (resolve, reject) {
                _qz.websocket
                    .dataPromise(
                        'websocket.getNetworkInfo',
                        {
                            hostname: hostname,
                            port: port,
                        },
                        signature,
                        signingTimestamp
                    )
                    .then(function (data) {
                        if (typeof mappingCallback !== 'undefined') {
                            resolve(mappingCallback(data));
                        } else {
                            resolve(data);
                        }
                    }, reject);
            });
        }
        // Wrap 2.1
        return _qz.tools.promise(function (resolve, reject) {
            _qz.websocket
                .dataPromise(
                    'networking.device',
                    {
                        hostname: hostname,
                        port: port,
                    },
                    signature,
                    signingTimestamp
                )
                .then(function (data) {
                    resolve({ ipAddress: data.ip, macAddress: data.mac });
                }, reject);
        });
    },

    /** Check if QZ version supports chosen algorithm */
    algorithm: function (quiet) {
        //if not connected yet we will assume compatibility exists for the time being
        //check semver to guard race condition for pending connections
        if (_qz.tools.isActive() && _qz.websocket.connection.semver) {
            if (_qz.tools.isVersion(2, 0)) {
                if (!quiet) {
                    _qz.log.warn(
                        'Connected to an older version of ' +
                            _qz.TITLE +
                            ', alternate signature algorithms are not supported'
                    );
                }
                return false;
            }
        }

        return true;
    },
};
