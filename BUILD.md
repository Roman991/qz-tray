# qz-tray — sorgente modulare → bundle IIFE/UMD

Il connettore, storicamente un singolo IIFE (`qz-tray.js`, ~3000 righe), è stato
scomposto in moduli ES in `src/`. Il bundler li ricuce in un unico file
self-contained (`dist/qz-tray.js`) con la stessa identica API e lo stesso global
`qz` dell'originale.

## Struttura

```
src/
  polyfills.js          Array.isArray / Number.isInteger / Array.from / padStart
  internal/
    core.js             _qz: singleton privato condiviso (TITLE/VERSION/DEBUG)
    log.js streams.js websocket.js printing.js serial.js socket.js
    usb.js hid.js printers.js file.js security.js tools.js
    compatible.js sha.js     ← ognuno fa `_qz.<ns> = { ... }`
  config.js             classe Config (export)
  api/
    registry.js         qz: singleton pubblico condiviso (`export const qz = {}`)
    websocket.js printers.js configs.js print.js serial.js socket.js
    usb.js hid.js file.js networking.js security.js api.js
                        ← ognuno fa `qz.<ns> = { ... }`
  index.js              importa tutto, setta qz.version, `export default qz`
```

### Come funziona lo stato condiviso

`_qz` e `qz` sono **due oggetti singleton** (`core.js`, `api/registry.js`). Ogni
modulo li importa e vi aggancia il proprio namespace. Poiché le istanze dei
moduli ES sono singleton, tutti condividono lo stesso oggetto: è la stessa
semantica della closure originale. I riferimenti incrociati (`_qz.tools.*`,
`qz.api.*`, `new Config(...)`) avvengono a runtime, quindi l'ordine di import è
irrilevante per la correttezza.

## Comandi

```bash
npm install        # installa esbuild
npm run build      # dist/qz-tray.js  (IIFE/UMD, minificato)
npm run build:dev  # idem, non minificato + sourcemap inline
npm test           # verifica equivalenza con l'originale qz-tray.js
```

L'output è IIFE con `globalName: 'qz'` (espone `window.qz`/`self.qz`); il footer
aggiunge CommonJS (`module.exports`) e AMD (`define`), riproducendo la coda UMD
dell'originale.

## Verifica di equivalenza

`scripts/verify.mjs` carica originale e bundle in un sandbox `vm` e confronta la
superficie API (namespace, nomi metodi, arità) — 77 funzioni, version 2.2.6 —
oltre a uno smoke test funzionale (creazione `Config`, `reconfigure`, percorsi
che lanciano eccezioni). Deve stampare `OK: API surface identical`.

## Rigenerare i moduli dall'originale

`scripts/split.mjs` ha affettato `qz-tray.js` in moduli copiando i corpi
byte-per-byte (riscrive solo il wrapper `chiave: { … }` → `oggetto.chiave = { … }`).
Serve solo per la migrazione iniziale: una volta che si lavora su `src/`, il file
`qz-tray.js` alla radice è di sola lettura/riferimento e può essere rimosso.
