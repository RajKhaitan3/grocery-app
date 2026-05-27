import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api/axios';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Example WhatsApp Number (replace with client's actual business number)
  const WHATSAPP_NUMBER = "919876543210"; 

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    // In a real app, you would redirect to a proper checkout page to enter address
    // For this learning step, we'll simulate an order placement with the user's default address
    if (!user.address || !user.address.street) {
      toast.error('Please update your address in profile before ordering');
      // navigate('/profile');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product,
          variantId: item.variantId,
          quantity: item.quantity
        })),
        shippingAddress: {
          ...user.address,
          phone: user.phone
        },
        paymentMethod: 'cod' // Default to COD for now
      };

      await API.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully! (Cash on Delivery)');
      navigate('/'); // Redirect to orders page later
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = () => {
    // Construct a WhatsApp message with order details
    let message = `*New Order Inquiry* 🛒\n\n`;
    
    if (user) {
      message += `*Customer:* ${user.name}\n`;
      message += `*Type:* ${user.customerType}\n\n`;
    }

    message += `*Items:*\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} `;
      if (item.variant) message += `(${item.variant}) `;
      message += `- ${item.quantity} x ₹${item.price}\n`;
    });

    message += `\n*Estimated Total: ₹${Math.round(cartTotal)}*`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="cart-empty">
          <div className="cart-empty__icon">🛍️</div>
          <h2 className="cart-empty__title">Your cart is empty</h2>
          <p className="cart-empty__text">Looks like you haven't added any groceries yet.</p>
          <Link to="/products" className="btn btn--primary btn--lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <h1 className="cart-page__title">Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Cart Items List */}
        <div>
          {cartItems.map((item) => (
            <div key={item.cartKey} className="cart-item">
              <div className="cart-item__image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span>🛍️</span>
                )}
              </div>
              
              <div className="cart-item__info">
                <h3 className="cart-item__name">{item.name}</h3>
                {item.variant && (
                  <div className="cart-item__variant">Size: {item.variant}</div>
                )}
              </div>

              <div className="cart-item__quantity">
                <button 
                  onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  <FiPlus />
                </button>
              </div>

              <div className="cart-item__price">
                ₹{Math.round(item.price * item.quantity)}
              </div>

              <button 
                className="cart-item__remove"
                onClick={() => removeFromCart(item.cartKey)}
                title="Remove Item"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            Order Summary
          </h3>
          
          <div className="cart-summary__row">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₹{Math.round(cartTotal)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Delivery Fee</span>
            <span style={{ color: 'var(--success)' }}>Free</span>
          </div>
          
          <div className="cart-summary__total">
            <span>Total</span>
            <span>₹{Math.round(cartTotal)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <button 
              className="btn btn--primary btn--full btn--lg"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'} <FiArrowRight />
            </button>
            
            <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              — OR —
            </div>

            <button 
              className="btn btn--whatsapp btn--full btn--lg"
              onClick={handleWhatsAppOrder}
            >
              <FaWhatsapp size={20} /> Order via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
