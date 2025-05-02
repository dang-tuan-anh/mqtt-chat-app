import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

import { Server as HttpServer } from 'http';
import { publishMessage } from './mqttClient';

export function initWebSocketServer(server: HttpServer) {
  if (wss) return wss;

  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('🔌 Client connected via WebSocket');
    clients.add(ws);

    ws.on('message', (message) => {
      console.log('📥 Received message:', message.toString());
      publishMessage(message.toString());
    });
    ws.on('close', () => {
      console.log('❌ Client disconnected');
      clients.delete(ws);
    });
  });

  return wss;
}

export function broadcastMessage(message: string) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      console.log('📤 Broadcasting message:', message);
      client.send(message);
    }
  }
}
