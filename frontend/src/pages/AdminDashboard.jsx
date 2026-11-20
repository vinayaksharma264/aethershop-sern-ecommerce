import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  DollarSign, Package, ShoppingCart, Users, 
  Plus, Edit, Trash2, X, AlertTriangle, TrendingUp 
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products

  // Product Form State (for Add/Edit Modal)
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('Laptops');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formErr, setFormErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Products list for management
      const productsRes = await fetch(`${API_URL}/products`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormStock('');
    setFormCategory('Laptops');
    setFormImageUrl('');
    setFormErr('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setFormImageUrl(product.image_url);
    setFormErr('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    setSubmitting(true);

    const productPayload = {
      name: formName,
      description: formDesc,
      price: parseFloat(formPrice),
      stock: parseInt(formStock),
      category: formCategory,
      image_url: formImageUrl
    };

    // Validations
    if (!productPayload.name || !productPayload.description || isNaN(productPayload.price) || isNaN(productPayload.stock) || !productPayload.image_url) {
      setFormErr('Please enter valid details in all fields.');
      setSubmitting(false);
      return;
    }

    try {
      let url = `${API_URL}/products`;
      let method = 'POST';

      if (editingProduct) {
        url = `${API_URL}/products/${editingProduct.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productPayload)
      });

      if (response.ok) {
        setShowModal(false);
        // Reload dashboard
        loadDashboardData();
      } else {
        const errData = await response.json();
        setFormErr(errData.message || 'Error processing request');
      }
    } catch (err) {
      setFormErr('Server connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to shut down this product node?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
        // Refresh stats
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="container py-5 flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Syncing analytics core modules...</p>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard">
      <div className="admin-header flex-align justify-between">
        <div>
          <h1>Aether Administrative Dashboard</h1>
          <p className="admin-subtitle">System hardware node controls and telemetry records</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex-align">
          <Plus size={18} />
          <span>Provision New System</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Telemetry Overview
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          System Inventories
        </button>
      </div>

      {/* Overview Content */}
      {activeTab === 'overview' && stats && (
        <div className="dashboard-content">
          {/* Stats Widget Row */}
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-card-icon-wrapper sales-icon">
                <DollarSign size={24} />
              </div>
              <div className="stats-card-info">
                <span className="stats-label">Accumulated Revenue</span>
                <h3>${stats.overview.totalSales.toFixed(2)}</h3>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-icon-wrapper orders-icon">
                <ShoppingCart size={24} />
              </div>
              <div className="stats-card-info">
                <span className="stats-label">Active Orders</span>
                <h3>{stats.overview.totalOrders}</h3>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-icon-wrapper users-icon">
                <Users size={24} />
              </div>
              <div className="stats-card-info">
                <span className="stats-label">Authorized Clients</span>
                <h3>{stats.overview.totalUsers}</h3>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-icon-wrapper products-icon">
                <Package size={24} />
              </div>
              <div className="stats-card-info">
                <span className="stats-label">Active Catalog Items</span>
                <h3>{stats.overview.totalProducts}</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-subgrid">
            {/* Low Stock Alerts */}
            <div className="dashboard-panel stock-panel">
              <div className="panel-header flex-align">
                <AlertTriangle size={18} className="warning-color" />
                <h4>Critical Stock Allocations</h4>
              </div>
              <div className="panel-body">
                {stats.lowStock.length === 0 ? (
                  <p className="no-data-msg">✅ All systems within standard supply constraints.</p>
                ) : (
                  <div className="stock-alerts-list">
                    {stats.lowStock.map(item => (
                      <div key={item.id} className="stock-alert-item flex-align justify-between">
                        <div>
                          <strong>{item.name}</strong>
                          <span className="item-price-lbl">${item.price.toFixed(2)}</span>
                        </div>
                        <span className={`stock-level-badge ${item.stock === 0 ? 'empty' : 'warning'}`}>
                          {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Performance */}
            <div className="dashboard-panel categories-panel">
              <div className="panel-header flex-align">
                <TrendingUp size={18} className="accent-color" />
                <h4>Hardware Sector Sales</h4>
              </div>
              <div className="panel-body">
                {stats.categorySales.length === 0 ? (
                  <p className="no-data-msg">No sales data compiled for this telemetry node cycle.</p>
                ) : (
                  <div className="category-sales-list">
                    {stats.categorySales.map((salesData, idx) => (
                      <div key={idx} className="category-sales-item">
                        <div className="category-sales-info flex-align justify-between">
                          <span>{salesData.category}</span>
                          <strong>${salesData.sales.toFixed(2)}</strong>
                        </div>
                        <div className="sales-progress-track">
                          <div 
                            className="sales-progress-fill" 
                            style={{ 
                              width: `${Math.min(100, (salesData.sales / (stats.overview.totalSales || 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Inventory Content */}
      {activeTab === 'products' && (
        <div className="dashboard-panel products-panel">
          <div className="products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product Node Details</th>
                  <th>Category</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Current Stock</th>
                  <th className="text-center">Database Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product-cell flex-align">
                        <img src={product.image_url} alt={product.name} className="table-product-img" />
                        <div>
                          <span className="table-product-name">{product.name}</span>
                          <span className="table-product-id">Node: #P-{product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-tag">{product.category}</span></td>
                    <td className="text-right font-medium">${product.price.toFixed(2)}</td>
                    <td className="text-right">
                      <span className={`table-stock-val ${product.stock < 5 ? 'critical-stock' : ''}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="table-actions flex-align justify-center">
                        <button 
                          onClick={() => openEditModal(product)} 
                          className="btn-table-action btn-edit"
                          title="Edit Node Spec"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="btn-table-action btn-delete"
                          title="Deprovision Node"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal-backdrop flex-center">
          <div className="modal-card">
            <div className="modal-header flex-align justify-between">
              <h3>{editingProduct ? 'Edit System Node Profile' : 'Provision New System Node'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formErr && <div className="alert alert-error">{formErr}</div>}

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)}
                    placeholder="AetherBook Pro"
                  />
                </div>

                <div className="input-group">
                  <label>Category Sector</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Displays">Displays</option>
                    <option value="Phones">Phones</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Listing Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formPrice} 
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="1299.99"
                  />
                </div>

                <div className="input-group">
                  <label>Inventory Stock</label>
                  <input 
                    type="number" 
                    required 
                    value={formStock} 
                    onChange={e => setFormStock(e.target.value)}
                    placeholder="20"
                  />
                </div>

                <div className="input-group full-width">
                  <label>Image Resource Link (URL)</label>
                  <input 
                    type="url" 
                    required 
                    value={formImageUrl} 
                    onChange={e => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div className="input-group full-width">
                  <label>Technical Description</label>
                  <textarea 
                    required 
                    rows={4}
                    value={formDesc} 
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Provide full technical specs, CPU cores, display configurations..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Abort
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Committing Logs...' : editingProduct ? 'Save Changes' : 'Commit Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
