import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Trips() {
  const { 
    trips, vehicles, drivers, addTrip, dispatchTrip, completeTrip, cancelTrip, currentUser 
  } = useApp();

  // Search filter
  const [search, setSearch] = useState('');

  // Form states
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');

  // Completion Modal states
  const [showCompModal, setShowCompModal] = useState(false);
  const [activeTripForComp, setActiveTripForComp] = useState(null);
  const [finalOdo, setFinalOdo] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [compError, setCompError] = useState('');

  const [formError, setFormError] = useState('');

  const canEdit = currentUser?.role === 'Driver' || currentUser?.role === 'Fleet Manager';

  // Get only AVAILABLE vehicles for the selector dropdown
  // NOTE: If we are EDITING a trip or viewing a draft, the currently selected vehicle should also appear in the pool.
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => {
    // Exclude expired licenses
    const isExpired = new Date(d.license_expiry) <= new Date();
    return d.status === 'Available' && !isExpired;
  });

  // Calculate live validation for weight capacity
  const selectedVehicle = vehicles.find(v => v.id === Number(vehicleId));
  const isOverweight = selectedVehicle && Number(cargoWeight) > selectedVehicle.capacity;
  const weightDifference = isOverweight ? Number(cargoWeight) - selectedVehicle.capacity : 0;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (isOverweight) {
      setFormError('Cannot dispatch: cargo weight exceeds vehicle capacity.');
      return;
    }

    const payload = {
      source,
      destination,
      vehicle_id: Number(vehicleId),
      driver_id: Number(driverId),
      cargo_weight: Number(cargoWeight),
      planned_distance: Number(plannedDistance)
    };

    try {
      await addTrip(payload);
      // Reset form
      setSource('');
      setDestination('');
      setVehicleId('');
      setDriverId('');
      setCargoWeight('');
      setPlannedDistance('');
      setFormError('');
    } catch (err) {
      setFormError(err.message || 'Failed to create trip.');
    }
  };

  const handleDispatch = async (id) => {
    try {
      await dispatchTrip(id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this trip? Both driver and vehicle will be returned to Available.')) {
      try {
        await cancelTrip(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const openCompletionModal = (trip) => {
    const v = vehicles.find(veh => veh.id === trip.vehicle_id);
    setActiveTripForComp(trip);
    setFinalOdo(v ? (v.odometer + trip.planned_distance).toString() : '');
    setFuelLiters('');
    setFuelCost('');
    setCompError('');
    setShowCompModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!finalOdo) {
      setCompError('Please enter final odometer reading.');
      return;
    }
    try {
      await completeTrip(activeTripForComp.id, {
        final_odometer: Number(finalOdo),
        fuel_liters: fuelLiters ? Number(fuelLiters) : null,
        fuel_cost: fuelCost ? Number(fuelCost) : null
      });
      setShowCompModal(false);
    } catch (err) {
      setCompError(err.message || 'Completion failed.');
    }
  };

  // Helper formatting values for listing
  const getVehicleLabel = (vId) => {
    const v = vehicles.find(veh => veh.id === vId);
    return v ? `${v.name} (${v.reg_number})` : 'Unassigned';
  };

  const getDriverLabel = (dId) => {
    const d = drivers.find(drv => drv.id === dId);
    return d ? d.name : 'Unassigned';
  };

  const filteredTrips = trips.filter(t => {
    const vLabel = getVehicleLabel(t.vehicle_id).toLowerCase();
    const dLabel = getDriverLabel(t.driver_id).toLowerCase();
    const matchSearch = t.source.toLowerCase().includes(search.toLowerCase()) ||
                        t.destination.toLowerCase().includes(search.toLowerCase()) ||
                        vLabel.includes(search.toLowerCase()) ||
                        dLabel.includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Trip Dispatcher</h1>
          <p>Schedule dispatches, manage vehicle loads, and view active deliveries</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px', alignItems: 'start' }}>
        {/* Left Side: Create Trip Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Schedule New Dispatch</h2>
          {canEdit ? (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div className="alert-box danger">
                  <span>{formError}</span>
                </div>
              )}
              
              <div className="form-group">
                <label>Source Location</label>
                <input
                  type="text"
                  placeholder="e.g. Gandhinagar Depot"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad Hub"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle (Available Only)</label>
                <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
                  <option value="">-- Select Available Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.reg_number}) - Cap: {v.capacity} kg
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Driver (Available & Valid License)</label>
                <select value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
                  <option value="">-- Select Available Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Score: {d.safety_score})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cargo Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Planned Distance (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 38"
                  value={plannedDistance}
                  onChange={(e) => setPlannedDistance(e.target.value)}
                  required
                />
              </div>

              {/* Live Weight Warning matching Excalidraw */}
              {isOverweight && (
                <div className="alert-box danger" style={{ borderStyle: 'dashed' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span style={{ fontWeight: 600 }}>Overloaded:</span> Capacity is {selectedVehicle.capacity} kg but load is {cargoWeight} kg.<br />
                    <strong>Capacity exceeded by {weightDifference} kg — dispatch blocked</strong>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={isOverweight}>
                Create Draft Trip
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
              🔒 Scheduler restricted to Driver / Dispatcher & Fleet Manager roles.
            </div>
          )}
        </div>

        {/* Right Side: Live Board List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Live Dispatch Board</h2>
            <input
              type="text"
              placeholder="Search source, driver, truck..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredTrips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No active dispatches found.
              </div>
            ) : (
              filteredTrips.map(trip => {
                const isDispatched = trip.status === 'Dispatched';
                const isDraft = trip.status === 'Draft';
                return (
                  <div
                    key={trip.id}
                    className="card"
                    style={{
                      padding: '16px',
                      background: 'rgba(13, 20, 35, 0.4)',
                      borderStyle: isDispatched ? 'solid' : 'dashed',
                      borderColor: isDispatched ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-glass)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>TR{trip.id.toString().slice(-4)}</span>
                          <span className={`badge ${trip.status.toLowerCase()}`}>{trip.status}</span>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '1rem' }}>
                          {trip.source} ➔ {trip.destination}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          🚚 {getVehicleLabel(trip.vehicle_id)} &nbsp;|&nbsp; 🧑 {getDriverLabel(trip.driver_id)}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Cargo: {trip.cargo_weight} kg &nbsp;|&nbsp; Distance: {trip.planned_distance} km
                        </p>
                      </div>

                      {canEdit && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          {isDraft && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleDispatch(trip.id)}
                            >
                              Dispatch
                            </button>
                          )}
                          {isDispatched && (
                            <>
                              <button
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--emerald)', boxShadow: 'none' }}
                                onClick={() => openCompletionModal(trip)}
                              >
                                Complete
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                onClick={() => handleCancel(trip.id)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {showCompModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Complete Dispatch TR{activeTripForComp?.id.toString().slice(-4)}</h3>
              <button className="close-x" onClick={() => setShowCompModal(false)}>×</button>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {compError && (
                  <div className="alert-box danger">
                    <span>{compError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label>Final Odometer Reading (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10238"
                    value={finalOdo}
                    onChange={(e) => setFinalOdo(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Starting odometer was {vehicles.find(v => v.id === activeTripForComp?.vehicle_id)?.odometer} km.
                  </p>
                </div>

                <div className="form-group">
                  <label>Fuel Consumed (Liters - Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 6.2"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Total Cost ($ - Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--emerald)' }}>
                  Save and Release Assets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
