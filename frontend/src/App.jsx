import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Drivers from './components/Drivers';
import Trips from './components/Trips';
import Maintenance from './components/Maintenance';
import Expenses from './components/Expenses';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

function App() {
  const { currentUser, loading } = useApp();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (loading && !currentUser) {
    return (
      <div className="login-overlay">
        <div className="login-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <svg className="brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1.5s linear infinite', width: '48px', height: '48px', margin: '0 auto 20px auto' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h2>Loading TransitOps</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Configuring fleet database secure tables...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fleet':
        return <Fleet />;
      case 'drivers':
        return <Drivers />;
      case 'trips':
        return <Trips />;
      case 'maintenance':
        return <Maintenance />;
      case 'expenses':
        return <Expenses />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderTabContent()}
    </Layout>
  );
}

export default App;
