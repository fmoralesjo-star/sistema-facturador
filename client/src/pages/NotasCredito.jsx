import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';
import './Facturacion.css'; // Reutilizamos estilos de facturación

function NotasCredito({ socket }) {
    const navigate = useNavigate();
    const [facturas, setFacturas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
    const [motivo, setMotivo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.facturaSeleccionada) {
            setFacturaSeleccionada(location.state.facturaSeleccionada);
        }
    }, [location.state]);

    const buscarFacturas = async () => {
        if (!busqueda) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/facturas/buscar`, {
                params: { numero: busqueda }
            });
            setFacturas(res.data);
        } catch (error) {
            console.error('Error al buscar facturas:', error);
            alert('Error al buscar facturas');
        } finally {
            setLoading(false);
        }
    };

    const handleCrearNC = async () => {
        if (!facturaSeleccionada || !motivo) {
            alert('Por favor seleccione una factura y especifique un motivo');
            return;
        }

        setProcesando(true);
        try {
            const res = await axios.post(`${API_URL}/notas-credito`, {
                factura_id: facturaSeleccionada.id,
                motivo: motivo
            });
            alert(`Nota de Crédito ${res.data.numero} creada exitosamente`);
            setFacturaSeleccionada(null);
            setMotivo('');
            setBusqueda('');
            setFacturas([]);
        } catch (error) {
            console.error('Error al crear NC:', error);
            alert(error.response?.data?.message || 'Error al crear la Nota de Crédito');
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="facturacion-container">
            <button onClick={() => navigate('/')} className="btn-home" style={{ marginBottom: '1rem' }} title="Volver a la pantalla principal">
                Inicio
            </button>

            <div className="busqueda-section" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Buscar factura por número (ej: 001-001-000000001)"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button onClick={buscarFacturas} className="btn-primary" disabled={loading}>
                    {loading ? 'Buscando...' : '🔍 Buscar'}
                </button>
            </div>

            {facturas.length > 0 && !facturaSeleccionada && (
                <div className="resultados-busqueda">
                    <h3>Resultados:</h3>
                    <table className="tabla-interactiva">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facturas.map(f => (
                                <tr key={f.id}>
                                    <td>{f.numero}</td>
                                    <td>{new Date(f.fecha).toLocaleDateString()}</td>
                                    <td>{f.cliente_nombre}</td>
                                    <td>${f.total}</td>
                                    <td>
                                        <button onClick={() => setFacturaSeleccionada(f)} className="btn-select">
                                            Seleccionar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {facturaSeleccionada && (
                <div className="nc-form-container" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <h2>Emisión de Nota de Crédito</h2>
                    <p><strong>Factura Original:</strong> {facturaSeleccionada.numero}</p>
                    <p><strong>Cliente:</strong> {facturaSeleccionada.cliente_nombre}</p>
                    <p><strong>Total Factura:</strong> ${facturaSeleccionada.total}</p>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label>Motivo de la Modificación *</label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Devolución de mercadería, error en precio..."
                            style={{ width: '100%', height: '100px', padding: '1rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={() => setFacturaSeleccionada(null)} className="btn-secondary">
                            Cancelar
                        </button>
                        <button onClick={handleCrearNC} className="btn-primary" disabled={procesando}>
                            {procesando ? 'Procesando...' : '💎 Generar Nota de Crédito'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotasCredito;
