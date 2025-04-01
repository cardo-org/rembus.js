import { component } from "../index.js";

const base_url = 'wss://127.0.0.1:8000'

function test_topic(data) {
    console.log("[test_topic]:", data)
}

const pub = component(`${base_url}/pub`);
const sub = component(`${base_url}/sub`)
await sub.subscribe(test_topic)
await sub.reactive()

await pub.publish("test_topic", { text: "Hello from Rembus!" });

await pub.close()
await sub.close()