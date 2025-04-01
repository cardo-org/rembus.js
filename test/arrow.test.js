import * as rembus from '../src/rembus.js';
import * as arrow from 'apache-arrow';
import * as cbor from 'cbor-x'

const TYPE_RPC = 2

test("encode", () => {
    const LENGTH = 2;

    const values = Float32Array.from(
        { length: LENGTH },
        (_, i) => i);

    const tbl = arrow.tableFromArrays({
        x: values,
    });

    //console.table([...tbl]);

    let rb = rembus.component()
    let payload = rb.encoder.encode(rembus.table2tag(tbl))

    let out = rembus.tag2table(cbor.decode(payload))
    //console.log(out.toArray())

    expect(out.toArray()).toStrictEqual(tbl.toArray())
})
