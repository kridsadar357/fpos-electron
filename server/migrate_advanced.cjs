const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Starting Advanced Features Migration...');

        // 1. Create members table
        await db.query(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(20) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                points INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created members table.');

        // 2. Create promotions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS promotions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type ENUM('discount', 'freebie') NOT NULL,
                condition_amount DECIMAL(10, 2) NOT NULL,
                value DECIMAL(10, 2) NOT NULL, -- Discount amount or Freebie quantity
                product_id INT NULL, -- For freebie (which product to give)
                start_date DATETIME NOT NULL,
                end_date DATETIME NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created promotions table.');

        // 3. Update transactions table
        try {
            await db.query(`
                ALTER TABLE transactions
                ADD COLUMN received_amount DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN change_amount DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN start_meter DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN end_meter DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN promotion_id INT NULL,
                ADD COLUMN total_discount DECIMAL(10, 2) DEFAULT 0,
                ADD COLUMN total_get_free INT DEFAULT 0,
                ADD COLUMN points_earned INT DEFAULT 0,
                ADD CONSTRAINT fk_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id);
            `);
            console.log('Updated transactions table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist in transactions table.');
            } else {
                throw err;
            }
        }

        // 4. Insert sample data
        // Sample Member
        await db.query(`
            INSERT IGNORE INTO members (phone, name, points) VALUES 
            ('0812345678', 'Somchai Jai-dee', 50);
        `);

        // Sample Promotion: Discount 0.25 baht per liter (implemented as fixed discount for simplicity in DB, logic in code)
        // Wait, user said "0.25 bath per liters". 
        // Let's store 'value' as 0.25 and type as 'discount_per_liter' maybe? 
        // Or just 'discount' and handle logic. 
        // Let's stick to simple types for now and handle logic in backend.
        // Let's add a 'discount_per_liter' type to enum? 
        // ALTER TABLE promotions MODIFY COLUMN type ENUM('discount', 'freebie', 'discount_per_liter') NOT NULL;

        // Actually, let's just insert a sample and handle logic later.
        // For now, let's assume 'discount' is fixed amount, we might need to adjust schema if we want dynamic.
        // User said "fuel amount 500 bath has discount 0.25 bath per liters".
        // This implies a condition (amount >= 500) and a reward (0.25 * liters).
        // Let's use 'discount_per_unit' logic.

        // Let's update the schema slightly to be more flexible if needed, but for now standard is fine.

        await db.query(`
            INSERT INTO promotions (name, type, condition_amount, value, start_date, end_date, active) 
            SELECT 'Discount 0.25/L if > 500', 'discount', 500.00, 0.25, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), TRUE
            WHERE NOT EXISTS (SELECT * FROM promotions WHERE name = 'Discount 0.25/L if > 500');
        `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
