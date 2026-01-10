import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import './Store.css';

// Simple Cart Context implemented as a hook via outlet context
// In a real big app we would use Context API.

const StoreLayout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('patoshub_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to local storage when it changes
    useEffect(() => {
        localStorage.setItem('patoshub_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.precio_venta || item.precio) * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="store-layout">
            {/* Store Navbar */}
            <nav className="store-navbar">
                <div className="store-container nav-content">
                    <Link to="/store" className="store-brand">
                        🛍️ Patoshub Store
                    </Link>

                    <div className="store-nav-links">
                        <Link to="/store">Catálogo</Link>
                        <button className="cart-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
                            🛒 Carrito ({cartCount})
                        </button>
                        <Link to="/login" className="login-link">Admin Login</Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="store-main">
                <Outlet context={{ addToCart, cart, isCartOpen, setIsCartOpen }} />
            </main>

            {/* Cart Sidebar */}
            <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>Tu Carrito</h3>
                    <button onClick={() => setIsCartOpen(false)}>✕</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p className="empty-cart">El carrito está vacío</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                {item.imagen_url && (
                                    <img src={item.imagen_url} alt={item.nombre} className="cart-item-img" />
                                )}
                                <div className="cart-item-info">
                                    <h4>{item.nombre}</h4>
                                    <p>${Number(item.precio_venta || item.precio).toFixed(2)}</p>
                                    <div className="qty-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >🗑️</button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            className="checkout-btn"
                            onClick={() => navigate('/store/checkout', { state: { cart, total: cartTotal } })}
                        >
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>

            {/* Overlay */}
            {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
        </div>
    );
};

export default StoreLayout;
