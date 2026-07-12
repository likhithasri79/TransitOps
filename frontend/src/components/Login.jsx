import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, error, clearError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    setLocalError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick preset login helper
  const handleQuickLogin = async (presetEmail, presetPass) => {
    setLocalError('');
    setEmail(presetEmail);
    setPassword(presetPass);
    setSubmitting(true);
    try {
      await login(presetEmail, presetPass);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <svg className="brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h2>TransitOps Login</h2>
          <p>Smart Transport Operations Platform</p>
        </div>

        {(localError || error) && (
          <div className="alert-box danger">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. manager@transitops.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '12px' }}>
            Demo Quick Login Roles
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => handleQuickLogin('manager@transitops.com', 'admin')}
              className="btn btn-secondary"
              style={{ padding: '8px', fontSize: '0.8rem' }}
              disabled={submitting}
            >
              💼 Fleet Manager
            </button>
            <button
              onClick={() => handleQuickLogin('driver@transitops.com', 'driver')}
              className="btn btn-secondary"
              style={{ padding: '8px', fontSize: '0.8rem' }}
              disabled={submitting}
            >
              🚚 Driver / Dispatcher
            </button>
            <button
              onClick={() => handleQuickLogin('safety@transitops.com', 'safety')}
              className="btn btn-secondary"
              style={{ padding: '8px', fontSize: '0.8rem' }}
              disabled={submitting}
            >
              🛡️ Safety Officer
            </button>
            <button
              onClick={() => handleQuickLogin('finance@transitops.com', 'finance')}
              className="btn btn-secondary"
              style={{ padding: '8px', fontSize: '0.8rem' }}
              disabled={submitting}
            >
              📊 Financial Analyst
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
