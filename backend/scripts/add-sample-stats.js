const { Pool } = require('pg');
require('dotenv').config();

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

const addSampleStats = async () => {
  try {
    console.log('Adding 7 days of sample water production data...');

    // Sample data for the last 7 days with realistic water production values
    const sampleData = [
      { day: 7, amount: 1.8, max: 2.1, min: 1.5 }, // 7 days ago
      { day: 6, amount: 2.1, max: 2.3, min: 1.9 }, // 6 days ago
      { day: 5, amount: 1.9, max: 2.0, min: 1.7 }, // 5 days ago
      { day: 4, amount: 2.2, max: 2.4, min: 2.0 }, // 4 days ago
      { day: 3, amount: 1.7, max: 1.9, min: 1.5 }, // 3 days ago
      { day: 2, amount: 2.0, max: 2.2, min: 1.8 }, // 2 days ago
      { day: 1, amount: 1.6, max: 1.8, min: 1.4 }, // 1 day ago
    ];

    for (const data of sampleData) {
      // Calculate timestamp for each day (going backwards from today)
      const date = new Date();
      date.setDate(date.getDate() - data.day);
      date.setHours(12, 0, 0, 0); // Set to noon for consistency

      // Add multiple readings per day to simulate real data
      const readingsPerDay = 24; // One reading per hour
      
      for (let hour = 0; hour < readingsPerDay; hour++) {
        const timestamp = new Date(date);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Add some variation to make it realistic
        const variation = (Math.random() - 0.5) * 0.4; // ±0.2 variation
        const waterLevel = Math.max(0, data.amount + variation);
        
        await pool.query(`
          INSERT INTO sensor_readings (sensor_type, value, timestamp, metadata)
          VALUES ($1, $2, $3, $4)
        `, ['water_level', waterLevel, timestamp, JSON.stringify({
          day: data.day,
          max: data.max,
          min: data.min,
          source: 'sample_data'
        })]);
      }
    }

    console.log('Sample statistics data added successfully!');
    console.log('Added 7 days of water level data with hourly readings.');
    
    // Show summary
    const result = await pool.query(`
      SELECT 
        DATE(timestamp) as day,
        COUNT(*) as readings,
        AVG(value) as avg_water_level,
        MAX(value) as max_water_level,
        MIN(value) as min_water_level
      FROM sensor_readings 
      WHERE sensor_type = 'water_level'
      AND timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY day DESC
    `);
    
    console.log('\nSummary of added data:');
    result.rows.forEach(row => {
      console.log(`${row.day}: ${row.readings} readings, avg: ${parseFloat(row.avg_water_level).toFixed(2)}L`);
    });

  } catch (error) {
    console.error('Error adding sample stats:', error);
  } finally {
    await pool.end();
  }
};

addSampleStats(); 