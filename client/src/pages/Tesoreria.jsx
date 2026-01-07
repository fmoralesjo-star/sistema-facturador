import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Tesoreria.css'
import { API_URL } from '../config/api'
import { formatearMoneda } from '../utils/formateo'

function Tesoreria() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('cheques')
    // Tabs disponibles: 'cheques', 'conciliacion', 'transferencias'

    // Estados para Cheques
    const [cheques, setCheques] = useState([])
    const [loadingCheques, setLoadingCheques] = useState(false)
    const [showChequeModal, setShowChequeModal] = useState(false)

    // Estados para Conciliación
    const [bancos, setBancos] = useState([])
    const [selectedBanco, setSelectedBanco] = useState('')
    const [movimientosSistema, setMovimientosSistema] = useState([])
    const [movimientosBanco, setMovimientosBanco] = useState([])
    const [resumenConciliacion, setResumenConciliacion] = useState(null)

    // Estados para Conciliación Inteligente (IA)
    const [modoIA, setModoIA] = useState(false)
    const [transaccionesPendientes, setTransaccionesPendientes] = useState([])
    const [transaccionActual, setTransaccionActual] = useState(null)
    const [sugerenciasIA, setSugerenciasIA] = useState([])
    const [estadisticasIA, setEstadisticasIA] = useState(null)
    const [cargandoExtracto, setCargandoExtracto] = useState(false)

    useEffect(() => {
        if (activeTab === 'cheques') {
            cargarCheques()
        } else if (activeTab === 'conciliacion') {
            cargarBancos()
        }
    }, [activeTab])

    useEffect(() => {
        if (selectedBanco && activeTab === 'conciliacion') {
            cargarDatosConciliacion()
        }
    }, [selectedBanco, activeTab])

    const cargarBancos = async () => {
        try {
            const res = await axios.get(`${API_URL}/bancos`)
            setBancos(res.data)
        } catch (error) {
            console.error('Error cargando bancos:', error)
        }
    }

    const cargarDatosConciliacion = async () => {
        try {
            const [resSistema, resBanco] = await Promise.all([
                axios.get(`${API_URL}/conciliaciones?banco_id=${selectedBanco}`),
                axios.get(`${API_URL}/conciliaciones/extracto?banco_id=${selectedBanco}`)
            ])
            setMovimientosSistema(resSistema.data.filter(m => !m.conciliado))
            setMovimientosBanco(resBanco.data.filter(m => !m.conciliado))
        } catch (error) {
            console.error('Error cargando datos de conciliación:', error)
        }
    }

    const cargarCheques = async () => {
        setLoadingCheques(true)
        try {
            const res = await axios.get(`${API_URL}/tesoreria/cheques`)
            setCheques(res.data)
        } catch (error) {
            // console.error('Error cargando cheques:', error) // Silenciar error si falta endpoint
            // Mock data for UI demo if endpoint fails
            setCheques([
                { id: 1, numero: '00001', monto: 150.00, beneficiario: 'Proveedor ABC', fecha_emision: '2026-01-15', estado: 'EMITIDO' },
                { id: 2, numero: '00002', monto: 2500.00, beneficiario: 'Servicios XYZ', fecha_emision: '2026-01-20', estado: 'COBRADO' },
            ])
        } finally {
            setLoadingCheques(false)
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (evt) => {
            const csvText = evt.target.result
            try {
                const res = await axios.post(`${API_URL}/conciliaciones/importar-extracto`, {
                    banco_id: parseInt(selectedBanco),
                    csv: csvText
                })
                setResumenConciliacion(res.data)
                alert(`Importación: ${res.data.importados} nuevos, ${res.data.duplicados} duplicados.`)
                cargarDatosConciliacion()
            } catch (error) {
                console.error('Error importando:', error)
                alert('Error al importar el archivo CSV.')
            }
        }
        reader.readAsText(file)
    }

    // --- Funciones para Conciliación Inteligente (IA) ---

    useEffect(() => {
        if (activeTab === 'conciliacion' && modoIA && selectedBanco) {
            cargarPendientesIA()
            cargarEstadisticasIA()
        }
    }, [activeTab, modoIA, selectedBanco])

    const cargarPendientesIA = async () => {
        try {
            const res = await axios.get(`${API_URL}/conciliaciones/ia/pendientes?banco_id=${selectedBanco}`)
            setTransaccionesPendientes(res.data)
        } catch (error) {
            console.error('Error cargando pendientes IA:', error)
        }
    }

    const cargarEstadisticasIA = async () => {
        try {
            const res = await axios.get(`${API_URL}/conciliaciones/ia/estadisticas?banco_id=${selectedBanco}`)
            setEstadisticasIA(res.data)
        } catch (error) {
            console.error('Error cargando estadísticas IA:', error)
        }
    }

    const handleUploadExtractoIA = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setCargandoExtracto(true)

        // Simular lectura de CSV para enviar JSON (en producción se enviaría FormData si el backend lo soporta, o JSON parseado)
        // Aquí usaremos el mismo formato que el importador manual pero enviado al endpoint de IA
        const reader = new FileReader()
        reader.onload = async (evt) => {
            const csvText = evt.target.result
            const lines = csvText.split('\n')
            const data = []

            // Parser simple de CSV (asumiendo formato: Fecha,Descripcion,Monto,Referencia)
            // Ocultar cabecera si existe
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue
                const parts = line.split(',')
                if (parts.length >= 3) {
                    data.push({
                        fecha: parts[0],
                        descripcion: parts[1],
                        monto: parseFloat(parts[2]),
                        referencia: parts[3] || '',
                        // Determinar tipo basado en signo si no viene explícito
                        tipo: parseFloat(parts[2]) > 0 ? 'CREDITO' : 'DEBITO'
                    })
                }
            }

            try {
                const res = await axios.post(`${API_URL}/conciliaciones/ia/procesar-extracto`, {
                    data: data,
                    banco_id: parseInt(selectedBanco)
                })
                alert(`Procesadas ${res.data.length} transacciones correctamente`)
                cargarPendientesIA()
                cargarEstadisticasIA()
            } catch (error) {
                console.error('Error procesando extracto IA:', error)
                alert('Error al procesar extracto')
            } finally {
                setCargandoExtracto(false)
            }
        }
        reader.readAsText(file)
    }

    const cargarSugerenciasIA = async (transaccion) => {
        setTransaccionActual(transaccion)
        setSugerenciasIA([]) // Limpiar anteriores
        try {
            const res = await axios.get(`${API_URL}/conciliaciones/ia/transacciones/${transaccion.id}/sugerencias`)
            setSugerenciasIA(res.data)
        } catch (error) {
            console.error('Error cargando sugerencias IA:', error)
        }
    }

    const confirmarMatchIA = async (conciliacionId) => {
        if (!transaccionActual) return

        try {
            await axios.post(`${API_URL}/conciliaciones/ia/transacciones/${transaccionActual.id}/confirmar`, {
                conciliacion_id: conciliacionId
            })
            alert('✅ Conciliación confirmada')

            // Actualizar UI
            setTransaccionesPendientes(prev => prev.filter(t => t.id !== transaccionActual.id))
            setTransaccionActual(null)
            setSugerenciasIA([])
            cargarEstadisticasIA()

            // También recargar datos de conciliación manual para mantener sincronía
            cargarDatosConciliacion()
        } catch (error) {
            console.error('Error confirmando match:', error)
            alert('Error al confirmar conciliación')
        }
    }

    return (
        <div className="tesoreria">
            <div className="tesoreria-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className="btn-home">Inicio</button>
                    <h1>🏦 Tesorería</h1>
                </div>
            </div>

            <div className="tesoreria-tabs">
                <button
                    className={`tesoreria-tab ${activeTab === 'cheques' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cheques')}
                >
                    💳 Gestión de Cheques
                </button>
                <button
                    className={`tesoreria-tab ${activeTab === 'conciliacion' ? 'active' : ''}`}
                    onClick={() => setActiveTab('conciliacion')}
                >
                    🤝 Conciliación Bancaria
                </button>
                <button
                    className={`tesoreria-tab ${activeTab === 'transferencias' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transferencias')}
                >
                    💸 Transferencias Bancarias
                </button>
            </div>

            {activeTab === 'cheques' && (
                <div className="tesoreria-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2>Cheques Girados</h2>
                        <button className="btn btn-primary" onClick={() => setShowChequeModal(true)}>+ Nuevo Cheque</button>
                    </div>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Fecha Emisión</th>
                                <th>Beneficiario</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cheques.map(cheque => (
                                <tr key={cheque.id}>
                                    <td>{cheque.numero}</td>
                                    <td>{cheque.fecha_emision}</td>
                                    <td>{cheque.beneficiario}</td>
                                    <td>{formatearMoneda(cheque.monto)}</td>
                                    <td>
                                        <span className={`cheque-status ${cheque.estado.toLowerCase()}`}>
                                            {cheque.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon">👁️</button>
                                    </td>
                                </tr>
                            ))}
                            {cheques.length === 0 && (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay cheques registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'conciliacion' && (
                <div className="tesoreria-card full-width">
                    <div className="conciliacion-container">

                        {/* Selector de Banco y Modo IA */}
                        <div className="conciliacion-controls header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div className="banco-selector">
                                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Seleccionar Banco:</label>
                                <select
                                    value={selectedBanco}
                                    onChange={e => setSelectedBanco(e.target.value)}
                                    className="form-select"
                                    style={{ padding: '8px', minWidth: '200px' }}
                                >
                                    <option value="">-- Seleccione un Banco --</option>
                                    {bancos.map(b => (
                                        <option key={b.id} value={b.id}>{b.nombre} - ${parseFloat(b.saldo_actual).toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedBanco && (
                                <div className="modo-toggle" style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                                    <button
                                        onClick={() => setModoIA(false)}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            background: !modoIA ? 'white' : 'transparent',
                                            boxShadow: !modoIA ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            fontWeight: !modoIA ? 600 : 400,
                                            cursor: 'pointer',
                                            color: !modoIA ? '#374151' : '#6b7280'
                                        }}
                                    >
                                        📝 Manual
                                    </button>
                                    <button
                                        onClick={() => setModoIA(true)}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            background: modoIA ? 'white' : 'transparent',
                                            boxShadow: modoIA ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            fontWeight: modoIA ? 600 : 400,
                                            cursor: 'pointer',
                                            color: modoIA ? '#2563eb' : '#6b7280',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        🤖 Conciliación Inteligente
                                    </button>
                                </div>
                            )}
                        </div>

                        {!selectedBanco ? (
                            <div className="empty-state-container" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                <h3>Seleccione un banco para comenzar la conciliación</h3>
                            </div>
                        ) : modoIA ? (
                            /* --- I N T E R F A Z   I A --- */
                            <div className="conciliacion-ia">
                                {/* Panel de Estadísticas */}
                                {estadisticasIA && (
                                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                        <div className="stat-card" style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>Total Transacciones</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#172554' }}>{estadisticasIA.total}</div>
                                        </div>
                                        <div className="stat-card" style={{ background: '#fff7ed', padding: '15px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#9a3412' }}>Pendientes</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c2d12' }}>{estadisticasIA.pendientes}</div>
                                        </div>
                                        <div className="stat-card" style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#166534' }}>Conciliadas</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d' }}>{estadisticasIA.conciliadas}</div>
                                        </div>
                                        <div className="stat-card" style={{ background: '#f5f3ff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#5b21b6' }}>Progreso</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4c1d95' }}>{estadisticasIA.porcentajeConciliado}%</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {/* Panel Izquierdo: Lista de Pendientes */}
                                    <div className="ia-panel-left" style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <div className="panel-header" style={{ padding: '15px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0 }}>📋 Transacciones Pendientes</h3>
                                            <div className="file-uploader-mini">
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleUploadExtractoIA}
                                                    id="file-upload-ia"
                                                    style={{ display: 'none' }}
                                                    disabled={cargandoExtracto}
                                                />
                                                <label htmlFor="file-upload-ia" style={{ cursor: 'pointer', color: '#2563eb', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    {cargandoExtracto ? 'Cargando...' : '+ Subir Extracto'}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="panel-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            {transaccionesPendientes.length === 0 ? (
                                                <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No hay transacciones pendientes</p>
                                            ) : (
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                                                        <tr>
                                                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Fecha</th>
                                                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '0.85rem' }}>Descripción</th>
                                                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>Monto</th>
                                                            <th style={{ padding: '10px', textAlign: 'center', fontSize: '0.85rem' }}>Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transaccionesPendientes.map(t => (
                                                            <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6', background: transaccionActual?.id === t.id ? '#eff6ff' : 'transparent' }}>
                                                                <td style={{ padding: '10px', fontSize: '0.9rem' }}>{new Date(t.fecha).toLocaleDateString()}</td>
                                                                <td style={{ padding: '10px', fontSize: '0.9rem' }}>{t.descripcion}</td>
                                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.9rem', color: t.tipo === 'CREDITO' ? '#059669' : '#dc2626', fontWeight: 500 }}>
                                                                    ${parseFloat(t.monto).toFixed(2)}
                                                                </td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                                    <button
                                                                        onClick={() => cargarSugerenciasIA(t)}
                                                                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                                                                    >
                                                                        🔍
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>

                                    {/* Panel Derecho: Sugerencias IA */}
                                    <div className="ia-panel-right" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
                                        {!transaccionActual ? (
                                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '100px' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🤖</div>
                                                <h3>Selecciona una transacción</h3>
                                                <p>La IA analizará montos, fechas y descripciones para sugerir coincidencias.</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Analizando Transacción:</h4>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600 }}>{transaccionActual.descripcion}</span>
                                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: transaccionActual.tipo === 'CREDITO' ? '#059669' : '#dc2626' }}>
                                                            ${parseFloat(transaccionActual.monto).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px' }}>
                                                        {new Date(transaccionActual.fecha).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <h4 style={{ marginBottom: '15px', color: '#334155' }}>🎯 Sugerencias de Conciliación</h4>

                                                {sugerenciasIA.length === 0 ? (
                                                    <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '6px', color: '#991b1b', textAlign: 'center' }}>
                                                        No se encontraron coincidencias probables.
                                                        <button style={{ display: 'block', margin: '10px auto 0', padding: '5px 10px', background: 'white', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                                                            Buscar manualmente en Libros
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="sugerencias-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                        {sugerenciasIA.map((sug, idx) => (
                                                            <div key={idx} style={{
                                                                background: 'white',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: `1px solid ${sug.score > 0.8 ? '#86efac' : sug.score > 0.5 ? '#fcd34d' : '#e5e7eb'}`,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                            }}>
                                                                {/* Header con Score */}
                                                                <div style={{
                                                                    background: sug.score > 0.8 ? '#f0fdf4' : sug.score > 0.5 ? '#fefce8' : '#f9fafb',
                                                                    padding: '10px 15px',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    borderBottom: '1px solid #f3f4f6'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <span style={{ fontSize: '1.2rem' }}>{sug.score > 0.8 ? '🔥' : '💡'}</span>
                                                                        <span style={{ fontWeight: 600, color: '#374151' }}>Confianza: {(sug.score * 100).toFixed(0)}%</span>
                                                                    </div>
                                                                    <div style={{ width: '100px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                                                        <div style={{ width: `${sug.score * 100}%`, height: '100%', background: sug.score > 0.8 ? '#22c55e' : '#eab308' }}></div>
                                                                    </div>
                                                                </div>

                                                                {/* Detalles del Asiento */}
                                                                <div style={{ padding: '15px' }}>
                                                                    <div style={{ marginBottom: '10px' }}>
                                                                        <div style={{ fontWeight: 500 }}>{sug.conciliacion.descripcion || 'Sin descripción'}</div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                                            <span style={{ color: '#6b7280' }}>{new Date(sug.conciliacion.fecha).toLocaleDateString()}</span>
                                                                            <span style={{ fontWeight: 600 }}>${parseFloat(sug.conciliacion.monto).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Razones */}
                                                                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', color: '#475569', marginBottom: '15px' }}>
                                                                        <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                                                                            {sug.razones.map((r, i) => <li key={i}>{r}</li>)}
                                                                        </ul>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => confirmarMatchIA(sug.conciliacion.id)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '10px',
                                                                            background: '#2563eb',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '6px',
                                                                            fontWeight: 600,
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: '8px'
                                                                        }}
                                                                    >
                                                                        <span>✓</span> Confirmar Conciliación
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* --- I N T E R F A Z   M A N U A L   (Existente) --- */
                            <div className="dashboard-conciliacion">
                                <div className="columna-sistema">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3>📖 Libros (Sistema)</h3>
                                        <button className="btn-small" onClick={() => alert('Función para agregar movimiento manual pendiente')}>+ Agregar</button>
                                    </div>
                                    <div className="lista-movimientos">
                                        {movimientosSistema.length === 0 ? <p className="empty-state">No hay movimientos pendientes</p> : (
                                            <table className="table-mini">
                                                <thead>
                                                    <tr>
                                                        <th>Fecha</th>
                                                        <th>Ref</th>
                                                        <th>Monto</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {movimientosSistema.map(m => (
                                                        <tr key={m.id}>
                                                            <td>{new Date(m.fecha).toLocaleDateString()}</td>
                                                            <td>{m.referencia}</td>
                                                            <td className={m.tipo === 'DEPOSITO' ? 'positivo' : 'negativo'}>
                                                                ${parseFloat(m.monto).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                <div className="columna-banco">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h3>🏦 Banco (Extracto)</h3>
                                        {/* Botón de carga original movido al header controls */}
                                    </div>
                                    <div className="lista-movimientos">
                                        {movimientosBanco.length === 0 ? <p className="empty-state">No hay movimientos pendientes. Importe un extracto.</p> : (
                                            <table className="table-mini">
                                                <thead>
                                                    <tr>
                                                        <th>Fecha</th>
                                                        <th>Desc</th>
                                                        <th>Monto</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {movimientosBanco.map(m => (
                                                        <tr key={m.id}>
                                                            <td>{new Date(m.fecha).toLocaleDateString()}</td>
                                                            <td>{m.descripcion}</td>
                                                            <td className={m.monto > 0 ? 'positivo' : 'negativo'}>
                                                                ${parseFloat(m.monto).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tesoreria
