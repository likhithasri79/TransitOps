import React from 'react';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { vehicles, trips, fuelLogs, maintenanceLogs, expenses } = useApp();

  // Financial constants
  const REVENUE_PER_KM = 3.00; // Flat logistics freight rate of $3 per km

  // Calculations helper for each vehicle
  const getVehicleFinancials = (v) => {
    const completedTrips = trips.filter(t => t.vehicle_id === v.id && t.status === 'Completed');
    
    // Total Distance Driven
    const totalDistance = completedTrips.reduce((sum, curr) => sum + curr.planned_distance, 0);
    
    // Projected Revenue
    const revenue = totalDistance * REVENUE_PER_KM;

    // Operational Costs
    const fuelCost = fuelLogs.filter(f => f.vehicle_id === v.id).reduce((sum, curr) => sum + curr.cost, 0);
    const fuelLiters = fuelLogs.filter(f => f.vehicle_id === v.id).reduce((sum, curr) => sum + curr.liters, 0);
    const maintCost = maintenanceLogs.filter(m => m.vehicle_id === v.id).reduce((sum, curr) => sum + curr.cost, 0);
    const otherCost = expenses.filter(e => e.vehicle_id === v.id).reduce((sum, curr) => sum + curr.cost, 0);
    const operatingCost = fuelCost + maintCost + otherCost;

    // Net Profit
    const netProfit = revenue - operatingCost;

    // Fuel Efficiency (Distance / Liters)
    const efficiency = fuelLiters > 0 ? (totalDistance / fuelLiters).toFixed(1) : '0.0';

    // ROI = (Revenue - (Maint + Fuel + Other)) / Acquisition Cost * 100
    const roi = v.acquisition_cost > 0 
      ? ((netProfit / v.acquisition_cost) * 100).toFixed(1) 
      : '0.0';

    return {
      reg_number: v.reg_number,
      name: v.name,
      distance: totalDistance,
      liters: fuelLiters,
      efficiency,
      operatingCost,
      revenue,
      netProfit,
      roi
    };
  };

  const fleetData = vehicles.map(v => getVehicleFinancials(v));

  // Fleet-wide averages/totals
  const totalFleetDistance = fleetData.reduce((sum, curr) => sum + curr.distance, 0);
  const totalFleetRevenue = fleetData.reduce((sum, curr) => sum + curr.revenue, 0);
  const totalFleetCost = fleetData.reduce((sum, curr) => sum + curr.operatingCost, 0);
  const averageEfficiency = fleetData.filter(d => Number(d.efficiency) > 0).length > 0
    ? (fleetData.reduce((sum, curr) => sum + Number(curr.efficiency), 0) / fleetData.filter(d => Number(d.efficiency) > 0).length).toFixed(1)
    : '0.0';
  const averageRoi = fleetData.length > 0
    ? (fleetData.reduce((sum, curr) => sum + Number(curr.roi), 0) / fleetData.length).toFixed(1)
    : '0.0';

  // CSV Export Handler
  const exportToCSV = () => {
    if (fleetData.length === 0) return;
    
    // Headers
    const headers = ['Registration Number', 'Vehicle Model', 'Distance Driven (km)', 'Fuel Consumed (L)', 'Efficiency (km/L)', 'Operating Cost ($)', 'Projected Revenue ($)', 'Net Profit ($)', 'ROI (%)'];
    
    // Build rows
    const rows = fleetData.map(d => [
      d.reg_number,
      d.name,
      d.distance,
      d.liters,
      d.efficiency,
      d.operatingCost,
      d.revenue,
      d.netProfit,
      d.roi
    ]);

    // CSV format assembly
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="header-bar">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Analyze vehicle returns, fleet fuel efficiency, and download CSV sheets</p>
        </div>
        <button className="btn btn-primary" onClick={exportToCSV} disabled={fleetData.length === 0}>
          📥 Export Fleet Financials (CSV)
        </button>
      </div>

      {/* Analytics KPI summary */}
      <div className="kpi-grid">
        <div className="card kpi-card cyan">
          <span className="kpi-label">Total Projected Revenue</span>
          <span className="kpi-value">${totalFleetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="card kpi-card rose">
          <span className="kpi-label">Total Fleet Cost</span>
          <span className="kpi-value">${totalFleetCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="card kpi-card emerald">
          <span className="kpi-label">Fleet Profit Margin</span>
          <span className="kpi-value">
            ${(totalFleetRevenue - totalFleetCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="card kpi-card cyan">
          <span className="kpi-label">Avg Fuel Efficiency</span>
          <span className="kpi-value">{averageEfficiency} km/L</span>
        </div>
        <div className="card kpi-card" style={{ borderLeftColor: 'var(--cyan)' }}>
          <span className="kpi-label">Average Vehicle ROI</span>
          <span className="kpi-value" style={{ color: Number(averageRoi) >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
            {averageRoi}%
          </span>
        </div>
      </div>

      {/* Detailed Financial Registry */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Fleet ROI & Performance Statement</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Freight Revenue modeled at ${REVENUE_PER_KM.toFixed(2)}/km driven on completed dispatches
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Model</th>
                <th>Distance</th>
                <th>Fuel (L)</th>
                <th>Efficiency</th>
                <th>Operating Cost</th>
                <th>Revenue</th>
                <th>Net Profit</th>
                <th style={{ color: 'var(--cyan)' }}>ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {fleetData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No records available.</td>
                </tr>
              ) : (
                fleetData.map(d => (
                  <tr key={d.reg_number}>
                    <td style={{ fontWeight: 700, color: 'var(--cyan)' }}>{d.reg_number}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>{d.distance.toLocaleString()} km</td>
                    <td>{d.liters} L</td>
                    <td style={{ fontWeight: 600 }}>{d.efficiency} km/L</td>
                    <td style={{ color: 'var(--rose)' }}>${d.operatingCost.toLocaleString()}</td>
                    <td style={{ color: 'var(--emerald)' }}>${d.revenue.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: d.netProfit >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                      {d.netProfit >= 0 ? '+' : ''}${d.netProfit.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: Number(d.roi) >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                      {d.roi}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
