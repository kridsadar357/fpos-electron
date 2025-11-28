const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Adding active column to users table...');

        // Check if column exists first to avoid error
        const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'active'");
        if (columns.length === 0) {
            await db.query("ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER role");
            console.log('Active column added successfully.');
        } else {
            console.log('Active column already exists.');
        }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
