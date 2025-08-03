const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('📊 Testing Dynamic Statistics with Different Dates...\n');

// Read certificate files
const caCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CA_CERT_PATH));
const clientCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CLIENT_CERT_PATH));
const privateKey = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_PRIVATE_KEY_PATH));

const options = {
  clientId: 'mist-charge-stats-test',
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
  console.log('✅ Connected to AWS IoT Core for stats testing');
  
  // Test data with different dates (using recent dates)
  const testData = [
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 5.2,
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 4.8,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 6.1,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 3.9,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 7.2,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 4.5,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 8.0,
        timestamp: new Date().toISOString(), // Today
        location: 'storage_tank_1',
        unit: 'liters'
      }
    }
  ];

  console.log('📤 Sending water level data for different dates...\n');

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

  // Check stats after sending all data
  setTimeout(() => {
    console.log('\n📊 Checking updated statistics...');
    console.log('🔗 API endpoint: http://localhost:3001/api/stats');
    console.log('📱 Check your frontend to see the new statistics!');
    client.end();
    process.exit(0);
  }, 15000);

});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
}); 