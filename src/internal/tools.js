import { _qz } from './core.js';

_qz.tools = {
    /** Create a new promise */
    promise: function (resolver) {
        //prefer global object for historical purposes
        if (typeof RSVP !== 'undefined') {
            return new RSVP.Promise(resolver);
        } else if (typeof Promise !== 'undefined') {
            return new Promise(resolver);
        } else {
            _qz.log.error('Promise/A+ support is required.  See qz.api.setPromiseType(...)');
        }
    },

    /** Stub for rejecting with an Error from withing a Promise */
    reject: function (error) {
        return _qz.tools.promise(function (resolve, reject) {
            reject(error);
        });
    },

    stringify: function (object) {
        //old versions of prototype affect stringify
        var pjson = Array.prototype.toJSON;
        delete Array.prototype.toJSON;

        function skipKeys(key, value) {
            if (key === 'promise') {
                return undefined;
            }

            return value;
        }

        var result = JSON.stringify(object, skipKeys);

        if (pjson) {
            Array.prototype.toJSON = pjson;
        }

        return result;
    },

    hash: function (data) {
        //prefer global object for historical purposes
        if (typeof Sha256 !== 'undefined') {
            return Sha256.hash(data);
        } else {
            return _qz.SHA.hash(data);
        }
    },

    ws: typeof WebSocket !== 'undefined' ? WebSocket : null,
    lna: undefined,

    getLna: function () {
        if (_qz.tools.lna === undefined) {
            _qz.tools.lna = _qz.tools.loadLna() || null;
        }
        return _qz.tools.lna;
    },

    loadLna: function () {
        if (typeof self === 'undefined') {
            // Not in a browser, no LNA restrictions apply
            return;
        }
        if (self.lna && self.lna.detectLna) {
            return self.lna;
        }
        // Use `require` if available so that bundlers can detect the dependency
        if (typeof require === 'function') {
            try {
                return require('lna');
            } catch (e) {
                _qz.log.warn('Unable to load LNA library', e);
            }
        }
    },

    /**
     * Normalize a host string by appending a "surf"" tld if necessary.
     * Ignored if "usingSurf" is set to false
     */
    appendSurf: function (host) {
        return _qz.tools.isQualified(host) ? host : host + '.' + _qz.websocket.connectConfig.surfDomain;
    },

    /**
     * Returns if the provided hostname is fully-qualified either as a domain
     * name or as an ip address. Used to determine whether to append a "surf" suffix
     * (e.g. ".qz.surf") at the end.
     */
    isQualified: function (host) {
        return (
            host.toLowerCase() === 'localhost' || // essentially qualified
            host.indexOf('.') !== -1 || // ipv4
            host.indexOf(':') !== -1
        ); // ipv6
    },

    absolute: function (loc) {
        if (typeof window !== 'undefined' && typeof document.createElement === 'function') {
            var a = document.createElement('a');
            a.href = loc;
            return a.href;
        } else if (typeof exports === 'object') {
            //node.js
            return require('path').resolve(loc);
        }
        return loc;
    },

    relative: function (data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].constructor === Object) {
                var absolute = false;

                if (data[i].data && data[i].data.search && data[i].data.search(/data:image\/\w+;base64,/) === 0) {
                    //upgrade from old base64 behavior
                    data[i].flavor = 'base64';
                    data[i].data = data[i].data.replace(/^data:image\/\w+;base64,/, '');
                } else if (data[i].flavor) {
                    //if flavor is known, we can directly check for absolute flavor types
                    if (['FILE', 'XML'].indexOf(data[i].flavor.toUpperCase()) > -1) {
                        absolute = true;
                    }
                } else if (
                    data[i].format &&
                    ['HTML', 'IMAGE', 'PDF', 'FILE', 'XML'].indexOf(data[i].format.toUpperCase()) > -1
                ) {
                    //if flavor is not known, all valid pixel formats default to file flavor
                    //previous v2.0 data also used format as what is now flavor, so we check for those values here too
                    absolute = true;
                } else if (
                    data[i].type &&
                    ((['PIXEL', 'IMAGE', 'PDF'].indexOf(data[i].type.toUpperCase()) > -1 && !data[i].format) ||
                        (['HTML', 'PDF'].indexOf(data[i].type.toUpperCase()) > -1 &&
                            (!data[i].format || data[i].format.toUpperCase() === 'FILE')))
                ) {
                    //if all we know is pixel type, then it is image's file flavor
                    //previous v2.0 data also used type as what is now format, so we check for those value here too
                    absolute = true;
                }

                if (absolute) {
                    //change relative links to absolute
                    data[i].data = _qz.tools.absolute(data[i].data);
                }
                if (data[i].options && typeof data[i].options.overlay === 'string') {
                    data[i].options.overlay = _qz.tools.absolute(data[i].options.overlay);
                }
            }
        }
    },

    /** Performs deep copy to target from remaining params */
    extend: function (target) {
        //special case when reassigning properties as objects in a deep copy
        if (typeof target !== 'object') {
            target = {};
        }

        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            if (!source) {
                continue;
            }

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    if (target === source[key]) {
                        continue;
                    }

                    if (source[key] && source[key].constructor && source[key].constructor === Object) {
                        var clone;
                        if (Array.isArray(source[key])) {
                            clone = target[key] || [];
                        } else {
                            clone = target[key] || {};
                        }

                        target[key] = _qz.tools.extend(clone, source[key]);
                    } else if (source[key] !== undefined) {
                        target[key] = source[key];
                    }
                }
            }
        }

        return target;
    },

    versionCompare: function (major, minor, patch, build) {
        if (_qz.tools.assertActive()) {
            var semver = _qz.websocket.connection.semver;
            if (Array.isArray(semver)) {
                if (major != undefined && semver.length > 0 && semver[0] != major) {
                    return semver[0] - major;
                }
                if (minor != undefined && semver.length > 1 && semver[1] != minor) {
                    return semver[1] - minor;
                }
                if (patch != undefined && semver.length > 2 && semver[2] != patch) {
                    return semver[2] - patch;
                }
                if (build != undefined && semver.length > 3 && semver[3] != build) {
                    return Number.isInteger(semver[3]) && Number.isInteger(build)
                        ? semver[3] - build
                        : semver[3].toString().localeCompare(build.toString());
                }
            }
            return 0;
        }
    },

    isVersion: function (major, minor, patch, build) {
        return _qz.tools.versionCompare(major, minor, patch, build) == 0;
    },

    isActive: function () {
        return (
            !_qz.websocket.shutdown &&
            _qz.websocket.connection != null &&
            (_qz.websocket.connection.readyState === _qz.tools.ws.OPEN ||
                _qz.websocket.connection.readyState === _qz.tools.ws.CONNECTING)
        );
    },

    assertActive: function () {
        if (_qz.tools.isActive()) {
            return true;
        }
        // Promise won't reject on throw; yet better than 'undefined'
        throw new Error('A connection to ' + _qz.TITLE + ' has not been established yet');
    },

    uint8ArrayToHex: function (uint8) {
        return Array.from(uint8)
            .map(function (i) {
                return i.toString(16).padStart(2, '0');
            })
            .join('');
    },

    uint8ArrayToBase64: function (uint8) {
        /**
         * Adapted from Egor Nepomnyaschih's code under MIT Licence (C) 2020
         * see https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
         */
        var map = [
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'w',
            'x',
            'y',
            'z',
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '+',
            '/',
        ];

        var result = '',
            i,
            l = uint8.length;
        for (i = 2; i < l; i += 3) {
            result += map[uint8[i - 2] >> 2];
            result += map[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
            result += map[((uint8[i - 1] & 0x0f) << 2) | (uint8[i] >> 6)];
            result += map[uint8[i] & 0x3f];
        }
        if (i === l + 1) {
            // 1 octet yet to write
            result += map[uint8[i - 2] >> 2];
            result += map[(uint8[i - 2] & 0x03) << 4];
            result += '==';
        }
        if (i === l) {
            // 2 octets yet to write
            result += map[uint8[i - 2] >> 2];
            result += map[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
            result += map[(uint8[i - 1] & 0x0f) << 2];
            result += '=';
        }
        return result;
    },
};
