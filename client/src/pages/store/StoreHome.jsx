import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
const { addToCart, storeConfig } = useOutletContext();
const [products, setProducts] = useState([]);
const [filteredProducts, setFilteredProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Filter States
const [categories, setCategories] = useState(['Todos']);
const [activeCategory, setActiveCategory] = useState('Todos');
const [searchTerm, setSearchTerm] = useState('');
const [priceRange, setPriceRange] = useState(1000); // Max default
const [showFilters, setShowFilters] = useState(false);

useEffect(() => {
    fetchProducts();
}, []);

useEffect(() => {
    let result = products;

    // Category Filter
    if (activeCategory !== 'Todos') {
        result = result.filter(p => p.categoria === activeCategory);
    }

    // Search Filter
    if (searchTerm) {
        result = result.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Price Filter
    result = result.filter(p => Number(p.precio_venta || p.precio) <= priceRange);

    setFilteredProducts(result);
}, [activeCategory, searchTerm, priceRange, products]);

const fetchProducts = async () => {
    try {
        const res = await axios.get(`${API_URL}/productos`);
        if (res.data && res.data.data) {
            setProducts(res.data.data);
            const cats = ['Todos', ...new Set(res.data.data.map(p => p.categoria || 'Varios').filter(Boolean))];
            setCategories(cats);

            // Find max price for slider
            const maxPrice = Math.max(...res.data.data.map(p => Number(p.precio_venta || p.precio)));
            setPriceRange(Math.ceil(maxPrice) || 1000);
        }
        setLoading(false);
    } catch (err) {
        setLoading(false);
        setError("No se pudieron cargar los productos.");
    }
};

const handleAddToCart = (product) => {
    addToCart(product);
    // Could implement a toast notification here
    const btn = document.getElementById(`btn-add-${product.id}`);
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = "✓ Agregado";
        btn.style.background = "var(--store-secondary)";
        btn.style.color = "white";
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = "";
            btn.style.color = "";
        }, 1500);
    }
};

if (loading) return (
    <div className="store-loader">
        <div className="spinner"></div>
        <p>Cargando Tienda...</p>
    </div>
);

return (
    <div className="store-bg">
        {/* Super Robust Hero Section */}
        {storeConfig?.mostrarBanner !== false && (
            <section className="store-hero">
                <div className="store-hero-overlay"></div>
                <div className="store-hero-content-wrapper store-container">
                    <div className="store-hero-text">
                        <span className="hero-badge">Nueva Colección 2026</span>
                        <h1 className="hero-title">{storeConfig?.bannerTitulo || 'Innovación & Calidad'}</h1>
                        <p className="hero-subtitle">{storeConfig?.bannerSubtitulo || 'Descubre los mejores productos seleccionados para ti con la mejor garantía del mercado.'}</p>
                        <div className="hero-buttons">
                            <button className="btn-hero-primary" onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}>Ver Catálogo</button>
                            <button className="btn-hero-secondary">Nuestras Ofertas</button>
                        </div>
                    </div>
                    <div className="store-hero-visual">
                        {/* Abstract decorative elements or a designated hero image if config supported it */}
                        <div className="floating-card glass">
                            <span>🔥 Oferta Semanal</span>
                            <h3>-20% Descuento</h3>
                        </div>
                    </div>
                </div>
            </section>
        )}

        <div className="store-container" id="shop-section" style={{ paddingBottom: '4rem' }}>

            {/* Search & Filter Bar Mobile */}
            <div className="mobile-filter-toggle">
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="mobile-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                    🌪️ Filtros
                </button>
            </div>

            <div className="store-layout-grid">
                {/* Sidebar Filters */}
                <aside className={`store-sidebar ${showFilters ? 'show' : ''}`}>
                    <div className="sidebar-group">
                        <h3>🔍 Buscar</h3>
                        <input
                            type="text"
                            placeholder="Escribe aquí..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="sidebar-input"
                        />
                    </div>

                    <div className="sidebar-group">
                        <h3>📂 Categorías</h3>
                        <ul className="category-list">
                            {categories.map(cat => (
                                <li
                                    key={cat}
                                    className={activeCategory === cat ? 'active' : ''}
                                    onClick={() => { setActiveCategory(cat); setShowFilters(false); }}
                                >
                                    {cat}
                                    {cat !== 'Todos' && <span className="count-badge">{products.filter(p => p.categoria === cat).length}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-group">
                        <h3>💰 Precio Máximo: ${priceRange}</h3>
                        <input
                            type="range"
                            min="0"
                            max={Math.max(...products.map(p => p.precio_venta || p.precio), 1000)}
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="price-slider"
                        />
                    </div>
                </aside>

                {/* Products Grid */}
                <div className="store-content-area">
                    <div className="results-header">
                        <h2>{activeCategory === 'Todos' ? 'Catálogo Completo' : activeCategory}</h2>
                        <span className="results-count">{filteredProducts.length} productos encontrados</span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="no-results">
                            <div style={{ fontSize: '3rem' }}>🔍</div>
                            <h3>No encontramos lo que buscas</h3>
                            <p>Intenta con otra categoría o ajusta los filtros.</p>
                            <button className="btn-reset" onClick={() => { setActiveCategory('Todos'); setSearchTerm(''); }}>Ver Todo</button>
                        </div>
                    ) : (
                        <div className="premium-products-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="premium-product-card">
                                    <div className="card-image-wrapper">
                                        {product.imagen_url ? (
                                            <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
                                        ) : (
                                            <div className="placeholder-img">{product.nombre[0]}</div>
                                        )}
                                        <button
                                            className="btn-quick-add"
                                            onClick={() => handleAddToCart(product)}
                                            title="Agregar Rápido"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="card-details">
                                        <span className="card-category">{product.categoria || 'General'}</span>
                                        <h3 className="card-title">{product.nombre}</h3>
                                        <div className="card-footer">
                                            <span className="price">${Number(product.precio_venta || product.precio).toFixed(2)}</span>
                                            <button
                                                id={`btn-add-${product.id}`}
                                                className="btn-add-cart"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);
};

export default StoreHome;
