const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fuel_pos'
};

async function setupTankReadings() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tank_readings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tank_id INT NOT NULL,
                volume DECIMAL(10, 2) NOT NULL,
                reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_tank_time (tank_id, reading_time),
                FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE CASCADE
            )
        `);
        console.log('Table tank_readings created or already exists.');

        // 2. Get Tanks
        const [tanks] = await connection.query('SELECT id, capacity FROM tanks');
        if (tanks.length === 0) {
            console.log('No tanks found. Skipping seed.');
            return;
        }

        // 3. Seed Data (Delete old data first to avoid duplicates if run multiple times)
        await connection.query('TRUNCATE TABLE tank_readings');
        console.log('Cleared old tank readings.');

        const readings = [];
        const now = new Date();

        for (const tank of tanks) {
            const capacity = parseFloat(tank.capacity);
            let currentVol = capacity * 0.8; // Start at 80%

            // Generate data for the last 365 days
            // We'll generate one reading per day for older data, and hourly for the last 24 hours

            // Last 365 days (Daily)
            for (let i = 365; i > 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);

                // Random fluctuation +/- 5%
                const change = (Math.random() - 0.5) * 0.1 * capacity;
                currentVol = Math.max(0, Math.min(capacity, currentVol + change));

                readings.push([tank.id, currentVol, date]);
            }

            // Last 24 hours (Hourly)
            for (let i = 24; i >= 0; i--) {
                const date = new Date(now);
                date.setHours(date.getHours() - i);

                const change = (Math.random() - 0.5) * 0.05 * capacity;
                currentVol = Math.max(0, Math.min(capacity, currentVol + change));

                readings.push([tank.id, currentVol, date]);
            }
        }

        // Batch insert
        if (readings.length > 0) {
            const chunkSize = 1000;
            for (let i = 0; i < readings.length; i += chunkSize) {
                const chunk = readings.slice(i, i + chunkSize);
                await connection.query(
                    'INSERT INTO tank_readings (tank_id, volume, reading_time) VALUES ?',
                    [chunk]
                );
            }
            console.log(`Inserted ${readings.length} historical readings.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

setupTankReadings();
