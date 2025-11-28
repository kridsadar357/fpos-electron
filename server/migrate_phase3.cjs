const db = require('./db.cjs');

async function migrate() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        console.log('Adding lock_reason column to nozzles table...');

        // Check if column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'nozzles' AND COLUMN_NAME = 'lock_reason'
        `, [process.env.DB_NAME || 'fuel_pos_db']);

        if (columns.length === 0) {
            await connection.query('ALTER TABLE nozzles ADD COLUMN lock_reason TEXT NULL');
            console.log('lock_reason column added.');
        } else {
            console.log('lock_reason column already exists.');
        }

        await connection.commit();
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        await connection.rollback();
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        connection.release();
    }
}

migrate();
