const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage for development
let mockSensorData = {
  temperature: 23.5,
  humidity: 84,
  waterLevel: 2.3,
  batteryLevel: 89,
  waterQuality: 'safe',
  lastUpdated: new Date().toISOString()
};

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
  // Simulate real-time updates
  mockSensorData.temperature = 20 + Math.random() * 10;
  mockSensorData.humidity = 70 + Math.random() * 20;
  mockSensorData.waterLevel = 1.5 + Math.random() * 2;
  mockSensorData.batteryLevel = 80 + Math.random() * 20;
  mockSensorData.lastUpdated = new Date().toISOString();
  
  res.json(mockSensorData);
});

// Get statistics
app.get('/api/stats', (req, res) => {
  res.json(mockStats);
});

// Update endpoint (for manual updates or device communication)
app.post('/api/update', (req, res) => {
  try {
    const { sensorType, value, metadata } = req.body;
    
    if (!sensorType || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update mock data
    if (sensorType === 'temperature') mockSensorData.temperature = value;
    if (sensorType === 'humidity') mockSensorData.humidity = value;
    if (sensorType === 'water_level') mockSensorData.waterLevel = value;
    if (sensorType === 'battery') mockSensorData.batteryLevel = value;
    if (sensorType === 'water_quality') mockSensorData.waterQuality = value;
    
    mockSensorData.lastUpdated = new Date().toISOString();
    
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'development',
    mqtt_connected: false
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mist Charge Development API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Status endpoint: http://localhost:${PORT}/api/status`);
});

module.exports = app; 