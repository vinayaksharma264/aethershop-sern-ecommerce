import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem('aether_cart');
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('aether_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product_id === product.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const newQty = updatedItems[existingItemIndex].quantity + quantity;
        
        // Ensure we don't exceed stock limit
        if (newQty > product.stock) {
          alert(`Cannot add more. Only ${product.stock} items available in stock.`);
          return prevItems;
        }

        updatedItems[existingItemIndex].quantity = newQty;
        return updatedItems;
      } else {
        if (quantity > product.stock) {
          alert(`Cannot add. Only ${product.stock} items available in stock.`);
          return prevItems;
        }
        return [
          ...prevItems,
          {
            product_id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            stock: product.stock,
            quantity: quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product_id === productId) {
          if (quantity > item.stock) {
            alert(`Only ${item.stock} items available in stock.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
