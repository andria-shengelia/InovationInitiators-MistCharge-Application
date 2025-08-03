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

const initializeDatabase = async () => {
  try {
    console.log('Initializing Mist Charge database...');

    // Create sensor_readings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id SERIAL PRIMARY KEY,
        sensor_type VARCHAR(50) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_timestamp 
      ON sensor_readings (sensor_type, timestamp DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp 
      ON sensor_readings (timestamp DESC)
    `);

    // Create users table for authentication (optional)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create device_config table for device settings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_config (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(100) UNIQUE NOT NULL,
        config_key VARCHAR(100) NOT NULL,
        config_value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(device_id, config_key)
      )
    `);

    // Insert sample data for testing
    const sampleData = [
      ['temperature', 23.5],
      ['humidity', 84],
      ['water_level', 2.3],
      ['battery', 89],
      ['water_quality', 1], // 1 = safe, 0 = unsafe
    ];

    for (const [type, value] of sampleData) {
      await pool.query(`
        INSERT INTO sensor_readings (sensor_type, value, timestamp)
        VALUES ($1, $2, NOW() - INTERVAL '1 minute')
        ON CONFLICT DO NOTHING
      `, [type, value]);
    }

    console.log('Database initialization completed successfully!');
    console.log('Tables created:');
    console.log('- sensor_readings: Stores all IoT sensor data');
    console.log('- users: User authentication (optional)');
    console.log('- device_config: Device configuration settings');

  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await pool.end();
  }
};

initializeDatabase();