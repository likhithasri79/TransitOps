const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// POST a new expense
router.post('/', requireRole(['Fleet Manager', 'Financial Analyst']), (req, res) => {
    const { expenseId, vehicleReg, type, cost, description, date } = req.body;
    
    if (!expenseId || !vehicleReg || !type || !cost || !date) {
        return res.status(400).json({ error: 'Missing required expense fields' });
    }

    const query = `
        INSERT INTO expenses (expenseId, vehicleReg, type, cost, description, date) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [expenseId, vehicleReg, type, cost, description, date];

    db.query(query, params, function(err, result) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Expense logged successfully' });
    });
});

// GET all expenses
router.get('/', (req, res) => {
    db.query('SELECT * FROM expenses', [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
