const rembus = require('rembus');

test('component url', () => {
    url = "ws://myhost:8000/myc"
    c = rembus.component(url)
    expect(c.protocol).toBe('ws');
    expect(c.host).toBe('myhost');
    expect(c.port).toBe('8000');
    expect(c.cid).toBe('myc');
});

test('empty cid url', () => {
    url = "ws://myhost:8000"
    c = rembus.component(url)
    expect(c.protocol).toBe('ws');
    expect(c.host).toBe('myhost');
    expect(c.port).toBe('8000');
    expect(c.cid).toBe(null);
});

test('wrong component url', () => {
    url = "zss://myhost:8000/myc"
    const testcase = () => {
        c = rembus.component(url)
    }
    expect(testcase).toThrow(Error);
});

test('component cid', () => {
    url = "myc"
    c = rembus.component(url)
    expect(c.protocol).toBe('ws');
    expect(c.host).toBe('localhost');
    expect(c.port).toBe('8000');
    expect(c.cid).toBe('myc');
});

// A file with path ~/caronte/apps/test_app 
// and content pippo must exist.
test('authenticate', async () => {
    secret = 'pippo'
    let rb = rembus.component('test_app', secret)
    await rb.connect()
    //expect(response).toBe(null)
    await rb.close()
})

test('rpc ok', async () => {
    let rb = rembus.component('myc')
    await rb.connect()
    let response = await rb.rpc('version')
    expect(response).toBe('0.2.1')
    await rb.close()
})

test('rpc notfound', async () => {
    let rb = rembus.component('myc')
    await rb.connect()
    await expect(rb.rpc('unknown_method')).rejects.toStrictEqual(new rembus.RembusError(42, "unknown_method: method unknown"))
    await rb.close()
})