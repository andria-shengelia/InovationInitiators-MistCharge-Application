const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const mqtt = require('mqtt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // For AWS RDS
  }
});

// MQTT Client for AWS IoT Core
let mqttClient;

const connectToAWSIoT = () => {
  const options = {
    clientId: process.env.AWS_IOT_CLIENT_ID || 'mist-charge-backend',
    username: process.env.AWS_IOT_USERNAME,
    password: process.env.AWS_IOT_PASSWORD,
    protocol: 'mqtts',
    port: 8883,
    ca: process.env.AWS_IOT_CA_CERT,
    cert: process.env.AWS_IOT_CLIENT_CERT,
    key: process.env.AWS_IOT_PRIVATE_KEY,
  };

  mqttClient = mqtt.connect(process.env.AWS_IOT_ENDPOINT, options);

  mqttClient.on('connect', () => {
    console.log('Connected to AWS IoT Core');
    
    // Subscribe to device topics
    const topics = [
      'mistcharge/sensors/temperature',
      'mistcharge/sensors/humidity',
      'mistcharge/sensors/water_level',
      'mistcharge/sensors/battery',
      'mistcharge/sensors/water_quality'
    ];

    topics.forEach(topic => {
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      await storeSensorData(topic, data);
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });

  mqttClient.on('error', (error) => {
    console.error('MQTT connection error:', error);
  });
};

// Store sensor data in PostgreSQL
const storeSensorData = async (topic, data) => {
  try {
    const sensorType = topic.split('/').pop();
    const query = `
      INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
      VALUES ($1, $2, NOW(), $3)
    `;
    
    await pool.query(query, [sensorType, data.value, JSON.stringify(data)]);
    console.log(`Stored ${sensorType} reading: ${data.value}`);
  } catch (error) {
    console.error('Error storing sensor data:', error);
  }
};

// API Routes

// Get current status
app.get('/api/status', async (req, res) => {
  try {
    const query = `
      SELECT 
        sensor_type,
        value,
        timestamp,
        ROW_NUMBER() OVER (PARTITION BY sensor_type ORDER BY timestamp DESC) as rn
      FROM sensor_readings
      WHERE timestamp > NOW() - INTERVAL '1 hour'
    `;
    
    const result = await pool.query(query);
    const latestReadings = result.rows.filter(row => row.rn === 1);
    
    const status = {
      temperature: latestReadings.find(r => r.sensor_type === 'temperature')?.value || 23,
      humidity: latestReadings.find(r => r.sensor_type === 'humidity')?.value || 84,
      waterLevel: latestReadings.find(r => r.sensor_type === 'water_level')?.value || 2.3,
      batteryLevel: latestReadings.find(r => r.sensor_type === 'battery')?.value || 89,
      waterQuality: latestReadings.find(r => r.sensor_type === 'water_quality')?.value || 'safe',
      lastUpdated: new Date().toISOString(),
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics for charts
app.get('/api/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('day', timestamp) as day,
        AVG(CASE WHEN sensor_type = 'temperature' THEN value END) as avg_temperature,
        AVG(CASE WHEN sensor_type = 'humidity' THEN value END) as avg_humidity,
        AVG(CASE WHEN sensor_type = 'water_level' THEN value END) as avg_water_level,
        MAX(CASE WHEN sensor_type = 'water_level' THEN value END) as max_water_level,
        MIN(CASE WHEN sensor_type = 'water_level' THEN value END) as min_water_level,
        AVG(CASE WHEN sensor_type = 'battery' THEN value END) as avg_battery
      FROM sensor_readings
      WHERE timestamp > NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', timestamp)
      ORDER BY day DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [days]);
    
    const stats = result.rows.map(row => ({
      date: row.day.toISOString().split('T')[0],
      amount: parseFloat(row.avg_water_level) || 0,
      temperature: parseFloat(row.avg_temperature) || 23,
      humidity: parseFloat(row.avg_humidity) || 75,
      battery: parseFloat(row.avg_battery) || 85,
      max: parseFloat(row.max_water_level) || 0,
      min: parseFloat(row.min_water_level) || 0,
    }));

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update endpoint (for manual updates or device communication)
app.post('/api/update', async (req, res) => {
  try {
    const { sensorType, value, metadata } = req.body;
    
    if (!sensorType || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
      VALUES ($1, $2, NOW(), $3)
    `;
    
    await pool.query(query, [sensorType, value, JSON.stringify(metadata || {})]);
    
    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish command to device via MQTT
app.post('/api/command', async (req, res) => {
  try {
    const { command, parameters } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const topic = `mistcharge/commands/${command}`;
    const payload = JSON.stringify({
      command,
      parameters: parameters || {},
      timestamp: new Date().toISOString(),
    });

    if (mqttClient && mqttClient.connected) {
      mqttClient.publish(topic, payload, (err) => {
        if (err) {
          console.error('Error publishing command:', err);
          res.status(500).json({ error: 'Failed to send command' });
        } else {
          console.log(`Published command ${command} to ${topic}`);
          res.json({ success: true, message: 'Command sent successfully' });
        }
      });
    } else {
      res.status(503).json({ error: 'MQTT client not connected' });
    }
  } catch (error) {
    console.error('Error sending command:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mqtt_connected: mqttClient?.connected || false,
  });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');

    // Connect to AWS IoT Core
    connectToAWSIoT();

    // Start server
    app.listen(PORT, () => {
      console.log(`Mist Charge API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();

module.exports = app;