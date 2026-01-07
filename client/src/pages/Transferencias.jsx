import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Transferencias.css'
import { API_URL } from '../config/api'

function Transferencias({ socket }) {
  const navigate = useNavigate()
  const [seccionActiva, setSeccionActiva] = useState('transferencias')
  const [transferencias, setTransferencias] = useState([])
  const [productos, setProductos] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'producto', // producto, dinero
    producto_id: '',
    cantidad: '',
    origen_id: '',
    destino_id: '',
    origen: '',
    destino: '',
    motivo: '',
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    cuenta_origen: '',
    cuenta_destino: '',
    referencia: ''
  })

  useEffect(() => {
    cargarDatos()

    if (socket) {
      socket.on('transferencia-creada', () => {
        cargarDatos()
      })
    }

    return () => {
      if (socket) {
        socket.off('transferencia-creada')
      }
    }
  }, [socket])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [productosRes, transferenciasRes, puntosVentaRes] = await Promise.all([
        axios.get(`${API_URL}/productos`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/transferencias`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/puntos-venta`).catch(() => ({ data: [] }))
      ])

      setProductos(productosRes.data || [])
      setTransferencias(transferenciasRes.data || [])
      setUbicaciones(puntosVentaRes.data || [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const transferencia = {
        ...formData,
        cantidad: formData.tipo === 'producto' ? parseFloat(formData.cantidad) : null,
        monto: formData.tipo === 'dinero' ? parseFloat(formData.monto) : null
      }

      await axios.post(`${API_URL}/transferencias`, transferencia)

      if (socket) {
        socket.emit('transferencia-creada')
      }

      setMostrarFormulario(false)
      setFormData({
        tipo: 'producto',
        producto_id: '',
        cantidad: '',
        origen_id: '',
        destino_id: '',
        origen: '',
        destino: '',
        motivo: '',
        fecha: new Date().toISOString().split('T')[0],
        monto: '',
        cuenta_origen: '',
        cuenta_destino: '',
        referencia: ''
      })
      cargarDatos()
      alert('Transferencia registrada exitosamente')
    } catch (error) {
      console.error('Error al crear transferencia:', error)
      alert('Error al registrar la transferencia: ' + (error.response?.data?.message || error.message))
    }
  }

  const estadisticas = {
    totalTransferencias: transferencias.length,
    transferenciasHoy: transferencias.filter(t => {
      const fecha = new Date(t.fecha).toISOString().split('T')[0]
      const hoy = new Date().toISOString().split('T')[0]
      return fecha === hoy
    }).length,
    productosTransferidos: transferencias.filter(t => t.tipo === 'producto').length,
    transferenciasDinero: transferencias.filter(t => t.tipo === 'dinero').length
  }

  return (
    <div className="transferencias-container">
      <div className="transferencias-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
            title="Volver a la pantalla principal"
          >
            Inicio
          </button>
          <h1>🔄 Gestión de Transferencias</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setMostrarFormulario(true)}
          >
            ➕ Nueva Transferencia
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.totalTransferencias}</div>
            <div className="stat-label">Total Transferencias</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.transferenciasHoy}</div>
            <div className="stat-label">Hoy</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.productosTransferidos}</div>
            <div className="stat-label">Productos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.transferenciasDinero}</div>
            <div className="stat-label">Dinero</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${seccionActiva === 'transferencias' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('transferencias')}
        >
          📋 Transferencias ({transferencias.length})
        </button>
        <button
          className={`tab ${seccionActiva === 'reportes' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('reportes')}
        >
          📊 Reportes
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : seccionActiva === 'transferencias' ? (
        <div className="tabla-container">
          <table className="tabla-transferencias">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Producto/Monto</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {transferencias.length === 0 ? (
                <tr>
                  <td colSpan="8" className="sin-datos">
                    No hay transferencias registradas
                  </td>
                </tr>
              ) : (
                transferencias
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map(transferencia => (
                    <tr key={transferencia.id}>
                      <td>{new Date(transferencia.fecha).toLocaleDateString()}</td>
                      <td>
                        <span className={`tipo-badge ${transferencia.tipo}`}>
                          {transferencia.tipo === 'producto' ? '📦 Producto' : '💰 Dinero'}
                        </span>
                      </td>
                      <td>{transferencia.origen || '-'}</td>
                      <td>{transferencia.destino || '-'}</td>
                      <td>
                        {transferencia.tipo === 'producto' ? (
                          transferencia.producto?.nombre || `Producto #${transferencia.producto_id}`
                        ) : (
                          `$${parseFloat(transferencia.monto || 0).toFixed(2)}`
                        )}
                      </td>
                      <td>
                        {transferencia.tipo === 'producto' ? (
                          transferencia.cantidad
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={`estado-badge ${transferencia.estado || 'pendiente'}`}>
                          {transferencia.estado === 'completada' ? '✓ Completada' :
                            transferencia.estado === 'en_transito' ? '🚚 En Tránsito' :
                              '⏳ Pendiente'}
                        </span>
                      </td>
                      <td>{transferencia.motivo || '-'}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="reportes-container">
          <div className="reporte-card">
            <h3>📊 Resumen de Transferencias</h3>
            <div className="reporte-content">
              <p><strong>Total de Transferencias:</strong> {estadisticas.totalTransferencias}</p>
              <p><strong>Transferencias de Productos:</strong> {estadisticas.productosTransferidos}</p>
              <p><strong>Transferencias de Dinero:</strong> {estadisticas.transferenciasDinero}</p>
              <p><strong>Transferencias Hoy:</strong> {estadisticas.transferenciasHoy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Transferencia */}
      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Nueva Transferencia</h2>
              <button onClick={() => setMostrarFormulario(false)}>✕</button>
            </div>
            <form className="form-transferencia" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo de Transferencia *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="producto">📦 Producto</option>
                  <option value="dinero">💰 Dinero</option>
                </select>
              </div>

              {formData.tipo === 'producto' ? (
                <>
                  <div className="form-group">
                    <label>Producto *</label>
                    <select
                      value={formData.producto_id}
                      onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="">-- Seleccione un producto --</option>
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.codigo || producto.sku} - {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cantidad *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Monto *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuenta Origen</label>
                    <input
                      type="text"
                      value={formData.cuenta_origen}
                      onChange={(e) => setFormData({ ...formData, cuenta_origen: e.target.value })}
                      className="form-input"
                      placeholder="Ej: Banco Principal"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuenta Destino</label>
                    <input
                      type="text"
                      value={formData.cuenta_destino}
                      onChange={(e) => setFormData({ ...formData, cuenta_destino: e.target.value })}
                      className="form-input"
                      placeholder="Ej: Banco Secundario"
                    />
                  </div>
                  <div className="form-group">
                    <label>Referencia</label>
                    <input
                      type="text"
                      value={formData.referencia}
                      onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                      className="form-input"
                      placeholder="Número de referencia"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Origen *</label>
                <select
                  value={formData.origen_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const nombre = ubicaciones.find(u => u.id.toString() === id)?.nombre || '';
                    setFormData({ ...formData, origen_id: id, origen: nombre })
                  }}
                  className="form-input"
                  required
                >
                  <option value="">-- Seleccione origen --</option>
                  {ubicaciones.map(ubicacion => (
                    <option key={ubicacion.id} value={ubicacion.id}>
                      {ubicacion.nombre} {ubicacion.tipo ? `(${ubicacion.tipo})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Destino *</label>
                <select
                  value={formData.destino_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const nombre = ubicaciones.find(u => u.id.toString() === id)?.nombre || '';
                    setFormData({ ...formData, destino_id: id, destino: nombre })
                  }}
                  className="form-input"
                  required
                >
                  <option value="">-- Seleccione destino --</option>
                  {ubicaciones.map(ubicacion => (
                    <option key={ubicacion.id} value={ubicacion.id}>
                      {ubicacion.nombre} {ubicacion.tipo ? `(${ubicacion.tipo})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Motivo</label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Descripción del motivo de la transferencia"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>

                <button type="submit" className="btn-primary">
                  Guardar Transferencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transferencias












