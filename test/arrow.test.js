const arrow = require('apache-arrow');
const cbor = require('cbor-x');
const rembus = require('rembus');

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

    rb = rembus.component()
    payload = rb.encoder.encode(rembus.table2tag(tbl))

    out = rembus.tag2table(cbor.decode(payload))
    //console.log(out.toArray())

    expect(out.toArray()).toStrictEqual(tbl.toArray())
})
