const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// AWS IoT Core Configuration
const AWS_IOT_ENDPOINT = process.env.AWS_IOT_ENDPOINT || 'your-aws-iot-endpoint.amazonaws.com';
const AWS_IOT_CLIENT_ID = process.env.AWS_IOT_CLIENT_ID || `mistcharge-test-${Date.now()}`;
const AWS_IOT_THING_NAME = process.env.AWS_IOT_THING_NAME || 'MistChargeDevice';

// Certificate paths
const CERT_DIR = path.join(__dirname, 'certs');
const CA_CERT_PATH = path.join(CERT_DIR, 'AmazonRootCA1.pem');
const CLIENT_CERT_PATH = path.join(CERT_DIR, 'certificate.pem.crt');
const PRIVATE_KEY_PATH = path.join(CERT_DIR, 'private.pem.key');

// Check if AWS IoT certificates exist
const hasAWSCerts = fs.existsSync(CA_CERT_PATH) && 
                   fs.existsSync(CLIENT_CERT_PATH) && 
                   fs.existsSync(PRIVATE_KEY_PATH);

console.log('🚀 MQTT Test Client for Mist Charge');
console.log('====================================');

let client;

if (hasAWSCerts) {
  console.log('🔐 AWS IoT Core certificates found');
  console.log(`📍 Endpoint: ${AWS_IOT_ENDPOINT}`);
  console.log(`🆔 Client ID: ${AWS_IOT_CLIENT_ID}`);
  console.log(`📦 Thing Name: ${AWS_IOT_THING_NAME}`);
  
  // AWS IoT Core connection
  client = mqtt.connect(`mqtts://${AWS_IOT_ENDPOINT}:8883`, {
    clientId: AWS_IOT_CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    ca: fs.readFileSync(CA_CERT_PATH),
    cert: fs.readFileSync(CLIENT_CERT_PATH),
    key: fs.readFileSync(PRIVATE_KEY_PATH),
    rejectUnauthorized: true,
  });
} else {
  console.log('⚠️  AWS IoT Core certificates not found');
  console.log('📡 Falling back to public MQTT broker for testing');
  console.log('💡 To use AWS IoT Core, run: ./setup-aws-iot.sh');
  
  // Public MQTT broker connection
  client = mqtt.connect('mqtt://broker.emqx.io:1883', {
    clientId: `mistcharge-test-${Date.now()}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });
}

client.on('connect', () => {
  console.log('🔗 Connected to MQTT broker');
  
  // Test data
  const testData = {
    temperature: { value: 24.5, unit: 'celsius' },
    humidity: { value: 78, unit: 'percent' },
    water_level: { value: 3.2, unit: 'liters' },
    battery: { value: 92, unit: 'percent' },
    water_quality: { value: 'safe', status: 'good' },
    power: { value: true, status: 'running' }
  };
  
  // Publish test data
  Object.entries(testData).forEach(([sensor, data]) => {
    const topic = `mistcharge/sensors/${sensor}`;
    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      deviceId: AWS_IOT_THING_NAME,
      source: 'test-client'
    });
    
    client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err);
      } else {
        console.log(`✅ Published to ${topic}: ${message}`);
      }
    });
  });
  
  // Disconnect after publishing
  setTimeout(() => {
    client.end();
    console.log('🔌 Test completed, disconnecting...');
    process.exit(0);
  }, 3000);
});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
  process.exit(1);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
});

console.log('\n📡 Publishing test sensor data...');
console.log('💡 Make sure your server-dev.js is running to receive the data');
console.log('⏳ Waiting for connection...\n'); 