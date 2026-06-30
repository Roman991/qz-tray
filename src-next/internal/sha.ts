// SHA-256, ported verbatim from the legacy `_qz.SHA` implementation
// (adapted from Chris Veness's code, MIT). Pure function, no singleton.

/* eslint-disable no-bitwise */

const rotr = (n: number, x: number): number => (x >>> n) | (x << (32 - n));
const sig0 = (x: number): number => rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
const sig1 = (x: number): number => rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
const dev0 = (x: number): number => rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
const dev1 = (x: number): number => rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);
const ch = (x: number, y: number, z: number): number => (x & y) ^ (~x & z);
const maj = (x: number, y: number, z: number): number => (x & y) ^ (x & z) ^ (y & z);

function hexStr(n: number): string {
    let s = '';
    for (let i = 7; i >= 0; i--) {
        s += ((n >>> (i * 4)) & 0xf).toString(16);
    }
    return s;
}

function utf8Encode(str: string): string {
    // encodeURIComponent + manual unescape, matching the legacy approach.
    return encodeURIComponent(str).replace(/%([\da-f]{2})/gi, (_, hex: string) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

export function sha256(message: string): string {
    let msg = utf8Encode(message) + String.fromCharCode(0x80);

    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
        0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
        0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
        0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
        0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
        0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
        0xc67178f2,
    ];
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    const l = msg.length / 4 + 2;
    const N = Math.ceil(l / 16);
    const M: number[][] = new Array(N);

    for (let i = 0; i < N; i++) {
        M[i] = new Array(16);
        for (let j = 0; j < 16; j++) {
            M[i][j] =
                (msg.charCodeAt(i * 64 + j * 4) << 24) |
                (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
                (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) |
                msg.charCodeAt(i * 64 + j * 4 + 3);
        }
    }
    M[N - 1][14] = Math.floor(((msg.length - 1) * 8) / Math.pow(2, 32));
    M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

    const W = new Array(64);
    let a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number;
    for (let i = 0; i < N; i++) {
        for (let t = 0; t < 16; t++) W[t] = M[i][t];
        for (let t = 16; t < 64; t++) {
            W[t] = (dev1(W[t - 2]) + W[t - 7] + dev0(W[t - 15]) + W[t - 16]) & 0xffffffff;
        }
        a = H[0];
        b = H[1];
        c = H[2];
        d = H[3];
        e = H[4];
        f = H[5];
        g = H[6];
        h = H[7];
        for (let t = 0; t < 64; t++) {
            const T1 = h + sig1(e) + ch(e, f, g) + K[t] + W[t];
            const T2 = sig0(a) + maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & 0xffffffff;
        }
        H[0] = (H[0] + a) & 0xffffffff;
        H[1] = (H[1] + b) & 0xffffffff;
        H[2] = (H[2] + c) & 0xffffffff;
        H[3] = (H[3] + d) & 0xffffffff;
        H[4] = (H[4] + e) & 0xffffffff;
        H[5] = (H[5] + f) & 0xffffffff;
        H[6] = (H[6] + g) & 0xffffffff;
        H[7] = (H[7] + h) & 0xffffffff;
    }

    return H.map(hexStr).join('');
}
