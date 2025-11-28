const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting Transaction Items Migration...');

        // Create transaction_items table
        await db.query(`
            CREATE TABLE IF NOT EXISTS transaction_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                type ENUM('fuel', 'goods') NOT NULL DEFAULT 'goods',
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );
        `);
        console.log('Created transaction_items table.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
