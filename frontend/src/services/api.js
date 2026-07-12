// TransitOps Frontend API Service Layer
// Bridges communication between React and the Express Backend (http://localhost:5000)
// Falls back to localStorage if the backend is offline.

const API_BASE_URL = 'http://localhost:5000/api';
export const USE_MOCK = true; // Toggle to false to use the live backend

// Helper to interact with LocalStorage when in MOCK mode
const mockDb = {
  get: (key, defaultVal = []) => JSON.parse(localStorage.getItem(`transitops_${key}`)) || defaultVal,
  set: (key, val) => localStorage.setItem(`transitops_${key}`, JSON.stringify(val))
};

// Seed initial mock data if localStorage is empty
const seedMockData = () => {
  if (!localStorage.getItem('transitops_users')) {
    mockDb.set('users', [
      { id: 1, email: 'manager@transitops.com', password_hash: 'admin', role: 'Fleet Manager' },
      { id: 2, email: 'driver@transitops.com', password_hash: 'driver', role: 'Driver' },
      { id: 3, email: 'safety@transitops.com', password_hash: 'safety', role: 'Safety Officer' },
      { id: 4, email: 'finance@transitops.com', password_hash: 'finance', role: 'Financial Analyst' }
    ]);
  }
  if (!localStorage.getItem('transitops_vehicles')) {
    mockDb.set('vehicles', [
      { id: 1, reg_number: 'VAN-05', name: 'Ford Transit Van', type: 'Van', capacity: 500, odometer: 10200, acquisition_cost: 22000, status: 'Available' },
      { id: 2, reg_number: 'TRUCK-04', name: 'Volvo FH16', type: 'Truck', capacity: 15000, odometer: 45000, acquisition_cost: 85000, status: 'Available' },
      { id: 3, reg_number: 'TRUCK-02', name: 'Isuzu NPR', type: 'Truck', capacity: 4500, odometer: 67000, acquisition_cost: 38000, status: 'In Shop' },
      { id: 4, reg_number: 'TRAILER-09', name: 'Kenworth T680', type: 'Trailer', capacity: 25000, odometer: 120000, acquisition_cost: 110000, status: 'Retired' }
    ]);
  }
  if (!localStorage.getItem('transitops_drivers')) {
    mockDb.set('drivers', [
      { id: 1, name: 'Alex Johnson', license_no: 'DL-55291', license_category: 'Class C', license_expiry: '2026-12-15', contact: '+1 (555) 019-2234', safety_score: 95, status: 'Available' },
      { id: 2, name: 'Suresh Kumar', license_no: 'DL-77810', license_category: 'Heavy Rigid', license_expiry: '2026-09-20', contact: '+91 98765 43210', safety_score: 88, status: 'Available' },
      { id: 3, name: 'Michael Smith', license_no: 'DL-11045', license_category: 'Class A', license_expiry: '2026-06-01', contact: '+1 (555) 021-9988', safety_score: 72, status: 'Suspended' },
      { id: 4, name: 'John Doe', license_no: 'DL-44390', license_category: 'Class B', license_expiry: '2026-07-20', contact: '+1 (555) 088-1245', safety_score: 90, status: 'Off Duty' }
    ]);
  }
  if (!localStorage.getItem('transitops_trips')) {
    mockDb.set('trips', [
      { id: 1, source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicle_id: 1, driver_id: 1, cargo_weight: 450, planned_distance: 38, status: 'Dispatched' },
      { id: 2, source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicle_id: 2, driver_id: 2, cargo_weight: 12000, planned_distance: 55, status: 'Draft' },
      { id: 3, source: 'Mansa', destination: 'Kalol Depot', vehicle_id: 3, driver_id: 3, cargo_weight: 3000, planned_distance: 25, status: 'Cancelled' }
    ]);
  }
  if (!localStorage.getItem('transitops_maintenance_logs')) {
    mockDb.set('maintenance_logs', [
      { id: 1, vehicle_id: 3, description: 'Engine oil filter replacement & diagnostic check', cost: 150, date: '2026-07-10', status: 'Open' },
      { id: 2, vehicle_id: 1, description: 'Brake pad replacement', cost: 320, date: '2026-06-15', status: 'Closed' }
    ]);
  }
  if (!localStorage.getItem('transitops_fuel_logs')) {
    mockDb.set('fuel_logs', [
      { id: 1, vehicle_id: 1, trip_id: 1, liters: 32, cost: 65, date: '2026-07-11' },
      { id: 2, vehicle_id: 2, trip_id: 2, liters: 145, cost: 290, date: '2026-07-09' }
    ]);
  }
  if (!localStorage.getItem('transitops_expenses')) {
    mockDb.set('expenses', [
      { id: 1, vehicle_id: 1, type: 'Tolls', cost: 12, description: 'Highway NH8 Toll', date: '2026-07-11' },
      { id: 2, vehicle_id: 2, type: 'Permits', cost: 150, description: 'State Border Entry Permit', date: '2026-07-08' }
    ]);
  }
};
seedMockData();

