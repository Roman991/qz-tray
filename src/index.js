/**
 * @version 2.2.6
 * @overview QZ Tray Connector
 * @license LGPL-2.1-only
 *
 * Connects a web client to the QZ Tray software.
 * Enables printing and device communication from javascript.
 *
 * Modular entry point. Bundled to an IIFE/UMD by the build (see package.json).
 */
'use strict';

import './polyfills.js';

// Internal singleton + all `_qz.*` namespaces.
import { _qz } from './internal/core.js';
import './internal/index.js';

// Config class (depends on _qz + public qz).
import './config.js';

// Public singleton + all `qz.*` namespaces.
import { qz } from './api/registry.js';
import './api/index.js';

/**
 * Version of this JavaScript library
 * @constant {string}
 * @memberof qz
 */
qz.version = _qz.VERSION;

// esbuild's `globalName: 'qz'` exposes this as the browser global; the build
// footer additionally wires CommonJS/AMD, reproducing the original UMD tail.
export default qz;
