import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

const StoreHome = () => {
    const { addToCart } = useOutletContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Usamos el endpoint público de productos
            const res = await axios.get(`${API_URL}/productos`);
            if (res.data && res.data.data) {
                // Filtrar solo productos con stock (opcional) ó mostrar todos
                setProducts(res.data.data);
            } else {
                setProducts([]);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching store products:", err);
            // Fallback para demo si falla la API
            setLoading(false);
            setError("No se pudieron cargar los productos.");
        }
    };

    if (loading) return <div className="store-container" style={{ padding: '4rem', textAlign: 'center' }}>Cargando catálogo...</div>;

    return (
        <>
            <section className="store-hero">
                <div className="store-container">
                    <h1>Bienvenido a Patoshub Store</h1>
                    <p>Descubre nuestra colección exclusiva de productos</p>
                </div>
            </section>

            <section className="store-container">
                {error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="store-products-grid">
                        {products.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-img-container">
                                    {product.imagen_url ? (
                                        <img src={product.imagen_url} alt={product.nombre} className="product-img" />
                                    ) : (
                                        <div className="no-img-placeholder">
                                            {product.nombre.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <div>
                                        <div className="product-category">{product.categoria || 'General'}</div>
                                        <h3 className="product-title">{product.nombre}</h3>
                                    </div>
                                    <div className="product-footer">
                                        <span className="product-price">
                                            ${Number(product.precio_venta || product.precio).toFixed(2)}
                                        </span>
                                        <button
                                            className="add-btn"
                                            onClick={() => addToCart(product)}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
};

export default StoreHome;
