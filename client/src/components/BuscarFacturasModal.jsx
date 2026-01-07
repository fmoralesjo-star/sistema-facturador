import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const BuscarFacturasModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const buscarFacturas = async () => {
        if (!busqueda) return;
        setLoading(true);
        try {
            // Buscar por número, cliente o fecha...
            // Usando endpoint existente 'facturas/buscar' que soporta 'numero' según NotasCredito.jsx
            const res = await axios.get(`${API_URL}/facturas/buscar`, {
                params: { numero: busqueda }
            });
            setFacturas(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error al buscar facturas:', error);
            alert('Error al buscar facturas');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            buscarFacturas();
        }
    };

    const handleAnular = async (factura) => {
        if (!window.confirm(`¿Estás SEGURO de que deseas ANULAR la factura ${factura.numero}? Esta acción no se puede deshacer.`)) {
            return;
        }

        setProcesando(true);
        try {
            await axios.post(`${API_URL}/facturas/${factura.id}/anular`);
            alert(`Factura ${factura.numero} anulada correctamente.`);
            // Refrescar lista
            buscarFacturas();
        } catch (error) {
            console.error('Error al anular factura:', error);
            alert(error.response?.data?.message || 'Error al anular la factura');
        } finally {
            setProcesando(false);
        }
    };

    const handleNotaCredito = (factura) => {
        onClose(); // Cerrar modal primero
        navigate('/notas-credito', {
            state: { facturaSeleccionada: factura }
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>🔍 Gestión de Facturas</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por número de factura..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '1rem'
                        }}
                        autoFocus
                    />
                    <button
                        onClick={buscarFacturas}
                        disabled={loading}
                        style={{
                            padding: '0.8rem 1.5rem',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? '...' : 'Buscar'}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {facturas.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Número</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Cliente</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Fecha</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturas.map(f => (
                                    <tr key={f.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem' }}>{f.numero}</td>
                                        <td style={{ padding: '1rem' }}>{f.cliente_nombre || f.razon_social}</td>
                                        <td style={{ padding: '1rem' }}>{new Date(f.fecha).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>${typeof f.total === 'number' ? f.total.toFixed(2) : f.total}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                backgroundColor: f.estado === 'ANULADA' ? '#fee2e2' : '#dcfce7',
                                                color: f.estado === 'ANULADA' ? '#dc2626' : '#166534'
                                            }}>
                                                {f.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {f.estado !== 'ANULADA' && (
                                                <>
                                                    <button
                                                        onClick={() => handleNotaCredito(f)}
                                                        title="Crear Nota de Crédito"
                                                        style={{
                                                            padding: '6px 10px',
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        💳 NC
                                                    </button>
                                                    <button
                                                        onClick={() => handleAnular(f)}
                                                        title="Anular Factura"
                                                        disabled={procesando}
                                                        style={{
                                                            padding: '6px 10px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.9rem',
                                                            opacity: procesando ? 0.5 : 1
                                                        }}
                                                    >
                                                        🚫
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                            {loading ? 'Buscando...' : 'No se encontraron facturas o no has realizado una búsqueda.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuscarFacturasModal;
