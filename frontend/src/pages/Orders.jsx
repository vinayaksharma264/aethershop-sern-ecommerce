import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { History, Package, Calendar, DollarSign, RefreshCw, CheckCircle2 } from 'lucide-react';

const Orders = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // Refresh local orders list
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Syncing order history ledger...</p>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <div className="orders-header flex-align justify-between">
        <div>
          <h1>{user?.role === 'admin' ? 'Global Orders Ledger' : 'Your Order History'}</h1>
          <p className="orders-subtitle">
            {user?.role === 'admin' 
              ? 'Real-time overview of customer purchase orders and system logs' 
              : 'Detailed history of authorized transactions and hardware shipments'}
          </p>
        </div>
        <button onClick={fetchOrders} className="btn-refresh flex-align">
          <RefreshCw size={16} />
          <span>Refresh List</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-container flex-center flex-column">
          <History size={48} className="empty-orders-icon" />
          <h3>No transactions recorded</h3>
          <p>No checkout orders have been created by this user account nodes yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Order Card Header */}
              <div className="order-card-header">
                <div className="header-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">TRANSACTION NODE</span>
                    <span className="meta-value">#AETHER-{order.id}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">DATE ENCRYPTED</span>
                    <span className="meta-value flex-align">
                      <Calendar size={14} />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">TOTAL CAPITAL</span>
                    <span className="meta-value flex-align price-val">
                      <DollarSign size={14} />
                      <span>{order.total_amount.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">PAYMENT STATE</span>
                    <span className={`status-badge payment-${order.payment_status}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Admin Status Actions */}
                {user?.role === 'admin' && (
                  <div className="admin-status-controls flex-align">
                    <span className="control-label">Update Shipment Node:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="admin-status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                {user?.role !== 'admin' && (
                  <div className="user-status-display">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Order User details (For Admin view) */}
              {user?.role === 'admin' && (
                <div className="order-customer-details">
                  👤 Customer Node: <strong>{order.user_name}</strong> ({order.user_email})
                </div>
              )}

              {/* Order Items Table */}
              <div className="order-card-body">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row flex-align">
                    <img src={item.image_url} alt={item.product_name} className="order-item-img" />
                    
                    <div className="order-item-info">
                      <h4>{item.product_name}</h4>
                      <p className="order-item-qty">Quantity allocated: {item.quantity}</p>
                    </div>

                    <div className="order-item-pricing text-right">
                      <span className="order-item-price-unit">${item.price.toFixed(2)} each</span>
                      <span className="order-item-price-sub">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
