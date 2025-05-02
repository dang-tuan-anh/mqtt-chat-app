import { NextRequest } from 'next/server';
import { publishMessage } from '@/lib/mqttClient';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  await publishMessage(message);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
