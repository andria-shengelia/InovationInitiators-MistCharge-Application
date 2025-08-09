const mqtt = require('mqtt');
require('dotenv').config();

// Connect to MQTT broker
const client = mqtt.connect('mqtt://broker.emqx.io:1883', {
  clientId: `mistcharge-water-test-${Date.now()}`,
  clean: true,
});

let waterLevel = 2.3; // Starting water level
let temperature = 24.5;
let humidity = 78;
let battery = 92;

client.on('connect', () => {
  console.log('🔗 Connected to MQTT broker for water collection test');
  console.log('💧 Simulating water collection over time...');
  console.log('📊 This will automatically update today\'s statistics');
  console.log('');
  
  // Simulate water collection over time
  let timeElapsed = 0;
  const interval = setInterval(() => {
    timeElapsed += 5; // 5 minutes
    
    // Simulate water collection (gradual increase)
    waterLevel += 0.1 + (Math.random() * 0.2);
    
    // Simulate temperature and humidity changes
    temperature += (Math.random() - 0.5) * 2;
    humidity += (Math.random() - 0.5) * 5;
    battery -= 0.1; // Gradual battery drain
    
    // Keep values in reasonable ranges
    waterLevel = Math.min(10, Math.max(0, waterLevel));
    temperature = Math.min(35, Math.max(15, temperature));
    humidity = Math.min(95, Math.max(30, humidity));
    battery = Math.min(100, Math.max(0, battery));
    
    // Publish updated sensor data
    const sensors = [
      { topic: 'mistcharge/sensors/water_level', value: waterLevel },
      { topic: 'mistcharge/sensors/temperature', value: temperature },
      { topic: 'mistcharge/sensors/humidity', value: humidity },
      { topic: 'mistcharge/sensors/battery', value: battery }
    ];
    
    sensors.forEach(sensor => {
      const message = JSON.stringify({
        value: sensor.value,
        timestamp: new Date().toISOString(),
        deviceId: 'MistChargeDevice',
        source: 'water-collection-test'
      });
      
      client.publish(sensor.topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to publish to ${sensor.topic}:`, err);
        } else {
          console.log(`✅ ${sensor.topic}: ${sensor.value.toFixed(1)}`);
        }
      });
    });
    
    console.log(`⏰ ${timeElapsed} minutes elapsed - Water Level: ${waterLevel.toFixed(1)}L`);
    
    // Stop after 30 minutes
    if (timeElapsed >= 30) {
      clearInterval(interval);
      console.log('');
      console.log('🎉 Water collection test completed!');
      console.log('📊 Check the statistics to see today\'s collected data');
      console.log('💡 You can also check: curl http://localhost:3001/api/stats/today');
      
      client.end();
      process.exit(0);
    }
  }, 5000); // Update every 5 seconds
});

client.on('error', (error) => {
  console.error('❌ MQTT test error:', error);
});

console.log('🚀 Starting water collection simulation...');
console.log('💡 Make sure your server-dev.js is running to receive the data');
console.log('⏳ Updates every 5 seconds for 30 minutes...\n'); 