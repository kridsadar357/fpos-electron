const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTankId() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fuel_pos_electron'
    });

    try {
        console.log('Adding tank_id column to fuel_imports...');
        await connection.query(`
            ALTER TABLE fuel_imports 
            ADD COLUMN tank_id INT NULL AFTER product_id,
            ADD CONSTRAINT fk_fuel_imports_tank FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE SET NULL
        `);
        console.log('Successfully added tank_id column.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column tank_id already exists.');
        } else {
            console.error('Error:', err.message);
        }
    } finally {
        await connection.end();
    }
}

addTankId();
