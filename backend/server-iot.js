const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
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
    rejectUnauthorized: false
  }
});

// MQTT Client for AWS IoT Core
let mqttClient;

const connectToAWSIoT = () => {
  try {
    // Read certificate files
    const caCert = fs.readFileSync(path.join(__dirname, process.env.AWS_IOT_CA_CERT_PATH));
    const clientCert = fs.readFileSync(path.join(__dirname, process.env.AWS_IOT_CLIENT_CERT_PATH));
    const privateKey = fs.readFileSync(path.join(__dirname, process.env.AWS_IOT_PRIVATE_KEY_PATH));

    const options = {
      clientId: process.env.AWS_IOT_CLIENT_ID,
      protocol: 'mqtts',
      port: 8883,
      ca: caCert,
      cert: clientCert,
      key: privateKey,
      reconnectPeriod: 10000,
      connectTimeout: 60000,
      keepalive: 60,
      clean: true,
      rejectUnauthorized: false
    };

    mqttClient = mqtt.connect(`mqtts://${process.env.AWS_IOT_ENDPOINT}`, options);

    mqttClient.on('connect', () => {
      console.log('✅ Connected to AWS IoT Core');
      
      // Subscribe to device topics
      const topics = [
        'mistcharge/sensors/temperature',
        'mistcharge/sensors/humidity',
        'mistcharge/sensors/water_level',
        'mistcharge/sensors/battery',
        'mistcharge/sensors/water_quality',
        'mistcharge/sensors/water_produced', // New topic for daily water production
        'mistcharge/commands/calibrate',
        'mistcharge/commands/restart',
        'mistcharge/commands/set_mode',
        'mistcharge/commands/emergency_stop',
        'mistcharge/commands/+' // Subscribe to all commands
      ];

      topics.forEach(topic => {
        mqttClient.subscribe(topic, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err);
          } else {
            console.log(`📡 Subscribed to ${topic}`);
          }
        });
      });
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`📨 Received message on ${topic}:`, data);
        
        // Handle different types of messages
        if (topic.startsWith('mistcharge/commands/')) {
          // Handle commands
          await handleCommand(topic, data);
        } else if (topic.startsWith('mistcharge/sensors/')) {
          // Handle sensor data
          await storeSensorData(topic, data);
          
          // Special handling for water_produced data
          if (topic === 'mistcharge/sensors/water_produced') {
            await storeDailyWaterProduction(data);
          }
        } else {
          console.log(`📨 Unknown topic: ${topic}`);
        }
        
      } catch (error) {
        console.error('❌ Error processing MQTT message:', error);
      }
    });

    mqttClient.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
    });

    mqttClient.on('close', () => {
      console.log('🔌 MQTT connection closed');
    });

    mqttClient.on('reconnect', () => {
      console.log('🔄 MQTT reconnecting...');
    });

    mqttClient.on('offline', () => {
      console.log('📴 MQTT client offline');
    });

    mqttClient.on('end', () => {
      console.log('🔚 MQTT client ended');
    });

  } catch (error) {
    console.error('❌ Error setting up MQTT connection:', error);
  }
};

// Store sensor data in PostgreSQL
const storeSensorData = async (topic, data) => {
  try {
    const sensorType = topic.split('/').pop();
    
    // Use provided timestamp or current time
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    
    const query = `
      INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
      VALUES ($1, $2, $3, $4)
    `;
    
    await pool.query(query, [sensorType, data.value, timestamp, JSON.stringify(data)]);
    console.log(`💾 Stored ${sensorType} reading: ${data.value} at ${timestamp.toISOString()}`);
    
    // If this is water level data, log that it will affect statistics
    if (sensorType === 'water_level') {
      console.log(`📊 Water level update will affect daily statistics for ${timestamp.toDateString()}`);
    }
  } catch (error) {
    console.error('❌ Error storing sensor data:', error);
  }
};

// Store daily water production data
const storeDailyWaterProduction = async (data) => {
  try {
    const { daily_production, date, timestamp } = data;
    
    // Store in a special way for daily statistics
    const query = `
      INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
      VALUES ($1, $2, $3, $4)
    `;
    
    const metadata = {
      type: 'daily_production',
      date: date,
      original_timestamp: timestamp,
      ...data
    };
    
    await pool.query(query, ['daily_water_production', daily_production, new Date(timestamp), JSON.stringify(metadata)]);
    console.log(`💧 Stored daily water production: ${daily_production}L for ${date}`);
  } catch (error) {
    console.error('❌ Error storing daily water production:', error);
  }
};

