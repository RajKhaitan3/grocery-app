import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  // Add shadow to navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">🛒</span>
            GroceryApp
          </Link>

          {/* Desktop Links */}
          <div className="navbar__links">
            <Link
              to="/"
              className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`navbar__link ${location.pathname === '/products' ? 'active' : ''}`}
            >
              Shop All
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="navbar__link">
                Dashboard
              </Link>
            )}
          </div>

          {/* Actions (Cart & User) */}
          <div className="navbar__actions">
            <Link to="/cart" className="navbar__cart-btn">
              <FiShoppingBag />
              {cartCount > 0 && (
                <span className="navbar__cart-badge">{cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <button onClick={logout} className="navbar__user-btn">
                <FiUser /> Logout
              </button>
            ) : (
              <Link to="/login" className="navbar__user-btn">
                <FiUser /> Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="navbar__toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link
          to="/"
          className={`mobile-menu__link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/products"
          className={`mobile-menu__link ${location.pathname === '/products' ? 'active' : ''}`}
        >
          Shop All
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="mobile-menu__link">
            Dashboard
          </Link>
        )}
      </div>
    </>
  );
};

export default Navbar;
