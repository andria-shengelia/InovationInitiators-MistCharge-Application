const mqtt = require('mqtt');
require('dotenv').config();

console.log('🚀 Testing Automatic Data Logging Feature');
console.log('==========================================');
console.log('');

// Connect to MQTT broker
const client = mqtt.connect('mqtt://broker.emqx.io:1883', {
  clientId: `mistcharge-auto-test-${Date.now()}`,
  clean: true,
});

client.on('connect', () => {
  console.log('🔗 Connected to MQTT broker');
  console.log('📡 Sending test sensor data...');
  console.log('');
  
  // Test data sequence
  const testSequence = [
    { waterLevel: 2.5, temperature: 25.0, humidity: 80, battery: 90 },
    { waterLevel: 2.8, temperature: 25.5, humidity: 82, battery: 89 },
    { waterLevel: 3.2, temperature: 26.0, humidity: 85, battery: 88 },
    { waterLevel: 3.8, temperature: 26.5, humidity: 87, battery: 87 },
    { waterLevel: 4.5, temperature: 27.0, humidity: 88, battery: 86 }
  ];
  
  let step = 0;
  
  const sendNextData = () => {
    if (step >= testSequence.length) {
      console.log('');
      console.log('✅ Test sequence completed!');
      console.log('📊 Check the results:');
      console.log('   • Today\'s stats: curl http://localhost:3001/api/stats/today');
      console.log('   • Weekly stats: curl http://localhost:3001/api/stats');
      console.log('   • Manual save: curl -X POST http://localhost:3001/api/stats/save-today');
      console.log('');
      console.log('💡 The system automatically logs data when sensor values change!');
      
      client.end();
      process.exit(0);
    }
    
    const data = testSequence[step];
    console.log(`📊 Step ${step + 1}: Water Level ${data.waterLevel}L, Temp ${data.temperature}°C`);
    
    // Send sensor data
    const sensors = [
      { topic: 'mistcharge/sensors/water_level', value: data.waterLevel },
      { topic: 'mistcharge/sensors/temperature', value: data.temperature },
      { topic: 'mistcharge/sensors/humidity', value: data.humidity },
      { topic: 'mistcharge/sensors/battery', value: data.battery }
    ];
    
    sensors.forEach(sensor => {
      const message = JSON.stringify({
        value: sensor.value,
        timestamp: new Date().toISOString(),
        deviceId: 'MistChargeDevice',
        source: 'auto-logging-test'
      });
      
      client.publish(sensor.topic, message, { qos: 1 });
    });
    
    step++;
    
    // Send next data after 3 seconds
    setTimeout(sendNextData, 3000);
  };
  
  // Start the sequence
  sendNextData();
});

client.on('error', (error) => {
  console.error('❌ MQTT test error:', error);
});

console.log('💡 Make sure your server-dev.js is running to receive the data');
console.log('⏳ Starting in 3 seconds...\n'); 