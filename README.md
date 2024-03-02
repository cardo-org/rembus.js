## Rembus for javascript

### RPC server
```js
rembus = require('rembus');

function myservice(x,y) {
    return x + y;
}

rb = rembus.component();
rb.expose("myservice", myservice)
```

### RPC client
```js
rembus = require('rembus');

rb = rembus.component()
let result = await rb.rpc("myservice", 1, 2)

```

