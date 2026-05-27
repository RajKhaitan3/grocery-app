import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');

  // Fetch Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string based on current filters
        let query = '/products?';
        if (selectedCategory) query += `category=${selectedCategory}&`;
        if (searchTerm) query += `search=${searchTerm}&`;
        if (sortBy) query += `sort=${sortBy}&`;
        
        const { data } = await API.get(query);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Update URL params
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
    
  }, [selectedCategory, searchTerm, sortBy, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will trigger automatically because searchTerm is in dependency array
    // We just need to make sure the state is updated when they submit the form, 
    // but we're also updating on onChange. A form submit is good for UX.
  };

  return (
    <div className="products-page page">
      {/* Sidebar Filters */}
      <aside className="sidebar">
        <h3 className="sidebar__title">
          <FiFilter style={{ marginRight: '8px' }} /> Filters
        </h3>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="form-group">
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <FiSearch style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
          </div>
        </form>

        {/* Sort */}
        <div className="form-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Categories */}
        <div style={{ marginTop: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '1rem' }}>Categories</label>
          
          <div 
            className={`sidebar__category ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </div>
          
          {categories.map(category => (
            <div 
              key={category._id}
              className={`sidebar__category ${selectedCategory === category._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content (Product Grid) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section__title" style={{ marginBottom: 0 }}>All Products</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Showing {products.length} result{products.length !== 1 && 's'}
          </p>
        </div>

        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>No products found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Try adjusting your search or filters
            </p>
            <button 
              className="btn btn--primary" 
              style={{ marginTop: '1.5rem' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products__grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
