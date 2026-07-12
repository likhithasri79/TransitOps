const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'transitops.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password_hash TEXT,
                role TEXT
            )`);

            // Vehicles Table
            db.run(`CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reg_number TEXT UNIQUE,
                name TEXT,
                type TEXT,
                capacity INTEGER,
                odometer INTEGER,
                acquisition_cost REAL,
                status TEXT
            )`);

            // Drivers Table
            db.run(`CREATE TABLE IF NOT EXISTS drivers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                license_no TEXT UNIQUE,
                license_category TEXT,
                license_expiry TEXT,
                contact TEXT,
                safety_score INTEGER,
                status TEXT
            )`);

            // Trips Table
            db.run(`CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT,
                destination TEXT,
                vehicle_id INTEGER,
                driver_id INTEGER,
                cargo_weight INTEGER,
                planned_distance INTEGER,
                status TEXT,
                FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
                FOREIGN KEY(driver_id) REFERENCES drivers(id)
            )`);

            // Maintenance Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS maintenance_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER,
                description TEXT,
                cost REAL,
                date TEXT,
                status TEXT,
                FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
            )`);

            // Fuel Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS fuel_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER,
                trip_id INTEGER,
                liters REAL,
                cost REAL,
                date TEXT,
                FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
                FOREIGN KEY(trip_id) REFERENCES trips(id)
            )`);

            console.log("Database tables verified/created.");
        });
    }
});

module.exports = db;
