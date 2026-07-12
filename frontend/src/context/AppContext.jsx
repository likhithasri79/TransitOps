import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear errors helper
  const clearError = () => setError(null);

  // Fetch all initial data from database/mock
  const refreshData = async () => {
    setLoading(true);
    try {
      const [vList, dList, tList, mList, fList, eList] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
        api.getTrips(),
        api.getMaintenanceLogs(),
        api.getFuelLogs(),
        api.getExpenses()
      ]);
      setVehicles(vList);
      setDrivers(dList);
      setTrips(tList);
      setMaintenanceLogs(mList);
      setFuelLogs(fList);
      setExpenses(eList);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  // Auth Operations
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      // Save the real token from the backend to localStorage
      if (res.token) localStorage.setItem('token', res.token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
      
      setCurrentUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    // Clear in-memory state
    setVehicles([]);
    setDrivers([]);
    setTrips([]);
    setMaintenanceLogs([]);
    setFuelLogs([]);
    setExpenses([]);
  };

  // Vehicles CRUD
  const addVehicle = async (vehicleData) => {
    setError(null);
    try {
      await api.createVehicle(vehicleData);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editVehicle = async (id, vehicleData) => {
    setError(null);
    try {
      await api.updateVehicle(id, vehicleData);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeVehicle = async (id) => {
    setError(null);
    try {
      await api.deleteVehicle(id);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Drivers CRUD
  const addDriver = async (driverData) => {
    setError(null);
    try {
      await api.createDriver(driverData);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editDriver = async (id, driverData) => {
    setError(null);
    try {
      await api.updateDriver(id, driverData);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeDriver = async (id) => {
    setError(null);
    try {
      await api.deleteDriver(id);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Trips Lifecycle
  const addTrip = async (tripData) => {
    setError(null);
    try {
      await api.createTrip(tripData);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const dispatchTrip = async (tripId) => {
    setError(null);
    try {
      await api.dispatchTrip(tripId);
      // Status update cascades to vehicles/drivers on frontend to keep sync
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const completeTrip = async (tripId, data) => {
    setError(null);
    try {
      await api.completeTrip(tripId, data);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const cancelTrip = async (tripId) => {
    setError(null);
    try {
      await api.cancelTrip(tripId);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Maintenance operations
  const addMaintenanceLog = async (logData) => {
    setError(null);
    try {
      const newLog = await api.createMaintenanceLog(logData);
      await refreshData();
      return newLog;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const closeMaintenanceLog = async (logId) => {
    setError(null);
    try {
      await api.closeMaintenanceLog(logId);
      await refreshData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fuel & Expenses
  const addFuelLog = async (fuelData) => {
    setError(null);
    try {
      const newLog = await api.createFuelLog(fuelData);
      await refreshData();
      return newLog;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addExpense = async (expenseData) => {
    setError(null);
    try {
      const newLog = await api.createExpense(expenseData);
      await refreshData();
      return newLog;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      vehicles,
      drivers,
      trips,
      maintenanceLogs,
      fuelLogs,
      expenses,
      loading,
      error,
      clearError,
      refreshData,
      login,
      logout,
      addVehicle,
      editVehicle,
      removeVehicle,
      addDriver,
      editDriver,
      removeDriver,
      addTrip,
      dispatchTrip,
      completeTrip,
      cancelTrip,
      addMaintenanceLog,
      closeMaintenanceLog,
      addFuelLog,
      addExpense
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
