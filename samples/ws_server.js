import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log("✅ WebSocket Server running on ws://localhost:8080");

wss.on("connection", (ws) => {
    console.log("🔗 Client connected");

    setInterval(() => {
        const message = {
            timestamp: new Date().toISOString(),
            value: Math.random() * 100, // Random value
            source: "Sensor A"
        };
        ws.send(JSON.stringify(message));
    }, 100); // Send new data every second
});
