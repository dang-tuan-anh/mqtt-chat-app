'use client';

import { useEffect, useState } from 'react';

export default function ChatPage() {
  const [input, setInput] = useState('Hello, world!');  // State để lưu message
  const [logs, setLogs] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);  // Tạo WebSocket state để quản lý kết nối

  // Gửi message thông qua WebSocket
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: input }));
      setLogs((prev) => [...prev, `📤 Sent: ${input}`]);
      // setInput('');
    }
  };

  // Kết nối WebSocket khi component mount và đóng khi unmount
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001'); // ⚠️ tùy theo domain

    socket.onmessage = (event) => {
      console.log('onmessage:', event.data);
      setLogs((prev) => [...prev, `📥 Received: ${event.data}`]);
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

    setWs(socket);  // Lưu WebSocket vào state

    return () => {
      socket.close();
    };
  }, []);  // Chạy một lần khi component mount

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MQTT Chat</h1>
      <div className="border p-4 h-[300px] overflow-auto bg-gray-50 rounded mb-4">
        {logs.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border flex-1 px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter message"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()} // Gửi khi nhấn Enter
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
