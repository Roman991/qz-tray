export declare const STREAMS: {
    readonly serial: "SERIAL";
    readonly usb: "USB";
    readonly hid: "HID";
    readonly printer: "PRINTER";
    readonly file: "FILE";
    readonly socket: "SOCKET";
};
export type StreamType = (typeof STREAMS)[keyof typeof STREAMS];
/** Registered callbacks: an array, a single function, or unset. */
export type Callbacks = ((event: unknown) => void) | Array<(event: unknown) => void> | null | undefined;
/** Invoke registered stream callbacks, tolerating array/single/unset slots. */
export declare function dispatch(callbacks: Callbacks, event: unknown): void;
