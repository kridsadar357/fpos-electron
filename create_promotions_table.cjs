const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fuel_pos'
};

async function createTable() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS promotions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type ENUM('discount', 'freebie', 'point_multiplier') NOT NULL DEFAULT 'discount',
                condition_amount DECIMAL(10, 2) DEFAULT 0.00,
                value DECIMAL(10, 2) DEFAULT 0.00,
                product_id INT NULL,
                start_date DATETIME NOT NULL,
                end_date DATETIME NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            )
        `);

        console.log('Promotions table created successfully');
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

createTable();
