const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise'); // For direct connection testing

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Setup API ---

// Check if configured
app.get('/api/setup/check', (req, res) => {
    const configPath = path.join(__dirname, 'db_config.json');
    if (fs.existsSync(configPath)) {
        res.json({ configured: true });
    } else {
        res.json({ configured: false });
    }
});

// Test DB Connection
app.post('/api/setup/db-test', async (req, res) => {
    const { host, user, password, database } = req.body;
    try {
        // Try to connect without database first to check credentials
        const connection = await mysql.createConnection({
            host,
            user,
            password
        });

        // Check if database exists, if not create it
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await connection.end();

        // Try connecting WITH database
        const dbConnection = await mysql.createConnection({
            host,
            user,
            password,
            database
        });
        await dbConnection.end();

        res.json({ success: true, message: 'Connection successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save DB Config
app.post('/api/setup/db-save', async (req, res) => {
    const { host, user, password, database } = req.body;
    const config = {
        host,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    try {
        const configPath = path.join(__dirname, 'db_config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // Reconnect DB
        db.reconnect();

        // Initialize Tables (Run setup_data logic here or call it)
        // For now, we assume the client will call the next steps to populate data
        // But we should ensure tables exist.
        // Let's run the schema creation here.
        await runSchemaSetup();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function runSchemaSetup() {
    // This function should contain the CREATE TABLE statements from setup_data.cjs
    // For brevity, I'll assume we can import or copy them. 
    // Ideally, we should refactor setup_data.cjs to export a function.
    // For now, I will execute the setup_data.cjs script as a child process or just rely on the user to run it?
    // User requested "connect or create for connect database".
    // So we should run the schema creation.

    // Let's try to require setup_data if it exports something, or just run the SQLs.
    // Since setup_data.cjs is a script, let's just run the SQLs directly here for robustness.

    const queries = [
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            type ENUM('fuel', 'goods') NOT NULL,
            stock DECIMAL(10, 2) DEFAULT 0,
            image_url VARCHAR(255),
            color VARCHAR(50) DEFAULT '#3B82F6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS tanks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            capacity DECIMAL(10, 2) NOT NULL,
            current_volume DECIMAL(10, 2) DEFAULT 0,
            fuel_type VARCHAR(50),
            color VARCHAR(50) DEFAULT '#EF4444',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS dispensers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS nozzles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dispenser_id INT,
            nozzle_number INT NOT NULL,
            product_id INT,
            tank_id INT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            FOREIGN KEY (dispenser_id) REFERENCES dispensers(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (tank_id) REFERENCES tanks(id)
        )`,
        `CREATE TABLE IF NOT EXISTS shifts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP NULL,
            start_cash DECIMAL(10, 2) DEFAULT 0,
            end_cash DECIMAL(10, 2) DEFAULT 0,
            status ENUM('open', 'closed') DEFAULT 'open',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shift_id INT,
            user_id INT,
            dispenser_id INT,
            product_id INT,
            amount DECIMAL(10, 2) NOT NULL,
            liters DECIMAL(10, 2) DEFAULT 0,
            price DECIMAL(10, 2) NOT NULL,
            payment_type ENUM('cash', 'promptpay', 'credit') DEFAULT 'cash',
            status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (shift_id) REFERENCES shifts(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (dispenser_id) REFERENCES dispensers(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`,
        `CREATE TABLE IF NOT EXISTS settings (
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
        )`
    ];

    for (const query of queries) {
        await db.query(query);
    }

    // Create default admin user if not exists
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
        // Default password 'admin' (hashed) - using simple text for now as bcrypt is used in login
        // Ideally we should use the same hash function.
        // Let's assume the user will create an admin in the wizard or we verify this later.
        // For now, let's insert a default one to ensure login works.
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin', 10);
        await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
    }
}

app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Get recent transactions with pagination
app.get('/api/transactions', async (req, res) => {
    console.log('GET /api/transactions called', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        // Get total count
        const [countResult] = await db.query('SELECT COUNT(*) as count FROM transactions');
        const total = countResult[0].count;

        // Get paginated data
        const [rows] = await db.query(`
            SELECT t.*, p.name as product_name, m.name as member_name
            FROM transactions t 
            LEFT JOIN products p ON t.product_id = p.id 
            LEFT JOIN members m ON t.member_id = m.id
            ORDER BY t.created_at DESC 
            LIMIT ? OFFSET ?
        `, [limit, offset]);

        res.json({
            data: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ error: err.message });
    }
});

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, role, active FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add User
app.post('/api/users', async (req, res) => {
    const { username, password, role, active } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, password, role, active) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, active !== undefined ? active : true]
        );
        res.json({ id: result.insertId, message: 'User added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, role, active } = req.body;
    try {
        let query = 'UPDATE users SET username = ?, role = ?, active = ?';
        let params = [username, role, active];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Members ---
app.get('/api/members', async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM members';
        const params = [];

        if (search) {
            query += ' WHERE phone LIKE ? OR name LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products with pagination and type filter
app.get('/api/products', async (req, res) => {
    const { type, page, limit } = req.query;
    try {
        let query = `
            SELECT p.id, p.name, p.price, p.type, p.image_url, p.color, ps.quantity as stock_qty 
            FROM products p 
            LEFT JOIN product_stock ps ON p.id = ps.product_id
            WHERE p.active = 1
        `;
        const params = [];

        if (type) {
            query += ' AND p.type = ?';
            params.push(type);
        }

        // Add pagination if requested
        if (page && limit) {
            // First get total count
            let countQuery = 'SELECT COUNT(*) as count FROM products p WHERE p.active = 1';
            if (type) countQuery += ' AND p.type = ?';
            const [countRows] = await db.query(countQuery, type ? [type] : []);
            const total = countRows[0].count;

            query += ' LIMIT ? OFFSET ?';
            const offset = (parseInt(page) - 1) * parseInt(limit);
            params.push(parseInt(limit), offset);

            const [rows] = await db.query(query, params);
            res.json({
                data: rows,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            });
        } else {
            // Return all if no pagination (for dropdowns etc)
            const [rows] = await db.query(query, params);
            res.json(rows);
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add Product
app.post('/api/products', async (req, res) => {
    const { name, price, type, image_url, stock_qty, color } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO products (name, price, type, image_url, color) VALUES (?, ?, ?, ?, ?)',
            [name, price, type, image_url, color || '#3B82F6']
        );
        const productId = result.insertId;
        await connection.query(
            'INSERT INTO product_stock (product_id, quantity) VALUES (?, ?)',
            [productId, stock_qty || 0]
        );
        await connection.commit();
        res.json({ id: productId, message: 'Product added successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, type, image_url, stock_qty, color } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE products SET name = ?, price = ?, type = ?, image_url = ?, color = ? WHERE id = ?',
            [name, price, type, image_url, color || '#3B82F6', id]
        );
        if (stock_qty !== undefined) {
            // Check if stock record exists
            const [stockRows] = await connection.query('SELECT * FROM product_stock WHERE product_id = ?', [id]);
            if (stockRows.length > 0) {
                await connection.query('UPDATE product_stock SET quantity = ? WHERE product_id = ?', [stock_qty, id]);
            } else {
                await connection.query('INSERT INTO product_stock (product_id, quantity) VALUES (?, ?)', [id, stock_qty]);
            }
        }
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Delete Product
// Soft Delete Product
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE products SET active = 0 WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tanks
// --- Tanks Management ---

// Get all tanks
app.get('/api/tanks', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, p.name as product_name, p.color as product_color 
            FROM tanks t 
            LEFT JOIN products p ON t.product_id = p.id
            ORDER BY t.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Tank
app.post('/api/tanks', async (req, res) => {
    const { name, product_id, capacity, current_volume, min_level } = req.body;
    try {
        await db.query(
            'INSERT INTO tanks (name, product_id, capacity, current_volume, min_level) VALUES (?, ?, ?, ?, ?)',
            [name, product_id, capacity, current_volume, min_level]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Tank
// Update Tank
app.put('/api/tanks/:id', async (req, res) => {
    const { name, product_id, capacity, current_volume, min_level } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update tank details
        await connection.query(
            'UPDATE tanks SET name = ?, product_id = ?, capacity = ?, current_volume = ?, min_level = ? WHERE id = ?',
            [name, product_id, capacity, current_volume, min_level, req.params.id]
        );

        // Log reading if volume changed (or just log every update for simplicity/tracking)
        await connection.query(
            'INSERT INTO tank_readings (tank_id, volume) VALUES (?, ?)',
            [req.params.id, current_volume]
        );

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Get Tank History
app.get('/api/tanks/:id/history', async (req, res) => {
    const { id } = req.params;
    const { period } = req.query; // 'today', 'week', 'month', 'year'

    try {
        let query = '';
        let params = [id];

        if (period === 'today') {
            // Hourly data for last 24 hours
            query = `
                SELECT 
                    DATE_FORMAT(MIN(reading_time), '%H:00') as label,
                    AVG(volume) as value,
                    MAX(reading_time) as sort_time
                FROM tank_readings 
                WHERE tank_id = ? AND reading_time >= NOW() - INTERVAL 1 DAY
                GROUP BY DATE_FORMAT(reading_time, '%Y-%m-%d %H:00')
                ORDER BY sort_time ASC
            `;
        } else if (period === 'week') {
            // Daily data for last 7 days
            query = `
                SELECT 
                    DATE_FORMAT(MIN(reading_time), '%a') as label,
                    AVG(volume) as value,
                    MAX(reading_time) as sort_time
                FROM tank_readings 
                WHERE tank_id = ? AND reading_time >= NOW() - INTERVAL 7 DAY
                GROUP BY DATE_FORMAT(reading_time, '%Y-%m-%d')
                ORDER BY sort_time ASC
            `;
        } else if (period === 'month') {
            // Daily data for last 30 days
            query = `
                SELECT 
                    DATE_FORMAT(MIN(reading_time), '%d/%m') as label,
                    AVG(volume) as value,
                    MAX(reading_time) as sort_time
                FROM tank_readings 
                WHERE tank_id = ? AND reading_time >= NOW() - INTERVAL 30 DAY
                GROUP BY DATE_FORMAT(reading_time, '%Y-%m-%d')
                ORDER BY sort_time ASC
            `;
        } else if (period === 'year') {
            // Monthly data for last 12 months
            query = `
                SELECT 
                    DATE_FORMAT(MIN(reading_time), '%b') as label,
                    AVG(volume) as value,
                    MAX(reading_time) as sort_time
                FROM tank_readings 
                WHERE tank_id = ? AND reading_time >= NOW() - INTERVAL 1 YEAR
                GROUP BY DATE_FORMAT(reading_time, '%Y-%m')
                ORDER BY sort_time ASC
            `;
        } else {
            return res.status(400).json({ error: 'Invalid period' });
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Tank
app.delete('/api/tanks/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM tanks WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lock nozzle with reason
app.post('/api/nozzles/:id/lock', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    try {
        await db.query('UPDATE nozzles SET status = "locked", lock_reason = ? WHERE id = ?', [reason, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unlock nozzle
app.post('/api/nozzles/:id/unlock', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE nozzles SET status = "idle", lock_reason = NULL WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Nozzle
app.post('/api/nozzles', async (req, res) => {
    const { dispenser_id, product_id, nozzle_number, meter_reading } = req.body;
    try {
        await db.query(
            'INSERT INTO nozzles (dispenser_id, product_id, nozzle_number, meter_reading, status) VALUES (?, ?, ?, ?, "idle")',
            [dispenser_id, product_id, nozzle_number, meter_reading || 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Nozzle
app.delete('/api/nozzles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM nozzles WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Nozzle (Name/Product/Number)
// Update Nozzle (Name/Product/Number)
app.put('/api/nozzles/:id', async (req, res) => {
    const { id } = req.params;
    const { nozzle_number, product_id, meter_reading } = req.body;
    try {
        let query = 'UPDATE nozzles SET nozzle_number = ?, product_id = ?';
        let params = [nozzle_number, product_id];

        if (meter_reading !== undefined) {
            query += ', meter_reading = ?';
            params.push(meter_reading);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Dispenser Name
app.put('/api/dispensers/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await db.query('UPDATE dispensers SET name = ? WHERE id = ?', [name, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get dispensers with nozzles
app.get('/api/dispensers', async (req, res) => {
    try {
        const [dispensers] = await db.query('SELECT * FROM dispensers');
        const [nozzles] = await db.query(`
            SELECT n.*, p.name as product_name, p.price as product_price, p.color as product_color
            FROM nozzles n 
            LEFT JOIN products p ON n.product_id = p.id
        `);

        const result = dispensers.map(d => ({
            ...d,
            nozzles: nozzles.filter(n => n.dispenser_id === d.id)
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Dispenser
app.delete('/api/dispensers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check for nozzles
        const [nozzles] = await db.query('SELECT * FROM nozzles WHERE dispenser_id = ?', [id]);
        if (nozzles.length > 0) {
            return res.status(400).json({ error: 'ไม่สามารถลบตู้จ่ายที่มีหัวจ่ายได้ (Cannot delete dispenser with nozzles)' });
        }

        await db.query('DELETE FROM dispensers WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Transaction
app.post('/api/transactions', async (req, res) => {
    const { dispenser_id, product_id, amount, liters, payment_type, status, member_id, received_amount, change_amount, cart } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let finalAmount = parseFloat(amount);
        let totalDiscount = 0;
        let totalGetFree = 0;
        let pointsEarned = 0;
        let promotionId = null;

        // 1. Calculate Promotions (Discount & Points)
        if (member_id) {
            // ... (Fetch member and promotions logic - simplified for brevity or assumed existing if not modifying)
            // Actually, I should include the full logic here to be safe as the previous state is unknown/broken.

            // Fetch Member
            const [members] = await connection.query('SELECT * FROM members WHERE id = ?', [member_id]);
            if (members.length > 0) {
                const member = members[0];

                // Calculate Points (1 point per 25 baht)
                pointsEarned = Math.floor(finalAmount / 25);

                // Check for Promotions
                const [promotions] = await connection.query(
                    'SELECT * FROM promotions WHERE active = 1 AND start_date <= NOW() AND end_date >= NOW() AND (product_id IS NULL OR product_id = ?)',
                    [product_id]
                );

                for (const promo of promotions) {
                    if (promo.type === 'discount' && finalAmount >= promo.condition_amount) {
                        // Round discount to nearest integer
                        totalDiscount = Math.round(promo.value);
                        promotionId = promo.id;
                        break; // Apply best promotion only (simple logic)
                    } else if (promo.type === 'point_multiplier') {
                        pointsEarned *= promo.value;
                        promotionId = promo.id;
                    }
                }

                // Update Member Points
                await connection.query('UPDATE members SET points = points + ? WHERE id = ?', [pointsEarned, member_id]);
            }
        }

        // 2. Handle Goods Products (Deduct Stock)
        if (cart && cart.length > 0) {
            for (const item of cart) {
                if (item.type === 'goods') {
                    await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);

                    // Add to transaction_items (if you have this table, otherwise skip or just log)
                    // Assuming we just track total amount for now or simple transaction structure
                }
            }
        }

        // 3. Handle Meter Readings & Update Nozzle
        let startMeter = 0;
        let endMeter = 0;

        if (dispenser_id && product_id) {
            const [nozzles] = await connection.query(
                'SELECT * FROM nozzles WHERE dispenser_id = ? AND product_id = ?',
                [dispenser_id, product_id]
            );

            if (nozzles.length > 0) {
                const nozzle = nozzles[0];
                startMeter = parseFloat(nozzle.meter_reading || 0);
                // Ensure liters is a number
                const litersSold = parseFloat(liters) || 0;
                endMeter = startMeter + litersSold;

                await connection.query(
                    'UPDATE nozzles SET meter_reading = ? WHERE id = ?',
                    [endMeter, nozzle.id]
                );

                // --- NEW: Update Tank Volume ---
                if (nozzle.tank_id) {
                    // 1. Deduct from tank
                    await connection.query(
                        'UPDATE tanks SET current_volume = current_volume - ? WHERE id = ?',
                        [litersSold, nozzle.tank_id]
                    );

                    // 2. Get new volume for logging
                    const [updatedTank] = await connection.query(
                        'SELECT current_volume FROM tanks WHERE id = ?',
                        [nozzle.tank_id]
                    );

                    if (updatedTank.length > 0) {
                        // 3. Log reading
                        await connection.query(
                            'INSERT INTO tank_readings (tank_id, volume) VALUES (?, ?)',
                            [nozzle.tank_id, updatedTank[0].current_volume]
                        );
                    }
                }
            }
        }

        // 4. Create Transaction
        const [result] = await connection.query(
            `INSERT INTO transactions
            (dispenser_id, product_id, amount, liters, payment_type, status, member_id,
                received_amount, change_amount, promotion_id, total_discount, total_get_free, points_earned,
                start_meter, end_meter)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dispenser_id, product_id, finalAmount, liters, payment_type, status || 'completed', member_id,
                received_amount || 0, change_amount || 0, promotionId, totalDiscount, totalGetFree, pointsEarned,
                startMeter, endMeter
            ]
        );

        await connection.commit();
        res.json({ success: true, transactionId: result.insertId, pointsEarned });

    } catch (err) {
        await connection.rollback();
        console.error('Transaction Error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});



// --- Settings Management ---

// Get all settings
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.key_name] = row.value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update settings
app.post('/api/settings', async (req, res) => {
    const settings = req.body; // Expect object { key: value, ... }
    try {
        await connection.beginTransaction();
        for (const [key, value] of Object.entries(settings)) {
            await connection.query(
                'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
                [key, value, value]
            );
        }
        await connection.commit();
        res.json({ success: true, message: 'Settings updated' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    }
});

// --- Suppliers Management ---
app.get('/api/suppliers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/suppliers', async (req, res) => {
    const { name, contact_person, phone, address } = req.body;
    try {
        await db.query('INSERT INTO suppliers (name, contact_person, phone, address) VALUES (?, ?, ?, ?)', [name, contact_person, phone, address]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/suppliers/:id', async (req, res) => {
    const { name, contact_person, phone, address } = req.body;
    try {
        await db.query('UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, address = ? WHERE id = ?', [name, contact_person, phone, address, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/suppliers/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Fuel Imports ---
app.get('/api/fuel-imports', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT fi.*, s.name as supplier_name, p.name as product_name 
            FROM fuel_imports fi
            LEFT JOIN suppliers s ON fi.supplier_id = s.id
            LEFT JOIN products p ON fi.product_id = p.id
            ORDER BY fi.import_date DESC
            `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Fuel Import & Batches ---

// 1. Create Import Batch (Pending)
app.post('/api/fuel-imports', async (req, res) => {
    const { supplier_id, items, shipping_cost } = req.body;
    // items: [{ product_id, tank_id, amount, price_per_unit, total_price }]

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('No items to import');
        }

        // Create Batch
        const [batchResult] = await connection.query(
            'INSERT INTO import_batches (supplier_id, shipping_cost, status) VALUES (?, ?, ?)',
            [supplier_id, parseFloat(shipping_cost) || 0, 'pending']
        );
        const batchId = batchResult.insertId;

        for (const item of items) {
            const { product_id, tank_id, amount, price_per_unit, total_price } = item;

            const importAmount = parseFloat(amount);
            const importPrice = parseFloat(price_per_unit);
            const importTotal = parseFloat(total_price);

            if (isNaN(importAmount) || importAmount <= 0) {
                throw new Error('Invalid amount');
            }

            // Insert Import Record linked to Batch
            await connection.query(
                'INSERT INTO fuel_imports (import_batch_id, supplier_id, product_id, tank_id, amount, price_per_unit, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [batchId, supplier_id, product_id, tank_id || null, importAmount, importPrice, importTotal]
            );
        }

        await connection.commit();
        res.json({ success: true, batchId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 2. Get Batches
app.get('/api/fuel-imports/batches', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                b.*, 
                s.name as supplier_name,
                (SELECT COUNT(*) FROM fuel_imports fi WHERE fi.import_batch_id = b.id) as item_count,
                (SELECT SUM(total_price) FROM fuel_imports fi WHERE fi.import_batch_id = b.id) as total_fuel_cost
            FROM import_batches b
            LEFT JOIN suppliers s ON b.supplier_id = s.id
            ORDER BY b.import_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Batch Details
app.get('/api/fuel-imports/batches/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                fi.*, 
                p.name as product_name,
                t.name as tank_name
            FROM fuel_imports fi
            LEFT JOIN products p ON fi.product_id = p.id
            LEFT JOIN tanks t ON fi.tank_id = t.id
            WHERE fi.import_batch_id = ?
        `, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Receive Batch (Confirm & Update Stock/Tanks)
app.post('/api/fuel-imports/receive/:id', async (req, res) => {
    const batchId = req.params.id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if already received
        const [batches] = await connection.query('SELECT status FROM import_batches WHERE id = ?', [batchId]);
        if (batches.length === 0) throw new Error('Batch not found');
        if (batches[0].status === 'received') throw new Error('Batch already received');

        // Get Items
        const [items] = await connection.query('SELECT * FROM fuel_imports WHERE import_batch_id = ?', [batchId]);

        for (const item of items) {
            const { product_id, tank_id, amount } = item;
            const importAmount = parseFloat(amount);

            // 1. Update Tank (if assigned)
            if (tank_id) {
                const [tanks] = await connection.query('SELECT * FROM tanks WHERE id = ?', [tank_id]);
                if (tanks.length > 0) {
                    const tank = tanks[0];
                    const currentVol = parseFloat(tank.current_volume);
                    const capacity = parseFloat(tank.capacity);

                    if (currentVol + importAmount > capacity) {
                        throw new Error(`Tank ${tank.name}: Over Capacity. Remaining: ${(capacity - currentVol).toFixed(2)} L`);
                    }

                    await connection.query('UPDATE tanks SET current_volume = current_volume + ? WHERE id = ?', [importAmount, tank_id]);

                    // Log Reading
                    await connection.query(
                        'INSERT INTO tank_readings (tank_id, volume) VALUES (?, ?)',
                        [tank_id, currentVol + importAmount]
                    );
                }
            }

            // 2. Update Product Stock
            await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [importAmount, product_id]);
        }

        // Update Batch Status
        await connection.query("UPDATE import_batches SET status = 'received' WHERE id = ?", [batchId]);

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 5. Calculate Profit
app.post('/api/fuel-imports/calculate-profit/:id', async (req, res) => {
    const batchId = req.params.id;
    try {
        // Get current batch info
        const [batches] = await db.query('SELECT * FROM import_batches WHERE id = ?', [batchId]);
        if (batches.length === 0) return res.status(404).json({ error: 'Batch not found' });
        const currentBatch = batches[0];

        // Find PREVIOUS batch for same supplier (or just previous batch in general? User said "previous oil import")
        // Assuming we calculate profit based on sales SINCE the previous batch UP TO this batch.
        // Logic: Find the batch immediately preceding this one (by date).

        const [prevBatches] = await db.query(`
            SELECT * FROM import_batches 
            WHERE import_date < ? AND status = 'received'
            ORDER BY import_date DESC 
            LIMIT 1
        `, [currentBatch.import_date]);

        let startDate;
        if (prevBatches.length === 0) {
            // No previous batch. Start from beginning of time? Or maybe just don't calculate?
            // User said "Look at the receipt date of the previous oil import".
            // If no previous, maybe default to 30 days ago or just 0?
            // Let's assume start of time for now, or maybe return a warning.
            startDate = '2000-01-01 00:00:00';
        } else {
            startDate = prevBatches[0].import_date;
        }

        const endDate = currentBatch.import_date;

        // Calculate Total Sales in this period
        // Note: This is a simplification. Ideally we should filter by products in the batch, 
        // but user said "find the total sales in the transaction table".
        // Let's filter by products that were in the PREVIOUS batch? Or just all fuel sales?
        // User said: "find each oil type, break it down by type, and compare the import costs"
        // This implies we need to match products.

        // Let's get products from the PREVIOUS batch (the one we are effectively calculating profit FOR).
        // Wait, user said "calculate cost/profit (if not already calculated)... in the import history for EACH import".
        // And "Look at the receipt date of the previous oil import... find total sales... up to the date the oil was imported... in the CURRENT batch".
        // This implies we are calculating profit for the PERIOD ending with the CURRENT batch.
        // So we are calculating profit for the PREVIOUS batch's period.
        // So we should update the PREVIOUS batch's record? Or the current one?
        // "The cost/profit calculation can only be applied to the previous batch."
        // Okay, so we are calculating for the PREVIOUS batch.

        if (prevBatches.length === 0) {
            return res.status(400).json({ error: 'ไม่พบรอบการนำเข้าก่อนหน้าสำหรับการคำนวณกำไร' });
        }

        const targetBatch = prevBatches[0]; // We are calculating profit for THIS batch
        const nextBatchDate = currentBatch.import_date;
        const targetBatchDate = targetBatch.import_date;

        // Get items from target batch to know which products to check
        const [targetItems] = await db.query('SELECT * FROM fuel_imports WHERE import_batch_id = ?', [targetBatch.id]);

        let totalSales = 0;

        for (const item of targetItems) {
            // Find sales for this product between targetBatchDate and nextBatchDate
            const [salesResult] = await db.query(`
                SELECT SUM(total_price) as total_sales 
                FROM transactions 
                WHERE product_id = ? 
                AND created_at >= ? 
                AND created_at < ?
            `, [item.product_id, targetBatchDate, nextBatchDate]);

            totalSales += parseFloat(salesResult[0].total_sales || 0);
        }

        // Calculate Costs
        const [fuelCostResult] = await db.query('SELECT SUM(total_price) as total FROM fuel_imports WHERE import_batch_id = ?', [targetBatch.id]);
        const totalFuelCost = parseFloat(fuelCostResult[0].total || 0);
        const shippingCost = parseFloat(targetBatch.shipping_cost || 0);
        const totalCost = totalFuelCost + shippingCost;

        const netProfit = totalSales - totalCost;

        // Update Target Batch
        await db.query(`
            UPDATE import_batches 
            SET total_sales = ?, net_profit = ?, profit_status = 'calculated' 
            WHERE id = ?
        `, [totalSales, netProfit, targetBatch.id]);

        res.json({
            success: true,
            targetBatchId: targetBatch.id,
            totalSales,
            totalCost,
            netProfit
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Expenses ---
app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', async (req, res) => {
    const { title, amount, category, note, date } = req.body;
    try {
        await db.query(
            'INSERT INTO expenses (title, amount, category, note, date) VALUES (?, ?, ?, ?, ?)',
            [title, amount, category, note, date || new Date()]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Daily Closings ---
app.get('/api/daily-closings', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM daily_closings ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/daily-summary', async (req, res) => {
    const { date } = req.query;
    try {
        // 1. Get total sales from transactions (All shifts)
        const [sales] = await db.query(`
            SELECT
                SUM(amount) as total_sales,
                SUM(liters) as total_liters,
                SUM(CASE WHEN payment_type = 'cash' THEN amount ELSE 0 END) as cash_sales,
                SUM(CASE WHEN payment_type = 'promptpay' THEN amount ELSE 0 END) as transfer_sales,
                SUM(CASE WHEN payment_type = 'credit' THEN amount ELSE 0 END) as credit_sales
            FROM transactions 
            WHERE DATE(created_at) = ?
        `, [date]);

        // 2. Get sales broken down by shift status
        // We need to join transactions with shifts based on time
        // Note: This assumes transactions belong to the shift active at their creation time
        const [shiftSales] = await db.query(`
    SELECT
    IFNULL(s.status, 'unknown') as shift_status,
        SUM(t.amount) as total
            FROM transactions t
            LEFT JOIN shifts s ON t.created_at >= s.start_time AND(s.end_time IS NULL OR t.created_at <= s.end_time)
            WHERE DATE(t.created_at) = ?
        GROUP BY s.status
            `, [date]);

        let closedShiftSales = 0;
        let openShiftSales = 0;

        shiftSales.forEach(row => {
            if (row.shift_status === 'closed') closedShiftSales += parseFloat(row.total || 0);
            else if (row.shift_status === 'open') openShiftSales += parseFloat(row.total || 0);
        });

        // 3. Get total expenses
        const [expenses] = await db.query('SELECT SUM(amount) as total_expenses FROM expenses WHERE DATE(date) = ?', [date]);

        // 4. Get detailed shift breakdown
        const [shifts] = await db.query(`
    SELECT
    s.id, s.start_time, s.end_time, s.start_cash, s.end_cash, s.status, u.username,
        COALESCE(SUM(CASE WHEN t.payment_type = 'cash' THEN t.amount ELSE 0 END), 0) as cash_sales,
        COALESCE(SUM(CASE WHEN t.payment_type = 'promptpay' THEN t.amount ELSE 0 END), 0) as transfer_sales,
        COALESCE(SUM(CASE WHEN t.payment_type = 'credit' THEN t.amount ELSE 0 END), 0) as credit_sales,
        COALESCE(SUM(t.amount), 0) as total_sales
            FROM shifts s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN transactions t ON t.created_at >= s.start_time AND(s.end_time IS NULL OR t.created_at <= s.end_time)
            WHERE DATE(s.start_time) = ?
        GROUP BY s.id
            ORDER BY s.start_time DESC
        `, [date]);

        const summary = {
            total_sales: sales[0].total_sales || 0,
            cash_sales: sales[0].cash_sales || 0,
            transfer_sales: sales[0].transfer_sales || 0,
            credit_sales: sales[0].credit_sales || 0,
            closed_shift_sales: closedShiftSales,
            open_shift_sales: openShiftSales,
            total_expenses: expenses[0].total_expenses || 0,
            net_income: (sales[0].total_sales || 0) - (expenses[0].total_expenses || 0),
            shifts: shifts // Return detailed shifts
        };
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/daily-details', async (req, res) => {
    const { date } = req.query;
    console.log(`[DEBUG] / api / daily - details called with date: ${date} `);
    try {
        // 1. Transactions
        const [transactions] = await db.query(`
            SELECT t.*, p.name as product_name, d.name as dispenser_name, pr.name as promotion_name
            FROM transactions t
            LEFT JOIN products p ON t.product_id = p.id
            LEFT JOIN dispensers d ON t.dispenser_id = d.id
            LEFT JOIN promotions pr ON t.promotion_id = pr.id
            WHERE DATE(t.created_at) = ?
        ORDER BY t.created_at DESC
            `, [date]);
        console.log(`[DEBUG] Transactions found: ${transactions.length} `);

        // 2. Meter Summary (Group by Dispenser + Product)
        // Note: This logic assumes start_meter and end_meter are recorded correctly in transactions
        const [meterSummary] = await db.query(`
    SELECT
    d.name as dispenser_name,
        p.name as product_name,
        MIN(t.start_meter) as start_meter,
        MAX(t.end_meter) as end_meter,
        SUM(t.liters) as total_volume
            FROM transactions t
            JOIN dispensers d ON t.dispenser_id = d.id
            JOIN products p ON t.product_id = p.id
            WHERE DATE(t.created_at) = ?
        GROUP BY t.dispenser_id, t.product_id
            `, [date]);
        console.log(`[DEBUG] Meter summary rows: ${meterSummary.length} `);

        // 3. Promotion Summary
        const [promotionSummary] = await db.query(`
    SELECT
    pr.name as promotion_name,
        COUNT(t.id) as usage_count,
        SUM(t.total_discount) as total_discount,
        SUM(t.total_get_free) as total_giveaway
            FROM transactions t
            JOIN promotions pr ON t.promotion_id = pr.id
            WHERE DATE(t.created_at) = ?
        GROUP BY t.promotion_id
            `, [date]);
        console.log(`[DEBUG] Promotion summary rows: ${promotionSummary.length} `);

        res.json({
            transactions,
            meter_summary: meterSummary,
            promotion_summary: promotionSummary
        });
    } catch (err) {
        console.error('[ERROR] /api/daily-details:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/close-day', async (req, res) => {
    const { date } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Calculate Summary
        const [sales] = await connection.query(`
    SELECT
    SUM(amount) as total_sales,
        SUM(CASE WHEN payment_type = 'cash' THEN amount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN payment_type = 'promptpay' THEN amount ELSE 0 END) as transfer_sales,
        SUM(CASE WHEN payment_type = 'credit' THEN amount ELSE 0 END) as credit_sales
            FROM transactions 
            WHERE DATE(created_at) = ?
        `, [date]);

        const [expenses] = await connection.query('SELECT SUM(amount) as total_expenses FROM expenses WHERE DATE(date) = ?', [date]);

        const total_sales = parseFloat(sales[0].total_sales || 0);
        const cash_sales = parseFloat(sales[0].cash_sales || 0);
        const transfer_sales = parseFloat(sales[0].transfer_sales || 0);
        const credit_sales = parseFloat(sales[0].credit_sales || 0);
        const total_expenses_val = parseFloat(expenses[0].total_expenses || 0);
        const net_income = total_sales - total_expenses_val;

        // 2. Check if already closed
        const [existing] = await connection.query('SELECT id FROM daily_closings WHERE date = ?', [date]);
        if (existing.length > 0) {
            await connection.query(`
                UPDATE daily_closings 
                SET total_sales =?, cash_sales =?, transfer_sales =?, credit_sales =?, total_expenses =?, net_income =?, closed_at = NOW()
                WHERE date =?
        `, [total_sales, cash_sales, transfer_sales, credit_sales, total_expenses_val, net_income, date]);
        } else {
            await connection.query(`
                INSERT INTO daily_closings(date, total_sales, cash_sales, transfer_sales, credit_sales, total_expenses, net_income, closed_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, NOW())
        `, [date, total_sales, cash_sales, transfer_sales, credit_sales, total_expenses_val, net_income]);
        }

        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// --- Advanced Reports ---
app.get('/api/reports/shift', async (req, res) => {
    const { startShiftId, endShiftId } = req.query;
    try {
        // Fetch aggregated data based on shift range
        // This is a simplified example, real implementation would be more complex joins
        const [rows] = await db.query(`
    SELECT
    t.payment_type,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count
            FROM transactions t
            JOIN shifts s ON t.created_at BETWEEN s.start_time AND IFNULL(s.end_time, NOW())
            WHERE s.id BETWEEN ? AND ?
        GROUP BY t.payment_type
            `, [startShiftId, endShiftId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/daily', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const [rows] = await db.query(`
    SELECT
    DATE(created_at) as date,
        SUM(amount) as total_sales,
        SUM(CASE WHEN payment_type = 'cash' THEN amount ELSE 0 END) as cash_sales
            FROM transactions
            WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
            `, [startDate, endDate]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// --- Shift Management APIs ---

// Get current open shift for user
app.get('/api/shifts/current', async (req, res) => {
    const { user_id } = req.query;
    try {
        const [rows] = await db.query(
            'SELECT * FROM shifts WHERE user_id = ? AND status = "open" ORDER BY start_time DESC LIMIT 1',
            [user_id]
        );
        res.json(rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all shifts for dropdown
app.get('/api/shifts', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, u.username 
            FROM shifts s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.id DESC LIMIT 50
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get shift summary
app.get('/api/shifts/summary', async (req, res) => {
    const { user_id } = req.query;
    try {
        // 1. Get current open shift
        const [shifts] = await db.query(
            'SELECT * FROM shifts WHERE user_id = ? AND status = "open" ORDER BY start_time DESC LIMIT 1',
            [user_id]
        );

        if (shifts.length === 0) {
            return res.status(404).json({ error: 'No open shift found' });
        }

        const shift = shifts[0];

        // 2. Calculate sales since shift start
        const [transactions] = await db.query(
            'SELECT payment_type, SUM(amount) as total FROM transactions WHERE created_at >= ? AND status = "completed" GROUP BY payment_type',
            [shift.start_time]
        );

        let cash_sales = 0;
        let transfer_sales = 0;
        let credit_sales = 0; // Placeholder

        transactions.forEach(t => {
            if (t.payment_type === 'cash') cash_sales += parseFloat(t.total || 0);
            else if (t.payment_type === 'promptpay') transfer_sales += parseFloat(t.total || 0);
        });

        const total_sales = cash_sales + transfer_sales + credit_sales;

        res.json({
            start_cash: parseFloat(shift.start_cash),
            cash_sales,
            transfer_sales,
            credit_sales,
            total_sales
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Open Shift
app.post('/api/shifts/open', async (req, res) => {
    const { user_id, start_cash } = req.body;
    try {
        // Check if already open
        const [existing] = await db.query(
            'SELECT * FROM shifts WHERE user_id = ? AND status = "open"',
            [user_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Shift already open' });
        }

        const [result] = await db.query(
            'INSERT INTO shifts (user_id, start_cash, status) VALUES (?, ?, "open")',
            [user_id, start_cash]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Held Sales Management ---

// Get all held sales
app.get('/api/held-sales', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM held_sales');
        // Parse JSON data
        const sales = rows.map(row => ({
            ...row,
            sale_data: typeof row.sale_data === 'string' ? JSON.parse(row.sale_data) : row.sale_data
        }));
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save/Update held sale
app.post('/api/held-sales', async (req, res) => {
    const { id, nozzle_id, sale_data } = req.body;
    try {
        if (id) {
            // Update existing
            await db.query(
                'UPDATE held_sales SET sale_data = ? WHERE id = ?',
                [JSON.stringify(sale_data), id]
            );
            res.json({ success: true, id });
        } else {
            // Create new
            const [result] = await db.query(
                'INSERT INTO held_sales (nozzle_id, sale_data) VALUES (?, ?)',
                [nozzle_id, JSON.stringify(sale_data)]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete held sale
app.delete('/api/held-sales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM held_sales WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Close Shift
app.post('/api/shifts/close', async (req, res) => {
    const { id, end_cash } = req.body;
    try {
        await db.query(
            'UPDATE shifts SET end_time = CURRENT_TIMESTAMP, end_cash = ?, status = "closed" WHERE id = ?',
            [end_cash, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Promotions Management ---
app.get('/api/promotions', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM promotions ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/promotions', async (req, res) => {
    const { name, type, condition_amount, value, product_id, start_date, end_date, active } = req.body;
    try {
        await db.query(
            'INSERT INTO promotions (name, type, condition_amount, value, product_id, start_date, end_date, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name,
                type,
                condition_amount || 0,
                value || 0,
                product_id || null,
                start_date,
                end_date,
                active
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/promotions/:id', async (req, res) => {
    const { name, type, condition_amount, value, product_id, start_date, end_date, active } = req.body;
    try {
        await db.query(
            'UPDATE promotions SET name = ?, type = ?, condition_amount = ?, value = ?, product_id = ?, start_date = ?, end_date = ?, active = ? WHERE id = ?',
            [
                name,
                type,
                condition_amount || 0,
                value || 0,
                product_id || null,
                start_date,
                end_date,
                active,
                req.params.id
            ]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/promotions/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- Held Sales ---

app.get('/api/held-sales', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM held_sales ORDER BY created_at DESC');
        // Parse sale_data if it's stored as string
        const results = rows.map(row => ({
            ...row,
            sale_data: typeof row.sale_data === 'string' ? JSON.parse(row.sale_data) : row.sale_data
        }));
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/held-sales', async (req, res) => {
    const { id, nozzle_id, sale_data } = req.body;
    try {
        const saleDataStr = JSON.stringify(sale_data);

        if (id) {
            // Update
            await db.query(
                'UPDATE held_sales SET nozzle_id = ?, sale_data = ?, updated_at = NOW() WHERE id = ?',
                [nozzle_id, saleDataStr, id]
            );
            res.json({ success: true, id });
        } else {
            // Insert
            const [result] = await db.query(
                'INSERT INTO held_sales (nozzle_id, sale_data) VALUES (?, ?)',
                [nozzle_id, saleDataStr]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/held-sales/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM held_sales WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Backup & Restore ---

const { exec } = require('child_process');
// const path = require('path'); // Removed duplicate
const fs = require('fs');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Image Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    // Return the URL relative to the server
    const imageUrl = `/ uploads / ${req.file.filename} `;
    res.json({ url: imageUrl });
});

// Backup Database
app.get('/api/backup', async (req, res) => {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup - ${date}.sql`;
    const backupPath = path.join(__dirname, 'backups', filename);

    // Ensure backups directory exists
    if (!fs.existsSync(path.join(__dirname, 'backups'))) {
        fs.mkdirSync(path.join(__dirname, 'backups'));
    }

    // Command to dump database
    // Assuming user is 'root' and no password as per previous context, adjust if needed
    const cmd = `mysqldump - u root fuel_pos > "${backupPath}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backup error: ${error.message} `);
            return res.status(500).json({ error: 'Backup failed' });
        }
        res.download(backupPath);
    });
});

// Restore Database
app.post('/api/restore', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Command to restore database
    const cmd = `mysql - u root fuel_pos < "${filePath}"`;

    exec(cmd, (error, stdout, stderr) => {
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        if (error) {
            console.error(`Restore error: ${error.message} `);
            return res.status(500).json({ error: 'Restore failed' });
        }
        res.json({ success: true, message: 'Database restored successfully' });
    });
});

// --- Specific Reports ---

// 1. Sales by Nozzle
app.get('/api/reports/sales-by-nozzle', async (req, res) => {
    const { startDate, endDate, startShiftId, endShiftId } = req.query;
    try {
        let query = `
    SELECT
    d.name as dispenser_name,
        n.nozzle_number,
        p.name as product_name,
        COUNT(t.id) as transaction_count,
        SUM(t.liters) as total_liters,
        SUM(t.amount) as total_amount
            FROM transactions t
            JOIN nozzles n ON t.dispenser_id = n.dispenser_id AND t.product_id = n.product_id-- Approximation, ideally t.nozzle_id
            JOIN dispensers d ON t.dispenser_id = d.id
            JOIN products p ON t.product_id = p.id
            WHERE 1 = 1
        `;
        const params = [];

        if (startShiftId && endShiftId) {
            const [startShift] = await db.query('SELECT start_time FROM shifts WHERE id = ?', [startShiftId]);
            const [endShift] = await db.query('SELECT end_time FROM shifts WHERE id = ?', [endShiftId]);

            if (startShift.length > 0 && endShift.length > 0) {
                const startTime = startShift[0].start_time;
                let endTime = endShift[0].end_time;
                if (!endTime) endTime = new Date();

                query += ' AND t.created_at >= ? AND t.created_at <= ?';
                params.push(startTime, endTime);
            }
        } else if (startDate && endDate) {
            query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY d.id, n.id, p.id ORDER BY d.name, n.nozzle_number';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Sales by Fuel Type
app.get('/api/reports/sales-by-fuel-type', async (req, res) => {
    const { startDate, endDate, startShiftId, endShiftId } = req.query;
    try {
        let query = `
    SELECT
    p.name as product_name,
        p.price as current_price,
        COUNT(t.id) as transaction_count,
        SUM(t.liters) as total_liters,
        SUM(t.amount) as total_amount
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE p.type = 'fuel'
        `;
        const params = [];

        if (startShiftId && endShiftId) {
            const [startShift] = await db.query('SELECT start_time FROM shifts WHERE id = ?', [startShiftId]);
            const [endShift] = await db.query('SELECT end_time FROM shifts WHERE id = ?', [endShiftId]);

            if (startShift.length > 0 && endShift.length > 0) {
                const startTime = startShift[0].start_time;
                let endTime = endShift[0].end_time;
                if (!endTime) endTime = new Date();

                query += ' AND t.created_at >= ? AND t.created_at <= ?';
                params.push(startTime, endTime);
            }
        } else if (startDate && endDate) {
            query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY p.id ORDER BY p.name';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Sales by Goods
app.get('/api/reports/sales-by-goods', async (req, res) => {
    const { startDate, endDate, startShiftId, endShiftId } = req.query;
    try {
        // Note: This assumes transactions table handles goods directly or via cart logic. 
        // For now, querying transactions where product type is goods.
        let query = `
    SELECT
    p.name as product_name,
        p.price as unit_price,
        COUNT(t.id) as transaction_count,
        SUM(t.amount) as total_amount
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE p.type = 'goods'
        `;
        const params = [];

        if (startShiftId && endShiftId) {
            const [startShift] = await db.query('SELECT start_time FROM shifts WHERE id = ?', [startShiftId]);
            const [endShift] = await db.query('SELECT end_time FROM shifts WHERE id = ?', [endShiftId]);

            if (startShift.length > 0 && endShift.length > 0) {
                const startTime = startShift[0].start_time;
                let endTime = endShift[0].end_time;
                if (!endTime) endTime = new Date();

                query += ' AND t.created_at >= ? AND t.created_at <= ?';
                params.push(startTime, endTime);
            }
        } else if (startDate && endDate) {
            query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY p.id ORDER BY total_amount DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Sales by Payment Type (Cash, Transfer, Credit)
app.get('/api/reports/sales-by-payment', async (req, res) => {
    const { startDate, endDate, startShiftId, endShiftId, type } = req.query; // type: 'cash', 'promptpay', 'credit'
    try {
        let query = `
    SELECT
    t.id as transaction_id,
        t.created_at,
        p.name as product_name,
        t.amount,
        t.payment_type,
        m.name as member_name
            FROM transactions t
            LEFT JOIN products p ON t.product_id = p.id
            LEFT JOIN members m ON t.member_id = m.id
            WHERE 1 = 1
        `;
        const params = [];

        if (type) {
            query += ' AND t.payment_type = ?';
            params.push(type);
        }

        if (startShiftId && endShiftId) {
            const [startShift] = await db.query('SELECT start_time FROM shifts WHERE id = ?', [startShiftId]);
            const [endShift] = await db.query('SELECT end_time FROM shifts WHERE id = ?', [endShiftId]);

            if (startShift.length > 0 && endShift.length > 0) {
                const startTime = startShift[0].start_time;
                let endTime = endShift[0].end_time;
                if (!endTime) endTime = new Date();

                query += ' AND t.created_at >= ? AND t.created_at <= ?';
                params.push(startTime, endTime);
            }
        } else if (startDate && endDate) {
            query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY t.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Sales by Meter
app.get('/api/reports/sales-by-meter', async (req, res) => {
    const { startDate, endDate, startShiftId, endShiftId } = req.query;
    try {
        let query = `
    SELECT
    d.name as dispenser_name,
        p.name as product_name,
        MIN(t.start_meter) as start_meter,
        MAX(t.end_meter) as end_meter,
        SUM(t.liters) as total_liters,
        SUM(t.amount) as total_amount
            FROM transactions t
            JOIN dispensers d ON t.dispenser_id = d.id
            JOIN products p ON t.product_id = p.id
            WHERE 1 = 1
        `;
        const params = [];

        if (startShiftId && endShiftId) {
            const [startShift] = await db.query('SELECT start_time FROM shifts WHERE id = ?', [startShiftId]);
            const [endShift] = await db.query('SELECT end_time FROM shifts WHERE id = ?', [endShiftId]);

            if (startShift.length > 0 && endShift.length > 0) {
                const startTime = startShift[0].start_time;
                let endTime = endShift[0].end_time;
                if (!endTime) endTime = new Date();

                query += ' AND t.created_at >= ? AND t.created_at <= ?';
                params.push(startTime, endTime);
            }
        } else if (startDate && endDate) {
            query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY d.id, p.id ORDER BY d.name, p.name';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `);
});
