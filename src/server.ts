import { createServer } from 'http';
import { initWebSocketServer } from './lib/wsServer';
import next from 'next';

const port = 4001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));

  initWebSocketServer(server); // Khởi tạo WebSocket

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
