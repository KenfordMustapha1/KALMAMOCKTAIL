import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const loadCartFromStorage = () => {
  const stored = localStorage.getItem('kalmaCart');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem('kalmaCart');
    return [];
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);

  useEffect(() => {
    localStorage.setItem('kalmaCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((drink, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === drink._id);
      if (existing) {
        return prev.map((item) =>
          item._id === drink._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...drink, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((drinkId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== drinkId));
  }, []);

  const updateQuantity = useCallback((drinkId, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item._id !== drinkId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === drinkId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('kalmaCart');
  }, []);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
