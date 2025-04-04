import * as rembus from '../src/rembus.js';

const cid = 'nodejs';
const pin = '11223344';

const rb = rembus.component();
try {
    await rb.register(cid, pin, null);
} catch (err) {
    console.log('error:', err);
}

await rb.close()