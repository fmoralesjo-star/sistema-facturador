import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

const StoreHome = () => {
    const { addToCart, storeConfig } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Categories Demo
    const categories = [
        { id: '1', name: 'Moviles', icon: '📱' },
        { id: '2', name: 'Laptops', icon: '💻' },
        { id: '3', name: 'Audio', icon: '🎧' },
        { id: '4', name: 'Relojes', icon: '⌚' }
    ];

    const [activeCat, setActiveCat] = useState('All');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/productos`);
            if (res.data && res.data.data) {
                setProducts(res.data.data);
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        // Simple visual feedback could be added here
        alert('Producto agregado al carrito');
    };

    // Filter logic
    const displayedProducts = activeCat === 'All'
        ? products
        : products.filter(p => p.categoria?.includes(activeCat) || p.nombre?.includes(activeCat));

    if (loading) return <div className="store-loader"><div className="spinner"></div></div>;

    return (
        <div className="nexus-home">
            <div className="store-container">

                {/* Hero Section */}
                <section className="nexus-hero">
                    <div className="nexus-hero-content">
                        <h1>FLASH SALES: <br /><span style={{ color: 'var(--nexus-primary)' }}>UP TO 50% OFF</span></h1>
                        <p className="hero-subtitle">Equípate con lo mejor de la tecnología.</p>
                        <button className="nexus-btn-primary">Comprar Ahora</button>
                    </div>
                    <div className="nexus-hero-image">
                        {/* Placeholder for tech visual */}
                        <div style={{ fontSize: '8rem' }}>💻</div>
                    </div>
                </section>

                {/* Categories Row */}
                <section className="nexus-categories">
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className={`nexus-cat-item ${activeCat === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCat(cat.name)}
                        >
                            <div className="cat-icon-box">{cat.icon}</div>
                            <span className="cat-label">{cat.name}</span>
                        </div>
                    ))}
                    <div className={`nexus-cat-item ${activeCat === 'All' ? 'active' : ''}`} onClick={() => setActiveCat('All')}>
                        <div className="cat-icon-box">♾️</div>
                        <span className="cat-label">Todos</span>
                    </div>
                </section>

                {/* New Arrivals & Countdown */}
                <section className="nexus-section">
                    <div className="nexus-section-header">
                        <div>
                            <h2>Nuevos Arrivos</h2>
                            <p style={{ color: 'var(--nexus-text-muted)', margin: 0 }}>Lo mejor de la semana</p>
                        </div>
                        <div className="countdown-timer">
                            00:00:00
                        </div>
                    </div>

                    <div className="nexus-grid">
                        {displayedProducts.map(product => (
                            <div key={product.id} className="nexus-card">
                                <div className="nexus-card-img">
                                    <span className="nexus-badge">New</span>
                                    {product.imagen_url ? (
                                        <img src={product.imagen_url} alt={product.nombre} />
                                    ) : (
                                        <div style={{ fontSize: '3rem' }}>📦</div>
                                    )}
                                </div>
                                <div className="nexus-card-info">
                                    <h3 className="nexus-title">{product.nombre}</h3>
                                    <div className="nexus-price-row">
                                        <span className="current-price">${Number(product.precio_venta || product.precio).toFixed(2)}</span>
                                        <span className="old-price">${(Number(product.precio_venta || product.precio) * 1.2).toFixed(2)}</span>
                                    </div>
                                    <button
                                        className="nexus-btn-add"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Añadir al Carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-bottom-nav">
                <a href="#" className="nav-item active">
                    <span>🏠</span> Home
                </a>
                <a href="#" className="nav-item">
                    <span>🔍</span> Buscar
                </a>
                <a href="#" className="nav-item">
                    <span>🛒</span> Carrito
                </a>
                <a href="#" className="nav-item">
                    <span>👤</span> Cuenta
                </a>
            </nav>
        </div>
    );
};

export default StoreHome;
