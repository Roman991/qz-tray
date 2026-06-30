// Bundles the TypeScript src-next/ tree. esbuild compiles .ts natively (type
// stripping only — run `npm run typecheck` for checking). Emits the same
// IIFE/UMD + ESM pair as the legacy build, plus types via `npm run types`.

import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const banner = `/**
 * @version ${pkg.version}
 * @overview QZ Tray Connector (instance-based / TypeScript build)
 * @license LGPL-2.1-only
 *
 * Built from src-next/ — do not edit directly.
 */`;

// UMD tail: expose the default export to CommonJS and AMD (browser global is
// declared by esbuild's `globalName`).
const footer = `qz = (qz && qz.default) ? qz.default : qz;
if (typeof module === "object" && module.exports) { module.exports = qz; }
else if (typeof define === "function" && define.amd) { define(function () { return qz; }); }`;

const dev = process.argv.includes('--dev');

const common = {
    entryPoints: [path.join(ROOT, 'src-next/index.ts')],
    bundle: true,
    target: ['es2017'],
    banner: { js: banner },
    legalComments: 'none',
    minify: !dev,
    sourcemap: dev ? 'inline' : false,
    logLevel: 'info',
};

// 1) IIFE/UMD — browser <script>, CommonJS require, AMD.
await build({
    ...common,
    outfile: path.join(ROOT, 'dist/qz-next.js'),
    format: 'iife',
    globalName: 'qz',
    footer: { js: footer },
});

// 2) ESM — `import { createQz } from 'qz-tray/next'` and <script type="module">.
await build({
    ...common,
    outfile: path.join(ROOT, 'dist/qz-next.mjs'),
    format: 'esm',
});

console.log('built dist/qz-next.js + dist/qz-next.mjs');
