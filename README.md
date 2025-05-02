Demo MQTT chat app.

## Setting
Copy certificate and key to certss folder
```
certs
├── keybox-01.cert.pem
├── keybox-01.private.key
├── keybox-01.public.key
└── root-CA.crt
```

## Build and run client and server

```bash
# Build
pnpm install

# Run Websocket server
pnpm run server

# Run chat app
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

<img width="702" alt="Screenshot 2025-05-02 at 12 40 28" src="https://github.com/user-attachments/assets/c9c7802c-de05-4a88-8a98-b8229a71beca" />
