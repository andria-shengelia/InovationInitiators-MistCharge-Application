const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3001;

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, COUNT(*) as count FROM sensor_readings');
    res.json({
      message: 'Database connection successful!',
      time: result.rows[0].time,
      sensorCount: result.rows[0].count
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
}); 