// Generic HTTP fetch helper with mock fallback capability
async function request(path, options = {}) {
  if (USE_MOCK) {
    throw new Error('Using local mock storage.');
  }
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
      },
      ...options
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Something went wrong');
    }
    return await response.json();
  } catch (error) {
    console.warn(`API Error (${path}): ${error.message}. Checking local storage fallback...`);
    throw error;
  }
}

export const api = {
  // Authentication
  login: async (email, password) => {
    if (USE_MOCK) {
      const users = mockDb.get('users');
      const user = users.find(u => u.email === email && u.password_hash === password);
      if (!user) throw new Error('Invalid email or password');
      const mockToken = `mock_jwt_token_${user.role.replace(' ', '_')}`;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify({ email: user.email, role: user.role }));
      return { token: mockToken, user: { email: user.email, role: user.role } };
    }
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Vehicles
  getVehicles: async () => {
    if (USE_MOCK) return mockDb.get('vehicles');
    return request('/vehicles');
  },
  createVehicle: async (vehicleData) => {
    if (USE_MOCK) {
      const list = mockDb.get('vehicles');
      if (list.some(v => v.reg_number === vehicleData.reg_number)) {
        throw new Error('Registration number must be unique.');
      }
      const newV = { id: Date.now(), ...vehicleData, odometer: Number(vehicleData.odometer || 0), capacity: Number(vehicleData.capacity || 0), acquisition_cost: Number(vehicleData.acquisition_cost || 0), status: vehicleData.status || 'Available' };
      list.push(newV);
      mockDb.set('vehicles', list);
      return newV;
    }
    return request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },
  updateVehicle: async (id, vehicleData) => {
    if (USE_MOCK) {
      const list = mockDb.get('vehicles');
      const idx = list.findIndex(v => v.id === Number(id));
      if (idx === -1) throw new Error('Vehicle not found');
      list[idx] = { ...list[idx], ...vehicleData };
      mockDb.set('vehicles', list);
      return list[idx];
    }
    return request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  },
  deleteVehicle: async (id) => {
    if (USE_MOCK) {
      const list = mockDb.get('vehicles');
      const filtered = list.filter(v => v.id !== Number(id));
      mockDb.set('vehicles', filtered);
      return { success: true };
    }
    return request(`/vehicles/${id}`, { method: 'DELETE' });
  },

  // Drivers
  getDrivers: async () => {
    if (USE_MOCK) return mockDb.get('drivers');
    return request('/drivers');
  },
  createDriver: async (driverData) => {
    if (USE_MOCK) {
      const list = mockDb.get('drivers');
      if (list.some(d => d.license_no === driverData.license_no)) {
        throw new Error('License number must be unique.');
      }
      const newD = { id: Date.now(), ...driverData, safety_score: Number(driverData.safety_score || 100), status: driverData.status || 'Available' };
      list.push(newD);
      mockDb.set('drivers', list);
      return newD;
    }
    return request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },
  updateDriver: async (id, driverData) => {
    if (USE_MOCK) {
      const list = mockDb.get('drivers');
      const idx = list.findIndex(d => d.id === Number(id));
      if (idx === -1) throw new Error('Driver not found');
      list[idx] = { ...list[idx], ...driverData };
      mockDb.set('drivers', list);
      return list[idx];
    }
    return request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },
  deleteDriver: async (id) => {
    if (USE_MOCK) {
      const list = mockDb.get('drivers');
      const filtered = list.filter(d => d.id !== Number(id));
      mockDb.set('drivers', filtered);
      return { success: true };
    }
    return request(`/drivers/${id}`, { method: 'DELETE' });
  },

  // Trips
  getTrips: async () => {
    if (USE_MOCK) return mockDb.get('trips');
    return request('/trips');
  },
  createTrip: async (tripData) => {
    if (USE_MOCK) {
      const list = mockDb.get('trips');
      const vehicles = mockDb.get('vehicles');
      const drivers = mockDb.get('drivers');

      const vehicle = vehicles.find(v => v.id === Number(tripData.vehicle_id));
      const driver = drivers.find(d => d.id === Number(tripData.driver_id));

      if (!vehicle || vehicle.status !== 'Available') throw new Error('Vehicle is not available.');
      if (!driver || driver.status !== 'Available') throw new Error('Driver is not available.');
      if (Number(tripData.cargo_weight) > vehicle.capacity) throw new Error(`Cargo weight (${tripData.cargo_weight}kg) exceeds vehicle capacity (${vehicle.capacity}kg).`);
      
      const licenseExpiry = new Date(driver.license_expiry);
      if (licenseExpiry <= new Date()) throw new Error('Driver driving license has expired.');

      const newTrip = {
        id: Date.now(),
        ...tripData,
        cargo_weight: Number(tripData.cargo_weight),
        planned_distance: Number(tripData.planned_distance),
        status: 'Draft'
      };

      list.push(newTrip);
      mockDb.set('trips', list);
      return newTrip;
    }
    return request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  },
  dispatchTrip: async (tripId) => {
    if (USE_MOCK) {
      const trips = mockDb.get('trips');
      const vehicles = mockDb.get('vehicles');
      const drivers = mockDb.get('drivers');

      const trip = trips.find(t => t.id === Number(tripId));
      if (!trip) throw new Error('Trip not found');

      const vehicle = vehicles.find(v => v.id === Number(trip.vehicle_id));
      const driver = drivers.find(d => d.id === Number(trip.driver_id));

      if (vehicle.status !== 'Available' && vehicle.status !== 'On Trip') throw new Error('Vehicle is not available.');
      if (driver.status !== 'Available' && driver.status !== 'On Trip') throw new Error('Driver is not available.');

      // Update statuses
      trip.status = 'Dispatched';
      vehicle.status = 'On Trip';
      driver.status = 'On Trip';

      mockDb.set('trips', trips);
      mockDb.set('vehicles', vehicles);
      mockDb.set('drivers', drivers);
      return trip;
    }
    return request(`/trips/${tripId}/dispatch`, { method: 'POST' });
  },
  completeTrip: async (tripId, data) => {
    // data contains: { final_odometer, fuel_liters, fuel_cost }
    if (USE_MOCK) {
      const trips = mockDb.get('trips');
      const vehicles = mockDb.get('vehicles');
      const drivers = mockDb.get('drivers');
      const fuelLogs = mockDb.get('fuel_logs');

      const trip = trips.find(t => t.id === Number(tripId));
      if (!trip) throw new Error('Trip not found');

      const vehicle = vehicles.find(v => v.id === Number(trip.vehicle_id));
      const driver = drivers.find(d => d.id === Number(trip.driver_id));

      const finalOdo = Number(data.final_odometer);
      if (finalOdo <= vehicle.odometer) {
        throw new Error(`Final odometer (${finalOdo} km) must be greater than starting odometer (${vehicle.odometer} km).`);
      }

      // Update values
      trip.status = 'Completed';
      trip.final_odometer = finalOdo;
      trip.fuel_consumed = Number(data.fuel_liters);

      vehicle.odometer = finalOdo;
      vehicle.status = 'Available';
      driver.status = 'Available';

      // Log Fuel
      if (data.fuel_liters && data.fuel_cost) {
        fuelLogs.push({
          id: Date.now(),
          vehicle_id: vehicle.id,
          trip_id: trip.id,
          liters: Number(data.fuel_liters),
          cost: Number(data.fuel_cost),
          date: new Date().toISOString().split('T')[0]
        });
        mockDb.set('fuel_logs', fuelLogs);
      }

      mockDb.set('trips', trips);
      mockDb.set('vehicles', vehicles);
      mockDb.set('drivers', drivers);
      return trip;
    }
    return request(`/trips/${tripId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  cancelTrip: async (tripId) => {
    if (USE_MOCK) {
      const trips = mockDb.get('trips');
      const vehicles = mockDb.get('vehicles');
      const drivers = mockDb.get('drivers');

      const trip = trips.find(t => t.id === Number(tripId));
      if (!trip) throw new Error('Trip not found');

      const vehicle = vehicles.find(v => v.id === Number(trip.vehicle_id));
      const driver = drivers.find(d => d.id === Number(trip.driver_id));

      trip.status = 'Cancelled';
      if (vehicle && vehicle.status === 'On Trip') vehicle.status = 'Available';
      if (driver && driver.status === 'On Trip') driver.status = 'Available';

      mockDb.set('trips', trips);
      mockDb.set('vehicles', vehicles);
      mockDb.set('drivers', drivers);
      return trip;
    }
    return request(`/trips/${tripId}/cancel`, { method: 'POST' });
  },

  // Maintenance
  getMaintenanceLogs: async () => {
    if (USE_MOCK) return mockDb.get('maintenance_logs');
    return request('/maintenance');
  },
  createMaintenanceLog: async (logData) => {
    if (USE_MOCK) {
      const list = mockDb.get('maintenance_logs');
      const vehicles = mockDb.get('vehicles');

      const vehicle = vehicles.find(v => v.id === Number(logData.vehicle_id));
      if (!vehicle) throw new Error('Vehicle not found');

      const newLog = {
        id: Date.now(),
        ...logData,
        cost: Number(logData.cost || 0),
        date: logData.date || new Date().toISOString().split('T')[0],
        status: 'Open'
      };

      vehicle.status = 'In Shop';

      list.push(newLog);
      mockDb.set('maintenance_logs', list);
      mockDb.set('vehicles', vehicles);
      return newLog;
    }
    return request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  },
  closeMaintenanceLog: async (logId) => {
    if (USE_MOCK) {
      const list = mockDb.get('maintenance_logs');
      const vehicles = mockDb.get('vehicles');

      const log = list.find(l => l.id === Number(logId));
      if (!log) throw new Error('Log not found');

      const vehicle = vehicles.find(v => v.id === Number(log.vehicle_id));
      
      log.status = 'Closed';
      if (vehicle && vehicle.status === 'In Shop') {
        vehicle.status = 'Available';
      }

      mockDb.set('maintenance_logs', list);
      mockDb.set('vehicles', vehicles);
      return log;
    }
    return request(`/maintenance/${logId}/close`, { method: 'POST' });
  },

  // Fuel Logs & Expenses
  getFuelLogs: async () => {
    if (USE_MOCK) return mockDb.get('fuel_logs');
    return request('/fuel');
  },
  createFuelLog: async (fuelData) => {
    if (USE_MOCK) {
      const list = mockDb.get('fuel_logs');
      const newLog = {
        id: Date.now(),
        ...fuelData,
        liters: Number(fuelData.liters),
        cost: Number(fuelData.cost),
        date: fuelData.date || new Date().toISOString().split('T')[0]
      };
      list.push(newLog);
      mockDb.set('fuel_logs', list);
      return newLog;
    }
    return request('/fuel', {
      method: 'POST',
      body: JSON.stringify(fuelData)
    });
  },
  getExpenses: async () => {
    if (USE_MOCK) return mockDb.get('expenses');
    return request('/expenses');
  },
  createExpense: async (expenseData) => {
    if (USE_MOCK) {
      const list = mockDb.get('expenses');
      const newLog = {
        id: Date.now(),
        ...expenseData,
        cost: Number(expenseData.cost),
        date: expenseData.date || new Date().toISOString().split('T')[0]
      };
      list.push(newLog);
      mockDb.set('expenses', list);
      return newLog;
    }
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }
};
