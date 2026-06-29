if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

if (!Number.isInteger) {
    Number.isInteger = function (value) {
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
}

if (!Array.from) {
    Array.from = function (object) {
        return [].slice.call(object);
    };
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; // truncate if number or convert non-number to 0
        padString = String(typeof padString !== 'undefined' ? padString : ' ');

        if (this.length >= targetLength) {
            return String(this);
        }

        var gapSize = targetLength - this.length;
        var padding = '';
        while (padding.length < gapSize) {
            padding += padString;
        }

        return padding.slice(0, gapSize) + String(this);
    };
}
