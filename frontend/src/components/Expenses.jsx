import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Expenses() {
  const { 
    expenses, fuelLogs, maintenanceLogs, vehicles, addExpense, addFuelLog, currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'fuel' | 'tolls'
  
  // Modal states
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);

  // Fuel Form states
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelError, setFuelError] = useState('');

  // Expense Form states
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState('Tolls');
  const [expCost, setExpCost] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expError, setExpError] = useState('');

  const canEdit = currentUser?.role === 'Financial Analyst' || currentUser?.role === 'Fleet Manager';

  // Helper calculation functions
  const getVehicleTotalFuel = (vId) => {
    return fuelLogs.filter(f => f.vehicle_id === vId).reduce((sum, curr) => sum + Number(curr.cost), 0);
  };

  const getVehicleTotalMaint = (vId) => {
    return maintenanceLogs.filter(m => m.vehicle_id === vId).reduce((sum, curr) => sum + Number(curr.cost), 0);
  };

  const getVehicleTotalOther = (vId) => {
    return expenses.filter(e => e.vehicle_id === vId).reduce((sum, curr) => sum + Number(curr.cost), 0);
  };

  const getVehicleLabel = (vId) => {
    const v = vehicles.find(veh => veh.id === vId);
    return v ? `${v.name} (${v.reg_number})` : `Vehicle ID ${vId}`;
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    if (!fuelVehicleId || !fuelLiters || !fuelCost) {
      setFuelError('Please fill in all fields.');
      return;
    }
    try {
      await addFuelLog({
        vehicle_id: fuelVehicleId,
        liters: Number(fuelLiters),
        cost: Number(fuelCost),
        date: fuelDate
      });
      setShowFuelModal(false);
      setFuelVehicleId('');
      setFuelLiters('');
      setFuelCost('');
      setFuelError('');
    } catch (err) {
      setFuelError(err.message || 'Action failed.');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expVehicleId || !expCost || !expDesc) {
      setExpError('Please fill in all fields.');
      return;
    }
    try {
      await addExpense({
        vehicle_id: expVehicleId,
        type: expType,
        cost: Number(expCost),
        description: expDesc,
        date: expDate
      });
      setShowExpModal(false);
      setExpVehicleId('');
      setExpCost('');
      setExpDesc('');
      setExpError('');
    } catch (err) {
      setExpError(err.message || 'Action failed.');
    }
  };

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Fuel & Expense Registry</h1>
          <p>Track mechanical services, tolls, refueling logs, and operating cost summaries</p>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setShowFuelModal(true)}>
              ⛽ Log Fuel Refill
            </button>
            <button className="btn btn-primary" onClick={() => setShowExpModal(true)}>
              💵 Log Other Expense
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', gap: '16px', marginBottom: '8px' }}>
        <button 
          onClick={() => setActiveTab('summary')}
          style={{ 
            background: 'none', 
            border: 'none',
            borderBottom: activeTab === 'summary' ? '2px solid var(--primary)' : '2px solid transparent', 
            borderRadius: 0, 
            padding: '12px 16px',
            color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'summary' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          📊 Operating Cost Summary
        </button>
        <button 
          onClick={() => setActiveTab('fuel')}
          style={{ 
            background: 'none', 
            border: 'none',
            borderBottom: activeTab === 'fuel' ? '2px solid var(--primary)' : '2px solid transparent', 
            borderRadius: 0, 
            padding: '12px 16px',
            color: activeTab === 'fuel' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'fuel' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          ⛽ Fuel Refill Logs ({fuelLogs.length})
        </button>
        <button 
          onClick={() => setActiveTab('tolls')}
          style={{ 
            background: 'none', 
            border: 'none',
            borderBottom: activeTab === 'tolls' ? '2px solid var(--primary)' : '2px solid transparent', 
            borderRadius: 0, 
            padding: '12px 16px',
            color: activeTab === 'tolls' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'tolls' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          🎫 Tolls & Fees Ledger ({expenses.length})
        </button>
      </div>

      {/* Subviews */}
      {activeTab === 'summary' && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Fleet Cost Breakdown</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Model</th>
                  <th>Fuel Costs</th>
                  <th>Maintenance Costs</th>
                  <th>Tolls & Fees Costs</th>
                  <th style={{ color: 'var(--cyan)' }}>Total Operating Cost</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles in database.</td>
                  </tr>
                ) : (
                  vehicles.map(v => {
                    const fuel = getVehicleTotalFuel(v.id);
                    const maint = getVehicleTotalMaint(v.id);
                    const other = getVehicleTotalOther(v.id);
                    const total = fuel + maint + other;
                    return (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>{v.name} ({v.reg_number})</td>
                        <td style={{ color: 'var(--amber)' }}>${fuel.toLocaleString()}</td>
                        <td style={{ color: 'var(--rose)' }}>${maint.toLocaleString()}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>${other.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--cyan)' }}>${total.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fuel' && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Fuel Log Ledger</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Liters Filled</th>
                  <th>Refill Cost</th>
                  <th>Average Price</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No fuel entries.</td>
                  </tr>
                ) : (
                  [...fuelLogs].reverse().map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{getVehicleLabel(f.vehicle_id)}</td>
                      <td>{f.date}</td>
                      <td>{f.liters} L</td>
                      <td style={{ fontWeight: 600, color: 'var(--emerald)' }}>${f.cost.toLocaleString()}</td>
                      <td>${(f.cost / f.liters).toFixed(2)}/L</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tolls' && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Tolls, Permits, Fines Ledger</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Expense Category</th>
                  <th>Memo Details</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No expenses recorded.</td>
                  </tr>
                ) : (
                  [...expenses].reverse().map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{getVehicleLabel(e.vehicle_id)}</td>
                      <td>{e.date}</td>
                      <td>
                        <span className={`badge ${e.type.toLowerCase() === 'tolls' ? 'dispatched' : 'retired'}`}>
                          {e.type}
                        </span>
                      </td>
                      <td>{e.description}</td>
                      <td style={{ fontWeight: 600, color: 'var(--rose)' }}>${e.cost.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Fuel Refill</h3>
              <button className="close-x" onClick={() => setShowFuelModal(false)}>×</button>
            </div>
            <form onSubmit={handleFuelSubmit}>
              <div className="modal-body">
                {fuelError && (
                  <div className="alert-box danger" style={{ marginBottom: '16px' }}>
                    <span>{fuelError}</span>
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Vehicle</label>
                    <select value={fuelVehicleId} onChange={(e) => setFuelVehicleId(e.target.value)} required>
                      <option value="">-- Choose Vehicle --</option>
                      {vehicles.filter(v => v.status !== 'Retired').map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.reg_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Liters Filled</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 45.5"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Price ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 90"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Refuel Date</label>
                    <input
                      type="date"
                      value={fuelDate}
                      onChange={(e) => setFuelDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFuelModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Refuel Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Other Expense</h3>
              <button className="close-x" onClick={() => setShowExpModal(false)}>×</button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                {expError && (
                  <div className="alert-box danger" style={{ marginBottom: '16px' }}>
                    <span>{expError}</span>
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Vehicle</label>
                    <select value={expVehicleId} onChange={(e) => setExpVehicleId(e.target.value)} required>
                      <option value="">-- Choose Vehicle --</option>
                      {vehicles.filter(v => v.status !== 'Retired').map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.reg_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expense Type</label>
                    <select value={expType} onChange={(e) => setExpType(e.target.value)}>
                      <option value="Tolls">Road Tolls</option>
                      <option value="Permits">Border/Weight Permits</option>
                      <option value="Fine">Traffic Violation Fine</option>
                      <option value="Insurance">Asset Insurance Fee</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Total Charge ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={expCost}
                      onChange={(e) => setExpCost(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Transaction Date</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Memo Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Expressway exit NH8, peak hours fee"
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
