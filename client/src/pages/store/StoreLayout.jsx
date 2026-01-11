import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import './Store.css';

const StoreLayout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [storeConfig, setStoreConfig] = useState(null);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('store_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
        fetchStoreConfig();
    }, []);

    // Save cart to local storage when it changes
    useEffect(() => {
        localStorage.setItem('store_cart', JSON.stringify(cart));
    }, [cart]);

    const fetchStoreConfig = async () => {
        try {
            const res = await axios.get(`${API_URL}/tienda-config`);
            if (res.data) {
                setStoreConfig(res.data);
                if (res.data.colorPrimario) {
                    document.documentElement.style.setProperty('--store-primary', res.data.colorPrimario);
                    // Generate darker variant
                    // Helper to darken hex
                    // For now simple fallback or same
                    document.documentElement.style.setProperty('--store-primary-dark', res.data.colorPrimario);
                }
                if (res.data.colorSecundario) {
                    document.documentElement.style.setProperty('--store-secondary', res.data.colorSecundario);
                }
            }
        } catch (error) {
            console.error("Error loading store config", error);
        }
    };

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
                        URBAN <span className="highlight">STYLE</span>
                    </Link>

                    <div className="store-search-bar">
                        <input type="text" placeholder="Buscar productos..." className="store-search-input" />
                    </div>

                    <div className="store-nav-links">
                        <button className="cart-indicator-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
                            🛒 <span className="cart-count-badge">{cartCount}</span>
                        </button>
                        <Link to="/login" className="login-link">Admin</Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="store-main">
                <Outlet context={{ addToCart, cart, isCartOpen, setIsCartOpen, storeConfig }} />
            </main>

            {/* Cart Sidebar */}
            <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>Tu Carrito ({cartCount})</h3>
                    <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                            <p>Tu carrito está vacío</p>
                            <button onClick={() => setIsCartOpen(false)} style={{ marginTop: '1rem', color: 'var(--store-primary)', border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Seguir comprando</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.imagen_url ? (
                                        <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
                                    )}
                                </div>
                                <div className="cart-item-info">
                                    <h4>{item.nombre}</h4>
                                    <p style={{ color: 'var(--store-primary)', fontWeight: 'bold' }}>${Number(item.precio_venta || item.precio).toFixed(2)}</p>
                                    <div className="qty-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ color: '#ff4444' }}
                                >✕</button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Subtotal:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>Envío e impuestos calculados al finalizar.</p>
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
