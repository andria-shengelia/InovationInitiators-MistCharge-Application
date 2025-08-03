const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🧪 Testing IoT data transmission...\n');

// Read certificate files
const caCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CA_CERT_PATH));
const clientCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CLIENT_CERT_PATH));
const privateKey = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_PRIVATE_KEY_PATH));

const options = {
  clientId: 'mist-charge-test-client',
  protocol: 'mqtts',
  port: 8883,
  ca: caCert,
  cert: clientCert,
  key: privateKey,
  reconnectPeriod: 5000,
  connectTimeout: 30000,
};

const client = mqtt.connect(`mqtts://${process.env.AWS_IOT_ENDPOINT}`, options);

client.on('connect', () => {
  console.log('✅ Connected to AWS IoT Core for testing');
  
  // Test sensor data
  const testData = [
    {
      topic: 'mistcharge/sensors/temperature',
      data: { value: 24.5, timestamp: new Date().toISOString() }
    },
    {
      topic: 'mistcharge/sensors/humidity',
      data: { value: 78.2, timestamp: new Date().toISOString() }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: { value: 2.1, timestamp: new Date().toISOString() }
    },
    {
      topic: 'mistcharge/sensors/battery',
      data: { value: 92.5, timestamp: new Date().toISOString() }
    },
    {
      topic: 'mistcharge/sensors/water_quality',
      data: { value: 1, timestamp: new Date().toISOString() }
    },
    {
      topic: 'mistcharge/sensors/water_produced',
      data: { 
        daily_production: 1.85, 
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        location: 'outdoor_unit_1'
      }
    }
  ];

  console.log('📤 Sending test sensor data...\n');

  testData.forEach((item, index) => {
    setTimeout(() => {
      const payload = JSON.stringify(item.data);
      client.publish(item.topic, payload, (err) => {
        if (err) {
          console.error(`❌ Error publishing to ${item.topic}:`, err);
        } else {
          console.log(`✅ Published to ${item.topic}: ${payload}`);
        }
      });
    }, index * 1000); // Send each message 1 second apart
  });

  // Send a command test
  setTimeout(() => {
    const commandPayload = JSON.stringify({
      command: 'calibrate',
      parameters: { sensors: ['temperature', 'humidity'] },
      timestamp: new Date().toISOString()
    });
    
    client.publish('mistcharge/commands/calibrate', commandPayload, (err) => {
      if (err) {
        console.error('❌ Error publishing command:', err);
      } else {
        console.log('✅ Published command: calibrate');
      }
    });
  }, 7000);

  // Disconnect after sending all data
  setTimeout(() => {
    console.log('\n✅ Test completed! Disconnecting...');
    client.end();
    process.exit(0);
  }, 10000);

});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
}); 