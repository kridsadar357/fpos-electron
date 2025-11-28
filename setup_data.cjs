const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setup() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'fuel_pos'
    });

    try {
        console.log('Creating settings table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255),
                company_address TEXT,
                tax_id VARCHAR(50),
                branch_id VARCHAR(50),
                phone VARCHAR(50),
                footer_text TEXT,
                line_notify_enabled BOOLEAN DEFAULT FALSE,
                line_notify_token VARCHAR(255),
                telegram_notify_enabled BOOLEAN DEFAULT FALSE,
                telegram_bot_token VARCHAR(255),
                telegram_chat_id VARCHAR(255),
                pos_status ENUM('open', 'closed') DEFAULT 'open',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if settings exist
        const [settings] = await db.query('SELECT * FROM settings');
        if (settings.length === 0) {
            console.log('Inserting default settings...');
            await db.query(`
                INSERT INTO settings (company_name, company_address, tax_id, branch_id, phone, footer_text)
                VALUES (?, ?, ?, ?, ?, ?)
            `, ['My Fuel Station', '123 Test Road, Bangkok', '1234567890123', '00000', '02-123-4567', 'Thank you for using our service']);
        }

        console.log('Checking transactions...');
        const [tx] = await db.query('SELECT COUNT(*) as count FROM transactions');
        if (tx[0].count === 0) {
            console.log('Generating dummy transactions...');
            // Get some products and dispensers
            const [products] = await db.query('SELECT id, price FROM products WHERE type="fuel" LIMIT 2');
            const [dispensers] = await db.query('SELECT id FROM dispensers LIMIT 1');

            if (products.length > 0 && dispensers.length > 0) {
                const p = products[0];
                const d = dispensers[0];

                // Insert some transactions for today and yesterday
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                for (let i = 0; i < 5; i++) {
                    await db.query(`
                        INSERT INTO transactions (dispenser_id, product_id, liters, amount, price, payment_type, status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)
                    `, [d.id, p.id, 10, p.price * 10, p.price, 'cash', today]);
                }

                for (let i = 0; i < 5; i++) {
                    await db.query(`
                        INSERT INTO transactions (dispenser_id, product_id, liters, amount, price, payment_type, status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)
                    `, [d.id, p.id, 20, p.price * 20, p.price, 'cash', yesterday]);
                }
                console.log('Dummy transactions inserted.');
            } else {
                console.log('No products or dispensers found to create transactions.');
            }
        }

        console.log('Setup complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

setup();
