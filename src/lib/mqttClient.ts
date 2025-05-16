import { mqtt, iot } from 'aws-iot-device-sdk-v2';
import { TextDecoder } from 'util';
import { broadcastMessage } from './wsServer';
import { config } from '../app.config';

const decoder = new TextDecoder('utf-8');

let client: mqtt.MqttClient | null = null;
let connection: mqtt.MqttClientConnection | null = null;

const publishTopic = config.AWS_IOT_TOPIC_PUBLISH;
const subscribeTopic = config.AWS_IOT_TOPIC_SUBSCRIBE;
if (!publishTopic || !subscribeTopic) {
  throw new Error('Environment variables for MQTT topics are not set.');
}
console.log('subscribeTopic', subscribeTopic);

export async function getMqttConnection(): Promise<mqtt.MqttClientConnection> {
  if (connection) return connection;

  const config = iot.AwsIotMqttConnectionConfigBuilder
    .new_mtls_builder_from_path('certs/keybox-01.cert.pem', 'certs/keybox-01.private.key')
    .with_certificate_authority_from_path(undefined, 'certs/root-CA.crt')
    .with_clean_session(true)
    .with_client_id('nextjs-backend-client-' + Math.floor(Math.random() * 1000))
    .with_endpoint(process.env.AWS_IOT_ENDPOINT || '')
    .build();

  client = new mqtt.MqttClient();
  connection = client.new_connection(config);

  await connection.connect();
  
  await connection.subscribe(subscribeTopic, mqtt.QoS.AtLeastOnce, (topic, payload) => {
    const message = decoder.decode(payload);
    console.log(`[Topic ${subscribeTopic}] Received: ${message}`);
    // TODO: Có thể đẩy message vào Redis/pubsub nếu cần phân phối đến frontend
    broadcastMessage(message);
  });

  return connection;
}

export async function publishMessage(message: string) {
  console.log(`[MQTT] Publishing: ${message}`);
  const conn = await getMqttConnection();
  await conn.publish(publishTopic, message, mqtt.QoS.AtLeastOnce);
}
