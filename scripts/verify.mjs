// Verifies the bundled dist/qz-tray.js is equivalent to the original qz-tray.js
// by loading both under a minimal browser-ish sandbox and comparing:
//   1) the public API surface (namespaces, method names, function arity)
//   2) a functional smoke test (Config wiring + connection-free code paths)
//   3) a differential test exercising the argument-normalization paths of many
//      public methods (the ones touched by the helper-extraction refactor)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function load(file) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const sandbox = { console, setTimeout, clearTimeout };
    sandbox.window = sandbox; // make `typeof window === 'object'` true and qz land on it
    vm.createContext(sandbox);
    new vm.Script(code + '\n;globalThis.__qz = (typeof qz!=="undefined")?qz:(window&&window.qz);').runInContext(
        sandbox
    );
    return sandbox.__qz || sandbox.qz;
}

// Structural signature: keys, types, and function arity (not bodies).
function shape(obj, depth = 0) {
    if (typeof obj === 'function') return 'fn/' + obj.length;
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return typeof obj + ':' + JSON.stringify(obj);
    if (Array.isArray(obj)) return 'array[' + obj.length + ']';
    if (depth > 6) return 'object';
    const out = {};
    for (const k of Object.keys(obj).sort()) out[k] = shape(obj[k], depth + 1);
    return out;
}

// Exercises Config wiring + connection-free paths; output must be deterministic.
function smoke(qz) {
    const out = {};
    const c = qz.configs.create('Printer-X', { copies: 3, colorType: 'grayscale' });
    c.reconfigure({ copies: 5 });
    out.printer = c.getPrinter();
    out.copies = c.config.copies;
    out.colorType = c.config.colorType;
    out.version = qz.version;
    try {
        c.getOptions();
        out.getOptions = 'NO-THROW';
    } catch (e) {
        out.getOptions = 'THROW:' + e.message;
    }
    try {
        out.isActive = qz.websocket.isActive();
    } catch (e) {
        out.isActive = 'THROW:' + e.message;
    }
    return JSON.stringify(out);
}

// Drives many public methods through their argument-normalization branches.
// Without an active connection these resolve to a deterministic throw (or a
// pure return), so the captured outcomes must be byte-identical orig vs built.
function differential(qz) {
    const calls = [
        // Config: string-printer vs object-printer normalization + data/array paths.
        ['configs.create(string)', () => JSON.stringify(qz.configs.create('P', { copies: 2 }).getPrinter())],
        ['configs.create(object)', () => JSON.stringify(qz.configs.create({ name: 'P', host: 'h' }, {}).getPrinter())],
        ['configs.create.config', () => JSON.stringify(qz.configs.create('P', { copies: 9 }).config.copies)],
        ['configs.create(no-opts)', () => JSON.stringify(qz.configs.create('P').getPrinter())],
        ['configs.create.reconfigure', () => JSON.stringify(qz.configs.create('P').reconfigure({ copies: 4 }))],
        // Device-info normalization (usb/hid) — positional args -> object.
        ['usb.claimDevice', () => qz.usb.claimDevice(0x1, 0x2, 0x3)],
        ['usb.isClaimed', () => qz.usb.isClaimed(0x1, 0x2)],
        ['usb.sendData', () => qz.usb.sendData(0x1, 0x2, 0x3, 'x')],
        ['usb.readData', () => qz.usb.readData(0x1, 0x2, 0x3, 8)],
        ['usb.listInterfaces', () => qz.usb.listInterfaces(0x1, 0x2)],
        ['hid.claimDevice', () => qz.hid.claimDevice(0x1, 0x2)],
        ['hid.sendData', () => qz.hid.sendData(0x1, 0x2, 'x')],
        ['hid.readData', () => qz.hid.readData(0x1, 0x2, 8)],
        // Send-data string->{data,type:'PLAIN'} + FILE path normalization.
        ['serial.sendData(string)', () => qz.serial.sendData('PORT', 'data')],
        ['serial.sendData(file)', () => qz.serial.sendData('PORT', { data: 'f.txt', type: 'FILE' })],
        ['socket.sendData', () => qz.socket.sendData('host', 1234, 'data')],
        // Array normalization (ensureArray).
        ['file.list', () => qz.file.list('/x', ['a'])],
        ['printers.find', () => qz.printers.find('x')],
    ];
    const out = {};
    for (const [label, thunk] of calls) {
        try {
            const r = thunk();
            if (r && typeof r.then === 'function') {
                // dataPromise rejects (null connection); swallow so it isn't an
                // unhandled rejection, and record only that a promise was returned.
                r.then(undefined, () => {});
                out[label] = 'PROMISE';
            } else {
                out[label] = 'VALUE:' + String(r);
            }
        } catch (e) {
            out[label] = 'THROW:' + e.message;
        }
    }
    return JSON.stringify(out);
}

const orig = load('qz-tray.js');
const built = load('dist/qz-tray.js');

const a = JSON.stringify(shape(orig), null, 1);
const b = JSON.stringify(shape(built), null, 1);

if (a !== b) {
    const al = a.split('\n'),
        bl = b.split('\n');
    for (let i = 0; i < Math.max(al.length, bl.length); i++) {
        if (al[i] !== bl[i]) {
            console.error('API MISMATCH at line ' + (i + 1));
            console.error('  original:', al[i]);
            console.error('  bundled :', bl[i]);
            break;
        }
    }
    process.exit(1);
}

if (smoke(orig) !== smoke(built)) {
    console.error('FUNCTIONAL MISMATCH\n  original:', smoke(orig), '\n  bundled :', smoke(built));
    process.exit(1);
}

if (differential(orig) !== differential(built)) {
    const ao = JSON.parse(differential(orig)),
        bo = JSON.parse(differential(built));
    for (const k of Object.keys(ao)) {
        if (ao[k] !== bo[k]) {
            console.error('DIFFERENTIAL MISMATCH at ' + k + '\n  original:', ao[k], '\n  bundled :', bo[k]);
            break;
        }
    }
    process.exit(1);
}

const fnCount = (a.match(/"fn\//g) || []).length;
console.log('OK: bundle matches original qz-tray.js (' + fnCount + ' functions, v' + built.version + ')');
process.exit(0);
