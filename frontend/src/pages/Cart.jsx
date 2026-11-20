import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, API_URL } from '../context/AuthContext';
import { Trash2, ShoppingBag, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';

const Cart = () => {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!token) {
      // User is not authenticated, redirect to login page with redirect param
      navigate('/login?redirect=cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: cartTotal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      setOrderId(data.orderId);
      setCheckoutSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="container py-5 checkout-success-container flex-center flex-column">
        <CheckCircle size={64} className="success-icon" />
        <h2>Transaction Authorized</h2>
        <p>Order reference node: <strong className="order-node-id">#AETHER-{orderId}</strong></p>
        <p className="success-sub">Thank you for your purchase. The system inventory has updated and your hardware configuration has entered the processing queue.</p>
        <div className="success-actions">
          <Link to="/orders" className="btn-primary">View Order Ledger</Link>
          <Link to="/" className="btn-secondary">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 empty-cart-container flex-center flex-column">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Cart is empty</h2>
        <p>No systems, peripherals, or specs currently compiled in local memory buffer.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '1.5rem' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Your Order Buffer</h1>
      
      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <div key={item.product_id} className="cart-item-card flex-align">
              <img src={item.image_url} alt={item.name} className="cart-item-img" />
              
              <div className="cart-item-info">
                <h4><Link to={`/product/${item.product_id}`}>{item.name}</Link></h4>
                <span className="cart-item-price">${item.price.toFixed(2)} each</span>
              </div>

              <div className="cart-item-qty">
                <button 
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>

              <span className="cart-item-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </span>

              <button 
                onClick={() => removeFromCart(item.product_id)} 
                className="btn-remove-item"
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button onClick={clearCart} className="btn-clear-cart">
            Clear Local Memory Buffer
          </button>
        </div>

        {/* Right: Summary Box */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Receipt Summary</h3>
            <div className="summary-row">
              <span>System count</span>
              <span>{cartCount} items</span>
            </div>
            <div className="summary-row">
              <span>Standard Insured Shipping</span>
              <span className="shipping-cost">FREE</span>
            </div>
            <div className="summary-row">
              <span>Environmental Tax</span>
              <span>$0.00</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total-row">
              <span>Total Price</span>
              <span className="summary-total">${cartTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={loading}
              className="btn-checkout flex-align"
            >
              {loading ? (
                <span>Authorizing Link...</span>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>{token ? 'Secure Checkout' : 'Login to Checkout'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="summary-security-note">
              🔒 Encrypted JWT Transaction node. System stock allocation secured immediately upon completion.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
