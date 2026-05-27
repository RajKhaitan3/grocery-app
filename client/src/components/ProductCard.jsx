import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  // Default to the first variant if available, otherwise null
  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  // Determine the display price
  let displayPrice = product.price;
  let originalPrice = null;

  if (selectedVariant) {
    displayPrice = user?.customerType === 'wholesale' && selectedVariant.wholesalePrice
      ? selectedVariant.wholesalePrice
      : selectedVariant.price;
      
    // Show retail price crossed out for wholesale customers if it's cheaper
    if (user?.customerType === 'wholesale' && selectedVariant.wholesalePrice) {
       originalPrice = selectedVariant.price;
    }
  } else {
    displayPrice = user?.customerType === 'wholesale' && product.wholesalePrice
      ? product.wholesalePrice
      : product.price;
      
    if (user?.customerType === 'wholesale' && product.wholesalePrice) {
        originalPrice = product.price;
    }
  }
  
  // Apply product discount
  if (product.discount > 0) {
      originalPrice = displayPrice;
      displayPrice = displayPrice * (1 - product.discount / 100);
  }

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="product-card">
      {/* Discount Badge */}
      {product.discount > 0 && (
        <div className="product-card__badge">{product.discount}% OFF</div>
      )}

      {/* Image */}
      <div className="product-card__image-wrap">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="product-card__image-placeholder">🛍️</div>
        )}
      </div>

      <div className="product-card__content">
        <div className="product-card__cat">
          {product.category?.name || 'Uncategorized'}
        </div>

        <h3 className="product-card__title">{product.name}</h3>

        {/* Variants Dropdown */}
        {product.variants && product.variants.length > 0 && (
          <select
            value={selectedVariant?._id || ''}
            onChange={(e) => {
              const variant = product.variants.find((v) => v._id === e.target.value);
              setSelectedVariant(variant);
            }}
          >
            {product.variants.map((v) => (
              <option key={v._id} value={v._id}>
                {v.size}
              </option>
            ))}
          </select>
        )}

        <div className="product-card__bottom">
          <div className="product-card__price-wrap">
            {originalPrice && (
              <span className="product-card__price-old">
                ₹{Math.round(originalPrice)}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="product-card__price">₹{Math.round(displayPrice)}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 'bold' }}>
                /{selectedVariant ? selectedVariant.size : product.unit}
              </span>
            </div>
          </div>

          <button className="product-card__add-btn" onClick={handleAddToCart} title="Add to Cart">
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
