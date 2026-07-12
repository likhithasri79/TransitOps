const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// GET all vehicles
router.get('/', (req, res) => {
    const { status, type } = req.query;
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
        query += ' AND status = ?';
        params.push(status);
    }

    if (type && type !== 'All') {
        query += ' AND type = ?';
        params.push(type);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET single vehicle by registration number
router.get('/:registrationNumber', (req, res) => {
    db.query('SELECT * FROM vehicles WHERE registrationNumber = ?', [req.params.registrationNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(results[0]);
    });
});

// POST a new vehicle (Restricted to Fleet Manager)
router.post('/', requireRole(['Fleet Manager']), (req, res) => {
    const { registrationNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

    const vehicleStatus = status || 'Available';

    const query = `
        INSERT INTO vehicles (registrationNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [registrationNumber, nameModel, type, maxLoadCapacity, odometer, acquisitionCost, vehicleStatus];

    db.query(query, params, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Registration number already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ registrationNumber, message: 'Vehicle created successfully' });
    });
});

// PUT (Update) a vehicle's status (Restricted to Fleet Manager)
router.put('/:registrationNumber/status', requireRole(['Fleet Manager']), (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    db.query(
        'UPDATE vehicles SET status = ? WHERE registrationNumber = ?',
        [status, req.params.registrationNumber],
        function (err, result) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }
            res.json({ message: 'Vehicle status updated successfully' });
        }
    );
});

// PUT (Update) full vehicle profile
router.put('/:registrationNumber', requireRole(['Fleet Manager']), (req, res) => {
    const { nameModel, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;
    const query = `
        UPDATE vehicles 
        SET nameModel = ?, type = ?, maxLoadCapacity = ?, odometer = ?, acquisitionCost = ?, status = ?
        WHERE registrationNumber = ?
    `;
    const params = [nameModel, type, maxLoadCapacity, odometer, acquisitionCost, status, req.params.registrationNumber];

    db.query(query, params, function (err, result) {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ message: 'Vehicle updated successfully' });
    });
});

// DELETE a vehicle
router.delete('/:registrationNumber', requireRole(['Fleet Manager']), (req, res) => {
    db.query('DELETE FROM vehicles WHERE registrationNumber = ?', [req.params.registrationNumber], function (err, result) {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ error: 'Cannot delete vehicle because it has associated trips, maintenance, or fuel logs.' });
            }
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted successfully' });
    });
});

module.exports = router;
