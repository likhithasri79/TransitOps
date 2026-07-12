import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { currentUser } = useApp();

  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  // Exact data from wireframe
  const rbacMatrix = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '-', fuelExp: '-', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'View', drivers: '-', trips: '✓', fuelExp: '-', analytics: '-' },
    { role: 'Safety Officer', fleet: '-', drivers: '✓', trips: 'View', fuelExp: '-', analytics: '-' },
    { role: 'Financial Analyst', fleet: 'View', drivers: '-', trips: '-', fuelExp: '✓', analytics: '✓' }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Settings & RBAC Audit</h1>
          <p>Configure regional defaults and audit access control configurations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px', alignItems: 'start' }}>
        {/* Left Side: General settings */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>General Settings</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Default Depot Name</label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>System Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Distance Unit</label>
              <input
                type="text"
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Save Settings
            </button>
          </form>
        </div>

        {/* Right Side: RBAC audit matrix */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Role-Based Access Control (RBAC) Matrix</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            System-enforced permissions governing CRUD operations and navigation menus.
          </p>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Fleet</th>
                  <th>Drivers</th>
                  <th>Trips</th>
                  <th>Fuel/Exp.</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {rbacMatrix.map((item, index) => {
                  const isCurrent = currentUser?.role === (item.role === 'Dispatcher' ? 'Driver' : item.role);
                  return (
                    <tr 
                      key={index}
                      style={{ 
                        background: isCurrent ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                        borderColor: isCurrent ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255,255,255,0.04)'
                      }}
                    >
                      <td style={{ fontWeight: 700, color: isCurrent ? 'var(--cyan)' : 'var(--text-primary)' }}>
                        {item.role} {isCurrent && ' (You)'}
                      </td>
                      <td style={{ fontSize: '1rem', color: item.fleet === '-' ? 'var(--rose)' : (item.fleet === '✓' ? 'var(--emerald)' : 'inherit') }}>{item.fleet}</td>
                      <td style={{ fontSize: '1rem', color: item.drivers === '-' ? 'var(--rose)' : (item.drivers === '✓' ? 'var(--emerald)' : 'inherit') }}>{item.drivers}</td>
                      <td style={{ fontSize: '1rem', color: item.trips === '-' ? 'var(--rose)' : (item.trips === '✓' ? 'var(--emerald)' : 'inherit') }}>{item.trips}</td>
                      <td style={{ fontSize: '1rem', color: item.fuelExp === '-' ? 'var(--rose)' : (item.fuelExp === '✓' ? 'var(--emerald)' : 'inherit') }}>{item.fuelExp}</td>
                      <td style={{ fontSize: '1rem', color: item.analytics === '-' ? 'var(--rose)' : (item.analytics === '✓' ? 'var(--emerald)' : 'inherit') }}>{item.analytics}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
