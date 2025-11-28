const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting Credit Payment Migration...');

        // Update payment_type enum
        await db.query(`
            ALTER TABLE transactions
            MODIFY COLUMN payment_type ENUM('cash', 'promptpay', 'credit') NOT NULL;
        `);
        console.log('Updated payment_type enum in transactions table.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
