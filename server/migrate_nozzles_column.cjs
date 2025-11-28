const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Migrating nozzles table...');

        // 1. Check if 'name' column exists
        const [columns] = await db.query("SHOW COLUMNS FROM nozzles LIKE 'name'");
        if (columns.length > 0) {
            console.log("Renaming 'name' to 'nozzle_number'...");
            // We can use CHANGE COLUMN to rename and change type if needed.
            // Assuming nozzle_number should be INT or VARCHAR. Code treats it as string/number.
            // Let's keep it VARCHAR(50) for now or INT.
            // The existing data is "Nozzle 1".

            // First, let's update the data to be just numbers if possible, or leave it.
            // "Nozzle 1" -> "1"

            await db.query(`UPDATE nozzles SET name = REPLACE(name, 'Nozzle ', '') WHERE name LIKE 'Nozzle %'`);

            // Now rename the column
            await db.query("ALTER TABLE nozzles CHANGE COLUMN name nozzle_number VARCHAR(50) NOT NULL");
            console.log("Column renamed successfully.");
        } else {
            console.log("'name' column not found. Checking for 'nozzle_number'...");
            const [cols] = await db.query("SHOW COLUMNS FROM nozzles LIKE 'nozzle_number'");
            if (cols.length > 0) {
                console.log("'nozzle_number' already exists.");
            } else {
                console.error("Neither 'name' nor 'nozzle_number' column found!");
            }
        }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
