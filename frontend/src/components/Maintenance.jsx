import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Maintenance() {
  const { 
    maintenanceLogs, vehicles, addMaintenanceLog, closeMaintenanceLog, currentUser 
  } = useApp();

  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [type, setType] = useState('Preventative');
  const [dateOpened, setDateOpened] = useState(new Date().toISOString().split('T')[0]);
  
  const [formError, setFormError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const isManager = currentUser?.role === 'Fleet Manager';

  // Only allow non-retired vehicles for new maintenance logs
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId || !description || !cost) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      await addMaintenanceLog({
        vehicle_id: Number(vehicleId),
        description,
        cost: Number(cost),
        type,
        date: dateOpened
      });
      setShowModal(false);
      setVehicleId('');
      setDescription('');
      setCost('');
      setType('Preventative');
      setFormError('');
    } catch (err) {
      setFormError(err.message || 'Failed to add maintenance log.');
    }
  };

  const handleCloseLog = async (id) => {
    if (window.confirm('Mark this maintenance issue as resolved? The vehicle status will be restored to Available.')) {
      try {
        await closeMaintenanceLog(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getVehicleLabel = (vId) => {
    const v = vehicles.find(veh => veh.id === vId);
    return v ? `${v.name} (${v.reg_number})` : `Vehicle ID ${vId}`;
  };

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Maintenance Registry</h1>
          <p>Schedule repairs, track mechanical issues, and record shop expenses</p>
        </div>
        <div>
          {isManager ? (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Log Maintenance Event</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--border-glass)', padding: '6px 12px', borderRadius: '6px' }}>
              🔒 Maintenance edits restricted to Fleet Manager
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Opened Date</th>
                <th>Service Description</th>
                <th>Repair Cost</th>
                <th>Log Status</th>
                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No maintenance logs recorded.</td>
                </tr>
              ) : (
                [...maintenanceLogs].reverse().map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{getVehicleLabel(log.vehicle_id)}</td>
                    <td>{log.type || 'Corrective'}</td>
                    <td>{log.date}</td>
                    <td>{log.description}</td>
                    <td style={{ fontWeight: 600, color: 'var(--rose)' }}>${log.cost.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${log.status === 'Open' ? 'in-shop' : 'completed'}`}>
                        {log.status === 'Open' ? 'Open (In Shop)' : 'Closed (Resolved)'}
                      </span>
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        {log.status === 'Open' ? (
                          <button
                            onClick={() => handleCloseLog(log.id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--emerald)', boxShadow: 'none' }}
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resolved ✓</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Maintenance Event</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-box danger" style={{ marginBottom: '16px' }}>
                    <span>{formError}</span>
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Vehicle</label>
                    <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                      <option value="">-- Choose Vehicle --</option>
                      {activeVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.reg_number}) [Currently: {v.status}]
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Maintenance Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Preventative">Preventative Maintenance (Oil/Filter/Tyres)</option>
                      <option value="Corrective">Corrective Repair (Breakdowns)</option>
                      <option value="Inspection">Safety / Regulatory Inspection</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Repair Cost ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date Opened</label>
                    <input
                      type="date"
                      value={dateOpened}
                      onChange={(e) => setDateOpened(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Service Description</label>
                    <textarea
                      rows="3"
                      placeholder="Describe what parts are being replaced or mechanical issues being diagnosed..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send to Shop & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
