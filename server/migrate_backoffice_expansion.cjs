const db = require('./db.cjs');

async function migrate() {
    try {
        console.log('Migrating Backoffice Expansion tables...');

        // 1. Suppliers Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_person VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created suppliers table');

        // 2. Fuel Imports Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS fuel_imports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_id INT,
                product_id INT,
                amount DECIMAL(10, 2) NOT NULL,
                price_per_unit DECIMAL(10, 2) NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('Created fuel_imports table');

        // 3. Expenses Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100),
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created expenses table');

        // 4. Daily Closings Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS daily_closings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL UNIQUE,
                total_sales DECIMAL(10, 2) DEFAULT 0,
                cash_sales DECIMAL(10, 2) DEFAULT 0,
                transfer_sales DECIMAL(10, 2) DEFAULT 0,
                credit_sales DECIMAL(10, 2) DEFAULT 0,
                total_expenses DECIMAL(10, 2) DEFAULT 0,
                net_income DECIMAL(10, 2) DEFAULT 0,
                closed_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('Created daily_closings table');

        console.log('Backoffice Expansion migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
