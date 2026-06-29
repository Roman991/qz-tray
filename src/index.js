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

// Internal singleton + namespaces (attach to `_qz`)
import { _qz } from './internal/core.js';
import './internal/log.js';
import './internal/streams.js';
import './internal/websocket.js';
import './internal/printing.js';
import './internal/serial.js';
import './internal/socket.js';
import './internal/usb.js';
import './internal/hid.js';
import './internal/printers.js';
import './internal/file.js';
import './internal/security.js';
import './internal/tools.js';
import './internal/compatible.js';
import './internal/sha.js';

// Config class (depends on _qz + public qz)
import './config.js';

// Public singleton + namespaces (attach to `qz`)
import { qz } from './api/registry.js';
import './api/websocket.js';
import './api/printers.js';
import './api/configs.js';
import './api/print.js';
import './api/serial.js';
import './api/socket.js';
import './api/usb.js';
import './api/hid.js';
import './api/file.js';
import './api/networking.js';
import './api/security.js';
import './api/api.js';

/**
 * Version of this JavaScript library
 * @constant {string}
 * @memberof qz
 */
qz.version = _qz.VERSION;

// esbuild's `globalName: 'qz'` exposes this as the browser global; the build
// footer additionally wires CommonJS/AMD, reproducing the original UMD tail.
export default qz;
