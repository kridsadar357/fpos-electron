const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting Product Migration...');

        // 1. Add columns to products table
        try {
            await db.query(`
                ALTER TABLE products
                ADD COLUMN type ENUM('fuel', 'goods') NOT NULL DEFAULT 'fuel',
                ADD COLUMN image_url VARCHAR(255) NULL;
            `);
            console.log('Added type and image_url to products table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist in products table.');
            } else {
                throw err;
            }
        }

        // 2. Create product_stock table
        await db.query(`
            CREATE TABLE IF NOT EXISTS product_stock (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);
        console.log('Created product_stock table.');

        // 3. Insert some sample goods
        const [goods] = await db.query('SELECT * FROM products WHERE type = "goods"');
        if (goods.length === 0) {
            console.log('Inserting sample goods...');
            const [res] = await db.query(`
                INSERT INTO products (name, price, type, image_url) VALUES 
                ('Water 600ml', 10.00, 'goods', ''),
                ('Coke 325ml', 15.00, 'goods', ''),
                ('Chips', 20.00, 'goods', '');
            `);

            // Add stock for them
            const startId = res.insertId;
            await db.query(`
                INSERT INTO product_stock (product_id, quantity) VALUES 
                (?, 100), (?, 100), (?, 100)
            `, [startId, startId + 1, startId + 2]);
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
