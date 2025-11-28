const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fuel_pos'
};

async function testQuery() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        const query = `
            SELECT 
                DATE_FORMAT(MIN(reading_time), '%H:00') as label,
                AVG(volume) as value
            FROM tank_readings 
            WHERE tank_id = 1 
            GROUP BY DATE_FORMAT(reading_time, '%Y-%m-%d %H:00')
            LIMIT 1
        `;

        const [rows] = await connection.query(query);
        console.log('Query success:', rows);

    } catch (err) {
        console.error('Query failed:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

testQuery();
