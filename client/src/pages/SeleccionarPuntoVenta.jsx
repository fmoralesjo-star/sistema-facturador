import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './SeleccionarPuntoVenta.css'
import { API_URL } from '../config/api'

function SeleccionarPuntoVenta() {
  const navigate = useNavigate()
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState(null)

  const [puntosVenta, setPuntosVenta] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarPuntosVenta = async () => {
      try {
        const response = await axios.get(`${API_URL}/puntos-venta`)
        setPuntosVenta(response.data)
      } catch (error) {
        console.error('Error al cargar puntos de venta:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarPuntosVenta()
  }, [])

  const handleSeleccionar = (puntoVenta) => {
    setPuntoVentaSeleccionado(puntoVenta)
    // Guardar en localStorage para que esté disponible en Facturacion
    localStorage.setItem('puntoVentaSeleccionado', JSON.stringify(puntoVenta))
    // Navegar a facturación
    navigate('/facturacion/nueva')
  }

  const handleVolverAtras = () => {
    navigate('/') // Ir a la página inicial (Home)
  }

  // Debug: Verificar que el componente se renderiza
  console.log('🔍 SeleccionarPuntoVenta renderizado - Botón debería estar visible')

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#e5e7eb',
      padding: '40px',
      margin: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 1
    }}>
      <button
        onClick={() => navigate('/')}
        type="button"
        className="btn-home"
        title="Volver a la pantalla principal"
        style={{ width: 'fit-content', marginBottom: '20px' }}
      >
        Inicio
      </button>

      <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          width: '100%',
          marginBottom: '15px'
        }}>
          <h1 style={{ margin: 0, display: 'inline-block', fontSize: '2.5rem', color: '#333', fontWeight: 700 }}>🏪 Seleccionar Punto de Venta</h1>
        </div>
        <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>Elija el local o punto de venta desde el cual desea facturar</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        flex: 1,
        alignContent: 'start'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
            <h2 style={{ color: '#666' }}>⌛ Cargando puntos de venta...</h2>
          </div>
        ) : puntosVenta.length === 0 ? (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>
            <h2 style={{ color: '#666' }}>🏪 No hay puntos de venta disponibles.</h2>
            <p style={{ color: '#888' }}>Por favor, cree uno en el panel de administración.</p>
          </div>
        ) : (
          puntosVenta.map((punto) => (
            <div
              key={punto.id}
              className={`punto-venta-card ${puntoVentaSeleccionado?.id === punto.id ? 'seleccionado' : ''}`}
              onClick={() => handleSeleccionar(punto)}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (puntoVentaSeleccionado?.id !== punto.id) {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (puntoVentaSeleccionado?.id !== punto.id) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              <div className="punto-venta-icono">
                <span style={{ fontSize: '3rem' }}>{punto.tipo === 'BODEGA' ? '📦' : '🏪'}</span>
              </div>
              <div className="punto-venta-info">
                <h3>{punto.nombre}</h3>
                <div className="punto-venta-detalles">
                  <p><strong>Tipo:</strong> {punto.tipo}</p>
                  <p><strong>Dirección:</strong> {punto.direccion || 'Sin dirección'}</p>
                  {punto.es_principal && <p style={{ color: '#f59e0b' }}>⭐ Punto Principal</p>}
                </div>
                <div className="punto-venta-estado">
                  <span className={`badge ${punto.activo ? 'activo' : 'inactivo'}`}>
                    {punto.activo ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </div>
              </div>
              <div className="punto-venta-flecha">
                <span>→</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SeleccionarPuntoVenta

