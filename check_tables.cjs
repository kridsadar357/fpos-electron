const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fuel_pos_db',
};

async function checkTables() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [transactions] = await connection.query('DESCRIBE transactions');
        console.log('--- Transactions Table ---');
        console.log(transactions);

        const [nozzles] = await connection.query('DESCRIBE nozzles');
        console.log('--- Nozzles Table ---');
        console.log(nozzles);

        try {
            const [tanks] = await connection.query('DESCRIBE tanks');
            console.log('--- Tanks Table ---');
            console.log(tanks);
        } catch (e) {
            console.log('--- Tanks Table does not exist ---');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTables();
