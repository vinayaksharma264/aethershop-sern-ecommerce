import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../context/AuthContext';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  
  const categories = ['All', 'Laptops', 'Audio', 'Wearables', 'Displays', 'Phones', 'Accessories'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/products?`;
        if (category && category !== 'All') url += `category=${category}&`;
        if (search) url += `search=${search}&`;
        if (sort) url += `sort=${sort}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [category, search, sort]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tagline">FUTURE HARDWARE EXPERIENCE</span>
          <h1>Engineered For Your Digital Atmosphere</h1>
          <p>
            Discover next-generation processors, crystal OLED screens, and audio fidelity that defines your workspace. 
          </p>
          <a href="#catalog" className="btn-hero-cta">Explore Catalog</a>
        </div>
      </section>

      {/* Catalog Search & Filtering */}
      <section id="catalog" className="catalog-section">
        <div className="catalog-controls">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search products by title or features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-sort-controls">
            <div className="sort-wrapper">
              <SlidersHorizontal size={16} />
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="sort-select"
              >
                <option value="">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Tab Row */}
        <div className="categories-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`category-tab-btn ${
                (cat === 'All' && !category) || category === cat ? 'active' : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid / Skeleton */}
        {loading ? (
          <div className="products-grid">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-desc"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-text skeleton-price"></div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-catalog">
            <ShoppingBag size={48} className="empty-catalog-icon" />
            <h3>No products found</h3>
            <p>We couldn't find anything matching your search. Try adjusting your filters or category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
