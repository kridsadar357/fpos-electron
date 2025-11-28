const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Adding member_id to transactions table...');
        await db.query(`
            ALTER TABLE transactions
            ADD COLUMN member_id VARCHAR(50) NULL AFTER status;
        `);
        console.log('Migration successful');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column member_id already exists');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
