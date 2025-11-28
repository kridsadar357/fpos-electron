const db = require('./server/db.cjs');

async function checkSchema() {
    try {
        const [columns] = await db.query('SHOW COLUMNS FROM products');
        console.log(columns.map(c => c.Field));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
