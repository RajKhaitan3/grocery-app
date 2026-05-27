import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__grid">
        {/* Brand Info */}
        <div>
          <div className="footer__brand">🛒 GroceryApp</div>
          <p className="footer__desc">
            Your trusted partner for fresh groceries, premium quality pulses, and
            daily essentials. Serving retail and wholesale customers with pride.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer__title">Quick Links</h4>
          <ul>
            <li><Link to="/" className="footer__link">Home</Link></li>
            <li><Link to="/products" className="footer__link">Shop All</Link></li>
            <li><Link to="/about" className="footer__link">About Us</Link></li>
            <li><Link to="/contact" className="footer__link">Contact</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="footer__title">Categories</h4>
          <ul>
            <li><Link to="/products?category=Dal & Pulses" className="footer__link">Dal & Pulses</Link></li>
            <li><Link to="/products?category=Rice & Grains" className="footer__link">Rice & Grains</Link></li>
            <li><Link to="/products?category=Spices & Masala" className="footer__link">Spices & Masala</Link></li>
            <li><Link to="/products?category=Dry Fruits" className="footer__link">Dry Fruits</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="footer__title">Contact Us</h4>
          <ul>
            <li className="footer__link">📍 Ahmedabad, Gujarat</li>
            <li className="footer__link">📞 +91 98765 43210</li>
            <li className="footer__link">✉️ info@groceryapp.com</li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} GroceryApp. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
