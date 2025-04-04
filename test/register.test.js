import * as rembus from '../src/rembus.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

//const cid = "nodejs";
const cid = "aaa";
const pin = "11223344";

function publicKeyFile(cid) {
    return join(
        process.env.REMBUS_DIR || join(process.env.HOME, ".config", "rembus"),
        "broker", // assume to test with the default broker
        "keys",
        `${cid}.rsa.pem`
    )
}

function deleteFile(filename) {
    try {
        unlinkSync(filename);
    } catch (error) {
    }
}

beforeEach(async () => {
});

afterEach(async () => {
});

test('register', async () => {
    // Remove existing keys
    const fn = await rembus.privateKeyFile(cid)
    deleteFile(fn)
    deleteFile(publicKeyFile(cid))

    const rb = rembus.component();
    await rb.register(cid, pin, null);
    await rb.close()
})

test('register already provisioned', async () => {
    const rb = rembus.component();
    await expect(rb.register(cid, pin, null))
        .rejects.toBeInstanceOf(rembus.RembusError);
    await rb.close()
})

test('connect authenticated', async () => {
    ////console.log('GETTING KEY')
    ////const key = await rembus.getPK(cid);
    ////console.log("get pk:", key);
    const rb = rembus.component(cid);
    const response = await rb.rpc("rid");
    console.log("response:", response);

    await rb.close();
})


test('unregister', async () => {
    const rb = rembus.component(cid);
    const response = await rb.unregister();
    await rb.close();
})


