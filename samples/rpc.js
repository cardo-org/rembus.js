import { component } from "../index.js";

const base_url = 'ws://127.0.0.1:8000'

const cli = component(`${base_url}/cli`);

await cli.rpc("uptime");

await cli.close()