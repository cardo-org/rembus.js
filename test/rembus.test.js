//const rembus = require('../src/rembus.js');

import { component, RembusError } from '../src/rembus.js';

test('component url', () => {
    let url = "ws://myhost:8000/myc"
    let c = component(url)
    expect(c.protocol).toBe('ws');
    expect(c.host).toBe('myhost');
    expect(c.port).toBe('8000');
    expect(c.cid).toBe('myc');
});

test('empty cid url', () => {
    let url = "ws://myhost:8000"
    let c = component(url)
    expect(c.protocol).toBe('ws');
    expect(c.host).toBe('myhost');
    expect(c.port).toBe('8000');
    expect(c.cid).toBe(null);
});

test('wrong component url', () => {
    let url = "zss://myhost:8000/myc"
    const testcase = () => {
        let c = component(url)
    }
    expect(testcase).toThrow(Error);
});

test('component cid', () => {
    let url = "myc"
    let c = component(url)
    expect(c.protocol).toBe('ws');
    expect(c.host).toBe('localhost');
    expect(c.port).toBe('8000');
    expect(c.cid).toBe('myc');
});

// A file with path ~/caronte/apps/test_app 
// and content pippo must exist.
test('authenticate', async () => {
    let secret = 'pippo'
    let rb = component('test_app', secret)
    await rb.connect()
    //expect(response).toBe(null)
    await rb.close()
})

test('rpc ok', async () => {
    let rb = component('myc')
    await rb.connect()
    let response = await rb.rpc('version')
    expect(response).toBe('0.6.0')
    await rb.close()
})

test('rpc notfound', async () => {
    let rb = component('myc')
    await rb.connect()
    await expect(rb.rpc('unknown_method')).rejects.toStrictEqual(new RembusError(42, "unknown_method: method unknown"))
    await rb.close()
})