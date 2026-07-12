const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// GET all drivers
router.get('/', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM drivers WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
        query += ' AND status = ?';
        params.push(status);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// GET single driver by license number
router.get('/:licenseNumber', (req, res) => {
    db.query('SELECT * FROM drivers WHERE licenseNumber = ?', [req.params.licenseNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) return res.status(404).json({ error: 'Driver not found' });
        res.json(results[0]);
    });
});

const dlRegex = /^[A-Za-z]{2}-\d{13}$/;

// POST a new driver (Restricted to Fleet Manager and Safety Officer)
router.post('/', requireRole(['Fleet Manager', 'Safety Officer']), (req, res) => {
    const { licenseNumber, name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    if (!dlRegex.test(licenseNumber)) {
        return res.status(400).json({
            error: 'Invalid Driving License format. Must follow DL format SS-RRYYYYNNNNNNN (e.g., AP-3120151234567)'
        });
    }

    const driverStatus = status || 'Available';
    const initialSafetyScore = safetyScore || 100;

    const query = `
        INSERT INTO drivers (licenseNumber, name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [licenseNumber, name, licenseCategory, licenseExpiryDate, contactNumber, initialSafetyScore, driverStatus];

    db.query(query, params, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'License number must be unique' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ licenseNumber, message: 'Driver created successfully' });
    });
});

// PUT (Update) a driver's status (Restricted to Fleet Manager and Safety Officer)
router.put('/:licenseNumber/status', requireRole(['Fleet Manager', 'Safety Officer']), (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    db.query(
        'UPDATE drivers SET status = ? WHERE licenseNumber = ?',
        [status, req.params.licenseNumber],
        function (err, result) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Driver not found' });
            }
            res.json({ message: 'Driver status updated successfully' });
        }
    );
});

// PUT (Update) full driver profile
router.put('/:licenseNumber', requireRole(['Fleet Manager', 'Safety Officer']), (req, res) => {
    const { name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;
    const query = `
        UPDATE drivers 
        SET name = ?, licenseCategory = ?, licenseExpiryDate = ?, contactNumber = ?, safetyScore = ?, status = ?
        WHERE licenseNumber = ?
    `;
    const params = [name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, req.params.licenseNumber];

    db.query(query, params, function (err, result) {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Driver not found' });
        res.json({ message: 'Driver updated successfully' });
    });
});

// DELETE a driver
router.delete('/:licenseNumber', requireRole(['Fleet Manager', 'Safety Officer']), (req, res) => {
    db.query('DELETE FROM drivers WHERE licenseNumber = ?', [req.params.licenseNumber], function (err, result) {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ error: 'Cannot delete driver because they are currently assigned to one or more trips.' });
            }
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Driver not found' });
        res.json({ message: 'Driver deleted successfully' });
    });
});

module.exports = router;
