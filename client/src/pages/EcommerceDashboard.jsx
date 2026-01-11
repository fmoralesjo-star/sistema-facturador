import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import './Admin.css'

function EcommerceDashboard() {
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(false)

    // Configuración de la tienda
    const [config, setConfig] = useState({
        bannerTitulo: '',
        bannerSubtitulo: '',
        colorPrimario: '#0066FF',
        colorSecundario: '#00CC66',
        mostrarBanner: true
    })
    const [savingConfig, setSavingConfig] = useState(false)

    // Filtros
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [prodRes, configRes] = await Promise.all([
                axios.get(`${API_URL}/productos`),
                axios.get(`${API_URL}/tienda-config`)
            ])

            setProductos(prodRes.data.data || [])
            if (configRes.data) {
                setConfig(configRes.data)
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
        } finally {
            setCargando(false)
        }
    }

    const handleConfigChange = (e) => {
        const { name, value, type, checked } = e.target
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const guardarConfiguracion = async (e) => {
        e.preventDefault()
        setSavingConfig(true)
        try {
            await axios.patch(`${API_URL}/tienda-config`, config)
            alert('Configuración guardada exitosamente')
        } catch (error) {
            console.error('Error al guardar configuración:', error)
            alert('Error al guardar configuración')
        } finally {
            setSavingConfig(false)
        }
    }

    // ... (Lógica de subida de imagenes se mantiene igual que MobileAppDashboard)
    const handleFileUpload = async (productoId, file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('tipo', 'producto')
        formData.append('entidadId', productoId)

        try {
            const res = await axios.post(`${API_URL}/media/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            // Actualizar estado local para reflejar cambio inmediato
            setProductos(prev => prev.map(p =>
                p.id === productoId ? { ...p, imagen_url: res.data.data.url } : p
            ))
        } catch (error) {
            console.error('Error al subir imagen:', error)
            alert('Error al subir imagen')
        }
    }

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="admin-container" style={{ minHeight: '100vh', width: '100%', maxWidth: '100%', margin: 0, padding: '20px', background: '#f8fafc', boxSizing: 'border-box' }}>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                    <h2>🛍️ Gestión de Tienda Online (E-commerce)</h2>
                    <p>Personaliza tu tienda y gestiona las imágenes de tus productos</p>
                </div>
                <a
                    href="/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.75rem 1.5rem', borderRadius: '50px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                >
                    🌐 Ver Tienda en Vivo
                </a>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>

                {/* Panel de Configuración General */}
                <div className="card">
                    <h3>🎨 Personalización de la Tienda</h3>
                    <form onSubmit={guardarConfiguracion} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Título del Banner Principal</label>
                            <input
                                type="text"
                                name="bannerTitulo"
                                value={config.bannerTitulo}
                                onChange={handleConfigChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtítulo</label>
                            <input
                                type="text"
                                name="bannerSubtitulo"
                                value={config.bannerSubtitulo}
                                onChange={handleConfigChange}
                                className="form-control"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Color Principal (Botones, Títulos)</label>
                                <input
                                    type="color"
                                    name="colorPrimario"
                                    value={config.colorPrimario}
                                    onChange={handleConfigChange}
                                    style={{ width: '100%', height: '40px', padding: '0', border: 'none' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Color Secundario (Detalles)</label>
                                <input
                                    type="color"
                                    name="colorSecundario"
                                    value={config.colorSecundario}
                                    onChange={handleConfigChange}
                                    style={{ width: '100%', height: '40px', padding: '0', border: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                name="mostrarBanner"
                                checked={config.mostrarBanner}
                                onChange={handleConfigChange}
                                id="mostrarBanner"
                            />
                            <label htmlFor="mostrarBanner" style={{ marginBottom: 0 }}>Mostrar Banner Principal</label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={savingConfig}>
                            {savingConfig ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>

                {/* Panel de Gestión de Imágenes (Original) */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>📸 Imágenes de Productos</h3>
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="form-control"
                            style={{ maxWidth: '300px' }}
                        />
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Precio</th>
                                    <th>Imagen Actual</th>
                                    <th>Subir Nueva</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Cargando...</td></tr>
                                ) : productosFiltrados.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{p.nombre}</div>
                                            <small style={{ color: '#666' }}>{p.codigo}</small>
                                        </td>
                                        <td>{p.categoria || '-'}</td>
                                        <td>${Number(p.precio_venta || p.precio).toFixed(2)}</td>
                                        <td>
                                            {p.imagen_url ? (
                                                <img src={p.imagen_url} alt="Prod" style={{ height: '50px', borderRadius: '4px' }} />
                                            ) : (
                                                <span style={{ color: '#999' }}>Sin imagen</span>
                                            )}
                                        </td>
                                        <td>
                                            <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                                📷 Cambiar
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files[0]) handleFileUpload(p.id, e.target.files[0])
                                                    }}
                                                />
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default EcommerceDashboard
