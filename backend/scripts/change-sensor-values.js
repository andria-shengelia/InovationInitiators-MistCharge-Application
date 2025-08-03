const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🌡️ Changing Sensor Values via MQTT...\n');

// Read certificate files
const caCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CA_CERT_PATH));
const clientCert = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_CLIENT_CERT_PATH));
const privateKey = fs.readFileSync(path.join(__dirname, '..', process.env.AWS_IOT_PRIVATE_KEY_PATH));

const options = {
  clientId: 'mist-charge-sensor-update',
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
  console.log('✅ Connected to AWS IoT Core for sensor updates');
  
  // New sensor values to send
  const sensorUpdates = [
    {
      topic: 'mistcharge/sensors/temperature',
      data: {
        value: 26.8,
        timestamp: new Date().toISOString(),
        location: 'outdoor_unit_1',
        accuracy: 0.1
      }
    },
    {
      topic: 'mistcharge/sensors/humidity',
      data: {
        value: 79.5,
        timestamp: new Date().toISOString(),
        location: 'outdoor_unit_1',
        accuracy: 0.5
      }
    },
    {
      topic: 'mistcharge/sensors/water_level',
      data: {
        value: 2.7,
        timestamp: new Date().toISOString(),
        location: 'storage_tank_1',
        unit: 'liters'
      }
    },
    {
      topic: 'mistcharge/sensors/battery',
      data: {
        value: 88.3,
        timestamp: new Date().toISOString(),
        location: 'main_unit',
        unit: 'percentage'
      }
    },
    {
      topic: 'mistcharge/sensors/water_quality',
      data: {
        value: 1,
        timestamp: new Date().toISOString(),
        location: 'water_tank',
        status: 'safe'
      }
    }
  ];

  console.log('📤 Sending updated sensor values...\n');

  sensorUpdates.forEach((item, index) => {
    setTimeout(() => {
      const payload = JSON.stringify(item.data);
      client.publish(item.topic, payload, (err) => {
        if (err) {
          console.error(`❌ Error publishing to ${item.topic}:`, err);
        } else {
          console.log(`✅ Updated ${item.topic.split('/').pop()}: ${item.data.value}`);
        }
      });
    }, index * 1000); // Send each update 1 second apart
  });

  // Disconnect after sending all updates
  setTimeout(() => {
    console.log('\n✅ Sensor updates completed! Disconnecting...');
    console.log('📱 Check your frontend to see the new values!');
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