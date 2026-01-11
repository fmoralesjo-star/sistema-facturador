import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

const INITIAL_FORM_STATE = {
  nombre: '', ruc: '', direccion: '', telefono: '', email: '', fechaNacimiento: '', esExtranjero: false,
  tipo_persona: 'NATURAL', razon_social: '', nombre_comercial: '', contribuyente_especial: '',
  persona_relacionada: '', categoria_persona: '', vendedor_asignado: '',
  es_cliente: true, es_proveedor: false, es_vendedor: false, es_empleado: false, es_artesano: false, para_exportacion: false,
  centro_costo_cliente: '', cuenta_por_cobrar: '', centro_costo_proveedor: '', cuenta_por_pagar: '',
  descuento_porcentaje: '', dias_credito: '', pvp_por_defecto: '', limite_credito: '',
  banco_nombre: '', cuenta_bancaria_numero: '', cuenta_bancaria_tipo: '',
  departamento: '', cargo: '', grupo_empleado: '', sueldo: '', tiempo_trabajo: '',
  fecha_ultimo_ingreso: '', fecha_ultima_salida: '', numero_cargas: '', vacaciones_tomadas: '',
  centro_costo_rrhh: '', tipo_contrato: '', notas: ''
}

function Clientes({ socket }) {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [mostrarMensajeExito, setMostrarMensajeExito] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [cuentasContables, setCuentasContables] = useState([])

  // Cargar plan de cuentas para selects
  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        const res = await axios.get(`${API_URL}/plan-cuentas`)
        // Aplanar el árbol para el select
        const aplanar = (nodos) => {
          let flat = []
          nodos.forEach(n => {
            flat.push({ id: n.id, codigo: n.codigo, nombre: n.nombre, fullLabel: `${n.codigo} - ${n.nombre}` })
            if (n.hijos) flat = flat.concat(aplanar(n.hijos))
          })
          return flat
        }
        setCuentasContables(aplanar(res.data))
      } catch (error) {
        console.error('Error cargando plan de cuentas:', error)
      }
    }
    cargarCuentas()
  }, [])

  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE })
  const [formTab, setFormTab] = useState('generales')

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

      setFormData({ ...INITIAL_FORM_STATE })
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
            setFormData({ ...INITIAL_FORM_STATE })
          }}>
            {mostrarFormulario ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        </div>

        {mostrarFormulario && (
          <div style={{ marginTop: '1.5rem' }}>
            {/* Tabs de Navegación del Formulario */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px', gap: '5px', overflowX: 'auto' }}>
              {[
                { id: 'generales', label: 'Datos Generales' },
                { id: 'roles', label: 'Roles y Categoría' },
                { id: 'comercial', label: 'Comercial y Contable' },
                { id: 'bancarios', label: 'Datos Bancarios' },
                { id: 'rrhh', label: 'Recursos Humanos' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFormTab(tab.id)}
                  style={{
                    padding: '10px 15px',
                    border: 'none',
                    background: formTab === tab.id ? 'white' : '#f3f4f6',
                    borderBottom: formTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                    color: formTab === tab.id ? '#2563eb' : '#6b7280',
                    cursor: 'pointer',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* === TAB 1: DATOS GENERALES === */}
              {formTab === 'generales' && (
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Tipo Persona</label>
                    <select
                      className="input-text"
                      value={formData.tipo_persona || 'NATURAL'}
                      onChange={(e) => setFormData({ ...formData, tipo_persona: e.target.value })}
                    >
                      <option value="NATURAL">NATURAL</option>
                      <option value="JURIDICA">JURIDICA</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>RUC / Cédula / Pasaporte *</label>
                    <input
                      type="text"
                      value={formData.ruc}
                      onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Razón Social (Nombre Legal) *</label>
                    <input
                      type="text"
                      value={formData.nombre} // Mapeado a 'nombre' en BD
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase(), razon_social: e.target.value.toUpperCase() })}
                      required
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nombre Comercial</label>
                    <input
                      type="text"
                      value={formData.nombre_comercial || ''}
                      onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value.toUpperCase() })}
                      style={{ textTransform: 'uppercase' }}
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
              )}

              {/* === TAB 2: ROLES Y CATEGORÍA === */}
              {formTab === 'roles' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    {[
                      { key: 'es_cliente', label: 'Es Cliente' },
                      { key: 'es_proveedor', label: 'Es Proveedor' },
                      { key: 'es_vendedor', label: 'Es Vendedor' },
                      { key: 'es_empleado', label: 'Es Empleado' },
                      { key: 'es_artesano', label: 'Es Artesano' },
                      { key: 'para_exportacion', label: 'Para Exportación' },
                    ].map(role => (
                      <div key={role.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                        <input
                          type="checkbox"
                          id={role.key}
                          checked={formData[role.key] || false}
                          onChange={(e) => setFormData({ ...formData, [role.key]: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor={role.key} style={{ margin: 0, cursor: 'pointer', fontSize: '14px' }}>{role.label}</label>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Categoría Persona</label>
                      <input
                        type="text"
                        value={formData.categoria_persona || ''}
                        onChange={(e) => setFormData({ ...formData, categoria_persona: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Persona Relacionada</label>
                      <input
                        type="text"
                        value={formData.persona_relacionada || ''}
                        onChange={(e) => setFormData({ ...formData, persona_relacionada: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Vendedor Asignado</label>
                      <input
                        type="text"
                        value={formData.vendedor_asignado || ''}
                        onChange={(e) => setFormData({ ...formData, vendedor_asignado: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contribuyente Especial (N° Res)</label>
                      <input
                        type="text"
                        placeholder="Ej: 534"
                        value={formData.contribuyente_especial || ''}
                        onChange={(e) => setFormData({ ...formData, contribuyente_especial: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: COMERCIAL Y CONTABLE === */}
              {formTab === 'comercial' && (
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>PVP por Defecto</label>
                    <input
                      type="text"
                      placeholder="Ej: PVP1, MAYORISTA"
                      value={formData.pvp_por_defecto || ''}
                      onChange={(e) => setFormData({ ...formData, pvp_por_defecto: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Descuento (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.descuento_porcentaje || ''}
                      onChange={(e) => setFormData({ ...formData, descuento_porcentaje: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Monto Crédito ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.limite_credito || ''}
                      onChange={(e) => setFormData({ ...formData, limite_credito: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Días Crédito</label>
                    <input
                      type="number"
                      value={formData.dias_credito || ''}
                      onChange={(e) => setFormData({ ...formData, dias_credito: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Centro Costo (Cliente)</label>
                    <input
                      type="text"
                      value={formData.centro_costo_cliente || ''}
                      onChange={(e) => setFormData({ ...formData, centro_costo_cliente: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuenta por Cobrar</label>
                    <select
                      className="input-text"
                      value={formData.cuenta_por_cobrar || ''}
                      onChange={(e) => setFormData({ ...formData, cuenta_por_cobrar: e.target.value })}
                    >
                      <option value="">-- Seleccione Cuenta --</option>
                      {cuentasContables.map(c => (
                        <option key={c.id} value={c.codigo}>
                          {c.fullLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Centro Costo (Proveedor)</label>
                    <input
                      type="text"
                      value={formData.centro_costo_proveedor || ''}
                      onChange={(e) => setFormData({ ...formData, centro_costo_proveedor: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuenta por Pagar</label>
                    <select
                      className="input-text"
                      value={formData.cuenta_por_pagar || ''}
                      onChange={(e) => setFormData({ ...formData, cuenta_por_pagar: e.target.value })}
                    >
                      <option value="">-- Seleccione Cuenta --</option>
                      {cuentasContables.map(c => (
                        <option key={c.id} value={c.codigo}>
                          {c.fullLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* === TAB 4: BANCARIOS === */}
              {formTab === 'bancarios' && (
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Banco</label>
                    <input
                      type="text"
                      value={formData.banco_nombre || ''}
                      onChange={(e) => setFormData({ ...formData, banco_nombre: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>N° Cuenta Bancaria</label>
                    <input
                      type="text"
                      value={formData.cuenta_bancaria_numero || ''}
                      onChange={(e) => setFormData({ ...formData, cuenta_bancaria_numero: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo Cuenta</label>
                    <select
                      className="input-text"
                      value={formData.cuenta_bancaria_tipo || ''}
                      onChange={(e) => setFormData({ ...formData, cuenta_bancaria_tipo: e.target.value })}
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="AHORROS">AHORROS</option>
                      <option value="CORRIENTE">CORRIENTE</option>
                    </select>
                  </div>
                </div>
              )}

              {/* === TAB 5: RRHH (Solo si es empleado) === */}
              {formTab === 'rrhh' && (
                <div>
                  {!formData.es_empleado && (
                    <div style={{ padding: '10px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '4px', marginBottom: '15px', color: '#9a3412' }}>
                      ⚠️ Active la opción "Es Empleado" en la pestaña Roles para que estos datos sean relevantes.
                    </div>
                  )}
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Departamento</label>
                      <input type="text" value={formData.departamento || ''} onChange={(e) => setFormData({ ...formData, departamento: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Cargo</label>
                      <input type="text" value={formData.cargo || ''} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Grupo</label>
                      <input type="text" value={formData.grupo_empleado || ''} onChange={(e) => setFormData({ ...formData, grupo_empleado: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Sueldo</label>
                      <input type="number" step="0.01" value={formData.sueldo || ''} onChange={(e) => setFormData({ ...formData, sueldo: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Tiempo Trabajo</label>
                      <input type="text" value={formData.tiempo_trabajo || ''} onChange={(e) => setFormData({ ...formData, tiempo_trabajo: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Fecha Últ. Ingreso</label>
                      <input type="date" value={formData.fecha_ultimo_ingreso || ''} onChange={(e) => setFormData({ ...formData, fecha_ultimo_ingreso: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Fecha Últ. Salida</label>
                      <input type="date" value={formData.fecha_ultima_salida || ''} onChange={(e) => setFormData({ ...formData, fecha_ultima_salida: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>N° Cargas</label>
                      <input type="number" value={formData.numero_cargas || ''} onChange={(e) => setFormData({ ...formData, numero_cargas: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Vacaciones Tomadas</label>
                      <input type="number" value={formData.vacaciones_tomadas || ''} onChange={(e) => setFormData({ ...formData, vacaciones_tomadas: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Centro Costos (RRHH)</label>
                      <input type="text" value={formData.centro_costo_rrhh || ''} onChange={(e) => setFormData({ ...formData, centro_costo_rrhh: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Contrato</label>
                      <input type="text" value={formData.tipo_contrato || ''} onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Nota</label>
                    <textarea
                      value={formData.notas || ''}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      rows="3"
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 30px', fontSize: '16px' }}>
                  {editingId ? 'Actualizar' : 'Guardar'} Cliente
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Lista de Clientes</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre / Razón Social</th>
              <th>Identificación (RUC)</th>
              <th>Tipo</th>
              <th>Categoría / Rol</th>
              <th>Vendedor</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>
                  <div style={{ fontWeight: '500' }}>{cliente.nombre}</div>
                  {cliente.nombre_comercial && cliente.nombre_comercial !== cliente.nombre && (
                    <div style={{ fontSize: '12px', color: '#666' }}>{cliente.nombre_comercial}</div>
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: 'bold' }}>{cliente.ruc || 'N/A'}</span>
                  {cliente.contribuyente_especial && (
                    <div style={{ fontSize: '10px', background: '#eef2ff', color: '#4338ca', padding: '2px 4px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                      Cont. Esp: {cliente.contribuyente_especial}
                    </div>
                  )}
                </td>
                <td>{cliente.tipo_persona || 'NATURAL'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {cliente.categoria_persona && <span style={{ fontSize: '12px', color: '#555' }}>Cat: {cliente.categoria_persona}</span>}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {cliente.es_cliente && <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '10px' }}>Cliente</span>}
                      {cliente.es_proveedor && <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '10px' }}>Prov</span>}
                      {cliente.es_empleado && <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '10px' }}>Emp</span>}
                    </div>
                  </div>
                </td>
                <td>{cliente.vendedor_asignado || '-'}</td>
                <td style={{ fontSize: '13px' }}>{cliente.direccion || 'N/A'}</td>
                <td>{cliente.telefono || 'N/A'}</td>
                <td>{cliente.email || 'N/A'}</td>
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
                      🗑️
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





