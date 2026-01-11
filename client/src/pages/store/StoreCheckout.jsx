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
        comprobante: null // Real implementation would need file upload for proof
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (cart.length === 0 && !success) {
        return (
            <div className="store-container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Tu carrito está vacío 😔</h2>
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
            // 1. Prepare Order Data (Mapping to CreateFacturaDto structure somewhat)
            // Since public users aren't "Clients" with ID in DB, we create a Generic Client or use metadata.
            // For this MVP, we will send it as a "Factura" with a special flag or to a "Pedidos" endpoint if it existed.
            // But we are reusing "Facturas" endpoint which requires a CLIENT_ID.
            // STRATEGY: We need a "Consumidor Final" or "Cliente Web" ID. 
            // Assuming ID 1 or we search/create by email.
            // For safety in this quick integration, let's assume we have a generic client ID=1 (Consumidor Final usually).

            const pedidoData = {
                cliente_id: 1, // Default Consumidor Final for now. In PROD, should Create Cliente first.
                fecha: new Date().toISOString(),
                detalles: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.quantity,
                    precio_unitario: Number(item.precio_venta || item.precio)
                })),
                forma_pago: '20', // Otros con utilizacion (o Transferencia)
                observaciones: `PEDIDO WEB - Cliente: ${formData.nombre} - Tel: ${formData.telefono} - Dir: ${formData.direccion} - Email: ${formData.email}`
            };

            // 2. Send to Backend
            // Using generic /api/facturas endpoint. NOTE: This endpoint might differ if using Pedidos table.
            // But user wants it unified.
            const res = await axios.post(`${API_URL}/facturas`, pedidoData);

            if (res.status === 201) {
                setSuccess(true);
                // Clear cart
                localStorage.removeItem('store_cart');
                // We can't clear context cart easily from here without dispatch, but we can trigger a reload or nav.
                // For now, assume success state hides cart.
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
            <div className="store-container" style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
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
        <div className="store-container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Finalizar Compra</h1>

            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Formulario */}
                <div className="checkout-form-container">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3>Tus Datos</h3>

                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="store-input" />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="store-input" />
                        </div>

                        <div className="form-group">
                            <label>Teléfono / WhatsApp</label>
                            <input required type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="store-input" />
                        </div>

                        <h3>Datos de Envío</h3>
                        <div className="form-group">
                            <label>Ciudad</label>
                            <input required type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="store-input" />
                        </div>

                        <div className="form-group">
                            <label>Dirección</label>
                            <textarea required name="direccion" value={formData.direccion} onChange={handleInputChange} className="store-input" rows="3"></textarea>
                        </div>

                        {error && <div className="error-msg" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}

                        <button type="submit" className="checkout-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                            {loading ? 'Procesando...' : 'Confirmar Pedido'}
                        </button>
                    </form>
                </div>

                {/* Resumen */}
                <div className="checkout-summary" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', height: 'fit-content', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3>Resumen del Pedido</h3>
                    <div className="summary-items" style={{ margin: '1rem 0' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>{item.quantity}x {item.nombre}</span>
                                <span>${(Number(item.precio_venta || item.precio) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>Total a Pagar:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                        <p><strong>Información de Pago:</strong></p>
                        <p>Realiza tu transferencia a:</p>
                        <p>Banco Pichincha</p>
                        <p>Cta. Ahorros: 2200112233</p>
                        <p>Nombre: Tu Empresa S.A.</p>
                        <p>RUC: 1790011223001</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
// Add some inline styles for inputs just for this file as helper
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  .store-input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  .store-input:focus {
    border-color: #7B2CBF;
    outline: none;
  }
  @media (max-width: 768px) {
    .checkout-grid { grid-template-columns: 1fr !important; }
  }
`;
document.head.appendChild(styleTag);

export default StoreCheckout;
