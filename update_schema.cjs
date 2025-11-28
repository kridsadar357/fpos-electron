const db = require('./server/db.cjs');

async function updateSchema() {
    try {
        const connection = await db.getConnection();
        console.log('Connected to database...');

        // 1. Add color column to products
        try {
            await connection.query('ALTER TABLE products ADD COLUMN color VARCHAR(50) DEFAULT "#3B82F6"');
            console.log('Added color column to products');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('color column already exists in products');
            } else {
                console.error('Error adding color column:', err);
            }
        }

        // 2. Add meter_reading column to nozzles
        try {
            await connection.query('ALTER TABLE nozzles ADD COLUMN meter_reading DECIMAL(15, 2) DEFAULT 0.00');
            console.log('Added meter_reading column to nozzles');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('meter_reading column already exists in nozzles');
            } else {
                console.error('Error adding meter_reading column:', err);
            }
        }

        connection.release();
        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

updateSchema();
