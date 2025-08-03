const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🧪 Testing MQTT Commands...\n');

// Read certificate files
const caCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CA_CERT_PATH));
const clientCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CLIENT_CERT_PATH));
const privateKey = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_PRIVATE_KEY_PATH));

const options = {
  clientId: 'mist-charge-command-test',
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
  console.log('✅ Connected to AWS IoT Core for command testing');
  
  // Test commands
  const testCommands = [
    {
      topic: 'mistcharge/commands/calibrate',
      data: {
        command: 'calibrate',
        parameters: {
          sensors: ['temperature', 'humidity', 'water_level'],
          duration: 30
        },
        timestamp: new Date().toISOString()
      }
    },
    {
      topic: 'mistcharge/commands/set_mode',
      data: {
        command: 'set_mode',
        parameters: {
          mode: 'high_efficiency',
          target_humidity: 75,
          target_temperature: 25
        },
        timestamp: new Date().toISOString()
      }
    },
    {
      topic: 'mistcharge/commands/restart',
      data: {
        command: 'restart',
        parameters: {
          delay: 5,
          reason: 'maintenance'
        },
        timestamp: new Date().toISOString()
      }
    }
  ];

  console.log('📤 Sending test commands...\n');

  testCommands.forEach((item, index) => {
    setTimeout(() => {
      const payload = JSON.stringify(item.data);
      client.publish(item.topic, payload, (err) => {
        if (err) {
          console.error(`❌ Error publishing command to ${item.topic}:`, err);
        } else {
          console.log(`✅ Published command to ${item.topic}:`, item.data.command);
        }
      });
    }, index * 2000); // Send each command 2 seconds apart
  });

  // Disconnect after sending all commands
  setTimeout(() => {
    console.log('\n✅ Command test completed! Disconnecting...');
    client.end();
    process.exit(0);
  }, 8000);

});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
}); 