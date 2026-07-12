const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// GET all trips
router.get('/', (req, res) => {
    db.query('SELECT * FROM trips', [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST / - Create a new Draft trip
router.post('/', requireRole(['Fleet Manager']), async (req, res) => {
    const { source, destination, vehicleReg, driverLicense, cargoWeight, plannedDistance } = req.body;
    const tripId = 'TRP-' + Date.now();
    
    try {
        const promisePool = db.promise();

        // 1. Validate Vehicle
        const [vehicles] = await promisePool.query('SELECT * FROM vehicles WHERE registrationNumber = ?', [vehicleReg]);
        if (vehicles.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        const vehicle = vehicles[0];

        if (vehicle.status !== 'Available') {
            return res.status(400).json({ error: `Vehicle is currently ${vehicle.status}` });
        }
        if (cargoWeight > vehicle.maxLoadCapacity) {
            return res.status(400).json({ error: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)` });
        }

        // 2. Validate Driver
        const [drivers] = await promisePool.query('SELECT * FROM drivers WHERE licenseNumber = ?', [driverLicense]);
        if (drivers.length === 0) return res.status(404).json({ error: 'Driver not found' });
        const driver = drivers[0];

        if (driver.status !== 'Available') {
            return res.status(400).json({ error: `Driver is currently ${driver.status}` });
        }
        
        const expiryDate = new Date(driver.licenseExpiryDate);
        if (expiryDate <= new Date()) {
            return res.status(400).json({ error: 'Driver license is expired' });
        }

        // 3. Insert Trip as Draft
        await promisePool.query(
            `INSERT INTO trips (tripId, source, destination, vehicleReg, driverLicense, cargoWeight, plannedDistance, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft')`,
            [tripId, source, destination, vehicleReg, driverLicense, cargoWeight, plannedDistance]
        );

        res.status(201).json({ tripId, message: 'Draft Trip created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /dispatch - Dispatch an existing Draft trip
router.post('/dispatch', requireRole(['Fleet Manager', 'Dispatcher']), async (req, res) => {
    const { tripId } = req.body;
    
    try {
        const promisePool = db.promise();
        
        const [trips] = await promisePool.query('SELECT * FROM trips WHERE tripId = ? AND status = "Draft"', [tripId]);
        if (trips.length === 0) return res.status(404).json({ error: 'Draft trip not found' });
        const trip = trips[0];

        const connection = await promisePool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query('UPDATE trips SET status = "Dispatched" WHERE tripId = ?', [tripId]);
            await connection.query('UPDATE vehicles SET status = "On Trip" WHERE registrationNumber = ?', [trip.vehicleReg]);
            await connection.query('UPDATE drivers SET status = "On Trip" WHERE licenseNumber = ?', [trip.driverLicense]);

            await connection.commit();
            res.status(200).json({ message: 'Trip successfully dispatched!' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /complete - Complete a trip (Allowed for Fleet Manager and Drivers)
router.post('/complete', requireRole(['Fleet Manager', 'Driver']), async (req, res) => {
    const { tripId, finalOdometer, fuelLiters, fuelCost } = req.body;

    try {
        const promisePool = db.promise();
        
        // Find Trip
        const [trips] = await promisePool.query('SELECT * FROM trips WHERE tripId = ? AND status = "Dispatched"', [tripId]);
        if (trips.length === 0) return res.status(404).json({ error: 'Active trip not found' });
        const trip = trips[0];

        const connection = await promisePool.getConnection();
        await connection.beginTransaction();

        try {
            // Update Trip
            await connection.query(
                'UPDATE trips SET status = "Completed", finalOdometer = ?, fuelConsumed = ? WHERE tripId = ?',
                [finalOdometer, fuelLiters || null, tripId]
            );

            // Update Vehicle (Odometer and Status)
            await connection.query(
                'UPDATE vehicles SET status = "Available", odometer = ? WHERE registrationNumber = ?',
                [finalOdometer, trip.vehicleReg]
            );

            // Update Driver Status
            await connection.query('UPDATE drivers SET status = "Available" WHERE licenseNumber = ?', [trip.driverLicense]);

            // Automatically Log Fuel (if provided)
            if (fuelLiters && fuelLiters > 0) {
                const calculatedCost = fuelCost !== undefined && fuelCost !== null ? fuelCost : (fuelLiters * 1.5);
                const logId = `FL-${Date.now()}`;
                await connection.query(
                    `INSERT INTO fuel_logs (logId, vehicleReg, liters, cost, date) VALUES (?, ?, ?, ?, CURDATE())`,
                    [logId, trip.vehicleReg, fuelLiters, calculatedCost]
                );
            }

            await connection.commit();
            res.json({ message: 'Trip completed successfully!' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /cancel - Cancel a trip (Allowed for Fleet Manager)
router.post('/cancel', requireRole(['Fleet Manager']), async (req, res) => {
    const { tripId } = req.body;

    try {
        const promisePool = db.promise();
        const [trips] = await promisePool.query('SELECT * FROM trips WHERE tripId = ? AND status = "Dispatched"', [tripId]);
        
        if (trips.length === 0) return res.status(404).json({ error: 'Active trip not found' });
        const trip = trips[0];

        const connection = await promisePool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query('UPDATE trips SET status = "Cancelled" WHERE tripId = ?', [tripId]);
            await connection.query('UPDATE vehicles SET status = "Available" WHERE registrationNumber = ?', [trip.vehicleReg]);
            await connection.query('UPDATE drivers SET status = "Available" WHERE licenseNumber = ?', [trip.driverLicense]);

            await connection.commit();
            res.json({ message: 'Trip cancelled successfully. Vehicle and Driver restored to Available.' });
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
