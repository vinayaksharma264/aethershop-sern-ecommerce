import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, KeyRound, Mail, User } from 'lucide-react';

const Register = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErr, setFormErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setFormErr(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <ShoppingBag className="auth-logo-icon" />
          <h2>AETHER<span>SHOP</span></h2>
          <p>Register New Node Identity</p>
        </div>

        {formErr && <div className="alert alert-error">{formErr}</div>}
        {error && !formErr && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
              />
            </div>
          </div>

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
                placeholder="alex.mercer@domain.com"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Create Access Security Key</label>
            <div className="input-wrapper">
              <KeyRound className="input-icon" size={16} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Compiling Registry Nodes...' : 'Register Connection'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already authorized? <Link to="/login">Connect existing node</Link></p>
        </div>

        <div className="auth-note-box">
          💡 **Placement Testing Note**: Registering an email address ending with `@aether.com` (e.g. `admin@aether.com`) automatically triggers the database backend to flag the new registry as **Admin**, granting access to CRUD operations and statistics dashboards.
        </div>
      </div>
    </div>
  );
};

export default Register;
