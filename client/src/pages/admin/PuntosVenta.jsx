import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import '../Admin.css'; // Reutilizamos estilos de admin

function PuntosVenta() {
    const navigate = useNavigate();
    const [puntosVenta, setPuntosVenta] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        codigo: '',
        direccion: '',
        telefono: '',
        email: '',
        observaciones: '',
        tipo: 'TIENDA',
        es_principal: false,
        activo: true
    });

    const [establecimientos, setEstablecimientos] = useState([]);

    useEffect(() => {
        cargarPuntosVenta();
        cargarEstablecimientos();
    }, []);

    const cargarEstablecimientos = async () => {
        try {
            const response = await axios.get(`${API_URL}/establecimientos`);
            setEstablecimientos(response.data);
        } catch (error) {
            console.error('Error al cargar establecimientos:', error);
        }
    };

    const cargarPuntosVenta = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/puntos-venta`);
            setPuntosVenta(response.data);
        } catch (error) {
            console.error('Error al cargar puntos de venta:', error);
            alert('Error al cargar puntos de venta');
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            // Preparar datos para el envío
            const payload = { ...formData };

            // Asegurar que establecimiento_id sea número o null
            if (payload.establecimiento_id && payload.establecimiento_id !== '') {
                payload.establecimiento_id = parseInt(payload.establecimiento_id);
            } else {
                payload.establecimiento_id = null;
            }

            if (modoEdicion) {
                // Removemos id del payload si va en la URL, aunque no estorba
                const { id, ...dataToSend } = payload;
                await axios.patch(`${API_URL}/puntos-venta/${formData.id}`, dataToSend);
                alert('Punto de venta actualizado correctamente');
            } else {
                // Para creación, nos aseguramos de no enviar ID nulo si el backend es estricto
                // TAMBIÉN: Removemos 'activo' ya que el DTO de creación podría no aceptarlo (y el default es true)
                const { id, activo, ...dataToSend } = payload;
                await axios.post(`${API_URL}/puntos-venta`, dataToSend);
                alert('Punto de venta creado correctamente');
            }
            setMostrarFormulario(false);
            cargarPuntosVenta();
            resetForm();
        } catch (error) {
            console.error('Error al guardar:', error);
            // Capturar mensaje específico del backend (NestJS suele devolver { message: string | string[], ... })
            const errorMessage = error.response?.data?.message
                ? (Array.isArray(error.response.data.message) ? error.response.data.message.join(', ') : error.response.data.message)
                : 'Error desconocido al guardar';

            alert('Error: ' + errorMessage);
        }
    };

    const handleEditar = (punto) => {
        setFormData({
            ...punto,
            establecimiento_id: punto.establecimiento?.id || punto.establecimiento_id || ''
        });
        setModoEdicion(true);
        setMostrarFormulario(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este punto de venta?')) {
            try {
                await axios.delete(`${API_URL}/puntos-venta/${id}`);
                cargarPuntosVenta();
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            nombre: '',
            codigo: '',
            direccion: '',
            telefono: '',
            email: '',
            observaciones: '',
            tipo: 'TIENDA',
            es_principal: false,
            activo: true,
            establecimiento_id: ''
        });
        setModoEdicion(false);
    };

    return (
        <div className="puntos-venta-page" style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/admin')} className="btn-back" style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' }}>
                        ← Volver
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>🏢 Puntos de Venta y Bodegas</h1>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        resetForm();
                        setMostrarFormulario(true);
                    }}
                    style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: '#4f46e5', color: 'white', border: 'none', fontWeight: '500' }}
                >
                    ➕ Nuevo Punto de Venta
                </button>
            </div>

            {loading ? (
                <div className="loading">Cargando...</div>
            ) : (
                <div className="tabla-container" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <table className="tabla-admin" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>ID</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>Nombre</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>Código</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>Dirección</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>Tipo</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>Principal</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#374151' }}>Estado</th>
                                <th style={{ padding: '15px', textAlign: 'center', color: '#374151' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {puntosVenta.map(punto => (
                                <tr key={punto.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '15px', color: '#6b7280' }}>{punto.id}</td>
                                    <td style={{ padding: '15px', fontWeight: '500', color: '#111827' }}>{punto.nombre}</td>
                                    <td style={{ padding: '15px', color: '#374151' }}>
                                        <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em' }}>
                                            {punto.codigo}
                                        </code>
                                    </td>
                                    <td style={{ padding: '15px', color: '#6b7280' }}>{punto.direccion || '-'}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span className={`badge ${punto.tipo === 'BODEGA' ? 'warning' : 'info'}`}
                                            style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', background: punto.tipo === 'BODEGA' ? '#fef3c7' : '#dbeafe', color: punto.tipo === 'BODEGA' ? '#92400e' : '#1e40af' }}>
                                            {punto.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>{punto.es_principal ? '⭐ Sí' : 'No'}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span className={`badge ${punto.activo ? 'success' : 'danger'}`}
                                            style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', background: punto.activo ? '#d1fae5' : '#fee2e2', color: punto.activo ? '#065f46' : '#991b1b' }}>
                                            {punto.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="acciones" style={{ padding: '15px', textAlign: 'center' }}>
                                        <button title="Editar" onClick={() => handleEditar(punto)} className="btn-icon" style={{ marginRight: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2em' }}>✏️</button>
                                        <button title="Eliminar" onClick={() => handleEliminar(punto.id)} className="btn-icon" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2em' }}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {mostrarFormulario && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modoEdicion ? 'Editar' : 'Nuevo'} Punto de Venta</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#0e7490' }}>🏛️ Establecimiento SRI (Tributario)</label>
                                <select
                                    value={formData.establecimiento_id}
                                    onChange={(e) => setFormData({ ...formData, establecimiento_id: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #0e7490', background: '#ecfeff' }}
                                >
                                    <option value="">-- Seleccione Establecimiento --</option>
                                    {establecimientos.map(est => (
                                        <option key={est.id} value={est.id}>
                                            {est.codigo} - {est.nombre_comercial || 'Matriz'} ({est.direccion})
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: '#666' }}>Vincule este punto físico con su estructura legal del SRI.</small>
                            </div>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Código *</label>
                                <input
                                    type="text"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                    required
                                    placeholder="Ej: 001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Dirección *</label>
                                <input
                                    type="text"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Tipo *</label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="TIENDA">Tienda</option>
                                    <option value="BODEGA">Bodega</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Observaciones</label>
                                <textarea
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    style={{ width: '100%', borderRadius: '4px', padding: '0.5rem', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.es_principal}
                                        onChange={(e) => setFormData({ ...formData, es_principal: e.target.checked })}
                                    />
                                    Es Principal
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setMostrarFormulario(false)} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="button" onClick={handleGuardar} className="btn-primary">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PuntosVenta;
