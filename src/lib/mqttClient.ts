import { mqtt, iot } from 'aws-iot-device-sdk-v2';
import { TextDecoder } from 'util';
import { broadcastMessage } from './wsServer';

const decoder = new TextDecoder('utf-8');

let client: mqtt.MqttClient | null = null;
let connection: mqtt.MqttClientConnection | null = null;

const publishTopic = 'keybox/event/company_01/box_01/status';
const subscribeTopic = 'keybox/action/company_01/box_01/lock_command';

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
