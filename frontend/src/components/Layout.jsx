import React from 'react';
import { useApp } from '../context/AppContext';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const { currentUser, logout } = useApp();

  // Define tab configuration with access control lists
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] },
    { id: 'fleet', label: 'Fleet Registry', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 11V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1M18 17h1a1 1 0 001-1v-5a1 1 0 00-1-1h-5v7h1', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'], editRoles: ['Fleet Manager'] },
    { id: 'drivers', label: 'Drivers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'], editRoles: ['Fleet Manager', 'Safety Officer'] },
    { id: 'trips', label: 'Trips & Dispatch', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'], editRoles: ['Driver', 'Fleet Manager'] },
    { id: 'maintenance', label: 'Maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'], editRoles: ['Fleet Manager'] },
    { id: 'expenses', label: 'Fuel & Expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Fleet Manager', 'Financial Analyst'] },
    { id: 'analytics', label: 'Analytics & ROI', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['Fleet Manager', 'Financial Analyst', 'Safety Officer'] },
    { id: 'settings', label: 'Settings & RBAC', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'] }
  ];

  const hasAccess = (tab) => {
    return tab.roles.includes(currentUser?.role);
  };

  const handleTabClick = (tab) => {
    if (hasAccess(tab)) {
      setCurrentTab(tab.id);
    } else {
      alert(`Access Denied!\nYour role "${currentUser?.role}" does not have permission to view the "${tab.label}" tab. Only "${tab.roles.join(', ')}" can access this page.`);
    }
  };

  const getUserInitials = () => {
    if (!currentUser?.email) return 'U';
    return currentUser.email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="app-container">
      {/* Fixed Sidebar */}
      <aside className="sidebar">
        <div className="brand-section">
          <svg className="brand-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="brand-name">TransitOps</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <ul className="nav-links">
            {navTabs.map(tab => {
              const accessible = hasAccess(tab);
              return (
                <li key={tab.id}>
                  <a
                    onClick={() => handleTabClick(tab)}
                    className={`nav-item ${currentTab === tab.id ? 'active' : ''}`}
                    style={{
                      opacity: accessible ? 1 : 0.45,
                      cursor: accessible ? 'pointer' : 'not-allowed',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignPage: 'center', gap: '12px', alignItems: 'center' }}>
                      <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                      </svg>
                      <span>{tab.label}</span>
                    </div>
                    {!accessible && <span style={{ fontSize: '0.75rem' }}>🔒</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.email}</span>
              <span className="user-role">{currentUser?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Right Side View */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
