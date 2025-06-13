'use client';

import { useEffect, useState } from 'react';
import { config } from '../app.config'; // Adjust the path based on the actual location of app.config

export default function ChatPage() {
  const message = `{
  "company_id": "company01",
  "box_id": "key_box01",
  "fw_ver": "1.0.0",
  "sent_at": "2025-01-01T00:00:00+09:00",
  "box_status": "Init",
  "sensor_alert_status": ["DoorOpenedAlert", "HighTemperatureAlert"],
  "sensor_error_status": ["LockControlError", "HighTemperatureError"],
  "door_open_status": "opened",
  "door_lock_status": "lock",
  "internal_temperature": 0.0,
  "sbc_fan_status": "on",
  "image_path": "bucket/folder/2025/01/01/hhmm.jpg",
  "qr_code": "1234567890AB",
  "key_status": ["E0040108639659B9", "E004010863965926", "E004010863965A09"],
  "key_enable": "enable"
}`;
  const [input, setInput] = useState(message);
  const [logs, setLogs] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(input);
      const timestamp = new Date().toISOString();
      setLogs((prev) => [...prev, `${timestamp}　 📤 Sent: ${input}`]);
    }
  };

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4001');

    socket.onmessage = (event) => {
      const timestamp = new Date().toISOString();
      setLogs((prev) => [...prev, `${timestamp}　📥 Received: ${event.data}`]);
    };

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">MQTT Chat</h1>
      <div className="text-sm text-gray-500 mb-4">
        <p>
          AWS_IOT_TOPIC_PUBLISH= {config.AWS_IOT_TOPIC_PUBLISH} <br />
          AWS_IOT_TOPIC_SUBSCRIBE= {config.AWS_IOT_TOPIC_SUBSCRIBE} <br />
        </p>
      </div>

      {/* Nội dung chính: chia làm 2 cột */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: log panel */}
        <div
          className="w-1/2 bg-gray-50 border rounded p-4 overflow-auto"
          ref={(el) => {
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
        >
          {logs.map((msg, idx) => (
            <div key={idx} className="mb-1 whitespace-pre-wrap">
              {msg}
            </div>
          ))}
        </div>

        {/* Right: input panel */}
        <div className="w-1/2 flex flex-col gap-2">
          <textarea
            className="border px-2 py-1 resize-none rounded flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter message"
            onKeyDown={(e) => {
              if (e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <button
              className="bg-red-600 text-white px-6 py-2 rounded cursor-pointer text-sm"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </button>
            <span>Press Shift + Enter to send</span>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer text-sm"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
