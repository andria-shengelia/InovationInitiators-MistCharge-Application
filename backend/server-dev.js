const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MQTT Client for development
let mqttClient = null;
let mqttConnected = false;

// Initialize MQTT connection
function initMQTT() {
  try {
    // Check for AWS IoT Core certificates
    const fs = require('fs');
    const path = require('path');

    const forcePublic = process.env.USE_PUBLIC_MQTT === '1';

    const CERT_DIR = path.join(__dirname, 'certs');
    const CA_CERT_PATH = path.join(CERT_DIR, 'AmazonRootCA1.pem');
    const CLIENT_CERT_PATH = path.join(CERT_DIR, 'certificate.pem.crt');
    const PRIVATE_KEY_PATH = path.join(CERT_DIR, 'private.pem.key');

    const hasAWSCerts = fs.existsSync(CA_CERT_PATH) &&
                       fs.existsSync(CLIENT_CERT_PATH) &&
                       fs.existsSync(PRIVATE_KEY_PATH);

    if (hasAWSCerts && !forcePublic) {
      // AWS IoT Core configuration
      const AWS_IOT_ENDPOINT = process.env.AWS_IOT_ENDPOINT || 'your-aws-iot-endpoint.amazonaws.com';
      const AWS_IOT_CLIENT_ID = process.env.AWS_IOT_CLIENT_ID || 'mist-charge-backend';

      console.log('🔐 Connecting to AWS IoT Core...');
      console.log(`📍 Endpoint: ${AWS_IOT_ENDPOINT}`);
      console.log(`🆔 Client ID: ${AWS_IOT_CLIENT_ID}`);

      mqttClient = mqtt.connect(`mqtts://${AWS_IOT_ENDPOINT}:8883`, {
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
      // Fallback to public MQTT broker for development
      if (forcePublic) {
        console.log('🚧 USE_PUBLIC_MQTT=1 set - using public broker for testing');
      } else {
        console.log('⚠️  AWS IoT Core certificates not found');
      }
      console.log('📡 Using public MQTT broker for development');
      console.log('💡 To use AWS IoT Core, run: node scripts/setup-aws-iot.js');

      mqttClient = mqtt.connect('mqtt://broker.emqx.io:1883', {
        clientId: `mistcharge-dev-${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });
    }

    mqttClient.on('connect', () => {
      console.log('🔗 Connected to MQTT broker');
      mqttConnected = true;

      // Subscribe to sensor topics
      const topics = [
        'mistcharge/sensors/temperature',
        'mistcharge/sensors/humidity',
        'mistcharge/sensors/water_level',
        'mistcharge/sensors/battery',
        'mistcharge/sensors/water_quality',
        'mistcharge/status/power'
      ];

      topics.forEach(topic => {
        mqttClient.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err);
          } else {
            console.log(`✅ Subscribed to ${topic}`);
          }
        });
      });
    });

    mqttClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`📡 Received MQTT data from ${topic}:`, data);

        // Update mock data based on MQTT message
        updateDataFromMQTT(topic, data);
      } catch (error) {
        console.error('❌ Error parsing MQTT message:', error);
      }
    });

    mqttClient.on('error', (error) => {
      console.error('❌ MQTT error:', error);
      mqttConnected = false;
    });

    mqttClient.on('close', () => {
      console.log('🔌 MQTT connection closed');
      mqttConnected = false;
    });

  } catch (error) {
    console.error('❌ Failed to initialize MQTT:', error);
  }
}

// Update mock data from MQTT messages
function updateDataFromMQTT(topic, data) {
  const timestamp = new Date().toISOString();

  switch (topic) {
    case 'mistcharge/sensors/temperature':
      mockSensorData.temperature = Math.round(data.value * 10) / 10;
      break;
    case 'mistcharge/sensors/humidity':
      mockSensorData.humidity = Math.round(data.value);
      break;
    case 'mistcharge/sensors/water_level':
      mockSensorData.waterLevel = Math.round(data.value * 10) / 10;
      break;
    case 'mistcharge/sensors/battery':
      mockSensorData.batteryLevel = Math.round(data.value);
      break;
    case 'mistcharge/sensors/water_quality':
      mockSensorData.waterQuality = data.value;
      break;
    case 'mistcharge/status/power':
      mockSensorData.isPoweredOn = Boolean(data.value);
      break;
  }

  mockSensorData.lastUpdated = timestamp;
  console.log(`📊 Updated ${topic}: ${JSON.stringify(data)}`);

  // Automatically update today's statistics when sensor data changes
  updateTodayStats();
}

// Mock data storage for development
let mockSensorData = {
  temperature: 23.5,
  humidity: 84,
  waterLevel: 2.3,
  batteryLevel: 89,
  waterQuality: 'safe',
  lastUpdated: new Date().toISOString(),
  isPoweredOn: true
};

// Daily statistics storage (simulates database)
let dailyStats = [];
let todayStats = {
  date: new Date().toISOString().split('T')[0],
  waterCollected: 0, // Sum of positive deltas
  maxWaterLevel: 0,
  minWaterLevel: 10,
  lastWaterLevel: null, // Track last seen water level to compute deltas
  avgTemperature: 0,
  avgHumidity: 0,
  avgBattery: 0,
  temperatureReadings: [],
  humidityReadings: [],
  batteryReadings: [],
  waterLevelReadings: [],
  lastUpdated: new Date().toISOString()
};

// Initialize with some historical data
function initializeHistoricalData() {
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic historical data
    const baseAmount = 2.5;
    const seasonalVariation = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.5;
    const weekendBonus = (date.getDay() === 0 || date.getDay() === 6) ? 0.3 : 0;
    const randomVariation = (Math.random() - 0.5) * 1.0;

    const waterCollected = Math.max(0.1, baseAmount + seasonalVariation + weekendBonus + randomVariation);
    const avgTemperature = 20 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 8 + (Math.random() - 0.5) * 4;
    const avgHumidity = 70 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 15 + (Math.random() - 0.5) * 10;
    const avgBattery = 85 + (Math.random() - 0.5) * 10;

    dailyStats.push({
      date: dateStr,
      waterCollected: Math.round(waterCollected * 10) / 10,
      maxWaterLevel: Math.round((waterCollected + 0.5) * 10) / 10,
      minWaterLevel: Math.round((waterCollected - 0.3) * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgHumidity: Math.round(avgHumidity),
      avgBattery: Math.round(avgBattery),
      lastUpdated: date.toISOString()
    });
  }

  console.log('📊 Initialized historical data with', dailyStats.length, 'days');
}

// Update today's statistics when sensor data changes
function updateTodayStats() {
  // Add current readings to today's stats
  todayStats.temperatureReadings.push(mockSensorData.temperature);
  todayStats.humidityReadings.push(mockSensorData.humidity);
  todayStats.batteryReadings.push(mockSensorData.batteryLevel);
  todayStats.waterLevelReadings.push(mockSensorData.waterLevel);

  // Keep only last 100 readings to prevent memory issues
  if (todayStats.temperatureReadings.length > 100) {
    todayStats.temperatureReadings = todayStats.temperatureReadings.slice(-100);
    todayStats.humidityReadings = todayStats.humidityReadings.slice(-100);
    todayStats.batteryReadings = todayStats.batteryReadings.slice(-100);
    todayStats.waterLevelReadings = todayStats.waterLevelReadings.slice(-100);
  }

  // Calculate averages
  todayStats.avgTemperature = Math.round(
    (todayStats.temperatureReadings.reduce((sum, val) => sum + val, 0) /
      todayStats.temperatureReadings.length) * 10
  ) / 10;

  todayStats.avgHumidity = Math.round(
    todayStats.humidityReadings.reduce((sum, val) => sum + val, 0) /
      todayStats.humidityReadings.length
  );

  todayStats.avgBattery = Math.round(
    todayStats.batteryReadings.reduce((sum, val) => sum + val, 0) /
      todayStats.batteryReadings.length
  );

  // Update min/max for reference
  const currentWaterLevel = mockSensorData.waterLevel;
  todayStats.maxWaterLevel = Math.max(todayStats.maxWaterLevel, currentWaterLevel);
  todayStats.minWaterLevel = Math.min(todayStats.minWaterLevel, currentWaterLevel);

  // Sum only positive deltas for collected water
  const prev = todayStats.lastWaterLevel;
  if (prev === null || typeof prev !== 'number') {
    todayStats.lastWaterLevel = currentWaterLevel;
  } else {
    const delta = currentWaterLevel - prev;
    if (delta > 0) {
      todayStats.waterCollected = Math.round((todayStats.waterCollected + delta) * 10) / 10;
    }
    todayStats.lastWaterLevel = currentWaterLevel;
  }

  todayStats.lastUpdated = new Date().toISOString();
  console.log(`📊 Today so far: ${todayStats.waterCollected}L collected (current level ${currentWaterLevel}L)`);
}

// Save today's data to daily stats at midnight
function saveTodayToHistory() {
  const today = new Date().toISOString().split('T')[0];

  // Check if we already have today's data
  const existingIndex = dailyStats.findIndex(stat => stat.date === today);

  const entry = {
    date: today,
    waterCollected: todayStats.waterCollected,
    maxWaterLevel: todayStats.maxWaterLevel,
    minWaterLevel: todayStats.minWaterLevel,
    avgTemperature: todayStats.avgTemperature,
    avgHumidity: todayStats.avgHumidity,
    avgBattery: todayStats.avgBattery,
    lastUpdated: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    dailyStats[existingIndex] = entry;
  } else {
    dailyStats.push(entry);
  }

  // Keep only last 365 days
  if (dailyStats.length > 365) {
    dailyStats = dailyStats.slice(-365);
  }

  console.log(`💾 Saved today's data: ${todayStats.waterCollected}L collected`);

  // Reset today's stats for next day
  todayStats = {
    date: new Date().toISOString().split('T')[0],
    waterCollected: 0,
    maxWaterLevel: 0,
    minWaterLevel: 10,
    lastWaterLevel: null,
    avgTemperature: 0,
    avgHumidity: 0,
    avgBattery: 0,
    temperatureReadings: [],
    humidityReadings: [],
    batteryReadings: [],
    waterLevelReadings: [],
    lastUpdated: new Date().toISOString()
  };
}

// Schedule daily save at midnight
function scheduleDailySave() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    saveTodayToHistory();
    // Schedule next save (every 24 hours)
    setInterval(saveTodayToHistory, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);

  console.log(`⏰ Scheduled daily save at midnight (in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes)`);
}

let mockStats = [
  { day: 'Mon', amount: 1.8, max: 2.1, min: 1.5 },
  { day: 'Tue', amount: 2.1, max: 2.3, min: 1.9 },
  { day: 'Wed', amount: 1.9, max: 2.0, min: 1.7 },
  { day: 'Thu', amount: 2.2, max: 2.4, min: 2.0 },
  { day: 'Fri', amount: 1.7, max: 1.9, min: 1.5 },
  { day: 'Sat', amount: 2.0, max: 2.2, min: 1.8 },
  { day: 'Sun', amount: 1.6, max: 1.8, min: 1.4 }
];

// API Routes

// Get current status
app.get('/api/status', (req, res) => {
  // Return static data - no random generation
  // Data only changes when explicitly updated via /api/update or MQTT
  res.json(mockSensorData);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const { days = 7 } = req.query;
  const requestedDays = Math.max(1, parseInt(days));

  const todayStr = new Date().toISOString().split('T')[0];

  // Build a list excluding today's saved entry (we will always append live todayStats at the end)
  const withoutToday = dailyStats
    .filter(stat => stat.date !== todayStr)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Take past (requestedDays - 1) days
  const pastDays = withoutToday.slice(0, Math.max(0, requestedDays - 1)).reverse();

  // Build today's entry from live todayStats
  const liveToday = {
    date: todayStr,
    waterCollected: todayStats.waterCollected,
    maxWaterLevel: todayStats.maxWaterLevel,
    minWaterLevel: todayStats.minWaterLevel,
    avgTemperature: todayStats.avgTemperature,
    avgHumidity: todayStats.avgHumidity,
    avgBattery: todayStats.avgBattery,
    lastUpdated: new Date().toISOString(),
  };

  const combined = [...pastDays, liveToday];

  // Format data for the frontend
  const formattedStats = combined.map(stat => ({
    day: new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' }),
    amount: stat.waterCollected,
    max: stat.maxWaterLevel,
    min: stat.minWaterLevel,
    temperature: stat.avgTemperature,
    humidity: stat.avgHumidity,
    battery: stat.avgBattery,
    date: stat.date,
  }));

  console.log(`📊 Returning ${formattedStats.length} days of statistics (ending with today)`);
  res.json(formattedStats);
});

// Get today's current statistics
app.get('/api/stats/today', (req, res) => {
  res.json({
    ...todayStats,
    currentWaterLevel: mockSensorData.waterLevel,
    isPoweredOn: mockSensorData.isPoweredOn
  });
});

// Manual save today's data (for testing)
app.post('/api/stats/save-today', (req, res) => {
  saveTodayToHistory();
  res.json({ success: true, message: 'Today\'s data saved to history' });
});

// Update endpoint (for manual updates or device communication)
app.post('/api/update', (req, res) => {
  try {
    const { sensorType, value, metadata } = req.body;

    if (!sensorType || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update mock data with proper rounding
    if (sensorType === 'temperature') mockSensorData.temperature = Math.round(value * 10) / 10;
    if (sensorType === 'humidity') mockSensorData.humidity = Math.round(value);
    if (sensorType === 'water_level') mockSensorData.waterLevel = Math.round(value * 10) / 10;
    if (sensorType === 'battery') mockSensorData.batteryLevel = Math.round(value);
    if (sensorType === 'water_quality') mockSensorData.waterQuality = value;
    if (sensorType === 'power') mockSensorData.isPoweredOn = Boolean(value);

    mockSensorData.lastUpdated = new Date().toISOString();

    console.log(`Updated ${sensorType}: ${value}`);
    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Command endpoint (simulated)
app.post('/api/command', (req, res) => {
  try {
    const { command, parameters } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    console.log(`Received command: ${command}`, parameters);

    // Simulate command processing
    setTimeout(() => {
      console.log(`Command ${command} processed successfully`);
    }, 1000);

    res.json({ success: true, message: 'Command sent successfully' });
  } catch (error) {
    console.error('Error sending command:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper to publish MQTT messages safely
function publishMQTT(topic, payload) {
  if (!mqttClient || !mqttClient.connected) {
    console.log(`🛑 MQTT not connected. Skipping publish to ${topic}`);
    return;
  }
  const message = JSON.stringify(payload);
  mqttClient.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.error(`❌ Failed to publish to ${topic}:`, err);
    } else {
      console.log(`📤 Published to ${topic}: ${message}`);
    }
  });
}

// Power control endpoint
app.post('/api/power', (req, res) => {
  try {
    const { isOn } = req.body;
    
    if (typeof isOn !== 'boolean') {
      return res.status(400).json({ error: 'isOn must be a boolean' });
    }

    mockSensorData.isPoweredOn = isOn;
    mockSensorData.lastUpdated = new Date().toISOString();

    // Broadcast status over MQTT so it is visible in AWS IoT Test Client
    publishMQTT('mistcharge/status/power', {
      value: isOn,
      source: 'mobile_app',
      timestamp: new Date().toISOString(),
      deviceId: process.env.AWS_IOT_THING_NAME || 'MistChargeDevice',
    });

    // Optionally publish a command topic too for auditing
    publishMQTT(`mistcharge/commands/${isOn ? 'power_on' : 'power_off'}`, {
      command: isOn ? 'power_on' : 'power_off',
      timestamp: new Date().toISOString(),
      source: 'mobile_app',
    });
    
    console.log(`Power ${isOn ? 'ON' : 'OFF'}`);
    res.json({ success: true, message: `Device powered ${isOn ? 'on' : 'off'}` });
  } catch (error) {
    console.error('Error controlling power:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'development',
    mqtt_connected: mqttConnected
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mist Charge Development API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Status endpoint: http://localhost:${PORT}/api/status`);
  initMQTT(); // Initialize MQTT on server start
  initializeHistoricalData(); // Initialize historical data
  scheduleDailySave(); // Schedule daily save
});

module.exports = app; 