// Shared internal singleton. Every internal module imports THIS object and
// attaches its own namespace to it (e.g. `_qz.websocket = {...}`). Because ES
// module instances are singletons, all importers share one `_qz`, preserving
// the semantics of the original closure-scoped private object.
export const _qz = {
    TITLE: 'QZ Tray',
    VERSION: '2.2.6', //must match @version in the banner / package.json
    DEBUG: false,
};
