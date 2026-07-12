import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Drivers() {
  const { drivers, addDriver, editDriver, removeDriver, currentUser } = useApp();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Form states
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('Available');
  
  const [formError, setFormError] = useState('');

  const canEdit = currentUser?.role === 'Fleet Manager' || currentUser?.role === 'Safety Officer';

  const resetForm = () => {
    setName('');
    setLicenseNo('');
    setLicenseCategory('');
    setLicenseExpiry('');
    setContact('');
    setSafetyScore('100');
    setStatus('Available');
    setFormError('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (d) => {
    setEditingId(d.id);
    setName(d.name);
    setLicenseNo(d.license_no);
    setLicenseCategory(d.license_category);
    setLicenseExpiry(d.license_expiry);
    setContact(d.contact);
    setSafetyScore(d.safety_score.toString());
    setStatus(d.status);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !licenseNo || !licenseCategory || !licenseExpiry || !contact) {
      setFormError('Please fill in all fields.');
      return;
    }

    const payload = {
      name,
      license_no: licenseNo.trim().toUpperCase(),
      license_category: licenseCategory,
      license_expiry: licenseExpiry,
      contact,
      safety_score: Number(safetyScore),
      status
    };

    try {
      if (editingId) {
        await editDriver(editingId, payload);
      } else {
        await addDriver(payload);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    setNotice({
      type: 'confirm',
      title: 'Remove Driver?',
      message: 'Are you sure you want to remove this driver profile? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await removeDriver(id);
          setNotice({ type: 'success', title: 'Deleted', message: 'Driver successfully removed from the system.' });
        } catch (err) {
          setNotice({ type: 'error', title: 'Deletion Failed', message: err.message });
        }
      }
    });
  };

  // Helper to calculate license status and days left
  const getLicenseStatus = (expiryString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryString);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired (${Math.abs(diffDays)} days ago) 🚨`, color: 'var(--rose)', isExpired: true };
    } else if (diffDays === 0) {
      return { text: `Expires Today! ⚠️`, color: 'var(--amber)', isExpired: false };
    } else if (diffDays <= 30) {
      return { text: `Expiring in ${diffDays} days! ⚠️`, color: 'var(--amber)', isExpired: false };
    } else {
      return { text: `${diffDays} days left`, color: 'var(--emerald)', isExpired: false };
    }
  };

  // Helper to determine Safety Score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--emerald)';
    if (score >= 75) return 'var(--cyan)';
    if (score >= 60) return 'var(--amber)';
    return 'var(--rose)';
  };

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Driver Directory</h1>
          <p>Manage commercial driver profiles, safety scores, and license compliance</p>
        </div>
        <div>
          {canEdit ? (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Register New Driver</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--border-glass)', padding: '6px 12px', borderRadius: '6px' }}>
              🔒 Edit restricted to Fleet Manager & Safety Officer
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>License Details</th>
                <th>Contact</th>
                <th>License Validity</th>
                <th>Safety Score</th>
                <th>Status</th>
                {canEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {drivers.filter(d => statusFilter === 'All' || d.status === statusFilter).length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No drivers found for this status.</td>
                </tr>
              ) : (
                drivers.filter(d => statusFilter === 'All' || d.status === statusFilter).map(d => {
                  const licInfo = getLicenseStatus(d.license_expiry);
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--cyan)', fontSize: '0.85rem' }}>{d.license_no}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category: {d.license_category}</span>
                        </div>
                      </td>
                      <td>{d.contact}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500, color: licInfo.color }}>{licInfo.text}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expiry: {d.license_expiry}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: getScoreColor(d.safety_score) }}>{d.safety_score}</span>
                          <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${d.safety_score}%`, height: '100%', background: getScoreColor(d.safety_score) }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${d.status.toLowerCase().replace(' ', '-')}`}>
                          {d.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEdit(d)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toggle Stat Filters from Wireframe */}
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Toggle Stat:
        </span>
        <button 
          onClick={() => setStatusFilter(statusFilter === 'Available' ? 'All' : 'Available')} 
          className="badge available" 
          style={{ cursor: 'pointer', border: 'none', opacity: statusFilter === 'Available' || statusFilter === 'All' ? 1 : 0.4 }}
        >
          Available
        </button>
        <button 
          onClick={() => setStatusFilter(statusFilter === 'On Trip' ? 'All' : 'On Trip')} 
          className="badge on-trip" 
          style={{ cursor: 'pointer', border: 'none', opacity: statusFilter === 'On Trip' || statusFilter === 'All' ? 1 : 0.4 }}
        >
          On Trip
        </button>
        <button 
          onClick={() => setStatusFilter(statusFilter === 'Off Duty' ? 'All' : 'Off Duty')} 
          className="badge off-duty" 
          style={{ cursor: 'pointer', border: 'none', opacity: statusFilter === 'Off Duty' || statusFilter === 'All' ? 1 : 0.4 }}
        >
          Off Duty
        </button>
        <button 
          onClick={() => setStatusFilter(statusFilter === 'Suspended' ? 'All' : 'Suspended')} 
          className="badge suspended" 
          style={{ cursor: 'pointer', border: 'none', opacity: statusFilter === 'Suspended' || statusFilter === 'All' ? 1 : 0.4 }}
        >
          Suspended
        </button>
        
        <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--amber)' }}>
          Rules: Expired license or Suspended status ➔ blocked from trip assignment
        </span>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Driver Profile' : 'Register New Driver'}</h3>
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
                    <label>Driver Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>License Number (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-12345"
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      disabled={editingId !== null}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>License Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Heavy Rigid / Class A"
                      value={licenseCategory}
                      onChange={(e) => setLicenseCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>License Expiry Date</label>
                    <input
                      type="date"
                      value={licenseExpiry}
                      onChange={(e) => setLicenseExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 019-2234"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Driver Safety Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 95"
                      value={safetyScore}
                      disabled={currentUser?.role === 'Fleet Manager' && currentUser?.role !== 'Safety Officer' && editingId !== null}
                      onChange={(e) => setSafetyScore(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Active Work Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Profile' : 'Register Driver'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centered Notice Modal */}
      {notice && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header" style={{ borderBottom: 'none', justifyContent: 'center', paddingBottom: 0 }}>
              <h3 style={{ fontSize: '1.25rem', color: notice.type === 'error' ? 'var(--rose)' : (notice.type === 'success' ? 'var(--emerald)' : 'white') }}>
                {notice.title}
              </h3>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{notice.message}</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
              {notice.type === 'confirm' ? (
                <>
                  <button className="btn btn-secondary" onClick={() => setNotice(null)}>Go Back</button>
                  <button className="btn btn-danger" onClick={notice.onConfirm}>Yes, Remove</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setNotice(null)}>Okay</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
