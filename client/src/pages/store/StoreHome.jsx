import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

const StoreHome = () => {
    const { addToCart, storeConfig } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    // Filter State
    const [filters, setFilters] = useState({
        category: [],
        color: [],
        size: []
    });

    const [activeSection, setActiveSection] = useState({
        subCategory: true,
        type: true,
        color: true,
        size: false
    });

    const toggleSection = (section) => {
        setActiveSection(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/productos`);
            if (res.data && res.data.data) {
                // Enrich data with fake sale info if missing for demo purposes
                const enriched = res.data.data.map(p => ({
                    ...p,
                    originalPrice: p.precio_venta ? (parseFloat(p.precio_venta) * 1.3).toFixed(2) : null,
                    discount: 30
                }));
                setProducts(enriched);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="store-page">
            {/* Minimalist Dynamic Banner */}
            {storeConfig?.mostrarBanner && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 1rem 2rem 1rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '900',
                        letterSpacing: '-2px',
                        margin: 0,
                        lineHeight: '1',
                        textTransform: 'uppercase'
                    }}>
                        {storeConfig.bannerTitulo || "NUEVA COLECCIÓN"}
                    </h1>
                    {storeConfig.bannerSubtitulo && (
                        <p style={{
                            color: '#666',
                            marginTop: '1rem',
                            fontSize: '1.2rem',
                            letterSpacing: '0.5px'
                        }}>
                            {storeConfig.bannerSubtitulo}
                        </p>
                    )}
                </div>
            )}

            <div className="store-main-container">
                {/* Sidebar Filters */}
                <aside className="store-sidebar">
                    <div className="filter-header">
                        <span style={{ fontWeight: '600' }}>Filtros</span>
                        <span style={{ fontSize: '1.2rem' }}>↹</span>
                    </div>

                    {/* Filter Groups */}
                    <div className="filter-group">
                        <div className="filter-title" onClick={() => toggleSection('subCategory')}>
                            <span>Sub-Categoría</span>
                            <span>{activeSection.subCategory ? '−' : '+'}</span>
                        </div>
                        {activeSection.subCategory && (
                            <div className="filter-content open">
                                <label className="checkbox-item"><input type="checkbox" /> Pantalones</label>
                                <label className="checkbox-item"><input type="checkbox" /> Blusas</label>
                                <label className="checkbox-item"><input type="checkbox" /> Vestidos</label>
                                <label className="checkbox-item"><input type="checkbox" /> Calzado</label>
                            </div>
                        )}
                    </div>

                    <div className="filter-group">
                        <div className="filter-title" onClick={() => toggleSection('color')}>
                            <span>Color</span>
                            <span>{activeSection.color ? '−' : '+'}</span>
                        </div>
                        {activeSection.color && (
                            <div className="filter-content open">
                                <label className="checkbox-item"><input type="checkbox" /> Negro</label>
                                <label className="checkbox-item"><input type="checkbox" /> Blanco</label>
                                <label className="checkbox-item"><input type="checkbox" /> Rojo</label>
                                <label className="checkbox-item"><input type="checkbox" /> Azul</label>
                            </div>
                        )}
                    </div>

                    <div className="filter-group">
                        <div className="filter-title" onClick={() => toggleSection('size')}>
                            <span>Talla</span>
                            <span>{activeSection.size ? '−' : '+'}</span>
                        </div>
                        {activeSection.size && (
                            <div className="filter-content open">
                                <label className="checkbox-item"><input type="checkbox" /> XS</label>
                                <label className="checkbox-item"><input type="checkbox" /> S</label>
                                <label className="checkbox-item"><input type="checkbox" /> M</label>
                                <label className="checkbox-item"><input type="checkbox" /> L</label>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="store-content">
                    <div className="content-header">
                        <span className="product-count">{products.length} productos</span>

                        <select className="sort-select">
                            <option>Ordenar por</option>
                            <option value="price_asc">Precio: Menor a Mayor</option>
                            <option value="price_desc">Precio: Mayor a Menor</option>
                            <option value="newest">Lo más nuevo</option>
                        </select>
                    </div>

                    <div className="product-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="card-image-wrapper">
                                    <span className="discount-badge">-{product.discount || 30}%</span>
                                    <button className="wishlist-btn">♡</button>

                                    {product.imagen_url ? (
                                        <img src={product.imagen_url} alt={product.nombre} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                            👕
                                        </div>
                                    )}

                                    <div className="size-selector">
                                        <div className="size-btn">06</div>
                                        <div className="size-btn">08</div>
                                        <div className="size-btn">10</div>
                                        <div className="size-btn">12</div>
                                    </div>
                                </div>

                                <div className="card-info">
                                    <h3 className="product-title">{product.nombre}</h3>
                                    <p className="product-brand">Studio F</p> {/* Placeholder Brand */}

                                    <div className="price-row">
                                        <span className="price-current">${Number(product.precio_venta || product.precio).toFixed(2)}</span>
                                        {product.originalPrice && (
                                            <span className="price-original">${product.originalPrice}</span>
                                        )}
                                    </div>

                                    <button
                                        className="btn-add-cart"
                                        onClick={() => addToCart(product)}
                                    >
                                        <span>🛒</span> COMPRAR
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreHome;
