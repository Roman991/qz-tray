// Small pure helpers extracted from the original IIFE to remove copy-pasted
// duplication across the api/* and internal/* modules. These intentionally do
// NOT reference the `_qz`/`qz` singletons so they stay pure and unit-testable.

/**
 * Invoke registered stream callbacks. The callback slot is either an array of
 * functions or a single function (legacy); a falsy slot is a no-op.
 * @param {Function|Function[]|null|undefined} callbacks
 * @param {*} event Stream event passed to each callback.
 */
export function dispatch(callbacks, event) {
    if (Array.isArray(callbacks)) {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](event);
        }
    } else if (callbacks) {
        callbacks(event);
    }
}

/**
 * Normalize raw send-data into the `{ data, type }` envelope. A non-object
 * value is wrapped as a PLAIN payload; an existing object is passed through.
 * @param {*} data
 * @returns {Object}
 */
export function normalizeData(data) {
    if (typeof data !== 'object') {
        return { data: data, type: 'PLAIN' };
    }
    return data;
}

/**
 * Ensure a value is an array, wrapping a single value in one.
 * @param {*} value
 * @returns {Array}
 */
export function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}

/**
 * Backwards-compatibility shim for the USB/HID device methods: if the first
 * argument is already a device-info object, return it; otherwise build the
 * object from positional `arguments` using the provided key order.
 * @param {IArguments|Array} args The method's `arguments`.
 * @param {string[]} keys Positional key names, in order.
 * @returns {Object}
 */
export function normalizeDeviceInfo(args, keys) {
    if (typeof args[0] === 'object') {
        return args[0];
    }
    var info = {};
    for (var i = 0; i < keys.length; i++) {
        info[keys[i]] = args[i];
    }
    return info;
}

/**
 * Normalize a printer argument: a string becomes `{ name: <string> }`, an
 * object is passed through.
 * @param {string|Object} printer
 * @returns {Object}
 */
export function normalizePrinter(printer) {
    if (typeof printer === 'string') {
        return { name: printer };
    }
    return printer;
}
