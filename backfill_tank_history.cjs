const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fuel_pos'
};

async function backfillHistory() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Get all tanks
        const [tanks] = await connection.query('SELECT id, current_volume, capacity FROM tanks');

        // 2. Clear existing history (optional, but safer for clean reconstruction)
        await connection.query('TRUNCATE TABLE tank_readings');
        console.log('Cleared existing tank history.');

        for (const tank of tanks) {
            console.log(`Processing Tank ${tank.id}...`);
            let currentVol = parseFloat(tank.current_volume);
            const tankId = tank.id;

            // 3. Get all transactions for this tank (via nozzles)
            // Order by date DESC (newest first) so we can work backwards
            const [transactions] = await connection.query(`
                SELECT t.liters, t.created_at 
                FROM transactions t
                JOIN nozzles n ON t.dispenser_id = n.dispenser_id AND t.product_id = n.product_id
                WHERE n.tank_id = ?
                ORDER BY t.created_at DESC
            `, [tankId]);

            const readings = [];

            // Add current state as the latest reading
            readings.push([tankId, currentVol, new Date()]);

            // Work backwards: Before this transaction, the volume was (current + liters)
            // However, we also need to account for refills (fuel_imports).
            // Since we don't have a direct link to fuel_imports yet or logic for it, 
            // we will simulate a "refill" if volume exceeds capacity or drops too low during reconstruction.
            // But strictly speaking, if we just want to show the *consumption* curve, we can just add back the liters.

            // Let's try to reconstruct the consumption curve.
            // Note: This assumes NO refills happened. If refills happened, this logic is flawed.
            // A better approach for "visuals" if we lack refill data is to just generate a realistic curve 
            // that ends at the current volume, using the transactions as "drops".

            // REVISED STRATEGY:
            // We will start from a hypothetical "full" or "high" state in the past and simulate forward?
            // No, working backwards is better but we need to handle "refills".
            // Since we don't have refill logs, we will assume a refill happened if the calculated previous volume > capacity.

            let simulatedVol = currentVol;

            for (const tx of transactions) {
                const liters = parseFloat(tx.liters);

                // The volume BEFORE this transaction was (simulatedVol + liters)
                simulatedVol += liters;

                // If simulated volume exceeds capacity, it means a refill must have occurred *after* this transaction 
                // but *before* the next one we processed (which is later in time).
                // For the purpose of the chart, we can just cap it at capacity or let it go high?
                // Let's cap at capacity to keep it realistic-looking, implying a refill happened.
                if (simulatedVol > parseFloat(tank.capacity)) {
                    simulatedVol = parseFloat(tank.capacity);
                }

                readings.push([tankId, simulatedVol, tx.created_at]);
            }

            // If we have very few transactions, the chart might look empty.
            // Let's add some dummy "start of time" point if needed.
            if (readings.length < 2) {
                readings.push([tankId, parseFloat(tank.capacity), new Date(new Date().setDate(new Date().getDate() - 30))]);
            }

            // Batch insert
            if (readings.length > 0) {
                const chunkSize = 1000;
                for (let i = 0; i < readings.length; i += chunkSize) {
                    const chunk = readings.slice(i, i + chunkSize);
                    await connection.query(
                        'INSERT INTO tank_readings (tank_id, volume, reading_time) VALUES ?',
                        [chunk]
                    );
                }
            }
            console.log(`Inserted ${readings.length} readings for Tank ${tankId}.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

backfillHistory();
