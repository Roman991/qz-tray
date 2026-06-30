/**
 * QZ Tray Connector — instance-based entry point.
 *
 * - Modern usage: `import { createQz } from 'qz-tray'` → independent client.
 * - Legacy usage: `import qz from 'qz-tray'` → the singleton `qz` global,
 *   API-compatible with the original library.
 */
export { createQz } from './client.js';
export type { Qz, BoundConfig } from './client.js';
export type { PrintConfig } from './printing/config.js';
export * from './types.js';
import { qz } from './legacy.js';
export default qz;
