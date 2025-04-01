# Rembus for javascript

## RPC server

```js
import rem from 'rembus';

function myservice(x,y) {
    return x + y;
}

// Get rembus component that connect via plain websocket on port 8000 
let rb = rem.component('ws://localhost:8000');

// Make myservice available to remote client components
await rb.expose(myservice)
```

## RPC client

```js
import rem from 'rembus';

// Default url is ws://localhost:8000
let rb = rem.component()

// Invoke remote service
let result = await rb.rpc("myservice", 1, 2)

// Terminate connection
await rb.close()
```
