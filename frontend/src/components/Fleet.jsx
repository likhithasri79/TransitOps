import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Fleet() {
  const { vehicles, addVehicle, editVehicle, removeVehicle, currentUser } = useApp();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [status, setStatus] = useState('Available');
  
  const [formError, setFormError] = useState('');

  const isManager = currentUser?.role === 'Fleet Manager';

  const resetForm = () => {
    setName('');
    setRegNumber('');
    setType('Van');
    setCapacity('');
    setOdometer('');
    setAcquisitionCost('');
    setStatus('Available');
    setFormError('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setName(v.name);
    setRegNumber(v.reg_number);
    setType(v.type);
    setCapacity(v.capacity.toString());
    setOdometer(v.odometer.toString());
    setAcquisitionCost(v.acquisition_cost.toString());
    setStatus(v.status);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !regNumber || !capacity || !odometer || !acquisitionCost) {
      setFormError('Please fill in all fields.');
      return;
    }

    const payload = {
      name,
      reg_number: regNumber.trim().toUpperCase(),
      type,
      capacity: Number(capacity),
      odometer: Number(odometer),
      acquisition_cost: Number(acquisitionCost),
      status
    };

    try {
      if (editingId) {
        await editVehicle(editingId, payload);
      } else {
        await addVehicle(payload);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to retire/remove this vehicle from the database?')) {
      try {
        await removeVehicle(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Vehicle Registry</h1>
          <p>Manage and audit company-owned transport assets</p>
        </div>
        <div>
          {isManager ? (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Vehicle</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--border-glass)', padding: '6px 12px', borderRadius: '6px' }}>
              🔒 Edit restricted to Fleet Manager
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Name / Model</th>
                <th>Type</th>
                <th>Max Payload</th>
                <th>Odometer</th>
                <th>Acquisition Cost</th>
                <th>Status</th>
                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicles in database.</td>
                </tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 700, color: 'var(--cyan)' }}>{v.reg_number}</td>
                    <td style={{ fontWeight: 600 }}>{v.name}</td>
                    <td>{v.type}</td>
                    <td>{v.capacity.toLocaleString()} kg</td>
                    <td>{v.odometer.toLocaleString()} km</td>
                    <td>${v.acquisition_cost.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.status.toLowerCase().replace(' ', '-')}`}>
                        {v.status}
                      </span>
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h3>
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
                    <label>Registration Number (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. VAN-05"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      disabled={editingId !== null} // Lock registration edit on edit mode
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Name / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Ford Transit"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Trailer">Trailer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Load Capacity (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Odometer (km)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Acquisition Cost ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={acquisitionCost}
                      onChange={(e) => setAcquisitionCost(e.target.value)}
                      required
                    />
                  </div>
                  {editingId && (
                    <div className="form-group">
                      <label>Physical Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="In Shop">In Shop</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Register Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
