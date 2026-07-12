import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, error, clearError } = useApp();

  // Views toggle state: 'login' | 'forgot' | 'reset-sent'
  const [view, setView] = useState('login');

  // Login form states
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Auto-fill form values when role is selected
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    clearError();
    setLocalError('');
    if (role === 'Fleet Manager') {
      setEmail('manager@transitops.com');
      setPassword('admin');
    } else if (role === 'Driver') {
      setEmail('driver@transitops.com');
      setPassword('driver');
    } else if (role === 'Safety Officer') {
      setEmail('safety@transitops.com');
      setPassword('safety');
    } else if (role === 'Financial Analyst') {
      setEmail('finance@transitops.com');
      setPassword('finance');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Error / Status feedback
  const [localError, setLocalError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill email if Remember Me was previously activated
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('transitops_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setLocalError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // If remember me is active, store email. Otherwise, delete it.
      if (rememberMe) {
        localStorage.setItem('transitops_remembered_email', email.trim());
      } else {
        localStorage.removeItem('transitops_remembered_email');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setLocalError('Please enter your email.');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setLocalError('');
    setSubmitting(true);

    // Simulate database recovery request
    setTimeout(() => {
      // Preset credentials checking for helper display
      const presets = {
        'manager@transitops.com': 'admin',
        'driver@transitops.com': 'driver',
        'safety@transitops.com': 'safety',
        'finance@transitops.com': 'finance'
      };

      const cleanEmail = forgotEmail.toLowerCase().trim();
      const foundPass = presets[cleanEmail];
      if (foundPass) {
        setStatusMessage(`A secure password recovery link has been dispatched to ${cleanEmail}. (Demo Mode: Your password is "${foundPass}")`);
      } else {
        setStatusMessage(`A secure password recovery link has been dispatched to ${cleanEmail} if the account exists.`);
      }

      setView('reset-sent');
      setSubmitting(false);
    }, 800);
  };

  const handleBackToLogin = () => {
    setLocalError('');
    setStatusMessage('');
    setView('login');
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <svg className="brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h2>TransitOps</h2>
          <p>Smart Transport Operations Platform</p>
        </div>

        {/* Errors Container */}
        {(localError || error) && (
          <div className="alert-box danger">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{localError || error}</span>
          </div>
        )}

        {/* View 1: Standard Login Form */}
        {view === 'login' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Select Demo Role / Profile</label>
              <select value={selectedRole} onChange={handleRoleChange}>
                <option value="">-- Manual Entry / Custom Email --</option>
                <option value="Fleet Manager">💼 Fleet Manager (Admin)</option>
                <option value="Driver">🚚 Driver / Dispatcher</option>
                <option value="Safety Officer">🛡️ Safety Officer</option>
                <option value="Financial Analyst">📊 Financial Analyst</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. manager@transitops.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                  setLocalError('');
                }}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <a
                  onClick={() => { setView('forgot'); setLocalError(''); }}
                  style={{ fontSize: '0.8rem', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 500 }}
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                  setLocalError('');
                }}
                required
              />
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none' }}>
                Remember Me
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* View 2: Forgot Password Form */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Enter your registered email address below. We will send you instructions to reset your password.
            </p>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="e.g. manager@transitops.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px' }}>
              {submitting ? 'Sending Request...' : 'Send Recovery Instructions'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBackToLogin}
              style={{ padding: '10px' }}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* View 3: Reset Instructions Sent Notification */}
        {view === 'reset-sent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div className="alert-box success" style={{ textAlign: 'left', lineHeight: '1.4' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{statusMessage}</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Please check your inbox (and spam folder) for the confirmation link.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBackToLogin}
              style={{ marginTop: '8px' }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
