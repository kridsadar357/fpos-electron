const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Migrating settings table...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                key_name VARCHAR(255) NOT NULL UNIQUE,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert default settings if not exists
        const defaults = [
            { key: 'company_name', value: 'บริษัท ตัวอย่าง จำกัด' },
            { key: 'company_address', value: '123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000' },
            { key: 'tax_id', value: '1234567890123' },
            { key: 'branch_id', value: '00000' },
            { key: 'phone', value: '02-123-4567' },
            { key: 'footer_text', value: 'ขอบคุณที่ใช้บริการ' }
        ];

        for (const setting of defaults) {
            await db.query(`
                INSERT IGNORE INTO settings (key_name, value) VALUES (?, ?)
            `, [setting.key, setting.value]);
        }

        console.log('Settings table migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
