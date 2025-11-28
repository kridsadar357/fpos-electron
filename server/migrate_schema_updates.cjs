const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting Schema Updates Migration...');

        // Add meter_reading to nozzles
        try {
            await db.query(`ALTER TABLE nozzles ADD COLUMN meter_reading DECIMAL(10, 2) DEFAULT 0.00`);
            console.log('Added meter_reading column to nozzles table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('meter_reading column already exists in nozzles table.');
            } else {
                throw err;
            }
        }

        // Add user_line_id to members
        try {
            await db.query(`ALTER TABLE members ADD COLUMN user_line_id VARCHAR(255) DEFAULT NULL`);
            console.log('Added user_line_id column to members table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('user_line_id column already exists in members table.');
            } else {
                throw err;
            }
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
