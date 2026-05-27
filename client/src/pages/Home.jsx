import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiTruck, FiShield } from 'react-icons/fi';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          API.get('/products?limit=8'), // Get top 8 products
          API.get('/categories')
        ]);
        setFeaturedProducts(productsRes.data.products);
        setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Dynamic Hero Section */}
      <section className="hero">
        <div className="hero__blob hero__blob--1"></div>
        <div className="hero__blob hero__blob--2"></div>
        
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__tag">
              <FiCheckCircle /> 100% Farm Fresh
            </div>
            <h1 className="hero__title">
              Premium Groceries <br />
              <span className="title-glow">Delivered Fresh</span>
            </h1>
            <p className="hero__subtitle">
              Experience the finest quality grains, aromatic spices, and daily essentials. 
              Exclusive wholesale rates for our business partners in Ahmedabad.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn--primary">
                Shop Collection <FiArrowRight />
              </Link>
              <Link to="/login" className="btn btn--secondary">
                Partner with us
              </Link>
            </div>
            
            <div className="hero__stats">
              <div>
                <div className="hero__stat-num">5k+</div>
                <div className="hero__stat-label">Happy Families</div>
              </div>
              <div>
                <div className="hero__stat-num">100%</div>
                <div className="hero__stat-label">Organic Quality</div>
              </div>
              <div>
                <div className="hero__stat-num">24h</div>
                <div className="hero__stat-label">Express Delivery</div>
              </div>
            </div>
          </div>
          
          <div className="hero__visual">
             <div className="hero__visual-card hero__visual-card--main">
               🛒
             </div>
             <div className="hero__visual-card hero__visual-card--floating">
               <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <FiTruck /> On the way!
               </div>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Arriving in 30 mins</div>
             </div>
          </div>
        </div>
      </section>

      {/* Modern Category Pills */}
      <section className="container" style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Shop by Category</h2>
          <p style={{ color: 'var(--text-muted)' }}>Explore our hand-picked premium selection</p>
        </div>
        
        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : (
          <div className="categories__grid">
            {categories.map((category) => (
              <div 
                key={category._id} 
                className="category-pill"
                onClick={() => navigate(`/products?category=${category._id}`)}
              >
                <span>
                  {category.name.includes('Dal') ? '🥣' :
                   category.name.includes('Rice') ? '🍚' :
                   category.name.includes('Spices') ? '🌶️' :
                   category.name.includes('Flour') ? '🌾' :
                   category.name.includes('Oil') ? '🫙' :
                   category.name.includes('Sugar') ? '🧂' :
                   category.name.includes('Dry') ? '🥜' : '🛍️'}
                </span>
                {category.name}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Grid */}
      <section className="container" style={{ paddingBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
           <div>
             <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--primary-dark)' }}>Trending Now</h2>
             <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Our most popular organic selections this week.</p>
           </div>
           <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
             View All <FiArrowRight />
           </Link>
        </div>
        
        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : (
          <div className="products__grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
