import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = localStorage.getItem('motherslove_cart');
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(item => item && typeof item === 'object' && item.id).map(item => ({
                ...item,
                qty: item.qty || 1
            }));
        } catch (err) {
            console.error("Error reading cart from localStorage", err);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('motherslove_cart', JSON.stringify(cartItems));
        } catch (err) {
            console.error("Error writing cart to localStorage", err);
        }
    }, [cartItems]);

    const addToCart = (product, size, qty = 1, color = 'Standard') => {
        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(
                item => item.id === product.id && item.size === size && item.color === color
            );

            // Ensure we extract a clean numeric price
            let priceNum = 0;
            if (typeof product.price === 'string') {
                priceNum = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
            } else {
                priceNum = product.price || 0;
            }

            if (existingItemIndex >= 0) {
                const updated = [...prev];
                updated[existingItemIndex].qty += qty;
                return updated;
            } else {
                return [...prev, { 
                    id: product.id, 
                    name: product.name, 
                    price: priceNum, // Store as clean number immediately
                    img: product.image_url || product.image || product.img, 
                    size, 
                    color, 
                    qty 
                }];
            }
        });
    };

    const removeFromCart = (id, size, color) => {
        setCartItems(prev => prev.filter(
            item => !(item.id === id && item.size === size && item.color === color)
        ));
    };

    const updateQuantity = (id, size, color, newQty) => {
        if (newQty <= 0) {
            removeFromCart(id, size, color);
            return;
        }
        setCartItems(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(item => item.id === id && item.size === size && item.color === color);
            if (idx >= 0) {
                updated[idx].qty = newQty;
            }
            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}
