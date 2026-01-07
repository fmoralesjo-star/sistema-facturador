import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

// Categorías de gastos con iconos y deducibilidad por defecto
const CATEGORIAS = [
    { value: 'SERVICIOS_PUBLICOS', label: 'Servicios Públicos', icon: '⚡', deducible: true, placeholder: 'Ej: Factura de luz mes enero' },
    { value: 'INTERNET_TELEFONIA', label: 'Internet/Telefonía', icon: '🌐', deducible: true, placeholder: 'Ej: Plan de internet mensual' },
    { value: 'SUMINISTROS_OFICINA', label: 'Suministros Oficina', icon: '📎', deducible: true, placeholder: 'Ej: Resma de papel, tinta' },
    { value: 'LIMPIEZA', label: 'Limpieza/Mantenimiento', icon: '🧹', deducible: true, placeholder: 'Ej: Productos de limpieza' },
    { value: 'TRANSPORTE', label: 'Transporte/Combustible', icon: '🚗', deducible: true, placeholder: 'Ej: Gasolina, taxi' },
    { value: 'ALIMENTACION', label: 'Alimentación', icon: '🍽️', deducible: false, placeholder: 'Ej: Almuerzo empleados' },
    { value: 'REPRESENTACION', label: 'Representación', icon: '🎁', deducible: false, placeholder: 'Ej: Regalo cliente' },
    { value: 'VARIOS', label: 'Otros Gastos', icon: '📋', deducible: false, placeholder: 'Descripción del gasto' },
];

