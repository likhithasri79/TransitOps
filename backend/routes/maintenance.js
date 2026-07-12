const express = require('express');
const router = express.Router();
const db = require('../db');

// POST - Open a maintenance log
router.post('/', async (req, res) => {
    const { logId, vehicleReg, description, type, cost } = req.body;
    
    try {
        const promisePool = db.promise();
        const connection = await promisePool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert Maintenance Log
            await connection.query(
                `INSERT INTO maintenance_logs (logId, vehicleReg, description, type, cost, dateOpened, status) 
                 VALUES (?, ?, ?, ?, ?, CURDATE(), 'Open')`,
                [logId, vehicleReg, description, type, cost]
            );

            // Update Vehicle Status to 'In Shop'
            await connection.query('UPDATE vehicles SET status = "In Shop" WHERE registrationNumber = ?', [vehicleReg]);

            await connection.commit();
            res.status(201).json({ message: 'Maintenance log created and vehicle placed In Shop' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Close a maintenance log
router.post('/close', async (req, res) => {
    const { logId } = req.body;

    try {
        const promisePool = db.promise();
        const [logs] = await promisePool.query('SELECT * FROM maintenance_logs WHERE logId = ?', [logId]);
        if (logs.length === 0) return res.status(404).json({ error: 'Log not found' });
        
        const log = logs[0];
        if (log.status === 'Closed') return res.status(400).json({ error: 'Log is already closed' });

        const connection = await promisePool.getConnection();
        await connection.beginTransaction();

        try {
            // Update Maintenance Log
            await connection.query(
                'UPDATE maintenance_logs SET status = "Closed", dateClosed = CURDATE() WHERE logId = ?',
                [logId]
            );

            // Update Vehicle Status back to Available
            await connection.query('UPDATE vehicles SET status = "Available" WHERE registrationNumber = ?', [log.vehicleReg]);

            await connection.commit();
            res.json({ message: 'Maintenance completed and vehicle is Available' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
