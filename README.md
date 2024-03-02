# Rembus for javascript

## RPC server

```js
import rem from 'rembus';

function myservice(x,y) {
    return x + y;
}

rb = rem.bus();
await rb.expose("myservice", myservice)
```

## RPC client

```js
import rem from 'rembus';

rb = rem.bus()
let result = await rb.rpc("myservice", 1, 2)

```
