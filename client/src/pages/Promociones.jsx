import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Promociones.css'
import { API_URL } from '../config/api'

function Promociones({ socket }) {
  const navigate = useNavigate()
  const [seccionActiva, setSeccionActiva] = useState('promociones')
  const [promociones, setPromociones] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'descuento_porcentaje', // descuento_porcentaje, descuento_fijo, compra_x_lleva_y, envio_gratis
    valor: '',
    producto_id: '',
    categoria: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    dias_semana: [],
    minimo_compra: '',
    maximo_usos: '',
    estado: 'activa'
  })

  useEffect(() => {
    cargarDatos()

    if (socket) {
      socket.on('promocion-creada', () => {
        cargarDatos()
      })
      socket.on('promocion-actualizada', () => {
        cargarDatos()
      })
    }

    return () => {
      if (socket) {
        socket.off('promocion-creada')
        socket.off('promocion-actualizada')
      }
    }
  }, [socket])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [promocionesRes, productosRes] = await Promise.all([
        axios.get(`${API_URL}/promociones`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/productos`).catch(() => ({ data: [] }))
      ])

      setPromociones(promocionesRes.data || [])
      setProductos(productosRes.data || [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const promocion = {
        ...formData,
        valor: parseFloat(formData.valor) || 0,
        producto_id: formData.producto_id ? parseInt(formData.producto_id) : null,
        minimo_compra: formData.minimo_compra ? parseFloat(formData.minimo_compra) : null,
        maximo_usos: formData.maximo_usos ? parseInt(formData.maximo_usos) : null,
        fecha_inicio: formData.fecha_inicio ? new Date(formData.fecha_inicio) : new Date(),
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin) : null,
      }

      if (editingId) {
        await axios.put(`${API_URL}/promociones/${editingId}`, promocion)
      } else {
        await axios.post(`${API_URL}/promociones`, promocion)
      }

      if (socket) {
        socket.emit(editingId ? 'promocion-actualizada' : 'promocion-creada')
      }

      setMostrarFormulario(false)
      setEditingId(null)
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: 'descuento_porcentaje',
        valor: '',
        producto_id: '',
        categoria: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        hora_inicio: '',
        hora_fin: '',
        dias_semana: [],
        minimo_compra: '',
        maximo_usos: '',
        estado: 'activa'
      })
      cargarDatos()
      alert(editingId ? 'Promoción actualizada exitosamente' : 'Promoción creada exitosamente')
    } catch (error) {
      console.error('Error al guardar promoción:', error)
      alert('Error al guardar la promoción: ' + (error.response?.data?.message || error.message))
    }
  }

  const editarPromocion = (promocion) => {
    setEditingId(promocion.id)
    setFormData({
      nombre: promocion.nombre || '',
      descripcion: promocion.descripcion || '',
      tipo: promocion.tipo || 'descuento_porcentaje',
      valor: promocion.valor || '',
      producto_id: promocion.producto_id || '',
      categoria: promocion.categoria || '',
      fecha_inicio: promocion.fecha_inicio ? new Date(promocion.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fecha_fin: promocion.fecha_fin ? new Date(promocion.fecha_fin).toISOString().split('T')[0] : '',
      hora_inicio: promocion.hora_inicio || '',
      hora_fin: promocion.hora_fin || '',
      dias_semana: promocion.dias_semana || [],
      minimo_compra: promocion.minimo_compra || '',
      maximo_usos: promocion.maximo_usos || '',
      estado: promocion.estado || 'activa'
    })
    setMostrarFormulario(true)
  }

  const eliminarPromocion = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta promoción?')) return

    try {
      await axios.delete(`${API_URL}/promociones/${id}`)
      cargarDatos()
      alert('Promoción eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar promoción:', error)
      alert('Error al eliminar la promoción')
    }
  }

  const toggleDiaSemana = (dia) => {
    setFormData(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia]
    }))
  }

  const verificarVigencia = (promocion) => {
    const ahora = new Date()
    const fechaInicio = new Date(promocion.fecha_inicio)
    const fechaFin = promocion.fecha_fin ? new Date(promocion.fecha_fin) : null

    if (fechaFin && ahora > fechaFin) return 'vencida'
    if (ahora < fechaInicio) return 'programada'
    return 'activa'
  }

  const estadisticas = {
    totalPromociones: promociones.length,
    promocionesActivas: promociones.filter(p => verificarVigencia(p) === 'activa').length,
    promocionesVencidas: promociones.filter(p => verificarVigencia(p) === 'vencida').length,
    promocionesProgramadas: promociones.filter(p => verificarVigencia(p) === 'programada').length
  }

  const diasSemana = [
    { valor: 'lunes', label: 'Lunes' },
    { valor: 'martes', label: 'Martes' },
    { valor: 'miercoles', label: 'Miércoles' },
    { valor: 'jueves', label: 'Jueves' },
    { valor: 'viernes', label: 'Viernes' },
    { valor: 'sabado', label: 'Sábado' },
    { valor: 'domingo', label: 'Domingo' }
  ]

  return (
    <div className="promociones-container">
      <div className="promociones-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
            title="Volver a la pantalla principal"
          >
            Inicio
          </button>
          <h1>🎁 Gestión de Promociones</h1>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setEditingId(null)
              setFormData({
                nombre: '',
                descripcion: '',
                tipo: 'descuento_porcentaje',
                valor: '',
                producto_id: '',
                categoria: '',
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: '',
                hora_inicio: '',
                hora_fin: '',
                dias_semana: [],
                minimo_compra: '',
                maximo_usos: '',
                estado: 'activa'
              })
              setMostrarFormulario(true)
            }}
          >
            ➕ Nueva Promoción
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.totalPromociones}</div>
            <div className="stat-label">Total Promociones</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.promocionesActivas}</div>
            <div className="stat-label">Activas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.promocionesProgramadas}</div>
            <div className="stat-label">Programadas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.promocionesVencidas}</div>
            <div className="stat-label">Vencidas</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${seccionActiva === 'promociones' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('promociones')}
        >
          🎁 Promociones ({promociones.length})
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
      ) : seccionActiva === 'promociones' ? (
        <div className="tabla-container">
          <table className="tabla-promociones">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Descuento</th>
                <th>Producto/Categoría</th>
                <th>Vigencia</th>
                <th>Estado</th>
                <th>Usos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promociones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="sin-datos">
                    No hay promociones registradas
                  </td>
                </tr>
              ) : (
                promociones
                  .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
                  .map(promocion => {
                    const estadoVigencia = verificarVigencia(promocion)
                    const producto = productos.find(p => p.id === promocion.producto_id)

                    return (
                      <tr key={promocion.id}>
                        <td>
                          <strong>{promocion.nombre}</strong>
                          {promocion.descripcion && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {promocion.descripcion}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`tipo-badge ${promocion.tipo}`}>
                            {promocion.tipo === 'descuento_porcentaje' ? '📊 % Descuento' :
                              promocion.tipo === 'descuento_fijo' ? '💰 $ Descuento' :
                                promocion.tipo === 'compra_x_lleva_y' ? '🎁 Compra X Lleva Y' :
                                  '🚚 Envío Gratis'}
                          </span>
                        </td>
                        <td>
                          {promocion.tipo === 'descuento_porcentaje' ? (
                            <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                              {promocion.valor}%
                            </span>
                          ) : promocion.tipo === 'descuento_fijo' ? (
                            <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                              ${promocion.valor}
                            </span>
                          ) : promocion.tipo === 'compra_x_lleva_y' ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              {promocion.valor}
                            </span>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>GRATIS</span>
                          )}
                        </td>
                        <td>
                          {producto ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              {producto.nombre}
                            </span>
                          ) : promocion.categoria ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              Categoría: {promocion.categoria}
                            </span>
                          ) : (
                            <span style={{ color: '#999', fontSize: '0.85rem' }}>Todos</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            <div>Desde: {new Date(promocion.fecha_inicio).toLocaleDateString()}</div>
                            {promocion.fecha_fin && (
                              <div>Hasta: {new Date(promocion.fecha_fin).toLocaleDateString()}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`estado-badge ${estadoVigencia}`}>
                            {estadoVigencia === 'activa' ? '✅ Activa' :
                              estadoVigencia === 'programada' ? '📅 Programada' :
                                '⏰ Vencida'}
                          </span>
                        </td>
                        <td>
                          {promocion.maximo_usos ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              {promocion.usos_actuales || 0} / {promocion.maximo_usos}
                            </span>
                          ) : (
                            <span style={{ color: '#999', fontSize: '0.85rem' }}>Ilimitado</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn-accion"
                              onClick={() => editarPromocion(promocion)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-accion"
                              onClick={() => eliminarPromocion(promocion.id)}
                              title="Eliminar"
                              style={{ background: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="reportes-container">
          <div className="reporte-card">
            <h3>📊 Resumen de Promociones</h3>
            <div className="reporte-content">
              <p><strong>Total de Promociones:</strong> {estadisticas.totalPromociones}</p>
              <p><strong>Promociones Activas:</strong> {estadisticas.promocionesActivas}</p>
              <p><strong>Promociones Programadas:</strong> {estadisticas.promocionesProgramadas}</p>
              <p><strong>Promociones Vencidas:</strong> {estadisticas.promocionesVencidas}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Promoción */}
      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Editar Promoción' : '➕ Nueva Promoción'}</h2>
              <button onClick={() => setMostrarFormulario(false)}>✕</button>
            </div>
            <form className="form-promocion" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la Promoción *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="form-input"
                  placeholder="Ej: Descuento de Verano 2024"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Descripción detallada de la promoción"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Promoción *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="descuento_porcentaje">📊 Descuento Porcentaje</option>
                    <option value="descuento_fijo">💰 Descuento Fijo</option>
                    <option value="compra_x_lleva_y">🎁 Compra X Lleva Y</option>
                    <option value="envio_gratis">🚚 Envío Gratis</option>
                  </select>
                </div>

                {formData.tipo !== 'envio_gratis' && (
                  <div className="form-group">
                    <label>
                      {formData.tipo === 'descuento_porcentaje' ? 'Porcentaje de Descuento (%)' :
                        formData.tipo === 'descuento_fijo' ? 'Monto de Descuento ($)' :
                          'Cantidad (Ej: 2x1)'} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="form-input"
                      required={formData.tipo !== 'envio_gratis'}
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Producto Específico</label>
                  <select
                    value={formData.producto_id}
                    onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                    className="form-input"
                  >
                    <option value="">-- Todos los productos --</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.codigo || producto.sku} - {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="form-input"
                    placeholder="Ej: Ropa, Electrónicos"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Inicio *</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Hora Fin</label>
                  <input
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Días de la Semana</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {diasSemana.map(dia => (
                    <button
                      key={dia.valor}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.valor)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: formData.dias_semana.includes(dia.valor) ? '#667eea' : '#e2e8f0',
                        color: formData.dias_semana.includes(dia.valor) ? 'white' : '#1e293b',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
                {formData.dias_semana.length === 0 && (
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Si no selecciona días, la promoción aplica todos los días
                  </small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mínimo de Compra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimo_compra}
                    onChange={(e) => setFormData({ ...formData, minimo_compra: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Máximo de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maximo_usos}
                    onChange={(e) => setFormData({ ...formData, maximo_usos: e.target.value })}
                    className="form-input"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Estado *</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="activa">Activa</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Guardar'} Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Promociones












