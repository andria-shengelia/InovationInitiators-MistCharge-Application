const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔌 Testing Power Control Commands...\n');

// Read certificate files
const caCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CA_CERT_PATH));
const clientCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CLIENT_CERT_PATH));
const privateKey = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_PRIVATE_KEY_PATH));

const options = {
  clientId: 'mist-charge-power-test',
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
  console.log('✅ Connected to AWS IoT Core for power control testing');
  
  const testCommands = [
    {
      topic: 'mistcharge/commands/power_on',
      data: {
        command: 'power_on',
        timestamp: new Date().toISOString(),
        source: 'test_script',
        parameters: {
          reason: 'testing_power_control',
          user: 'test_user'
        }
      }
    },
    {
      topic: 'mistcharge/commands/power_off',
      data: {
        command: 'power_off',
        timestamp: new Date().toISOString(),
        source: 'test_script',
        parameters: {
          reason: 'testing_power_control',
          user: 'test_user'
        }
      }
    }
  ];

  console.log('🔌 Testing power control commands...\n');

  testCommands.forEach((item, index) => {
    setTimeout(() => {
      const payload = JSON.stringify(item.data);
      const command = item.topic.split('/').pop();
      
      client.publish(item.topic, payload, (err) => {
        if (err) {
          console.error(`❌ Error publishing ${command}:`, err);
        } else {
          console.log(`✅ Sent ${command} command`);
        }
      });
    }, index * 3000); // Send each command 3 seconds apart
  });

  // Disconnect after sending all commands
  setTimeout(() => {
    console.log('\n✅ Power control test completed!');
    console.log('📱 Check your mobile app to see the power status change!');
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