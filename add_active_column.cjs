const db = require('./server/db.cjs');

async function addActiveColumn() {
    try {
        console.log('Checking products table...');
        const [columns] = await db.query('SHOW COLUMNS FROM products LIKE "active"');

        if (columns.length === 0) {
            console.log('Adding active column...');
            await db.query('ALTER TABLE products ADD COLUMN active BOOLEAN DEFAULT TRUE');
            console.log('Column added successfully.');
        } else {
            console.log('Column active already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

addActiveColumn();
