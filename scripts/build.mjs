// Bundles the modular src/ back into a single IIFE/UMD file, behavior-identical
// to the original hand-written qz-tray.js.
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const banner = `/**
 * @version 2.2.6
 * @overview QZ Tray Connector
 * @license LGPL-2.1-only
 *
 * Connects a web client to the QZ Tray software.
 * Enables printing and device communication from javascript.
 *
 * Built from src/ — do not edit directly.
 */`;

// Reproduces the original UMD tail. `globalName: 'qz'` already declares the
// browser global `qz`; here we additionally expose it to CommonJS and AMD.
const footer = `qz = (qz && qz.default) ? qz.default : qz;
if (typeof module === "object" && module.exports) { module.exports = qz; }
else if (typeof define === "function" && define.amd) { define(function () { return qz; }); }`;

const dev = process.argv.includes('--dev');

const common = {
    entryPoints: [path.join(ROOT, 'src/index.js')],
    bundle: true,
    target: ['es2015'], // match the original's broad browser support
    banner: { js: banner },
    legalComments: 'none',
    minify: !dev,
    sourcemap: dev ? 'inline' : false,
    logLevel: 'info',
};

// 1) IIFE/UMD — browser <script>, CommonJS require, AMD. Same as the original.
await build({
    ...common,
    outfile: path.join(ROOT, 'dist/qz-tray.js'),
    format: 'iife', // single self-contained closure, like the original
    globalName: 'qz', // expose window.qz / self.qz like the original
    footer: { js: footer },
});

// 2) ESM — `import qz from 'qz-tray'` and <script type="module">.
await build({
    ...common,
    outfile: path.join(ROOT, 'dist/qz-tray.mjs'),
    format: 'esm', // emits `export default qz`
});

console.log('built dist/qz-tray.js + dist/qz-tray.mjs');
