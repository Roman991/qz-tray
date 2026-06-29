// Shared public singleton. Each api/* module attaches its namespace to this
// object (e.g. `qz.printers = {...}`). Mirrors `internal/core.js` for the
// public surface that ends up exported as the global `qz`.
export const qz = {};
