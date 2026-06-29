import { _qz } from '../internal/core.js';
import { qz } from './registry.js';

/**
 * Calls related to signing connection requests.
 * @namespace qz.security
 */
qz.security = {
    /**
     * Set promise resolver for calls to acquire the site's certificate.
     *
     * @param {Function|AsyncFunction|Promise<string>} promiseHandler Either a function that will be used as a promise resolver (of format <code>Function({function} resolve, {function}reject)</code>),
     *     an async function, or a promise. Any of which should return the public certificate via their respective <code>resolve</code> call.
     * @param {Object} [options] Configuration options for the certificate resolver
     *  @param {boolean} [options.rejectOnFailure=[false]] Overrides default behavior to call resolve with a blank certificate on failure.
     * @memberof qz.security
     */
    setCertificatePromise: function (promiseHandler, options) {
        _qz.security.certHandler = promiseHandler;
        _qz.security.rejectOnCertFailure = !!(options && options.rejectOnFailure);
    },

    /**
     * Set promise factory for calls to sign API calls.
     *
     * @param {Function|AsyncFunction} promiseFactory Either a function that accepts a string parameter of the data to be signed
     *     and returns a function to be used as a promise resolver (of format <code>Function({function} resolve, {function}reject)</code>),
     *     or an async function that can take a string parameter of the data to be signed. Either of which should return the signed contents of
     *     the passed string parameter via their respective <code>resolve</code> call.
     *
     * @example
     *  qz.security.setSignaturePromise(function(dataToSign) {
     *    return function(resolve, reject) {
     *      $.ajax("/signing-url?data=" + dataToSign).then(resolve, reject);
     *    }
     *  })
     *
     * @memberof qz.security
     */
    setSignaturePromise: function (promiseFactory) {
        _qz.security.signatureFactory = promiseFactory;
    },

    /**
     * Set which signing algorithm QZ will check signatures against.
     *
     * @param {string} algorithm The algorithm used in signing. Valid values: <code>[SHA1 | SHA256 | SHA512]</code>
     * @since 2.1.0
     *
     * @memberof qz.security
     */
    setSignatureAlgorithm: function (algorithm) {
        //warn for incompatibilities if known
        if (!_qz.compatible.algorithm()) {
            return;
        }

        if (['SHA1', 'SHA256', 'SHA512'].indexOf(algorithm.toUpperCase()) < 0) {
            _qz.log.error("Signing algorithm '" + algorithm + "' is not supported.");
        } else {
            _qz.security.signAlgorithm = algorithm;
        }
    },

    /**
     * Get the signing algorithm QZ will be checking signatures against.
     *
     * @returns {string} The algorithm used in signing.
     * @since 2.1.0
     *
     * @memberof qz.security
     */
    getSignatureAlgorithm: function () {
        return _qz.security.signAlgorithm;
    },
};
