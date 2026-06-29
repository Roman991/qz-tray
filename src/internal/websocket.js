import { _qz } from './core.js';
import { qz } from '../api/registry.js';

_qz.websocket = {
    /** The actual websocket object managing the connection. */
    connection: null,
    /** Track if a connection attempt is being cancelled. */
    shutdown: false,

    /** Default parameters used on new connections. Override values using options parameter on {@link qz.websocket.connect}. */
    connectConfig: {
        host: ['localhost', 'localhost.qz.io'], //hosts QZ Tray can be running on
        hostIndex: 0, //internal var - index on host array
        usingSecure: true, //boolean use of secure protocol
        usingSurf: true, //append suffix to non-qualified hostnames
        surfDomain: 'qz.surf', //surf suffix to append
        protocol: {
            secure: 'wss://', //secure websocket
            insecure: 'ws://', //insecure websocket
        },
        port: {
            secure: [8181, 8282, 8383, 8484], //list of secure ports QZ Tray could be listening on
            insecure: [8182, 8283, 8384, 8485], //list of insecure ports QZ Tray could be listening on
            portIndex: 0, //internal var - index on active port array
        },
        keepAlive: 60, //time between pings to keep connection alive, in seconds
        retries: 0, //number of times to reconnect before failing
        delay: 0, //seconds before firing a connection
    },

    setup: {
        webSocketPromise: function (address) {
            var ws, onError, onOpen;
            return _qz.tools
                .promise(function (resolve, reject) {
                    ws = new _qz.tools.ws(address);
                    _qz.websocket.connection = ws;
                    onOpen = function () {
                        resolve(ws);
                    };
                    onError = function (e) {
                        _qz.websocket.connection = null;
                        reject(e);
                    };
                    ws.addEventListener('open', onOpen);
                    ws.addEventListener('error', onError);
                    // Older Safari versions may trigger close event instead of error event.
                    ws.addEventListener('close', onError);
                })
                .finally(function () {
                    ws.removeEventListener('open', onOpen);
                    ws.removeEventListener('error', onError);
                    ws.removeEventListener('close', onError);
                });
        },

        connectToAddress: function (address) {
            var lna = _qz.tools.getLna();

            _qz.log.trace('Attempting connection', address);
            var wsPromise;
            if (lna) {
                _qz.log.trace('Connecting with lna.js');
                wsPromise = lna.detectLna(address, _qz.websocket.setup.webSocketPromise, {
                    isWebSocket: true,
                    defaultAddressSpace: 'public',
                });
            } else {
                _qz.log.trace('Connecting without lna.js');
                wsPromise = _qz.websocket.setup.webSocketPromise(address);
            }
            return wsPromise.catch(function (evt) {
                var msg = evt.denied
                    ? 'Connection attempt denied by Local Network Access restrictions'
                    : 'Unable to establish connection with ' + _qz.TITLE;
                var err = new Error(msg);
                if (lna && evt instanceof lna.LnaError) {
                    err.denied = evt.denied;
                    err.permission = evt.permission;
                }
                throw err;
            });
        },

        /** Loop through possible ports to open connection, sets web socket calls that will settle the promise. */
        findConnection: function (config, resolve, reject) {
            if (_qz.websocket.shutdown) {
                reject(new Error('Connection attempt cancelled by user'));
                return;
            }

            //force flag if missing ports
            if (!config.port.secure.length) {
                if (!config.port.insecure.length) {
                    reject(new Error('No ports have been specified to connect over'));
                    return;
                } else if (config.usingSecure) {
                    _qz.log.error('No secure ports specified - forcing insecure connection');
                    config.usingSecure = false;
                }
            } else if (!config.port.insecure.length && !config.usingSecure) {
                _qz.log.trace('No insecure ports specified - forcing secure connection');
                config.usingSecure = true;
            }

            var deeper = function (e) {
                if (_qz.websocket.shutdown) {
                    //connection attempt was cancelled, bail out
                    reject(new Error('Connection attempt cancelled by user'));
                    return;
                }

                if (e.denied) {
                    //user denied LNA permission, stop trying
                    reject(e);
                    return;
                }

                config.port.portIndex++;

                if (
                    (config.usingSecure && config.port.portIndex >= config.port.secure.length) ||
                    (!config.usingSecure && config.port.portIndex >= config.port.insecure.length)
                ) {
                    if (config.hostIndex >= config.host.length - 1) {
                        //give up, all hope is lost
                        reject(e);
                        return;
                    } else {
                        config.hostIndex++;
                        config.port.portIndex = 0;
                    }
                }

                // recursive call until connection established or all ports are exhausted
                _qz.websocket.setup.findConnection(config, resolve, reject);
            };

            var address;
            if (config.usingSecure) {
                address =
                    config.protocol.secure +
                    config.host[config.hostIndex] +
                    ':' +
                    config.port.secure[config.port.portIndex];
            } else {
                address =
                    config.protocol.insecure +
                    config.host[config.hostIndex] +
                    ':' +
                    config.port.insecure[config.port.portIndex];
            }

            var promise = _qz.websocket.setup.connectToAddress(address);

            promise.then(
                //called on successful connection to qz, begins setup of websocket calls and resolves connect promise after certificate is sent
                function () {
                    _qz.log.info('Established connection with ' + _qz.TITLE + ' on ' + address);
                    _qz.websocket.setup.openConnection({ resolve: resolve, reject: reject });

                    if (config.keepAlive > 0) {
                        var interval = setInterval(function () {
                            if (!_qz.tools.isActive() || _qz.websocket.connection.interval !== interval) {
                                clearInterval(interval);
                                return;
                            }

                            _qz.websocket.connection.send('ping');
                        }, config.keepAlive * 1000);

                        _qz.websocket.connection.interval = interval;
                    }
                },
                //called for errors during setup (such as invalid ports), reject connect promise only if all ports have been tried
                function (e) {
                    _qz.log.trace(e);
                    deeper(e);
                }
            );
        },

        /** Finish setting calls on successful connection, sets web socket calls that won't settle the promise. */
        openConnection: function (openPromise) {
            //called when an open connection is closed
            _qz.websocket.connection.onclose = function (evt) {
                _qz.log.trace(evt);

                _qz.websocket.connection = null;
                _qz.websocket.callClose(evt);
                _qz.log.info('Closed connection with ' + _qz.TITLE);

                for (var uid in _qz.websocket.pendingCalls) {
                    if (_qz.websocket.pendingCalls.hasOwnProperty(uid)) {
                        _qz.websocket.pendingCalls[uid].reject(new Error('Connection closed before response received'));
                    }
                }

                //if this is set, then an explicit close call was made
                if (this.promise != undefined) {
                    this.promise.resolve();
                }
            };

            //called for any errors with an open connection
            _qz.websocket.connection.onerror = function (evt) {
                _qz.websocket.callError(evt);
            };

            //send JSON objects to qz
            _qz.websocket.connection.sendData = function (obj) {
                _qz.log.trace('Preparing object for websocket', obj);

                if (obj.timestamp == undefined) {
                    obj.timestamp = Date.now();
                    if (typeof obj.timestamp !== 'number') {
                        obj.timestamp = new Date().getTime();
                    }
                }
                if (obj.promise != undefined) {
                    obj.uid = _qz.websocket.setup.newUID();
                    _qz.websocket.pendingCalls[obj.uid] = obj.promise;
                }

                // track requesting monitor
                obj.position = {
                    x:
                        typeof screen !== 'undefined'
                            ? (screen.availWidth || screen.width) / 2 + (screen.left || screen.availLeft || 0)
                            : 0,
                    y:
                        typeof screen !== 'undefined'
                            ? (screen.availHeight || screen.height) / 2 + (screen.top || screen.availTop || 0)
                            : 0,
                };

                try {
                    if (obj.call != undefined && obj.signature == undefined && _qz.security.needsSigned(obj.call)) {
                        var signObj = {
                            call: obj.call,
                            params: obj.params,
                            timestamp: obj.timestamp,
                        };

                        //make a hashing promise if not already one
                        var hashing = _qz.tools.hash(_qz.tools.stringify(signObj));
                        if (!hashing.then) {
                            hashing = _qz.tools.promise(function (resolve) {
                                resolve(hashing);
                            });
                        }

                        hashing
                            .then(function (hashed) {
                                return _qz.security.callSign(hashed);
                            })
                            .then(function (signature) {
                                _qz.log.trace('Signature for call', signature);
                                obj.signature = signature || '';
                                obj.signAlgorithm = _qz.security.signAlgorithm;

                                _qz.signContent = undefined;
                                _qz.websocket.connection.send(_qz.tools.stringify(obj));
                            })
                            .catch(function (err) {
                                _qz.log.error('Signing failed', err);

                                if (obj.promise != undefined) {
                                    obj.promise.reject(new Error('Failed to sign request'));
                                    delete _qz.websocket.pendingCalls[obj.uid];
                                }
                            });
                    } else {
                        _qz.log.trace('Signature for call', obj.signature);

                        //called for pre-signed content and (unsigned) setup calls
                        _qz.websocket.connection.send(_qz.tools.stringify(obj));
                    }
                } catch (err) {
                    _qz.log.error(err);

                    if (obj.promise != undefined) {
                        obj.promise.reject(err);
                        delete _qz.websocket.pendingCalls[obj.uid];
                    }
                }
            };

            //receive message from qz
            _qz.websocket.connection.onmessage = function (evt) {
                var returned = JSON.parse(evt.data);

                if (returned.uid == null) {
                    if (returned.type == null) {
                        //incorrect response format, likely connected to incompatible qz version
                        _qz.websocket.connection.close(4003, 'Connected to incompatible ' + _qz.TITLE + ' version');
                    } else {
                        //streams (callbacks only, no promises)
                        switch (returned.type) {
                            case _qz.streams.serial:
                                if (!returned.event) {
                                    returned.event = JSON.stringify({ portName: returned.key, output: returned.data });
                                }

                                _qz.serial.callSerial(JSON.parse(returned.event));
                                break;
                            case _qz.streams.socket:
                                _qz.socket.callSocket(JSON.parse(returned.event));
                                break;
                            case _qz.streams.usb:
                                if (!returned.event) {
                                    returned.event = JSON.stringify({
                                        vendorId: returned.key[0],
                                        productId: returned.key[1],
                                        output: returned.data,
                                    });
                                }

                                _qz.usb.callUsb(JSON.parse(returned.event));
                                break;
                            case _qz.streams.hid:
                                _qz.hid.callHid(JSON.parse(returned.event));
                                break;
                            case _qz.streams.printer:
                                _qz.printers.callPrinter(JSON.parse(returned.event));
                                break;
                            case _qz.streams.file:
                                _qz.file.callFile(JSON.parse(returned.event));
                                break;
                            default:
                                _qz.log.allay('Cannot determine stream type for callback', returned);
                                break;
                        }
                    }

                    return;
                }

                _qz.log.trace('Received response from websocket', returned);

                var promise = _qz.websocket.pendingCalls[returned.uid];
                if (promise == undefined) {
                    _qz.log.allay('No promise found for returned response');
                } else {
                    if (returned.error != undefined) {
                        promise.reject(new Error(returned.error));
                    } else {
                        promise.resolve(returned.result);
                    }
                }

                delete _qz.websocket.pendingCalls[returned.uid];
            };

            //send up the certificate before making any calls
            //also gives the user a chance to deny the connection
            function sendCert(cert) {
                if (cert === undefined) {
                    cert = null;
                }

                //websocket setup, query what version is connected
                qz.api
                    .getVersion()
                    .then(function (version) {
                        _qz.websocket.connection.version = version;
                        _qz.websocket.connection.semver = version
                            .toLowerCase()
                            .replace(/-rc\./g, '-rc')
                            .split(/[\\+\\.-]/g);
                        for (var i = 0; i < _qz.websocket.connection.semver.length; i++) {
                            try {
                                if (i == 3 && _qz.websocket.connection.semver[i].toLowerCase().indexOf('rc') == 0) {
                                    // Handle "rc1" pre-release by negating build info
                                    _qz.websocket.connection.semver[i] = -_qz.websocket.connection.semver[i].replace(
                                        /\D/g,
                                        ''
                                    );
                                    continue;
                                }
                                _qz.websocket.connection.semver[i] = parseInt(_qz.websocket.connection.semver[i]);
                            } catch (ignore) {}

                            if (_qz.websocket.connection.semver.length < 4) {
                                _qz.websocket.connection.semver[3] = 0;
                            }
                        }

                        //algorithm can be declared before a connection, check for incompatibilities now that we have one
                        _qz.compatible.algorithm(true);
                    })
                    .then(function () {
                        _qz.websocket.connection.sendData({ certificate: cert, promise: openPromise });
                    });
            }

            _qz.security
                .callCert()
                .then(sendCert)
                .catch(function (error) {
                    _qz.log.warn('Failed to get certificate:', error);

                    if (_qz.security.rejectOnCertFailure) {
                        openPromise.reject(error);
                    } else {
                        sendCert(null);
                    }
                });
        },

        /** Generate unique ID used to map a response to a call. */
        newUID: function () {
            var len = 6;
            return (new Array(len + 1).join('0') + ((Math.random() * Math.pow(36, len)) << 0).toString(36)).slice(-len);
        },
    },

    dataPromise: function (callName, params, signature, signingTimestamp) {
        return _qz.tools.promise(function (resolve, reject) {
            var msg = {
                call: callName,
                promise: { resolve: resolve, reject: reject },
                params: params,
                signature: signature,
                timestamp: signingTimestamp,
            };

            _qz.websocket.connection.sendData(msg);
        });
    },

    /** Library of promises awaiting a response, uid -> promise */
    pendingCalls: {},

    /** List of functions to call on error from the websocket. */
    errorCallbacks: [],
    /** Calls all functions registered to listen for errors. */
    callError: function (evt) {
        if (Array.isArray(_qz.websocket.errorCallbacks)) {
            for (var i = 0; i < _qz.websocket.errorCallbacks.length; i++) {
                _qz.websocket.errorCallbacks[i](evt);
            }
        } else {
            _qz.websocket.errorCallbacks(evt);
        }
    },

    /** List of function to call on closing from the websocket. */
    closedCallbacks: [],
    /** Calls all functions registered to listen for closing. */
    callClose: function (evt) {
        if (Array.isArray(_qz.websocket.closedCallbacks)) {
            for (var i = 0; i < _qz.websocket.closedCallbacks.length; i++) {
                _qz.websocket.closedCallbacks[i](evt);
            }
        } else {
            _qz.websocket.closedCallbacks(evt);
        }
    },
};
