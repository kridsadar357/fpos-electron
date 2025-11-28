const db = require('./db.cjs');
const bcrypt = require('bcryptjs');

async function seedUser() {
    const username = 'admin';
    const password = 'password123';
    const role = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            console.log('User already exists');
            process.exit(0);
        }

        await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]);

        console.log('Default admin user created');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
}

seedUser();
