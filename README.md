# qz-tray

A JavaScript/TypeScript client for [QZ Tray](https://qz.io/) that lets a web
page print and talk to local devices (printers, serial, USB, HID, sockets) over
a WebSocket connection to the QZ Tray application running on the user's machine.

This package ships the modern, **instance-based** build. Instead of mutating a
single shared global, you create an independent client with `createQz()` and
pass it your configuration up front. A backwards-compatible singleton (`qz`) is
still exported as the default for existing code.

## Installation

```bash
npm install qz-tray
```

QZ Tray itself must be installed and running on the client machine — download it
from [qz.io](https://qz.io/download/).

## Importing

The package resolves to the TypeScript build (`dist/qz-next.*`) with full type
declarations.

```js
// ESM — modern, instance-based API
import { createQz } from 'qz-tray';

// ESM — legacy singleton (API-compatible with the original library)
import qz from 'qz-tray';

// CommonJS
const { createQz } = require('qz-tray');
const qz = require('qz-tray').default ?? require('qz-tray');
```

Browser `<script>` (UMD global `qz`):

```html
<script src="node_modules/qz-tray/dist/qz-next.js"></script>
<script>
  const client = qz.createQz();
</script>
```

## Initializing the client

`createQz(options)` returns a fully independent client. All options are
optional — call it with no arguments for an anonymous connection.

```js
import { createQz } from 'qz-tray';

const client = createQz({
  // Optional default print options applied to every config this client creates
  defaults: {
    copies: 1,
    size: { width: 4, height: 6 },
    units: 'in',
  },

  // Optional default WebSocket connection settings
  connect: {
    host: 'localhost',
    retries: 3,
    delay: 1,
  },

  // Optional signing (required for privileged calls on a secured QZ Tray)
  security: {
    certificate: () => fetch('/assets/digital-certificate.txt').then((r) => r.text()),
    sign: (toSign) => fetch('/sign?data=' + encodeURIComponent(toSign)).then((r) => r.text()),
    algorithm: 'SHA512',
  },

  debug: false,
});
```

### Connecting and disconnecting

`connect()` returns a promise that resolves once the WebSocket is established.

```js
await client.connect();

console.log('Connected:', client.isActive());
console.log(client.getConnectionInfo()); // { socket, host, port }

// ... do work ...

await client.disconnect();
```

You can override connection options per call:

```js
await client.connect({ host: ['localhost', '127.0.0.1'], usingSecure: true });
```

## Security / signing

Privileged calls (printing, listing printers, device access) must be signed when
QZ Tray runs in its default secured mode. Provide a `certificate` resolver and a
`sign` function. Both may be synchronous or return a promise.

```js
const client = createQz({
  security: {
    // Return your site's public certificate
    certificate: async () => (await fetch('/assets/digital-certificate.txt')).text(),

    // Sign the hashed payload server-side and return the signature
    sign: async (toSign) => (await fetch('/sign?data=' + encodeURIComponent(toSign))).text(),

    algorithm: 'SHA512', // 'SHA1' (default) | 'SHA256' | 'SHA512'

    // Reject the connection if the certificate cannot be loaded
    // (default: fall back to an anonymous connection)
    rejectOnCertFailure: true,
  },
});
```

These can also be set at runtime via `client.security.setCertificatePromise(...)`
and `client.security.setSignaturePromise(...)`, but supplying them at
construction is preferred.

## Finding printers

```js
// Default system printer
const printerName = await client.printers.getDefault();

// Find a printer by (partial) name
const epson = await client.printers.find('Epson');

// All printers with full details
const all = await client.printers.details();
```

## Printing

A **config** binds a printer to a set of print options. `client.config()`
returns a `BoundConfig` with a convenient `.print()` method, plus chainable
`.with()` / `.withPrinter()` builders that return new (immutable) configs.

### Raw / plain text printing

A bare string is treated as raw command data.

```js
const config = client.config(await client.printers.getDefault());

await config.print(['Hello world\n\n\n']);
```

### Printing ESC/POS or ZPL raw commands

```js
const config = client.config('Zebra Tech', { size: { width: 4, height: 6 } });

await config.print([
  { type: 'raw', format: 'command', flavor: 'plain', data: '^XA^FO50,50^ADN,36,20^FDHello^FS^XZ' },
]);
```

### Printing a PDF

```js
const config = client.config('PDF Printer', { copies: 2, orientation: 'portrait' });

await config.print([
  { type: 'pixel', format: 'pdf', flavor: 'file', data: 'http://localhost/sample.pdf' },
]);
```

### Printing HTML

```js
const config = client.config(await client.printers.getDefault(), {
  size: { width: 4, height: 6 },
  units: 'in',
});

await config.print([
  {
    type: 'pixel',
    format: 'html',
    flavor: 'plain',
    data: '<h1>Receipt</h1><p>Thank you!</p>',
  },
]);
```

### Printing an image

```js
const config = client.config(await client.printers.getDefault());

await config.print([
  { type: 'pixel', format: 'image', flavor: 'file', data: 'http://localhost/logo.png' },
]);
```

### Adjusting options without rebuilding

`.with()` and `.withPrinter()` return new configs; the original is unchanged.

```js
const base = client.config('Receipt Printer', { copies: 1 });

const twoCopies = base.with({ copies: 2 });
const otherPrinter = base.withPrinter('Label Printer');

await twoCopies.print(['Order #1234\n\n\n']);
```

### Printing to multiple printers at once

Pass arrays of configs and matching data sets to `client.print()`.

```js
const receipt = client.config('Receipt Printer');
const label = client.config('Label Printer');

await client.print(
  [receipt, label],
  [
    ['Receipt data\n\n\n'],
    [{ type: 'raw', format: 'command', flavor: 'plain', data: '^XA...^XZ' }],
  ]
);
```

### Continue on error

Pass `resumeOnError = true` to keep printing remaining jobs even if one fails;
the returned promise rejects with the collected errors.

```js
await config.print(['job one'], /* resumeOnError */ true);
```

## Listening to printer status / job events

```js
client.printers.setPrinterCallbacks((event) => {
  console.log('Printer event:', event);
});

await client.printers.startListening(null, { jobData: true });
await client.printers.getStatus();

// later
await client.printers.stopListening();
```

## Other device namespaces

The client also exposes `serial`, `socket`, `usb`, `hid`, `file`, `networking`,
and `api` namespaces, mirroring the QZ Tray protocol:

```js
await client.networking.device();      // host network info
const ports = await client.serial.findPorts(); // available serial ports
```

## Full example

```js
import { createQz } from 'qz-tray';

const client = createQz({
  security: {
    certificate: () => fetch('/assets/digital-certificate.txt').then((r) => r.text()),
    sign: (toSign) => fetch('/sign?data=' + encodeURIComponent(toSign)).then((r) => r.text()),
    algorithm: 'SHA512',
  },
});

async function printReceipt(lines) {
  await client.connect();
  try {
    const printer = await client.printers.find('Receipt');
    const config = client.config(printer, { copies: 1 });
    await config.print([lines.join('\n') + '\n\n\n']);
  } finally {
    await client.disconnect();
  }
}

printReceipt(['QZ Tray', 'Order #1234', 'Thank you!']).catch(console.error);
```

## Legacy / singleton API

For drop-in compatibility with the original library, import the default export.
It reconstructs the classic `qz.websocket`, `qz.configs`, `qz.print`, and
`qz.security` surface on top of a single shared instance.

```js
import qz from 'qz-tray';

qz.security.setCertificatePromise((resolve, reject) => {
  fetch('/assets/digital-certificate.txt').then((r) => r.text()).then(resolve, reject);
});
qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
  fetch('/sign?data=' + encodeURIComponent(toSign)).then((r) => r.text()).then(resolve, reject);
});

await qz.websocket.connect();

const config = qz.configs.create(await qz.printers.getDefault());
await qz.print(config, ['Hello world\n\n\n']);

await qz.websocket.disconnect();
```

> New code should prefer `createQz()` — the singleton exists only for migration.

## API reference (types)

Type declarations are published under `dist/types/`. Key types:

- `QzOptions` — options accepted by `createQz()`
- `PrintOptions` — per-config print options (`copies`, `size`, `orientation`, …)
- `PrintData` / `PrintPayload` — the print payload shape
- `PrinterInput` / `Printer` — printer targeting (name, host/port, or file)
- `SecurityOptions`, `ConnectOptions`

See the source under `src-next/` for the complete, documented surface.

## License

LGPL-2.1-only. © QZ Industries, LLC.
