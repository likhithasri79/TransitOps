const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reports - Dashboard KPIs & Analytics Aggregator
router.get('/', async (req, res) => {
    try {
        const promisePool = db.promise();
        
        // Dashboard KPIs
        const [vehicles] = await promisePool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="Available" THEN 1 ELSE 0 END) as available, SUM(CASE WHEN status="In Shop" THEN 1 ELSE 0 END) as inMaintenance FROM vehicles');
        
        const [trips] = await promisePool.query('SELECT COUNT(*) as totalTrips, SUM(CASE WHEN status="Dispatched" THEN 1 ELSE 0 END) as activeTrips, SUM(CASE WHEN status="Draft" THEN 1 ELSE 0 END) as pendingTrips, SUM(plannedDistance) as totalDistance FROM trips');
        
        const [drivers] = await promisePool.query('SELECT SUM(CASE WHEN status="On Trip" THEN 1 ELSE 0 END) as onDuty FROM drivers');
        
        const [expenses] = await promisePool.query('SELECT SUM(cost) as totalExpenses FROM expenses');
        
        const [fuel] = await promisePool.query('SELECT SUM(liters) as totalLiters, SUM(cost) as totalFuelCost FROM fuel_logs');

        // Derived Dashboard KPIs
        const totalVehicles = vehicles[0].total || 0;
        const activeTrips = trips[0].activeTrips || 0;
        const fleetUtilization = totalVehicles > 0 ? ((activeTrips / totalVehicles) * 100).toFixed(2) : 0;
        const totalDistance = trips[0].totalDistance || 0;
        const totalFuelLiters = fuel[0].totalLiters || 0;
        const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : 0;

        // Vehicle ROI & Reports
        const [vehicleStats] = await promisePool.query(`
            SELECT 
                v.registrationNumber, 
                v.nameModel, 
                v.acquisitionCost,
                (SELECT COUNT(*) FROM trips t WHERE t.vehicleReg = v.registrationNumber AND t.status='Completed') as completedTrips,
                (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs m WHERE m.vehicleReg = v.registrationNumber) as totalMaintenance,
                (SELECT COALESCE(SUM(cost), 0) FROM fuel_logs f WHERE f.vehicleReg = v.registrationNumber) as totalFuel
            FROM vehicles v
        `);

        const roiData = vehicleStats.map(v => {
            const maintenanceAndFuel = Number(v.totalMaintenance) + Number(v.totalFuel);
            const revenue = v.completedTrips * 1500; // Flat $1500 revenue per completed trip
            const acqCost = Number(v.acquisitionCost) || 1; // Avoid division by zero
            
            // Formula exactly as requested: [Revenue - (Maintenance + Fuel)] / Acquisition Cost
            const roi = ((revenue - maintenanceAndFuel) / acqCost).toFixed(4);

            return {
                registrationNumber: v.registrationNumber,
                nameModel: v.nameModel,
                revenue,
                maintenanceAndFuel,
                acquisitionCost: acqCost,
                vehicleROI: parseFloat(roi)
            };
        });

        res.json({
            dashboard: {
                activeVehicles: totalVehicles, 
                availableVehicles: vehicles[0].available || 0,
                vehiclesInMaintenance: vehicles[0].inMaintenance || 0,
                activeTrips: activeTrips,
                pendingTrips: trips[0].pendingTrips || 0,
                driversOnDuty: drivers[0].onDuty || 0,
                fleetUtilization: parseFloat(fleetUtilization)
            },
            reports: {
                fuelEfficiency: parseFloat(fuelEfficiency),
                operationalCost: (Number(expenses[0].totalExpenses || 0) + Number(fuel[0].totalFuelCost || 0)),
                vehicleROI: roiData
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
