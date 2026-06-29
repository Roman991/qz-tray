import { _qz } from './core.js';

_qz.security = {
    /** Function used to resolve promise when acquiring site's public certificate. */
    certHandler: function (resolve, reject) {
        reject();
    },
    /** Called to create new promise (using {@link _qz.security.certHandler}) for certificate retrieval. */
    callCert: function () {
        if (typeof _qz.security.certHandler.then === 'function') {
            //already a promise
            return _qz.security.certHandler;
        } else if (_qz.security.certHandler.constructor.name === 'AsyncFunction') {
            //already callable as a promise
            return _qz.security.certHandler();
        } else {
            //turn into a promise
            return _qz.tools.promise(_qz.security.certHandler);
        }
    },

    /** Function used to create promise resolver when requiring signed calls. */
    signatureFactory: function () {
        return function (resolve) {
            resolve();
        };
    },
    /** Called to create new promise (using {@link _qz.security.signatureFactory}) for signed calls. */
    callSign: function (toSign) {
        if (_qz.security.signatureFactory.constructor.name === 'AsyncFunction') {
            //use directly
            return _qz.security.signatureFactory(toSign);
        } else {
            //use in a promise
            return _qz.tools.promise(_qz.security.signatureFactory(toSign));
        }
    },

    /** Signing algorithm used on signatures */
    signAlgorithm: 'SHA1',

    rejectOnCertFailure: false,

    needsSigned: function (callName) {
        const undialoged = [
            'printers.getStatus',
            'printers.stopListening',
            'usb.isClaimed',
            'usb.closeStream',
            'usb.releaseDevice',
            'hid.stopListening',
            'hid.isClaimed',
            'hid.closeStream',
            'hid.releaseDevice',
            'file.stopListening',
            'getVersion',
        ];

        return callName != null && undialoged.indexOf(callName) === -1;
    },
};
