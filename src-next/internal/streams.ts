// Stream type identifiers used in websocket callback messages.

export const STREAMS = {
    serial: 'SERIAL',
    usb: 'USB',
    hid: 'HID',
    printer: 'PRINTER',
    file: 'FILE',
    socket: 'SOCKET',
} as const;

export type StreamType = (typeof STREAMS)[keyof typeof STREAMS];

/** Registered callbacks: an array, a single function, or unset. */
export type Callbacks = ((event: unknown) => void) | Array<(event: unknown) => void> | null | undefined;

/** Invoke registered stream callbacks, tolerating array/single/unset slots. */
export function dispatch(callbacks: Callbacks, event: unknown): void {
    if (Array.isArray(callbacks)) {
        for (const cb of callbacks) cb(event);
    } else if (callbacks) {
        callbacks(event);
    }
}
