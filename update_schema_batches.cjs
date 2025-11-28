const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fuel_pos_electron',
    multipleStatements: true
};

async function updateSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // 1. Create import_batches table
        const createBatchesTable = `
            CREATE TABLE IF NOT EXISTS import_batches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT,
                import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                shipping_cost DECIMAL(10,2) DEFAULT 0.00,
                status ENUM('pending', 'received') DEFAULT 'pending',
                profit_status ENUM('pending', 'calculated') DEFAULT 'pending',
                total_sales DECIMAL(15,2) DEFAULT 0.00,
                net_profit DECIMAL(15,2) DEFAULT 0.00,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await connection.query(createBatchesTable);
        console.log('Created import_batches table');

        // 2. Add import_batch_id to fuel_imports if not exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'fuel_imports' AND COLUMN_NAME = 'import_batch_id'
        `, [dbConfig.database]);

        if (columns.length === 0) {
            await connection.query(`
                ALTER TABLE fuel_imports 
                ADD COLUMN import_batch_id INT,
                ADD CONSTRAINT fk_import_batch FOREIGN KEY (import_batch_id) REFERENCES import_batches(id) ON DELETE CASCADE
            `);
            console.log('Added import_batch_id to fuel_imports');
        } else {
            console.log('import_batch_id column already exists');
        }

        console.log('Schema update completed successfully');

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
