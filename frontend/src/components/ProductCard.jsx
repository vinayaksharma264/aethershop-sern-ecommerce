import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image-wrapper">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="product-card-image"
          loading="lazy"
        />
        {isOutOfStock && <span className="badge badge-out">Sold Out</span>}
        {isLowStock && <span className="badge badge-low">Only {product.stock} left</span>}
        <div className="product-card-overlay">
          <span className="view-details-txt">View Product Details</span>
        </div>
      </Link>

      <div className="product-card-content">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card-description">{product.description}</p>
        
        <div className="product-card-footer">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          <button 
            onClick={() => addToCart(product)} 
            disabled={isOutOfStock}
            className={`btn-add-cart flex-align ${isOutOfStock ? 'disabled' : ''}`}
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
