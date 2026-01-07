import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

function Clientes({ socket }) {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [mostrarMensajeExito, setMostrarMensajeExito] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    esExtranjero: false
  })

  // Estados para el historial de cliente
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [historialData, setHistorialData] = useState(null)
  const [productosFrecuentes, setProductosFrecuentes] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [tabHistorial, setTabHistorial] = useState('facturas')
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  useEffect(() => {
    cargarClientes()

    socket.on('cliente-creado', () => {
      cargarClientes()
    })

    socket.on('cliente-actualizado', () => {
      cargarClientes()
    })

    socket.on('cliente-eliminado', () => {
      cargarClientes()
    })

    return () => {
      socket.off('cliente-creado')
      socket.off('cliente-actualizado')
      socket.off('cliente-eliminado')
    }
  }, [socket])

  const cargarClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`)
      setClientes(res.data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        await axios.put(`${API_URL}/clientes/${editingId}`, formData)
      } else {
        await axios.post(`${API_URL}/clientes`, formData)
      }

      setFormData({
        nombre: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        fechaNacimiento: '',
        esExtranjero: false
      })
      setMostrarFormulario(false)
      setEditingId(null)
      alert(editingId ? 'Cliente actualizado' : 'Cliente creado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el cliente')
    }
  }

  const editarCliente = (cliente) => {
    setFormData(cliente)
    setEditingId(cliente.id)
    setMostrarFormulario(true)
  }

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return

    try {
      await axios.delete(`${API_URL}/clientes/${id}`)
      // Recargar lista de clientes
      await cargarClientes()
      // Mostrar mensaje de éxito
      setMensajeExito('Cliente eliminado exitosamente')
      setMostrarMensajeExito(true)
      // Ocultar mensaje después de 2 segundos
      setTimeout(() => {
        setMostrarMensajeExito(false)
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setMensajeExito('Error al eliminar el cliente: ' + (error.response?.data?.message || error.message))
      setMostrarMensajeExito(true)
      // Ocultar mensaje de error después de 3 segundos
      setTimeout(() => {
        setMostrarMensajeExito(false)
      }, 3000)
    }
  }

  // Función para ver el historial de compras de un cliente
  const verHistorialCliente = async (cliente) => {
    setClienteSeleccionado(cliente)
    setMostrarHistorial(true)
    setCargandoHistorial(true)
    setTabHistorial('facturas')

    try {
      // Cargar historial, productos frecuentes y estadísticas en paralelo
      const [historialRes, productosRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/clientes/${cliente.id}/historial`),
        axios.get(`${API_URL}/clientes/${cliente.id}/productos-frecuentes`),
        axios.get(`${API_URL}/clientes/${cliente.id}/estadisticas`)
      ])

      setHistorialData(historialRes.data)
      setProductosFrecuentes(productosRes.data)
      setEstadisticas(statsRes.data)
    } catch (error) {
      console.error('Error al cargar historial:', error)
      alert('Error al cargar el historial del cliente')
    } finally {
      setCargandoHistorial(false)
    }
  }

  const cerrarHistorial = () => {
    setMostrarHistorial(false)
    setClienteSeleccionado(null)
    setHistorialData(null)
    setProductosFrecuentes([])
    setEstadisticas(null)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-EC')
  }

  const formatearMoneda = (valor) => {
    return parseFloat(valor || 0).toFixed(2)
  }

  return (
    <div className="clientes" style={{ position: 'relative' }}>
      {/* Mensaje de éxito/error */}
      {mostrarMensajeExito && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: mensajeExito.includes('Error') ? '#ef4444' : '#25D366',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 10000,
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-in',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <span style={{ fontSize: '24px' }}>{mensajeExito.includes('Error') ? '❌' : '✅'}</span>
          {mensajeExito}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              className="btn-home"
              title="Volver a la pantalla principal"
            >
              Inicio
            </button>
            <h2>Clientes</h2>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setMostrarFormulario(!mostrarFormulario)
            setEditingId(null)
            setFormData({
              nombre: '',
              ruc: '',
              direccion: '',
              telefono: '',
              email: '',
              fechaNacimiento: '',
              esExtranjero: false
            })
          }}>
            {mostrarFormulario ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>RUC</label>
                <input
                  type="text"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value.toUpperCase() })}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fechaNacimiento || ''}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="esExtranjero"
                  checked={formData.esExtranjero || false}
                  onChange={(e) => setFormData({ ...formData, esExtranjero: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="esExtranjero" style={{ cursor: 'pointer', margin: 0 }}>
                  Es Extranjero
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar' : 'Crear'} Cliente
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Lista de Clientes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUC / Cédula</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Fecha de Nacimiento</th>
              <th>Extranjero</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.ruc || 'N/A'}</td>
                <td>{cliente.direccion || 'N/A'}</td>
                <td>{cliente.telefono || 'N/A'}</td>
                <td>{cliente.email || 'N/A'}</td>
                <td>{cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>{cliente.esExtranjero ? '✅ Sí' : '❌ No'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.875rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                      onClick={() => verHistorialCliente(cliente)}
                      title="Ver historial de compras"
                    >
                      📊 Historial
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      onClick={() => editarCliente(cliente)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      onClick={() => eliminarCliente(cliente.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Historial de Cliente */}
      {
        mostrarHistorial && clienteSeleccionado && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '1000px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              {/* Header del modal */}
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ margin: 0 }}>📊 Historial de Compras</h2>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                    {clienteSeleccionado.nombre} {clienteSeleccionado.ruc ? `(${clienteSeleccionado.ruc})` : ''}
                  </p>
                </div>
                <button
                  onClick={cerrarHistorial}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                {[
                  { id: 'facturas', label: '📄 Facturas', count: historialData?.facturas?.length || 0 },
                  { id: 'productos', label: '🛒 Productos Frecuentes', count: productosFrecuentes?.length || 0 },
                  { id: 'estadisticas', label: '📈 Estadísticas', count: null }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTabHistorial(tab.id)}
                    style={{
                      padding: '15px 25px',
                      border: 'none',
                      background: tabHistorial === tab.id ? 'white' : 'transparent',
                      borderBottom: tabHistorial === tab.id ? '3px solid #667eea' : '3px solid transparent',
                      cursor: 'pointer',
                      fontWeight: tabHistorial === tab.id ? '600' : '400',
                      color: tabHistorial === tab.id ? '#667eea' : '#6b7280'
                    }}
                  >
                    {tab.label} {tab.count !== null && <span style={{
                      background: '#e5e7eb',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      marginLeft: '5px'
                    }}>{tab.count}</span>}
                  </button>
                ))}
              </div>

              {/* Contenido */}
              <div style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
                {cargandoHistorial ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Cargando historial...</p>
                  </div>
                ) : (
                  <>
                    {/* Tab Facturas */}
                    {tabHistorial === 'facturas' && (
                      <div>
                        {historialData?.facturas?.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Número</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Fecha</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Subtotal</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>IVA</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Total</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historialData.facturas.map((factura, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <td style={{ padding: '12px' }}>{factura.numero}</td>
                                  <td style={{ padding: '12px' }}>{formatearFecha(factura.fecha)}</td>
                                  <td style={{ padding: '12px', textAlign: 'right' }}>${formatearMoneda(factura.subtotal)}</td>
                                  <td style={{ padding: '12px', textAlign: 'right' }}>${formatearMoneda(factura.impuesto)}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>${formatearMoneda(factura.total)}</td>
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{
                                      padding: '4px 12px',
                                      borderRadius: '12px',
                                      fontSize: '12px',
                                      backgroundColor: factura.estado === 'AUTORIZADA' ? '#dcfce7' :
                                        factura.estado === 'ANULADA' ? '#fee2e2' : '#fef3c7',
                                      color: factura.estado === 'AUTORIZADA' ? '#166534' :
                                        factura.estado === 'ANULADA' ? '#991b1b' : '#92400e'
                                    }}>
                                      {factura.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ textAlign: 'center', color: '#6b7280' }}>Este cliente no tiene facturas registradas.</p>
                        )}
                      </div>
                    )}

                    {/* Tab Productos Frecuentes */}
                    {tabHistorial === 'productos' && (
                      <div>
                        {productosFrecuentes?.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Producto</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Código</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Veces Comprado</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Cantidad Total</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Total Gastado</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Última Compra</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosFrecuentes.map((prod, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <td style={{ padding: '12px', fontWeight: '500' }}>{prod.nombre}</td>
                                  <td style={{ padding: '12px', color: '#6b7280' }}>{prod.codigo}</td>
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{
                                      background: '#dbeafe',
                                      color: '#1e40af',
                                      padding: '4px 12px',
                                      borderRadius: '12px',
                                      fontWeight: '600'
                                    }}>
                                      {prod.veces_comprado}x
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(prod.cantidad_total).toFixed(0)} uds</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#059669' }}>${formatearMoneda(prod.total_gastado)}</td>
                                  <td style={{ padding: '12px' }}>{formatearFecha(prod.ultima_compra)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ textAlign: 'center', color: '#6b7280' }}>Este cliente no ha comprado productos aún.</p>
                        )}
                      </div>
                    )}

                    {/* Tab Estadísticas */}
                    {tabHistorial === 'estadisticas' && estadisticas && (
                      <div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '20px',
                          marginBottom: '30px'
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '20px',
                            borderRadius: '12px',
                            color: 'white'
                          }}>
                            <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Total Gastado</h4>
                            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                              ${formatearMoneda(estadisticas.resumen?.total_gastado)}
                            </p>
                          </div>
                          <div style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            padding: '20px',
                            borderRadius: '12px',
                            color: 'white'
                          }}>
                            <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Promedio por Compra</h4>
                            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                              ${formatearMoneda(estadisticas.resumen?.promedio_compra)}
                            </p>
                          </div>
                          <div style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            padding: '20px',
                            borderRadius: '12px',
                            color: 'white'
                          }}>
                            <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Total Facturas</h4>
                            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                              {estadisticas.resumen?.total_facturas || 0}
                            </p>
                          </div>
                          <div style={{
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            padding: '20px',
                            borderRadius: '12px',
                            color: 'white'
                          }}>
                            <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Productos Únicos</h4>
                            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                              {estadisticas.productos_unicos_comprados || 0}
                            </p>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '15px',
                          background: '#f9fafb',
                          padding: '20px',
                          borderRadius: '8px'
                        }}>
                          <div>
                            <strong>Primera Compra:</strong>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>{formatearFecha(estadisticas.resumen?.primera_compra)}</p>
                          </div>
                          <div>
                            <strong>Última Compra:</strong>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>{formatearFecha(estadisticas.resumen?.ultima_compra)}</p>
                          </div>
                          <div>
                            <strong>Compra Mínima:</strong>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>${formatearMoneda(estadisticas.resumen?.compra_minima)}</p>
                          </div>
                          <div>
                            <strong>Compra Máxima:</strong>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>${formatearMoneda(estadisticas.resumen?.compra_maxima)}</p>
                          </div>
                        </div>

                        {estadisticas.compras_por_mes?.length > 0 && (
                          <div style={{ marginTop: '30px' }}>
                            <h4>📅 Compras por Mes (Últimos 12 meses)</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f3f4f6' }}>
                                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Mes</th>
                                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Facturas</th>
                                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {estadisticas.compras_por_mes.map((mes, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '10px' }}>{mes.mes}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{mes.cantidad_facturas}</td>
                                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>${formatearMoneda(mes.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default Clientes





