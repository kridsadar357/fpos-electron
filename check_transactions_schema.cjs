const db = require('./server/db.cjs');

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE transactions');
        console.log(rows);
    } catch (err) {
        console.error('Error describing transactions table:', err.message);
    } finally {
        process.exit();
    }
}

checkSchema();
