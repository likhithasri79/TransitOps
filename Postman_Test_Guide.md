# TransitOps Postman Testing Guide

Here are all the HTTP methods, endpoints, and JSON bodies you need to test every single business rule in Postman.

## 1. Authentication

### A. Register User
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Body (JSON):**
```json
{
  "email": "fleet_manager@transit.com",
  "password": "secure123",
  "name": "Fleet Boss",
  "role": "Fleet Manager"
}
```

### B. Login (Get Token)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "fleet_manager@transit.com",
  "password": "secure123"
}
```
> **IMPORTANT:** Copy the `token` you get back. For all the requests below, go to the **Headers** tab in Postman, add Key `Authorization`, and Value `Bearer <YOUR_TOKEN>`.

---

## 2. Asset Creation (CRUD)

### A. Create Vehicle
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/vehicles`
- **Body (JSON):**
```json
{
  "registrationNumber": "VAN-999",
  "nameModel": "Ford Transit",
  "type": "Van",
  "maxLoadCapacity": 1000,
  "odometer": 20000,
  "acquisitionCost": 35000
}
```

### B. Create Driver
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/drivers`
- **Body (JSON):**
```json
{
  "licenseNumber": "LIC-12345",
  "name": "John Doe",
  "licenseCategory": "Class B",
  "licenseExpiryDate": "2030-12-31",
  "contactNumber": "555-9876",
  "safetyScore": 95
}
```

---

## 3. Testing Business Rules

### Test Case: Expired License (Should FAIL)
First, create a driver with an expired license:
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/drivers`
- **Body (JSON):**
```json
{
  "licenseNumber": "LIC-EXPIRED",
  "name": "Old Joe",
  "licenseCategory": "Class B",
  "licenseExpiryDate": "2020-01-01",
  "contactNumber": "555-0000",
  "safetyScore": 80
}
```
Now, try to assign them to a trip. The server will reject it:
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/trips/dispatch`
- **Body (JSON):**
```json
{
  "tripId": "TRP-001",
  "source": "Warehouse A",
  "destination": "Store B",
  "vehicleReg": "VAN-999",
  "driverLicense": "LIC-EXPIRED",
  "cargoWeight": 500,
  "plannedDistance": 100
}
```

### Test Case: Overweight Cargo (Should FAIL)
Try to dispatch a trip where the cargo is `2000` (the Van max limit is `1000`). The server will reject it:
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/trips/dispatch`
- **Body (JSON):**
```json
{
  "tripId": "TRP-002",
  "source": "Warehouse A",
  "destination": "Store B",
  "vehicleReg": "VAN-999",
  "driverLicense": "LIC-12345",
  "cargoWeight": 2000,
  "plannedDistance": 100
}
```

### Test Case: Valid Dispatch (Should PASS)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/trips/dispatch`
- **Body (JSON):**
```json
{
  "tripId": "TRP-003",
  "source": "Warehouse A",
  "destination": "Store B",
  "vehicleReg": "VAN-999",
  "driverLicense": "LIC-12345",
  "cargoWeight": 800,
  "plannedDistance": 100
}
```
*Note: Make a `GET` to `/api/vehicles` and `/api/drivers` to verify they both automatically changed to `On Trip`.*

### Test Case: Complete Trip (Restores Available)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/trips/complete`
- **Body (JSON):**
```json
{
  "tripId": "TRP-003",
  "finalOdometer": 20100,
  "fuelConsumed": 15
}
```

---

## 4. Maintenance Workflow

### Put Vehicle In Shop
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/maintenance`
- **Body (JSON):**
```json
{
  "logId": "MAINT-001",
  "vehicleReg": "VAN-999",
  "description": "Oil Change",
  "type": "Routine",
  "cost": 120
}
```

### Close Maintenance (Restores Available)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/maintenance/close`
- **Body (JSON):**
```json
{
  "logId": "MAINT-001"
}
```

---

## 5. Analytics & Dashboard
After completing all the steps above, check the Analytics Aggregator to see all your data!
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/reports`
