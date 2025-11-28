const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fuel_pos_electron'
    });

    try {
        const [columns] = await connection.query('SHOW COLUMNS FROM fuel_imports');
        console.log('Columns in fuel_imports:', columns.map(c => c.Field));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkSchema();
