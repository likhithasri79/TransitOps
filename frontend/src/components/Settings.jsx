import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { currentUser } = useApp();

  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('USD ($)');

  // Preset configuration audit mapping
  const rbacMatrix = [
    { role: 'Fleet Manager', fleet: 'Read & Write', drivers: 'Read & Write', trips: 'Read Only', maint: 'Read & Write', finance: 'Read Only', analytics: 'Read Only' },
    { role: 'Driver / Dispatcher', fleet: 'Read Only', drivers: 'Read Only', trips: 'Read & Write', maint: 'Read Only', finance: 'Write Only', analytics: 'No Access' },
    { role: 'Safety Officer', fleet: 'Read Only', drivers: 'Read & Write', trips: 'Read Only', maint: 'Read Only', finance: 'No Access', analytics: 'Read Only' },
    { role: 'Financial Analyst', fleet: 'Read Only', drivers: 'No Access', trips: 'Read Only', maint: 'Read Only', finance: 'Read & Write', analytics: 'Read & Write' }
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
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD ($)">USD ($) - Dollar</option>
                <option value="INR (Rs)">INR (Rs) - Rupee</option>
                <option value="GBP (£)">GBP (£) - Pound</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Database Connection Mode</label>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Mock Database Storage:</span>
                  <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Active (localStorage)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Live Server (Port 5000):</span>
                  <span>Standby</span>
                </div>
              </div>
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
                  <th>Maint.</th>
                  <th>Expenses</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {rbacMatrix.map((item, index) => {
                  const isCurrent = currentUser?.role === (item.role === 'Driver / Dispatcher' ? 'Driver' : item.role);
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
                      <td style={{ fontSize: '0.8rem', color: item.fleet === 'No Access' ? 'var(--rose)' : 'inherit' }}>{item.fleet}</td>
                      <td style={{ fontSize: '0.8rem', color: item.drivers === 'No Access' ? 'var(--rose)' : 'inherit' }}>{item.drivers}</td>
                      <td style={{ fontSize: '0.8rem', color: item.trips === 'No Access' ? 'var(--rose)' : 'inherit' }}>{item.trips}</td>
                      <td style={{ fontSize: '0.8rem', color: item.maint === 'No Access' ? 'var(--rose)' : 'inherit' }}>{item.maint}</td>
                      <td style={{ fontSize: '0.8rem', color: item.finance === 'No Access' ? 'var(--rose)' : 'inherit' }}>{item.finance}</td>
                      <td style={{ fontSize: '0.8rem', color: item.analytics === 'No Access' ? 'var(--rose)' : 'inherit' }}>{item.analytics}</td>
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
