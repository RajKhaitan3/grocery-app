// ===========================================
// CART CONTEXT
// ===========================================
// Manages the shopping cart state globally.
// Persists cart to localStorage so it survives page refresh.
// ===========================================

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // Load cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ---- Add to Cart ----
  const addToCart = (product, variant = null, quantity = 1) => {
    setCartItems((prev) => {
      // Create a unique key: productId + variantId (if any)
      const cartKey = variant ? `${product._id}-${variant._id}` : product._id;

      // Check if item already exists
      const existingIndex = prev.findIndex((item) => item.cartKey === cartKey);

      if (existingIndex > -1) {
        // Item exists — increase quantity
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      // Determine price based on customer type
      let price = product.price;
      if (user?.customerType === 'wholesale' && product.wholesalePrice) {
        price = product.wholesalePrice;
      }
      if (variant) {
        price = user?.customerType === 'wholesale' && variant.wholesalePrice
          ? variant.wholesalePrice
          : variant.price;
      }

      // New item
      return [
        ...prev,
        {
          cartKey,
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price,
          variant: variant?.size || '',
          variantId: variant?._id || null,
          quantity,
          stock: variant?.stock || product.stock,
        },
      ];
    });
  };

  // ---- Update Quantity ----
  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  // ---- Remove from Cart ----
  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  // ---- Clear Cart ----
  const clearCart = () => {
    setCartItems([]);
  };

  // ---- Calculate totals ----
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
