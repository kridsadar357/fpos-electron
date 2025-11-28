const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting Held Sales Migration...');

        // Create held_sales table
        await db.query(`
            CREATE TABLE IF NOT EXISTS held_sales (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nozzle_id INT NOT NULL,
                sale_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        console.log('Created held_sales table.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
