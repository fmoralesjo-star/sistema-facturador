import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config/api'
import { useAuth } from '../contexts/AuthContext'
import './MobileAppDashboard.css'

function MobileAppDashboard() {
    const { getToken } = useAuth()
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [productoSeleccionado, setProductoSeleccionado] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [mensaje, setMensaje] = useState(null)

    // Buscar productos
    const buscarProductos = async (query) => {
        if (!query) return
        setLoading(true)
        try {
            const token = getToken()
            const res = await axios.get(`${API_URL}/productos?codigo=${query}&nombre=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // La API actual filtra por codigo OR cod_barras OR sku si se pasan query params separados
            // Si la API no soporta búsqueda general, quizás debamos traer todos y filtrar localmente o mejorar la API.
            // Por ahora probaremos buscando por código, que es lo que soporta el backend actual en findAll con query params.
            setProductos(res.data)
        } catch (error) {
            console.error('Error buscando productos:', error)
        } finally {
            setLoading(false)
        }
    }

    // Cargar todos los productos al inicio (limitado si fueran muchos, backend actual trae todos)
    useEffect(() => {
        const cargarProductos = async () => {
            setLoading(true)
            try {
                const token = getToken()
                const res = await axios.get(`${API_URL}/productos`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setProductos(res.data)
            } catch (error) {
                console.error('Error cargando productos:', error)
            } finally {
                setLoading(false)
            }
        }
        cargarProductos()
    }, [getToken])

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    )

    const handleFileChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]

        if (!productoSeleccionado) {
            alert("Selecciona un producto primero")
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        setMensaje({ tipo: 'info', texto: 'Subiendo archivo...' })

        try {
            const token = getToken()
            const res = await axios.post(`${API_URL}/media/productos/${productoSeleccionado.id}/imagen`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.data.success) {
                setMensaje({ tipo: 'success', texto: 'Archivo subido correctamente' })
                // Actualizar producto en la lista local
                setProductos(prev => prev.map(p => {
                    if (p.id === productoSeleccionado.id) {
                        return { ...p, imagen_url: res.data.data.url }
                    }
                    return p
                }))
                setProductoSeleccionado(prev => ({ ...prev, imagen_url: res.data.data.url }))
            }
        } catch (error) {
            console.error('Error subiendo archivo:', error)
            setMensaje({ tipo: 'error', texto: 'Error al subir el archivo' })
        } finally {
            setUploading(false)
            setTimeout(() => setMensaje(null), 3000)
        }
    }

    return (
        <div className="mobile-app-dashboard-container">
            <header className="mobile-app-header">
                <div className="header-content">
                    <h1>📱 App Móvil Sistema Facturador</h1>
                    <p>Gestiona la integración y monitorea la actividad de la aplicación móvil.</p>
                </div>
                <Link to="/" className="btn-volver">Volver al Inicio</Link>
            </header>

            {mensaje && (
                <div className={`mensaje-alerta ${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="mobile-dashboard-grid">
                {/* Gestión de Archivos */}
                <div className="dashboard-card photo-manager-card" style={{ gridColumn: '1 / -1' }}>
                    <h2>📸 Gestión de Archivos del Inventario</h2>
                    <div className="photo-manager-layout">
                        <div className="productos-list-section">
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o código..."
                                className="search-input"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                            <div className="productos-scroll">
                                {loading ? <p>Cargando productos...</p> : (
                                    productosFiltrados.slice(0, 50).map(p => (
                                        <div
                                            key={p.id}
                                            className={`producto-item ${productoSeleccionado?.id === p.id ? 'seleccionado' : ''}`}
                                            onClick={() => setProductoSeleccionado(p)}
                                        >
                                            <div className="producto-info">
                                                <strong>{p.nombre}</strong>
                                                <span>{p.codigo}</span>
                                            </div>
                                            {p.imagen_url && <span className="has-image">📷</span>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="image-upload-section">
                            {productoSeleccionado ? (
                                <div className="upload-container">
                                    <h3>{productoSeleccionado.nombre}</h3>
                                    <div className="image-preview">
                                        {productoSeleccionado.imagen_url ? (
                                            <img src={productoSeleccionado.imagen_url} alt={productoSeleccionado.nombre} />
                                        ) : (
                                            <div className="placeholder">Sin archivo asignado</div>
                                        )}
                                    </div>
                                    <div className="upload-actions">
                                        <label className={`btn-upload ${uploading ? 'disabled' : ''}`}>
                                            {uploading ? 'Subiendo...' : '📂 Subir Archivo'}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>Selecciona un producto de la lista para gestionar su fotografía.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="dashboard-card stats-card">
                    <h2>📊 Actividad Reciente</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Usuarios Activos</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Pedidos Hoy</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">$0.00</span>
                            <span className="stat-label">Ventas App</span>
                        </div>
                    </div>
                </div>

                {/* Estado del Servicio */}
                <div className="dashboard-card status-card">
                    <h2>🟢 Estado del Servicio</h2>
                    <div className="status-item">
                        <span className="status-indicator online"></span>
                        <div className="status-info">
                            <strong>API REST</strong>
                            <small>Funcionando correctamente</small>
                        </div>
                    </div>
                    <div className="status-item">
                        <span className="status-indicator online"></span>
                        <div className="status-info">
                            <strong>Base de Datos</strong>
                            <small>Conectada</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MobileAppDashboard
