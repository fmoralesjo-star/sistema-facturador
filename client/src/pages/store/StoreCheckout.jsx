import React, { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

const StoreCheckout = () => {
    const { state } = useLocation();
    const { cart: contextCart, setIsCartOpen } = useOutletContext();
    const navigate = useNavigate();

    // Use cart passed via navigation or fallback to context
    const cart = state?.cart || contextCart;
    const total = state?.total || cart.reduce((sum, item) => sum + (Number(item.precio_venta || item.precio) * item.quantity), 0);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        formaPago: 'TRANSFERENCIA',
        comprobante: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (cart.length === 0 && !success) {
        return (
            <div className="store-main-container" style={{ justifyContent: 'center', textAlign: 'center', minHeight: '60vh', flexDirection: 'column' }}>
                <h2>Tu bolsa está vacía</h2>
                <button onClick={() => navigate('/store')} className="checkout-btn" style={{ maxWidth: '200px', margin: '2rem auto' }}>Volver al Catálogo</button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const pedidoData = {
                cliente_id: 1,
                fecha: new Date().toISOString(),
                detalles: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.quantity,
                    precio_unitario: Number(item.precio_venta || item.precio)
                })),
                forma_pago: '20',
                observaciones: `PEDIDO WEB - Cliente: ${formData.nombre} - Tel: ${formData.telefono} - Dir: ${formData.direccion} - Email: ${formData.email}`
            };

            const res = await axios.post(`${API_URL}/facturas`, pedidoData);

            if (res.status === 201) {
                setSuccess(true);
                localStorage.removeItem('store_cart');
                // Optional: refresh page or clear context state if possible
            }
        } catch (err) {
            console.error("Error creating order:", err);
            setError("Hubo un error al procesar tu pedido. Por favor intenta nuevamente o contáctanos.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="store-main-container" style={{ justifyContent: 'center', textAlign: 'center', minHeight: '60vh', flexDirection: 'column' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                <h1>¡Gracias por tu compra!</h1>
                <p>Tu pedido ha sido registrado exitosamente.</p>
                <p>Nos pondremos en contacto contigo al <strong>{formData.telefono}</strong> para coordinar la entrega.</p>
                <button onClick={() => { navigate('/store'); window.location.reload(); }} className="checkout-btn" style={{ maxWidth: '200px', margin: '2rem auto' }}>
                    Volver a la Tienda
                </button>
            </div>
        );
    }

    return (
        <div className="store-main-container">
            <div style={{ width: '100%' }}>
                <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>Finalizar Compra</h1>

                <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    {/* Formulario */}
                    <div className="checkout-form-container">
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Tus Datos</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Nombre Completo</label>
                                        <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="search-input" style={{ background: '#fff', border: '1px solid #ddd' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Email</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="search-input" style={{ background: '#fff', border: '1px solid #ddd' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Teléfono / WhatsApp</label>
                                        <input required type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="search-input" style={{ background: '#fff', border: '1px solid #ddd' }} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Datos de Envío</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Ciudad</label>
                                        <input required type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="search-input" style={{ background: '#fff', border: '1px solid #ddd' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Dirección</label>
                                        <textarea required name="direccion" value={formData.direccion} onChange={handleInputChange} className="search-input" style={{ background: '#fff', border: '1px solid #ddd', minHeight: '100px' }}></textarea>
                                    </div>
                                </div>
                            </div>

                            {error && <div className="error-msg" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}

                            <button type="submit" className="checkout-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                                {loading ? 'Procesando...' : 'Confirmar Pedido'}
                            </button>
                        </form>
                    </div>

                    {/* Resumen */}
                    <div className="checkout-summary" style={{ background: '#fcfcfc', padding: '2rem', border: '1px solid #eee', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Resumen del Pedido</h3>
                        <div className="summary-items" style={{ margin: '1rem 0' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span>
                                        <span>{item.nombre}</span>
                                    </div>
                                    <span>${(Number(item.precio_venta || item.precio) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '2px solid #000', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: 'auto' }}>
                            <span>Total a Pagar:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#555' }}>
                            <p style={{ marginBottom: '5px' }}><strong>Transferencia Bancaria:</strong></p>
                            <p>Banco Pichincha</p>
                            <p>Cta. Ahorros: 2200112233</p>
                            <p>Nombre: Tu Empresa S.A.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreCheckout;
