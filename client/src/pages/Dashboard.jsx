import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import './Dashboard.css'

function Dashboard({ socket }) {
  const navigate = useNavigate()
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarEstadisticas, 30000)
    
    if (socket) {
      socket.on('factura-creada', cargarEstadisticas)
      socket.on('producto-actualizado', cargarEstadisticas)
      socket.on('movimiento-inventario', cargarEstadisticas)
    }

    return () => {
      clearInterval(interval)
      if (socket) {
        socket.off('factura-creada')
        socket.off('producto-actualizado')
        socket.off('movimiento-inventario')
      }
    }
  }, [socket])

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get(`${API_URL}/integracion/estadisticas`)
      setEstadisticas(response.data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Cargando estadísticas...</div>
  }

  if (!estadisticas) {
    return <div className="dashboard-error">Error al cargar estadísticas</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard Integrado</h1>
        <button onClick={() => navigate('/')} className="btn-home">
          🏠 Inicio
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Facturación */}
        <div className="dashboard-card facturacion">
          <div className="card-header">
            <h2>📄 Facturación</h2>
            <button onClick={() => navigate('/facturacion')} className="btn-link">
              Ver más →
            </button>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span className="stat-label">Facturas Hoy</span>
              <span className="stat-value">{estadisticas.facturacion.facturas_hoy}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Ventas Hoy</span>
              <span className="stat-value">${estadisticas.facturacion.total_ventas_hoy.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div className="dashboard-card inventario">
          <div className="card-header">
            <h2>📦 Inventario</h2>
            <button onClick={() => navigate('/inventario')} className="btn-link">
              Ver más →
            </button>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span className="stat-label">Total Productos</span>
              <span className="stat-value">{estadisticas.inventario.productos_total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bajo Stock</span>
              <span className={`stat-value ${estadisticas.inventario.productos_bajo_stock > 0 ? 'warning' : ''}`}>
                {estadisticas.inventario.productos_bajo_stock}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Movimientos Hoy</span>
              <span className="stat-value">{estadisticas.inventario.movimientos_hoy}</span>
            </div>
          </div>
        </div>

        {/* Promociones */}
        <div className="dashboard-card promociones">
          <div className="card-header">
            <h2>🎁 Promociones</h2>
            <button onClick={() => navigate('/promociones')} className="btn-link">
              Ver más →
            </button>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span className="stat-label">Promociones Activas</span>
              <span className="stat-value">{estadisticas.promociones.activas}</span>
            </div>
          </div>
        </div>

        {/* Transferencias */}
        <div className="dashboard-card transferencias">
          <div className="card-header">
            <h2>🔄 Transferencias</h2>
            <button onClick={() => navigate('/transferencias')} className="btn-link">
              Ver más →
            </button>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span className="stat-label">Transferencias Hoy</span>
              <span className="stat-value">{estadisticas.transferencias.hoy}</span>
            </div>
          </div>
        </div>

        {/* Recursos Humanos */}
        <div className="dashboard-card recursos-humanos">
          <div className="card-header">
            <h2>👥 Recursos Humanos</h2>
            <button onClick={() => navigate('/recursos-humanos')} className="btn-link">
              Ver más →
            </button>
          </div>
          <div className="card-content">
            <div className="stat-item">
              <span className="stat-label">Empleados Activos</span>
              <span className="stat-value">{estadisticas.recursos_humanos.empleados_activos}</span>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="dashboard-card accesos-rapidos">
          <div className="card-header">
            <h2>⚡ Accesos Rápidos</h2>
          </div>
          <div className="card-content">
            <div className="quick-links">
              <button onClick={() => navigate('/facturacion')} className="quick-link">
                📄 Nueva Factura
              </button>
              <button onClick={() => navigate('/productos')} className="quick-link">
                📦 Productos
              </button>
              <button onClick={() => navigate('/clientes')} className="quick-link">
                👥 Clientes
              </button>
              <button onClick={() => navigate('/contabilidad')} className="quick-link">
                📊 Contabilidad
              </button>
              <button onClick={() => navigate('/promociones')} className="quick-link">
                🎁 Promociones
              </button>
              <button onClick={() => navigate('/reportes')} className="quick-link">
                📈 Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard












