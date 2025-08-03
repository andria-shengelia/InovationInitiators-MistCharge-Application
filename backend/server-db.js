const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
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
      lastUpdated: new Date().toISOString()
    };
    
    // Update with actual database values
    result.rows.forEach(row => {
      if (row.sensor_type === 'temperature') status.temperature = parseFloat(row.value);
      if (row.sensor_type === 'humidity') status.humidity = parseFloat(row.value);
      if (row.sensor_type === 'water_level') status.waterLevel = parseFloat(row.value);
      if (row.sensor_type === 'battery') status.batteryLevel = parseFloat(row.value);
      if (row.sensor_type === 'water_quality') status.waterQuality = row.value > 0 ? 'safe' : 'unsafe';
      status.lastUpdated = row.timestamp;
    });
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(timestamp) as day,
        AVG(value) as amount,
        MAX(value) as max,
        MIN(value) as min
      FROM sensor_readings 
      WHERE sensor_type = 'water_level'
      AND timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY day
    `;
    
    const result = await pool.query(query);
    
    const stats = result.rows.map(row => ({
      day: new Date(row.day).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: parseFloat(row.amount) || 0,
      max: parseFloat(row.max) || 0,
      min: parseFloat(row.min) || 0,
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

// Command endpoint (simulated)
app.post('/api/command', async (req, res) => {
  try {
    const { command, parameters } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    console.log(`Received command: ${command}`, parameters);
    
    // Store command in database (optional)
    const query = `
      INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
      VALUES ($1, $2, NOW(), $3)
    `;
    
    await pool.query(query, ['command', 1, JSON.stringify({ command, parameters })]);
    
    res.json({ success: true, message: 'Command sent successfully' });
  } catch (error) {
    console.error('Error sending command:', error);
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
      mqtt_connected: false
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

// Start server
const initializeApp = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');

    // Start server
    app.listen(PORT, () => {
      console.log(`Mist Charge API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Status endpoint: http://localhost:${PORT}/api/status`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

initializeApp();

module.exports = app; 