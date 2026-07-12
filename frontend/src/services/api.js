// TransitOps Frontend API Service Layer
// Bridges communication between React and the Express Backend

const API_BASE = 'http://localhost:5000/api';

const handleResponse = async (res) => {
    if (!res.ok) {
        let errMessage = 'API Request Failed';
        try {
            const errData = await res.json();
            errMessage = errData.error || errData.message || errMessage;
        } catch (e) { }
        throw new Error(errMessage);
    }
    return res.json();
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Mappers to translate between Frontend (snake_case/mock keys) and Backend (camelCase/schema keys)
const mapVehicleToBackend = (v) => ({
    registrationNumber: v.reg_number,
    nameModel: v.name,
    type: v.type,
    maxLoadCapacity: v.capacity,
    odometer: v.odometer,
    acquisitionCost: v.acquisition_cost,
    status: v.status
});
const mapVehicleToFrontend = (v) => ({
    id: v.registrationNumber, // Frontend uses id or reg_number
    reg_number: v.registrationNumber,
    name: v.nameModel,
    type: v.type,
    capacity: v.maxLoadCapacity,
    odometer: v.odometer,
    acquisition_cost: v.acquisitionCost,
    status: v.status
});

const mapDriverToBackend = (d) => ({
    licenseNumber: d.license_no,
    name: d.name,
    licenseCategory: d.license_category,
    licenseExpiryDate: d.license_expiry,
    contactNumber: d.contact,
    safetyScore: d.safety_score,
    status: d.status
});
const mapDriverToFrontend = (d) => ({
    id: d.licenseNumber,
    license_no: d.licenseNumber,
    name: d.name,
    license_category: d.licenseCategory,
    license_expiry: d.licenseExpiryDate,
    contact: d.contactNumber,
    safety_score: d.safetyScore,
    status: d.status
});

const mapTripToBackend = (t) => ({
    source: t.source,
    destination: t.destination,
    vehicleReg: t.vehicle_id,
    driverLicense: t.driver_id,
    cargoWeight: t.cargo_weight,
    plannedDistance: t.planned_distance,
    status: t.status
});
const mapTripToFrontend = (t) => ({
    id: t.tripId,
    tripId: t.tripId,
    source: t.source,
    destination: t.destination,
    vehicle_id: t.vehicleReg,
    driver_id: t.driverLicense,
    cargo_weight: t.cargoWeight,
    planned_distance: t.plannedDistance,
    final_odometer: t.finalOdometer,
    fuel_consumed: t.fuelConsumed,
    status: t.status,
    createdAt: t.createdAt
});

const mapMaintenanceToBackend = (m) => ({
    vehicleReg: m.vehicle_id,
    description: m.description,
    type: m.type || 'Repair',
    cost: m.cost,
    dateOpened: m.date
});
const mapMaintenanceToFrontend = (m) => ({
    id: m.logId,
    logId: m.logId,
    vehicle_id: m.vehicleReg,
    description: m.description,
    type: m.type,
    cost: m.cost,
    date: m.dateOpened,
    dateClosed: m.dateClosed,
    status: m.status
});

const mapFuelToFrontend = (f) => ({
    id: f.logId,
    vehicle_id: f.vehicleReg,
    liters: f.liters,
    cost: f.cost,
    date: f.date
});
const mapExpenseToFrontend = (e) => ({
    id: e.expenseId,
    vehicle_id: e.vehicleReg,
    type: e.type,
    cost: e.cost,
    description: e.description,
    date: e.date
});

export const api = {
    // Authentication
    register: async (userData) => {
        const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(userData) });
        return handleResponse(res);
    },
    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        return handleResponse(res);
    },

    // Vehicles
    getVehicles: async () => {
        const res = await fetch(`${API_BASE}/vehicles`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapVehicleToFrontend);
    },
    createVehicle: async (vehicleData) => {
        const res = await fetch(`${API_BASE}/vehicles`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(mapVehicleToBackend(vehicleData)) });
        return handleResponse(res);
    },
    updateVehicle: async (id, vehicleData) => {
        const res = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(mapVehicleToBackend(vehicleData)) });
        return handleResponse(res);
    },
    deleteVehicle: async (id) => {
        const res = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE', headers: getHeaders() });
        return handleResponse(res);
    },

    // Drivers
    getDrivers: async () => {
        const res = await fetch(`${API_BASE}/drivers`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapDriverToFrontend);
    },
    createDriver: async (driverData) => {
        const res = await fetch(`${API_BASE}/drivers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(mapDriverToBackend(driverData)) });
        return handleResponse(res);
    },
    updateDriver: async (id, driverData) => {
        const res = await fetch(`${API_BASE}/drivers/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(mapDriverToBackend(driverData)) });
        return handleResponse(res);
    },
    deleteDriver: async (id) => {
        const res = await fetch(`${API_BASE}/drivers/${id}`, { method: 'DELETE', headers: getHeaders() });
        return handleResponse(res);
    },

    // Trips
    getTrips: async () => {
        const res = await fetch(`${API_BASE}/trips`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapTripToFrontend);
    },
    createTrip: async (tripData) => {
        const res = await fetch(`${API_BASE}/trips`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(mapTripToBackend(tripData)) });
        return handleResponse(res);
    },
    dispatchTrip: async (tripId) => {
        const res = await fetch(`${API_BASE}/trips/dispatch`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ tripId }) });
        return handleResponse(res);
    },
    completeTrip: async (tripId, data) => {
        const payload = {
            tripId,
            finalOdometer: data.final_odometer,
            fuelLiters: data.fuel_liters,
            fuelCost: data.fuel_cost
        };
        const res = await fetch(`${API_BASE}/trips/complete`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
        return handleResponse(res);
    },
    cancelTrip: async (tripId) => {
        const res = await fetch(`${API_BASE}/trips/cancel`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ tripId }) });
        return handleResponse(res);
    },

    // Maintenance
    getMaintenanceLogs: async () => {
        const res = await fetch(`${API_BASE}/maintenance`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapMaintenanceToFrontend);
    },
    createMaintenanceLog: async (logData) => {
        const res = await fetch(`${API_BASE}/maintenance`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(mapMaintenanceToBackend(logData)) });
        return handleResponse(res);
    },
    closeMaintenanceLog: async (logId) => {
        const res = await fetch(`${API_BASE}/maintenance/close`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ logId }) });
        return handleResponse(res);
    },

    // Fuel Logs & Expenses
    getFuelLogs: async () => {
        const res = await fetch(`${API_BASE}/fuel`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapFuelToFrontend);
    },
    createFuelLog: async (fuelData) => {
        const payload = {
            vehicleReg: fuelData.vehicle_id,
            tripId: fuelData.trip_id,
            liters: fuelData.liters,
            cost: fuelData.cost,
            date: fuelData.date
        };
        const res = await fetch(`${API_BASE}/fuel`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
        return handleResponse(res);
    },
    getExpenses: async () => {
        const res = await fetch(`${API_BASE}/expenses`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.map(mapExpenseToFrontend);
    },
    createExpense: async (expenseData) => {
        const payload = {
            vehicleReg: expenseData.vehicle_id,
            type: expenseData.type,
            cost: expenseData.cost,
            description: expenseData.description,
            date: expenseData.date
        };
        const res = await fetch(`${API_BASE}/expenses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
        return handleResponse(res);
    },

    // Reports & Analytics
    getAnalytics: async () => {
        const res = await fetch(`${API_BASE}/reports`, { headers: getHeaders() });
        return handleResponse(res);
    }
};
