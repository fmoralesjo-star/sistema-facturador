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

    const cartTotal = cart.reduce((sum, item) => sum + (Number(item.precio_venta || item.precio || 0) * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="store-layout">
            {/* Banda Shop Navbar */}
            <nav className="store-navbar">
                <div className="nav-content">
                    {/* Left: Nav Links */}
                    <div className="nav-links-left">
                        <Link to="/store?cat=mujer" className="nav-link">Mujer</Link>
                        <Link to="/store?cat=hombre" className="nav-link">Hombre</Link>
                        <Link to="/store?cat=marcas" className="nav-link">Marcas</Link>
                        <Link to="/store?cat=sale" className="nav-link sale">Sale</Link>
                        <Link to="/store?cat=new" className="nav-link">New Arrivals</Link>
                    </div>

                    {/* Center: Brand */}
                    <Link to="/store" className="store-brand">
                        banda.shop
                    </Link>

                    {/* Right: Actions */}
                    <div className="nav-actions">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="¿Qué estás buscando?"
                                className="search-input"
                            />
                            <span className="search-icon">🔍</span>
                        </div>

                        <button className="icon-btn">
                            👤
                        </button>

                        <button className="icon-btn">
                            ♡
                        </button>

                        <button className="icon-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
                            👜
                            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                        </button>
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
                    <h3>Tu Bolsa ({cartCount})</h3>
                    <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                            <p>Tu bolsa está vacía</p>
                            <button onClick={() => setIsCartOpen(false)} style={{ marginTop: '1rem', color: 'black', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}>Ver Novedades</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div style={{ width: '80px', height: '100px', background: '#f5f5f5' }}>
                                    {item.imagen_url ? (
                                        <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : null}
                                </div>
                                <div className="cart-item-info">
                                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 5px 0' }}>{item.nombre}</h4>
                                    <p style={{ fontWeight: 'bold' }}>${Number(item.precio_venta || item.precio).toFixed(2)}</p>
                                    <div className="qty-controls" style={{ marginTop: '10px', display: 'flex', gap: '10px', border: '1px solid #eee', width: 'fit-content' }}>
                                        <button onClick={() => updateQuantity(item.id, -1)} style={{ border: 'none', background: 'none', padding: '5px 10px', cursor: 'pointer' }}>-</button>
                                        <span style={{ padding: '5px 0' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} style={{ border: 'none', background: 'none', padding: '5px 10px', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    style={{ color: '#999', border: 'none', background: 'none', height: 'fit-content', cursor: 'pointer' }}
                                >✕</button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total Estimado</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            className="checkout-btn"
                            onClick={() => navigate('/store/checkout', { state: { cart, total: cartTotal } })}
                        >
                            INICIAR COMPRA
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
