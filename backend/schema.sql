CREATE DATABASE IF NOT EXISTS transitops;
USE transitops;

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
    registrationNumber VARCHAR(50) PRIMARY KEY,
    nameModel VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    maxLoadCapacity INT NOT NULL,
    odometer INT NOT NULL,
    acquisitionCost DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS drivers (
    licenseNumber VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    licenseCategory VARCHAR(50) NOT NULL,
    licenseExpiryDate DATE NOT NULL,
    contactNumber VARCHAR(50) NOT NULL,
    safetyScore INT DEFAULT 100,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
    tripId VARCHAR(50) PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicleReg VARCHAR(50),
    driverLicense VARCHAR(100),
    cargoWeight INT NOT NULL,
    plannedDistance INT NOT NULL,
    finalOdometer INT,
    fuelConsumed DECIMAL(10,2),
    status VARCHAR(50) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicleReg) REFERENCES vehicles(registrationNumber),
    FOREIGN KEY (driverLicense) REFERENCES drivers(licenseNumber)
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    logId VARCHAR(50) PRIMARY KEY,
    vehicleReg VARCHAR(50),
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    dateOpened DATE NOT NULL,
    dateClosed DATE,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (vehicleReg) REFERENCES vehicles(registrationNumber)
);

CREATE TABLE IF NOT EXISTS fuel_logs (
    logId VARCHAR(50) PRIMARY KEY,
    vehicleReg VARCHAR(50),
    liters DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (vehicleReg) REFERENCES vehicles(registrationNumber)
);

CREATE TABLE IF NOT EXISTS expenses (
    expenseId VARCHAR(50) PRIMARY KEY,
    vehicleReg VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (vehicleReg) REFERENCES vehicles(registrationNumber)
);
