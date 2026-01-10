import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

const StoreHome = () => {
    const { addToCart, storeConfig } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Categorias (Dinamicas o estaticas)
    const [categories, setCategories] = useState(['Todos']);
    const [activeCategory, setActiveCategory] = useState('Todos');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (activeCategory === 'Todos') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.categoria === activeCategory));
        }
    }, [activeCategory, products]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/productos`);
            if (res.data && res.data.data) {
                setProducts(res.data.data);

                // Extract unique categories
                const cats = ['Todos', ...new Set(res.data.data.map(p => p.categoria || 'Varios').filter(c => c))];
                setCategories(cats);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching store products:", err);
            setLoading(false);
            setError("No se pudieron cargar los productos.");
        }
    };

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--store-primary)' }}>
            <h2>Cargando Patoshub Store...</h2>
        </div>
    );

    return (
        <>
            {/* Hero Section */}
            {storeConfig?.mostrarBanner !== false && (
                <section className="store-hero-section">
                    <div className="hero-blob"></div>
                    <div className="store-container">
                        <div className="store-hero-content">
                            <h1>{storeConfig?.bannerTitulo || 'Tecnología que impulsa tu mundo'}</h1>
                            <p>{storeConfig?.bannerSubtitulo || 'Encuentra los mejores productos con calidad garantizada y envío rápido.'}</p>
                            <button className="hero-cta" onClick={() => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' })}>
                                Ver Ofertas
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <div className="store-container" id="catalogo">
                {/* Categories */}
                <div className="categories-strip">
                    {categories.map(cat => (
                        <div
                            key={cat}
                            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </div>
                    ))}
                </div>

                {/* Products Grid */}
                <h2 className="section-title">
                    {activeCategory === 'Todos' ? 'Destacados' : activeCategory}
                </h2>

                {error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="store-products-grid">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-img-container">
                                    <span className="product-badge">NUEVO</span>
                                    {product.imagen_url ? (
                                        <img src={product.imagen_url} alt={product.nombre} className="product-img" />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '3rem', fontWeight: 'bold', background: '#f0f4f8' }}>
                                            {product.nombre.substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <div className="product-category-label">{product.categoria || 'Tecnología'}</div>
                                    <h3 className="product-title">{product.nombre}</h3>
                                    <div className="product-price-row">
                                        <span className="product-price">
                                            ${Number(product.precio_venta || product.precio).toFixed(2)}
                                        </span>
                                        <button
                                            className="add-btn"
                                            onClick={() => addToCart(product)}
                                            title="Agregar al carrito"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default StoreHome;
