import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, KeyRound, Mail, User } from 'lucide-react';

const Login = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErr, setFormErr] = useState('');

  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect back to cart or home
      navigate(redirect ? `/${redirect}` : '/');
    } catch (err) {
      setFormErr(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@aether.com');
    setPassword('admin123');
  };

  const autofillUser = () => {
    setEmail('vinay@example.com');
    setPassword('password123');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <ShoppingBag className="auth-logo-icon" />
          <h2>AETHER<span>SHOP</span></h2>
          <p>Initialize Secure Node Connection</p>
        </div>

        {formErr && <div className="alert alert-error">{formErr}</div>}
        {error && !formErr && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Node Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@domain.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Access Security Key</label>
            <div className="input-wrapper">
              <KeyRound className="input-icon" size={16} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Decrypting Access Token...' : 'Authorize Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>No authorization record? <Link to="/register">Create new node registry</Link></p>
        </div>

        <div className="auth-presets">
          <p>Quick Access Presets for Placement Reviewers:</p>
          <div className="preset-buttons">
            <button onClick={autofillAdmin} className="btn-preset admin-preset flex-align">
              <KeyRound size={12} />
              <span>Admin Profile Preset</span>
            </button>
            <button onClick={autofillUser} className="btn-preset user-preset flex-align">
              <User size={12} />
              <span>Regular User Profile</span>
            </button>
          </div>
          <span className="preset-note">Note: If profiles are not registered in SQLite database yet, go to Sign Up first.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
