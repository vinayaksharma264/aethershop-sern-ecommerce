import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, LayoutDashboard, History, ShoppingBag, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <ShoppingBag className="brand-icon" />
          <span>AETHER<span className="brand-accent">SHOP</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-item">Catalog</Link>
          
          {user && (
            <Link to="/orders" className="nav-item flex-align">
              <History size={18} />
              <span>Orders</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-item flex-align admin-link">
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </Link>
          )}

          <Link to="/cart" className="nav-item cart-btn flex-align">
            <div className="cart-icon-wrapper">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </Link>

          {user ? (
            <div className="user-menu">
              <div className="user-profile flex-align">
                <User size={18} className="profile-icon" />
                <span className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn flex-align" title="Logout">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
