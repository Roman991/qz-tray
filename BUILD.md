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
    helpers.js          funzioni PURE riusabili (dispatch, normalizeData,
                        ensureArray, normalizeDeviceInfo, normalizePrinter)
    index.js            barrel: importa tutti i moduli internal
    log.js streams.js websocket.js printing.js serial.js socket.js
    usb.js hid.js printers.js file.js security.js tools.js
    compatible.js sha.js     ← ognuno fa `_qz.<ns> = { ... }`
  config.js             classe Config (export); usa normalizePrinter
  api/
    registry.js         qz: singleton pubblico condiviso (`export const qz = {}`)
    index.js            barrel: importa tutti i moduli api
    websocket.js printers.js configs.js print.js serial.js socket.js
    usb.js hid.js file.js networking.js security.js api.js
                        ← ognuno fa `qz.<ns> = { ... }`
  index.js              entry: polyfills → internal → config → api,
                        setta qz.version, `export default qz`
```

### Funzioni pure (`internal/helpers.js`)

Logica di normalizzazione argomenti che era copia-incollata nei moduli (dispatch
dei callback di stream, conversione `arguments`→deviceInfo in usb/hid, wrapping
`{data,type:'PLAIN'}`, `Array.isArray ? x : [x]`, printer string→`{name}`) è
estratta in funzioni pure, senza dipendenze da `_qz`/`qz`, testate in isolamento
(`scripts/units.mjs`). Le **firme/arità pubbliche restano invariate** (la verifica
controlla `fn/<length>`).

### Come funziona lo stato condiviso

`_qz` e `qz` sono **due oggetti singleton** (`core.js`, `api/registry.js`). Ogni
modulo li importa e vi aggancia il proprio namespace. Poiché le istanze dei
moduli ES sono singleton, tutti condividono lo stesso oggetto: è la stessa
semantica della closure originale. I riferimenti incrociati (`_qz.tools.*`,
`qz.api.*`, `new Config(...)`) avvengono a runtime, quindi l'ordine di import è
irrilevante per la correttezza.

## Comandi

```bash
npm install        # installa esbuild + prettier
npm run build      # dist/qz-tray.js + dist/qz-tray.mjs (IIFE/UMD + ESM, minificati)
npm run build:dev  # idem, non minificato + sourcemap inline
npm test           # verify.mjs (equivalenza) + units.mjs (helper puri)
npm run test:unit  # solo i test unitari dei helper
npm run format     # prettier --write
```

L'output IIFE usa `globalName: 'qz'` (espone `window.qz`/`self.qz`); il footer
aggiunge CommonJS (`module.exports`) e AMD (`define`), riproducendo la coda UMD
dell'originale. La build legge la `version` da `package.json` per il banner e
**fallisce** se `core.js` è andato fuori sincrono (guardia anti-drift).

## Verifica di equivalenza

`scripts/verify.mjs` carica originale e bundle in un sandbox `vm` e confronta:

1. la superficie API (namespace, nomi metodi, **arità** — 77 funzioni, v2.2.6);
2. uno smoke test funzionale (`Config`, `reconfigure`, percorsi che lanciano);
3. un test differenziale che esercita i percorsi di normalizzazione argomenti su
   molti metodi pubblici (usb/hid/serial/socket/file/printers/configs),
   confrontando l'esito (`THROW:…` / `PROMISE`) tra originale e bundle.

`scripts/units.mjs` testa in isolamento le funzioni pure di `internal/helpers.js`.
Entrambi devono stampare `OK`.

## Nota sulla migrazione

`scripts/split.mjs` (storico) ha affettato l'originale `qz-tray.js` in moduli. Ora
che `src/` è stato rifattorizzato a mano (helper estratti, dedup), **diverge** di
proposito dall'originale: lo split non va più rieseguito. `src/` è la fonte di
verità; `qz-tray.js` alla radice resta come oracolo richiesto da `verify.mjs`
(rimuovendolo, `npm test` fallisce: usa `npm run test:unit` da solo, oppure
reintroduci nel verify il fallback standalone).
