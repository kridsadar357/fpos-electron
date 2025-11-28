const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

let pool;

const configPath = path.join(__dirname, 'db_config.json');

function getDbConfig() {
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return config;
        } catch (err) {
            console.error('Error reading db_config.json:', err);
        }
    }
    // Fallback to env or defaults (for initial setup check)
    return {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fuel_pos_electron',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

function createPool() {
    const config = getDbConfig();
    pool = mysql.createPool(config);
    return pool;
}

// Initialize pool
createPool();

// Export a wrapper to allow re-initialization
module.exports = {
    query: (...args) => pool.promise().query(...args),
    getConnection: () => pool.promise().getConnection(),
    reconnect: () => {
        if (pool) {
            pool.end();
        }
        createPool();
    },
    getConfig: getDbConfig
};