// Handle incoming commands
const handleCommand = async (topic, data) => {
  try {
    const command = topic.split('/').pop();
    console.log(`🎯 Processing command: ${command}`, data);
    
    // Store command in database
    const query = `
      INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
      VALUES ($1, $2, NOW(), $3)
    `;
    
    const metadata = {
      type: 'command',
      command: command,
      parameters: data.parameters || {},
      timestamp: data.timestamp,
      source: 'aws_mqtt_test_client',
      ...data
    };
    
    await pool.query(query, ['command', 1, JSON.stringify(metadata)]);
    console.log(`💾 Stored command: ${command}`);
    
    // Process different command types
    switch (command) {
      case 'power_on':
        console.log(`🔌 Power ON command received:`, data.parameters);
        // Store power status in database
        await pool.query(`
          INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
          VALUES ($1, $2, NOW(), $3)
        `, ['power_status', 1, JSON.stringify(data)]);
        console.log(`✅ Machine powered ON`);
        break;
        
      case 'power_off':
        console.log(`🔌 Power OFF command received:`, data.parameters);
        // Store power status in database
        await pool.query(`
          INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
          VALUES ($1, $2, NOW(), $3)
        `, ['power_status', 0, JSON.stringify(data)]);
        console.log(`✅ Machine powered OFF`);
        break;
        
      case 'calibrate':
        console.log(`🔧 Calibrating sensors:`, data.parameters);
        // Simulate calibration process
        setTimeout(() => {
          console.log(`✅ Calibration completed for sensors:`, data.parameters?.sensors);
        }, 2000);
        break;
        
      case 'restart':
        console.log(`🔄 Restart command received:`, data.parameters);
        // Simulate restart process
        setTimeout(() => {
          console.log(`✅ Device restart initiated`);
        }, 1000);
        break;
        
      case 'set_mode':
        console.log(`⚙️ Setting operating mode:`, data.parameters);
        // Simulate mode change
        setTimeout(() => {
          console.log(`✅ Operating mode changed to:`, data.parameters?.mode);
        }, 1000);
        break;
        
      case 'emergency_stop':
        console.log(`🛑 Emergency stop activated:`, data.parameters);
        // Simulate emergency stop
        setTimeout(() => {
          console.log(`✅ Emergency stop executed`);
        }, 500);
        break;
        
      default:
        console.log(`❓ Unknown command: ${command}`);
    }
    
  } catch (error) {
    console.error('❌ Error handling command:', error);
  }
};

// API Routes

// Get current status
app.get('/api/status', async (req, res) => {
  try {
    // Get the latest readings for each sensor type
    const query = `
      SELECT sensor_type, value, timestamp
      FROM sensor_readings 
      WHERE id IN (
        SELECT MAX(id) 
        FROM sensor_readings 
        WHERE sensor_type IN ('temperature', 'humidity', 'water_level', 'battery', 'water_quality', 'power_status')
        GROUP BY sensor_type
      )
      ORDER BY timestamp DESC
    `;
    
    const result = await pool.query(query);
    
    // Format the response
    const status = {
      temperature: 23.5,
      humidity: 84,
      waterLevel: 2.3,
      batteryLevel: 89,
      waterQuality: 'safe',
      isPoweredOn: false,
      lastUpdated: new Date().toISOString()
    };
    
    // Update with actual database values
    result.rows.forEach(row => {
      if (row.sensor_type === 'temperature') status.temperature = parseFloat(row.value);
      if (row.sensor_type === 'humidity') status.humidity = parseFloat(row.value);
      if (row.sensor_type === 'water_level') status.waterLevel = parseFloat(row.value);
      if (row.sensor_type === 'battery') status.batteryLevel = parseFloat(row.value);
      if (row.sensor_type === 'water_quality') status.waterQuality = row.value > 0 ? 'safe' : 'unsafe';
      if (row.sensor_type === 'power_status') status.isPoweredOn = row.value > 0;
      status.lastUpdated = row.timestamp;
    });
    
    res.json(status);
  } catch (error) {
    console.error('❌ Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics (dynamic calculation from water level readings)
app.get('/api/stats', async (req, res) => {
  try {
    // Calculate daily water production from water level readings for the last 7 days
    const query = `
      SELECT 
        DATE(timestamp) as day,
        AVG(value) as amount,
        MAX(value) as max,
        MIN(value) as min,
        COUNT(*) as readings_count
      FROM sensor_readings 
      WHERE sensor_type = 'water_level'
      AND timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY day DESC
      LIMIT 7
    `;
    
    const result = await pool.query(query);
    
    // Create a map of the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      
      // Find if we have data for this day (handle both UTC and local dates)
      const dayData = result.rows.find(row => {
        const rowDate = new Date(row.day);
        const rowDayKey = rowDate.toISOString().split('T')[0];
        return rowDayKey === dayKey;
      });
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayData ? parseFloat(dayData.amount) : 0,
        max: dayData ? parseFloat(dayData.max) : 0,
        min: dayData ? parseFloat(dayData.min) : 0,
        readings: dayData ? parseInt(dayData.readings_count) : 0
      });
    }
    
    console.log('📊 Database result rows:', result.rows);
    console.log('📊 Generated stats:', last7Days);
    
    console.log('📊 Generated dynamic stats:', last7Days);
    res.json(last7Days);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
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
    console.error('❌ Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Command endpoint (send commands to IoT device)
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
          console.error('❌ Error publishing command:', err);
          res.status(500).json({ error: 'Failed to send command' });
        } else {
          console.log(`📤 Published command ${command} to ${topic}`);
          res.json({ success: true, message: 'Command sent successfully' });
        }
      });
    } else {
      res.status(503).json({ error: 'MQTT client not connected' });
    }
  } catch (error) {
    console.error('❌ Error sending command:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      mqtt_connected: mqttClient?.connected || false,
      iot_endpoint: process.env.AWS_IOT_ENDPOINT
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');

    // Connect to AWS IoT Core
    connectToAWSIoT();

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Mist Charge IoT API server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Network access: http://10.60.210.109:${PORT}/api/health`);
      console.log(`📊 Status endpoint: http://localhost:${PORT}/api/status`);
      console.log(`📈 Stats endpoint: http://localhost:${PORT}/api/stats`);
      console.log(`📡 IoT Endpoint: ${process.env.AWS_IOT_ENDPOINT}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();

module.exports = app; 