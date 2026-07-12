const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// GET all fuel logs
router.get('/', (req, res) => {
    db.query('SELECT * FROM fuel_logs', [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST a new fuel log
router.post('/', requireRole(['Fleet Manager', 'Driver']), (req, res) => {
    const { vehicleReg, tripId, liters, cost, date } = req.body;
    const logId = 'FUEL-' + Date.now();
    
    db.query(
        'INSERT INTO fuel_logs (logId, vehicleReg, liters, cost, date) VALUES (?, ?, ?, ?, ?)',
        [logId, vehicleReg, liters, cost, date],
        function (err, result) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ logId, message: 'Fuel log created successfully' });
        }
    );
});

module.exports = router;
