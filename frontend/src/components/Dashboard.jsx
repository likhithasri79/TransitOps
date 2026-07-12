import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { vehicles, drivers, trips } = useApp();
  
  // Local filter states
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  // We assign mock regions to vehicles dynamically for filtering display
  const getVehicleRegion = (vehicle) => {
    if (vehicle.reg_number.includes('VAN-05') || vehicle.id === 1) return 'Gandhinagar';
    if (vehicle.reg_number.includes('TRUCK-04') || vehicle.id === 2) return 'Vatva';
    if (vehicle.reg_number.includes('TRUCK-02') || vehicle.id === 3) return 'Mansa';
    return 'Gandhinagar'; // Default
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    const region = getVehicleRegion(v);
    const matchType = filterType === 'All' || v.type === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchRegion = filterRegion === 'All' || region === filterRegion;
    return matchType && matchStatus && matchRegion;
  });

  // KPI Calculations (based on filtered list to reflect changes instantly)
  const totalVehiclesCount = filteredVehicles.length;
  const activeVehicles = filteredVehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = filteredVehicles.filter(v => v.status === 'Available').length;
  const inShopVehicles = filteredVehicles.filter(v => v.status === 'In Shop').length;

  // Trips filtering based on filtered vehicles
  const filteredVehicleIds = filteredVehicles.map(v => v.id);
  const relevantTrips = trips.filter(t => filteredVehicleIds.includes(t.vehicle_id));

  const activeTrips = relevantTrips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = relevantTrips.filter(t => t.status === 'Draft').length;

  // Drivers on duty count
  const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;

  // Fleet Utilization = (Active Vehicles / (Active + Available Vehicles)) * 100
  const utilizationPool = activeVehicles + availableVehicles;
  const utilization = utilizationPool > 0 
    ? Math.round((activeVehicles / utilizationPool) * 100) 
    : 0;

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Fleet Dashboard</h1>
          <p>Real-time fleet operations control room</p>
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label>Vehicle Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Van">Vans</option>
              <option value="Truck">Trucks</option>
              <option value="Trailer">Trailers</option>
            </select>
          </div>
          <div className="form-group">
            <label>Asset Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop (Maintenance)</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div className="form-group">
            <label>Region / Depot</label>
            <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option value="All">All Regions</option>
              <option value="Gandhinagar">Gandhinagar Depot</option>
              <option value="Vatva">Vatva Industrial Area</option>
              <option value="Mansa">Mansa Depot</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="card kpi-card cyan">
          <span className="kpi-label">Active Vehicles</span>
          <span className="kpi-value">{activeVehicles}</span>
        </div>
        <div className="card kpi-card emerald">
          <span className="kpi-label">Available Vehicles</span>
          <span className="kpi-value">{availableVehicles}</span>
        </div>
        <div className="card kpi-card amber">
          <span className="kpi-label">In Maintenance</span>
          <span className="kpi-value">{inShopVehicles}</span>
        </div>
        <div className="card kpi-card cyan">
          <span className="kpi-label">Active Trips</span>
          <span className="kpi-value">{activeTrips}</span>
        </div>
        <div className="card kpi-card amber">
          <span className="kpi-label">Pending Trips</span>
          <span className="kpi-value">{pendingTrips}</span>
        </div>
        <div className="card kpi-card emerald">
          <span className="kpi-label">Drivers On Duty</span>
          <span className="kpi-value">{driversOnDuty}</span>
        </div>
        <div className="card kpi-card" style={{ borderLeftColor: 'var(--cyan)' }}>
          <span className="kpi-label">Fleet Utilization</span>
          <span className="kpi-value" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {utilization}<span style={{ fontSize: '1.2rem', fontWeight: 500 }}>%</span>
          </span>
        </div>
      </div>

      {/* Visual Analytics / Quick Live Board overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Fleet Status Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Fleet Status Distribution</h2>
          <div style={{ flexGrow: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active (On Trip)', value: activeVehicles },
                    { name: 'Available', value: availableVehicles },
                    { name: 'In Maintenance', value: inShopVehicles }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="var(--cyan)" />
                  <Cell fill="var(--emerald)" />
                  <Cell fill="var(--amber)" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtered Table */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Filtered Fleet Status List ({totalVehiclesCount} Assets)</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Region / Depot</th>
                  <th>Load Capacity</th>
                  <th>Odometer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles match the selected filters.</td>
                  </tr>
                ) : (
                  filteredVehicles.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.name} ({v.reg_number})</td>
                      <td>{v.type}</td>
                      <td>{getVehicleRegion(v)}</td>
                      <td>{v.capacity} kg</td>
                      <td>{v.odometer.toLocaleString()} km</td>
                      <td>
                        <span className={`badge ${v.status.toLowerCase().replace(' ', '-')}`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
