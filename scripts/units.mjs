// Unit tests for the pure helpers in src/internal/helpers.js. These cover the
// argument-normalization logic that the public-API differential test cannot
// observe directly (the normalized values are swallowed before a connection
// throw). Run via `npm run test:unit`.
import assert from 'node:assert/strict';
import {
    dispatch,
    normalizeData,
    ensureArray,
    normalizeDeviceInfo,
    normalizePrinter,
} from '../src/internal/helpers.js';

let passed = 0;
function test(name, fn) {
    fn();
    passed++;
    console.log('  ok  ' + name);
}

test('dispatch: array invokes each callback once with the event', () => {
    const seen = [];
    const event = { type: 'SERIAL' };
    dispatch([(e) => seen.push(['a', e]), (e) => seen.push(['b', e])], event);
    assert.deepEqual(seen, [
        ['a', event],
        ['b', event],
    ]);
});

test('dispatch: single function is invoked once with the event', () => {
    let count = 0,
        got;
    dispatch((e) => {
        count++;
        got = e;
    }, 42);
    assert.equal(count, 1);
    assert.equal(got, 42);
});

test('dispatch: null/undefined/empty-array are no-ops', () => {
    assert.doesNotThrow(() => dispatch(null, 1));
    assert.doesNotThrow(() => dispatch(undefined, 1));
    assert.doesNotThrow(() => dispatch([], 1));
});

test('normalizeData: wraps a non-object as PLAIN', () => {
    assert.deepEqual(normalizeData('hello'), { data: 'hello', type: 'PLAIN' });
});

test('normalizeData: passes an object through unchanged', () => {
    const obj = { data: 'x', type: 'FILE' };
    assert.equal(normalizeData(obj), obj);
});

test('ensureArray: wraps a scalar', () => {
    assert.deepEqual(ensureArray('x'), ['x']);
});

test('ensureArray: passes an array through (same reference)', () => {
    const arr = ['a', 'b'];
    assert.equal(ensureArray(arr), arr);
});

test('normalizeDeviceInfo: object first arg passes through', () => {
    const info = { vendorId: 1, productId: 2 };
    assert.equal(normalizeDeviceInfo([info], ['vendorId', 'productId']), info);
});

test('normalizeDeviceInfo: positional args map to keys', () => {
    assert.deepEqual(normalizeDeviceInfo([0x1, 0x2, 0x3], ['vendorId', 'productId', 'interface']), {
        vendorId: 0x1,
        productId: 0x2,
        interface: 0x3,
    });
});

test('normalizeDeviceInfo: extra positional args beyond keys are ignored', () => {
    assert.deepEqual(normalizeDeviceInfo([1, 2, 3, 4], ['vendorId', 'productId']), { vendorId: 1, productId: 2 });
});

test('normalizePrinter: string becomes {name}', () => {
    assert.deepEqual(normalizePrinter('Office'), { name: 'Office' });
});

test('normalizePrinter: object passes through', () => {
    const p = { name: 'Office', host: '1.2.3.4' };
    assert.equal(normalizePrinter(p), p);
});

console.log('\nOK: ' + passed + ' unit tests passed');
