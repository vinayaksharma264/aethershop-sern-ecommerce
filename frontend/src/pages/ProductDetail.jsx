import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_URL } from '../context/AuthContext';
import { ArrowLeft, ShoppingCart, Shield, Truck, RotateCcw } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Retrieving detailed spec sheet...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 flex-center flex-column" style={{ minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--error)' }}>Spec Sheet Loading Failed</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'The requested hardware profile could not be resolved.'}</p>
        <Link to="/" className="btn-primary flex-align" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container product-detail-page">
      <Link to="/" className="btn-back flex-align">
        <ArrowLeft size={16} />
        <span>Back to Catalog</span>
      </Link>

      <div className="product-detail-layout">
        {/* Left Side: Product Image */}
        <div className="product-detail-media">
          <div className="detail-image-card">
            <img src={product.image_url} alt={product.name} className="detail-image" />
            {isOutOfStock && <span className="detail-badge badge-out">Out of Stock</span>}
            {product.stock > 0 && product.stock < 5 && (
              <span className="detail-badge badge-low">Critical Inventory: Only {product.stock} left</span>
            )}
          </div>
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="product-detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>
          <span className="detail-price">${product.price.toFixed(2)}</span>
          
          <div className="detail-separator"></div>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-specifications">
            <div className="spec-item flex-align">
              <Shield size={18} className="spec-icon" />
              <div>
                <h5>3-Year Premium Warranty</h5>
                <p>Complete hardware coverage with onsite repair support.</p>
              </div>
            </div>
            <div className="spec-item flex-align">
              <Truck size={18} className="spec-icon" />
              <div>
                <h5>Free Insured Delivery</h5>
                <p>Ships next day in customized anti-static container packages.</p>
              </div>
            </div>
            <div className="spec-item flex-align">
              <RotateCcw size={18} className="spec-icon" />
              <div>
                <h5>30-Day Technical Returns</h5>
                <p>Easy returns process, zero hassle refunds.</p>
              </div>
            </div>
          </div>

          <div className="detail-separator"></div>

          {/* Action Row */}
          {!isOutOfStock && (
            <div className="detail-action-row">
              <div className="qty-picker">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="qty-btn"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="qty-btn"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn-primary btn-add-cart-detail flex-align">
                <ShoppingCart size={18} />
                <span>Add {quantity} to Cart</span>
              </button>
            </div>
          )}

          {isOutOfStock && (
            <div className="out-of-stock-alert">
              This system node is currently sold out. Click below to sign up for notification triggers when restocked.
              <button disabled className="btn-secondary" style={{ marginTop: '0.8rem', width: '100%' }}>
                Notify Me on Re-entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
