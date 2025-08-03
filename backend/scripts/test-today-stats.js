const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('📊 Testing Today\'s Dynamic Statistics...\n');

// Read certificate files
const caCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CA_CERT_PATH));
const clientCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CLIENT_CERT_PATH));
const privateKey = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_PRIVATE_KEY_PATH));

const options = {
  clientId: 'mist-charge-today-test',
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
  console.log('✅ Connected to AWS IoT Core for today\'s stats testing');
  
  // Get today's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  console.log(`📅 Today: ${today.toDateString()}`);
  console.log(`📅 Yesterday: ${yesterday.toDateString()}`);
  
  // Test data for today and yesterday
  const testData = [
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 9.5,
        timestamp: today.toISOString(),
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 6.8,
        timestamp: yesterday.toISOString(),
        location: 'storage_tank_1',
        unit: 'liters'
      }
    }
  ];

  console.log('\n📤 Sending water level data for today and yesterday...\n');

  testData.forEach((item, index) => {
    setTimeout(() => {
      const payload = JSON.stringify(item.data);
      const date = new Date(item.data.timestamp).toDateString();
      
      client.publish(item.topic, payload, (err) => {
        if (err) {
          console.error(`❌ Error publishing to ${item.topic}:`, err);
        } else {
          console.log(`✅ Sent water level ${item.data.value}L for ${date}`);
        }
      });
    }, index * 2000); // Send each update 2 seconds apart
  });

  // Check stats after sending data
  setTimeout(() => {
    console.log('\n📊 Checking updated statistics...');
    console.log('🔗 API endpoint: http://localhost:3001/api/stats');
    console.log('📱 Check your frontend to see the new statistics!');
    client.end();
    process.exit(0);
  }, 6000);

});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
}); 