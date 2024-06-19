const rembus = require('rembus');

function foo(x, y) {
    return x + y;
}

let server

beforeEach(async () => {
    server = rembus.component()
    await server.expose(foo)
});

afterEach(async () => {
    console.log("closing server")
    await server.close()
});

test('rpc ok', async () => {
    let rb = rembus.component('myc')
    try {
        await rb.connect()
        let response = await rb.rpc('foo', 1, 2)
        expect(response).toBe(3)
    } finally {
        await rb.close()
    }
})