const CajaChicaModal = ({ onClose, puntoVentaId, usuarioId }) => {
    const [saldo, setSaldo] = useState(0);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState('');

    // Estado del formulario
    const [tipo, setTipo] = useState('GASTO');
    const [categoria, setCategoria] = useState('VARIOS');
    const [esDeducible, setEsDeducible] = useState(false);
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [referencia, setReferencia] = useState('');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [proveedorNombre, setProveedorNombre] = useState('');

    useEffect(() => {
        cargarDatos();
    }, [puntoVentaId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [resSaldo, resHistorial] = await Promise.all([
                axios.get(`${API_URL}/caja-chica/saldo/${puntoVentaId}`),
                axios.get(`${API_URL}/caja-chica/historial/${puntoVentaId}`)
            ]);
            setSaldo(resSaldo.data);
            setHistorial(resHistorial.data);
        } catch (error) {
            console.error('Error al cargar datos de caja chica:', error);
            alert('Error al cargar información de la Caja Chica');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoriaChange = (cat) => {
        setCategoria(cat);
        const catInfo = CATEGORIAS.find(c => c.value === cat);
        if (catInfo) {
            setEsDeducible(catInfo.deducible);
        }
    };

    const iniciarGastoRapido = (categoriaValue) => {
        setTipo('GASTO');
        handleCategoriaChange(categoriaValue);
        setMostrarFormulario(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!monto || !descripcion) {
            alert('Por favor complete el monto y la descripción');
            return;
        }

        if (tipo === 'GASTO' && Number(monto) > saldo) {
            if (!window.confirm('⚠️ El monto del gasto supera el saldo actual. ¿Desea continuar? (El saldo quedará negativo)')) {
                return;
            }
        }

        setProcesando(true);
        try {
            await axios.post(`${API_URL}/caja-chica/movimiento`, {
                punto_venta_id: puntoVentaId,
                usuario_id: usuarioId || 1,
                tipo,
                categoria: tipo === 'INGRESO' ? 'REPOSICION_FONDO' : categoria,
                es_deducible: tipo === 'INGRESO' ? false : esDeducible,
                monto: Number(monto),
                descripcion,
                referencia,
                numero_documento: numeroDocumento,
                proveedor_nombre: proveedorNombre
            });

            // Limpiar y recargar
            resetFormulario();
            await cargarDatos();
            alert('✅ Movimiento registrado correctamente');
        } catch (error) {
            console.error('Error al registrar movimiento:', error);
            alert('Error al registrar el movimiento');
        } finally {
            setProcesando(false);
        }
    };

    const resetFormulario = () => {
        setMonto('');
        setDescripcion('');
        setReferencia('');
        setNumeroDocumento('');
        setProveedorNombre('');
        setCategoria('VARIOS');
        setEsDeducible(false);
        setMostrarFormulario(false);
    };

    const getCategoriaInfo = (cat) => CATEGORIAS.find(c => c.value === cat) || { icon: '📋', label: cat };

    const historialFiltrado = filtroCategoria
        ? historial.filter(m => m.categoria === filtroCategoria)
        : historial;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                width: '95%',
                maxWidth: '700px',
                maxHeight: '95vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #fd7e14', paddingBottom: '0.75rem' }}>
                    <h2 style={{ margin: 0, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💸 Caja Chica / Gastos Menores
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#fee2e2',
                            border: 'none',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            color: '#dc2626',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        Cargando...
                    </div>
                ) : (
                    <>
                        {/* Saldo Actual */}
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                            borderRadius: '12px',
                            border: '2px solid #fb923c',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: '600', letterSpacing: '1px' }}>SALDO DISPONIBLE</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: saldo < 0 ? '#dc2626' : '#c2410c' }}>
                                ${Number(saldo).toFixed(2)}
                            </div>
                        </div>

                        {/* Botones de Acceso Rápido */}
                        {!mostrarFormulario && (
                            <>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', fontWeight: '600' }}>⚡ REGISTRO RÁPIDO DE GASTOS</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {CATEGORIAS.filter(c => c.value !== 'VARIOS').slice(0, 4).map(cat => (
                                            <button
                                                key={cat.value}
                                                onClick={() => iniciarGastoRapido(cat.value)}
                                                style={{
                                                    padding: '0.6rem 0.4rem',
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    transition: 'all 0.2s',
                                                    fontSize: '0.75rem'
                                                }}
                                                onMouseEnter={e => { e.target.style.backgroundColor = '#e0f2fe'; e.target.style.borderColor = '#38bdf8'; }}
                                                onMouseLeave={e => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; }}
                                            >
                                                <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                                                <span style={{ fontWeight: '500', color: '#475569', textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {CATEGORIAS.filter(c => c.value !== 'VARIOS').slice(4).map(cat => (
                                            <button
                                                key={cat.value}
                                                onClick={() => iniciarGastoRapido(cat.value)}
                                                style={{
                                                    padding: '0.6rem 0.4rem',
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    transition: 'all 0.2s',
                                                    fontSize: '0.75rem'
                                                }}
                                                onMouseEnter={e => { e.target.style.backgroundColor = '#e0f2fe'; e.target.style.borderColor = '#38bdf8'; }}
                                                onMouseLeave={e => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; }}
                                            >
                                                <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                                                <span style={{ fontWeight: '500', color: '#475569', textAlign: 'center', lineHeight: 1.2 }}>{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <button
                                        onClick={() => { setTipo('GASTO'); setCategoria('VARIOS'); setMostrarFormulario(true); }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <span>📤</span> OTRO GASTO
                                    </button>
                                    <button
                                        onClick={() => { setTipo('INGRESO'); setCategoria('REPOSICION_FONDO'); setMostrarFormulario(true); }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: '#22c55e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <span>📥</span> REPONER FONDO
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Formulario de registro */}
                        {mostrarFormulario && (
                            <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', padding: '1rem', border: '2px solid', borderColor: tipo === 'INGRESO' ? '#22c55e' : '#ef4444', borderRadius: '12px', backgroundColor: tipo === 'INGRESO' ? '#f0fdf4' : '#fef2f2' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: tipo === 'INGRESO' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {tipo === 'INGRESO' ? '📥 Reposición de Fondo' : `${getCategoriaInfo(categoria).icon} ${getCategoriaInfo(categoria).label}`}
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {/* Monto */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Monto ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={monto}
                                            onChange={(e) => setMonto(e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1.1rem', fontWeight: 'bold' }}
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    {/* Número de Documento */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>N° Documento</label>
                                        <input
                                            type="text"
                                            value={numeroDocumento}
                                            onChange={(e) => setNumeroDocumento(e.target.value)}
                                            placeholder="Factura/Recibo #"
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                        />
                                    </div>

                                    {/* Descripción - Full width */}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Descripción *</label>
                                        <input
                                            type="text"
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            placeholder={getCategoriaInfo(categoria).placeholder || 'Descripción del movimiento'}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                            required
                                        />
                                    </div>

                                    {/* Proveedor */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Proveedor/Comercio</label>
                                        <input
                                            type="text"
                                            value={proveedorNombre}
                                            onChange={(e) => setProveedorNombre(e.target.value)}
                                            placeholder="Nombre del comercio"
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                        />
                                    </div>

                                    {/* Referencia */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Referencia</label>
                                        <input
                                            type="text"
                                            value={referencia}
                                            onChange={(e) => setReferencia(e.target.value)}
                                            placeholder="Nota adicional"
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                        />
                                    </div>

                                    {/* Categoría (solo para gastos) */}
                                    {tipo === 'GASTO' && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem' }}>Categoría</label>
                                            <select
                                                value={categoria}
                                                onChange={(e) => handleCategoriaChange(e.target.value)}
                                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                            >
                                                {CATEGORIAS.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Deducibilidad (solo para gastos) */}
                                    {tipo === 'GASTO' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                                            <input
                                                type="checkbox"
                                                id="esDeducible"
                                                checked={esDeducible}
                                                onChange={(e) => setEsDeducible(e.target.checked)}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="esDeducible" style={{ cursor: 'pointer', fontWeight: '500', color: esDeducible ? '#166534' : '#991b1b' }}>
                                                {esDeducible ? '✓ Gasto Deducible' : '✗ No Deducible'}
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={resetFormulario}
                                        style={{ flex: 1, padding: '0.65rem', border: '1px solid #ccc', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={procesando}
                                        style={{
                                            flex: 2,
                                            padding: '0.65rem',
                                            background: tipo === 'INGRESO' ? '#22c55e' : '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {procesando ? '⏳ Guardando...' : '💾 Guardar'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Historial Reciente */}
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Últimos Movimientos</h3>
                                <select
                                    value={filtroCategoria}
                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                    style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                                >
                                    <option value="">Todas las categorías</option>
                                    {CATEGORIAS.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            {historialFiltrado.length === 0 ? (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No hay movimientos {filtroCategoria ? 'en esta categoría' : 'recientes'}</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {historialFiltrado.slice(0, 10).map(mov => (
                                        <li key={mov.id} style={{
                                            padding: '0.6rem',
                                            borderBottom: '1px solid #f3f4f6',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: mov.tipo === 'INGRESO' ? '#f0fdf4' : 'transparent'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{getCategoriaInfo(mov.categoria).icon}</span>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{mov.descripcion}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                                        {new Date(mov.fecha).toLocaleDateString()}
                                                        {mov.proveedor_nombre && ` • ${mov.proveedor_nombre}`}
                                                        {mov.numero_documento && ` • Doc: ${mov.numero_documento}`}
                                                        {mov.es_deducible === false && <span style={{ color: '#dc2626', marginLeft: '0.3rem' }}>• No Deducible</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: mov.tipo === 'INGRESO' ? '#166534' : '#dc2626',
                                                textAlign: 'right'
                                            }}>
                                                <div>{mov.tipo === 'INGRESO' ? '+' : '-'}${Number(mov.monto).toFixed(2)}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 'normal' }}>Saldo: ${Number(mov.saldo_resultante).toFixed(2)}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CajaChicaModal;
