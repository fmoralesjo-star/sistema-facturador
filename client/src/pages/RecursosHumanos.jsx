import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './RecursosHumanos.css'
import { API_URL } from '../config/api'

function RecursosHumanos({ socket }) {
  const navigate = useNavigate()
  const [seccionActiva, setSeccionActiva] = useState('empleados')
  const [empleados, setEmpleados] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(false)
  const [mostrarFormularioEmpleado, setMostrarFormularioEmpleado] = useState(false)
  const [mostrarFormularioAsistencia, setMostrarFormularioAsistencia] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] = useState(null)
  const [formDataEmpleado, setFormDataEmpleado] = useState({
    nombre: '',
    apellido: '',
    identificacion: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    fecha_ingreso: '',
    estado: 'activo',
    activo: true,
    sueldo: 460.00
  })
  const [formDataAsistencia, setFormDataAsistencia] = useState({
    empleado_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_entrada: '',
    hora_salida: '',
    tipo: 'normal',
    observaciones: ''
  })
  const [filtroFecha, setFiltroFecha] = useState({
    inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  })

  // Estados para Contratos
  const [contratos, setContratos] = useState([])
  const [mostrarFormularioContrato, setMostrarFormularioContrato] = useState(false)

  // Estados para IESS
  const [reportesIESS, setReportesIESS] = useState([])
  const [mostrarFormularioIESS, setMostrarFormularioIESS] = useState(false)

  // Estado para visor de Código del Trabajo
  const [mostrarCodigoTrabajo, setMostrarCodigoTrabajo] = useState(false)

  useEffect(() => {
    cargarDatos()

    if (socket) {
      socket.on('empleado-actualizado', cargarDatos)
      socket.on('asistencia-creada', cargarDatos)
    }

    return () => {
      if (socket) {
        socket.off('empleado-actualizado')
        socket.off('asistencia-creada')
      }
    }
  }, [socket])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [empleadosRes, asistenciasRes] = await Promise.all([
        axios.get(`${API_URL}/recursos-humanos/empleados`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/recursos-humanos/asistencias`).catch(() => ({ data: [] }))
      ])

      setEmpleados(empleadosRes.data || [])
      setAsistencias(asistenciasRes.data || [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitEmpleado = async (e) => {
    e.preventDefault()
    try {
      const empleadoData = {
        ...formDataEmpleado,
        fecha_nacimiento: formDataEmpleado.fecha_nacimiento || null,
        fecha_ingreso: formDataEmpleado.fecha_ingreso || null
      }

      if (empleadoEditando) {
        await axios.put(`${API_URL}/recursos-humanos/empleados/${empleadoEditando.id}`, empleadoData)
      } else {
        await axios.post(`${API_URL}/recursos-humanos/empleados`, empleadoData)
      }

      if (socket) {
        socket.emit('empleado-actualizado')
      }

      setMostrarFormularioEmpleado(false)
      setEmpleadoEditando(null)
      setFormDataEmpleado({
        nombre: '',
        apellido: '',
        identificacion: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        fecha_ingreso: '',
        estado: 'activo',
        activo: true
      })
      cargarDatos()
    } catch (error) {
      console.error('Error al guardar empleado:', error)
      alert('Error al guardar el empleado')
    }
  }

  const handleSubmitAsistencia = async (e) => {
    e.preventDefault()
    try {
      const asistenciaData = {
        ...formDataAsistencia,
        empleado_id: parseInt(formDataAsistencia.empleado_id),
        fecha: new Date(formDataAsistencia.fecha)
      }

      await axios.post(`${API_URL}/recursos-humanos/asistencias`, asistenciaData)

      if (socket) {
        socket.emit('asistencia-creada')
      }

      setMostrarFormularioAsistencia(false)
      setFormDataAsistencia({
        empleado_id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora_entrada: '',
        hora_salida: '',
        tipo: 'normal',
        observaciones: ''
      })
      cargarDatos()
    } catch (error) {
      console.error('Error al guardar asistencia:', error)
      alert('Error al guardar la asistencia')
    }
  }

  const handleEditarEmpleado = (empleado) => {
    setEmpleadoEditando(empleado)
    setFormDataEmpleado({
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      identificacion: empleado.identificacion || '',
      email: empleado.email || '',
      telefono: empleado.telefono || '',
      fecha_nacimiento: empleado.fecha_nacimiento ? new Date(empleado.fecha_nacimiento).toISOString().split('T')[0] : '',
      fecha_ingreso: empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toISOString().split('T')[0] : '',
      estado: empleado.estado || 'activo',
      activo: empleado.activo !== undefined ? empleado.activo : true
    })
    setMostrarFormularioEmpleado(true)
  }

  const handleEliminarEmpleado = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este empleado?')) return

    try {
      await axios.delete(`${API_URL}/recursos-humanos/empleados/${id}`)
      if (socket) {
        socket.emit('empleado-actualizado')
      }
      cargarDatos()
    } catch (error) {
      console.error('Error al eliminar empleado:', error)
      alert('Error al eliminar el empleado')
    }
  }

  const asistenciasFiltradas = asistencias.filter(a => {
    const fechaAsistencia = new Date(a.fecha).toISOString().split('T')[0]
    return fechaAsistencia >= filtroFecha.inicio && fechaAsistencia <= filtroFecha.fin
  })

  const estadisticas = {
    totalEmpleados: empleados.length,
    empleadosActivos: empleados.filter(e => e.activo).length,
    asistenciasMes: asistenciasFiltradas.length,
    asistenciasHoy: asistencias.filter(a => {
      const hoy = new Date().toISOString().split('T')[0]
      return new Date(a.fecha).toISOString().split('T')[0] === hoy
    }).length
  }

  return (
    <div className="recursos-humanos-container">

      <button onClick={() => navigate('/')} className="btn-home" style={{ marginBottom: '1rem' }} title="Volver a la pantalla principal">
        Inicio
      </button>

      <div className="rh-tabs">
        <button
          className={`tab ${seccionActiva === 'empleados' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('empleados')}
        >
          👤 Empleados
        </button>
        <button
          className={`tab ${seccionActiva === 'asistencias' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('asistencias')}
        >
          📅 Asistencias
        </button>
        <button
          className={`tab ${seccionActiva === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('estadisticas')}
        >
          📊 Estadísticas
        </button>
        <button
          className={`tab ${seccionActiva === 'rol_pagos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('rol_pagos')}
        >
          💰 Rol de Pagos
        </button>
        <button
          className={`tab ${seccionActiva === 'contratos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('contratos')}
        >
          📄 Contratos
        </button>
        <button
          className={`tab ${seccionActiva === 'iess' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('iess')}
        >
          🏥 IESS
        </button>
      </div>

      {seccionActiva === 'empleados' && (
        <div className="rh-content">
          <div className="rh-actions">
            <button
              className="btn-primary"
              onClick={() => {
                setEmpleadoEditando(null)
                setFormDataEmpleado({
                  nombre: '',
                  apellido: '',
                  identificacion: '',
                  email: '',
                  telefono: '',
                  fecha_nacimiento: '',
                  fecha_ingreso: '',
                  estado: 'activo',
                  activo: true
                })
                setMostrarFormularioEmpleado(true)
              }}
            >
              + Nuevo Empleado
            </button>
          </div>

          {mostrarFormularioEmpleado && (
            <div className="form-container">
              <h2>{empleadoEditando ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <form onSubmit={handleSubmitEmpleado}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formDataEmpleado.nombre}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      value={formDataEmpleado.apellido}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, apellido: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Identificación</label>
                    <input
                      type="text"
                      value={formDataEmpleado.identificacion}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, identificacion: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formDataEmpleado.email}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={formDataEmpleado.telefono}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, telefono: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={formDataEmpleado.fecha_nacimiento}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, fecha_nacimiento: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Ingreso</label>
                    <input
                      type="date"
                      value={formDataEmpleado.fecha_ingreso}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, fecha_ingreso: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={formDataEmpleado.estado}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, estado: e.target.value })}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="vacaciones">Vacaciones</option>
                      <option value="licencia">Licencia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formDataEmpleado.activo}
                        onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, activo: e.target.checked })}
                      />
                      Activo
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Sueldo Mensual ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formDataEmpleado.sueldo}
                      onChange={(e) => setFormDataEmpleado({ ...formDataEmpleado, sueldo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {empleadoEditando ? 'Actualizar' : 'Crear'} Empleado
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setMostrarFormularioEmpleado(false)
                      setEmpleadoEditando(null)
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {!mostrarFormularioEmpleado && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Identificación</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Fecha Ingreso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                        No hay empleados registrados
                      </td>
                    </tr>
                  ) : (
                    empleados.map((empleado) => (
                      <tr key={empleado.id}>
                        <td>{empleado.nombre}</td>
                        <td>{empleado.apellido || '-'}</td>
                        <td>{empleado.identificacion || '-'}</td>
                        <td>{empleado.email || '-'}</td>
                        <td>{empleado.telefono || '-'}</td>
                        <td>
                          {empleado.fecha_ingreso
                            ? new Date(empleado.fecha_ingreso).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <span className={`badge ${empleado.activo ? 'activo' : 'inactivo'}`}>
                            {empleado.estado || (empleado.activo ? 'activo' : 'inactivo')}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => handleEditarEmpleado(empleado)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleEliminarEmpleado(empleado.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {seccionActiva === 'asistencias' && (
        <div className="rh-content">
          <div className="rh-actions">
            <div className="filtros">
              <input
                type="date"
                value={filtroFecha.inicio}
                onChange={(e) => setFiltroFecha({ ...filtroFecha, inicio: e.target.value })}
              />
              <input
                type="date"
                value={filtroFecha.fin}
                onChange={(e) => setFiltroFecha({ ...filtroFecha, fin: e.target.value })}
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setFormDataAsistencia({
                  empleado_id: '',
                  fecha: new Date().toISOString().split('T')[0],
                  hora_entrada: '',
                  hora_salida: '',
                  tipo: 'normal',
                  observaciones: ''
                })
                setMostrarFormularioAsistencia(true)
              }}
            >
              + Nueva Asistencia
            </button>
          </div>

          {mostrarFormularioAsistencia && (
            <div className="form-container">
              <h2>Registrar Asistencia</h2>
              <form onSubmit={handleSubmitAsistencia}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Empleado *</label>
                    <select
                      value={formDataAsistencia.empleado_id}
                      onChange={(e) => setFormDataAsistencia({ ...formDataAsistencia, empleado_id: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar empleado</option>
                      {empleados.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre} {emp.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      value={formDataAsistencia.fecha}
                      onChange={(e) => setFormDataAsistencia({ ...formDataAsistencia, fecha: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora de Entrada</label>
                    <input
                      type="time"
                      value={formDataAsistencia.hora_entrada}
                      onChange={(e) => setFormDataAsistencia({ ...formDataAsistencia, hora_entrada: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora de Salida</label>
                    <input
                      type="time"
                      value={formDataAsistencia.hora_salida}
                      onChange={(e) => setFormDataAsistencia({ ...formDataAsistencia, hora_salida: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo *</label>
                    <select
                      value={formDataAsistencia.tipo}
                      onChange={(e) => setFormDataAsistencia({ ...formDataAsistencia, tipo: e.target.value })}
                      required
                    >
                      <option value="normal">Normal</option>
                      <option value="permiso">Permiso</option>
                      <option value="vacacion">Vacación</option>
                      <option value="ausencia">Ausencia</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      value={formDataAsistencia.observaciones}
                      onChange={(e) => setFormDataAsistencia({ ...formDataAsistencia, observaciones: e.target.value })}
                      rows="3"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Registrar Asistencia
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setMostrarFormularioAsistencia(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {!mostrarFormularioAsistencia && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Fecha</th>
                    <th>Hora Entrada</th>
                    <th>Hora Salida</th>
                    <th>Tipo</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No hay asistencias registradas
                      </td>
                    </tr>
                  ) : (
                    asistenciasFiltradas.map((asistencia) => (
                      <tr key={asistencia.id}>
                        <td>
                          {asistencia.empleado
                            ? `${asistencia.empleado.nombre} ${asistencia.empleado.apellido || ''}`
                            : '-'}
                        </td>
                        <td>{new Date(asistencia.fecha).toLocaleDateString()}</td>
                        <td>{asistencia.hora_entrada || '-'}</td>
                        <td>{asistencia.hora_salida || '-'}</td>
                        <td>
                          <span className={`badge tipo-${asistencia.tipo}`}>
                            {asistencia.tipo}
                          </span>
                        </td>
                        <td>{asistencia.observaciones || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {seccionActiva === 'estadisticas' && (
        <div className="rh-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Empleados</h3>
                <p className="stat-number">{estadisticas.totalEmpleados}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Empleados Activos</h3>
                <p className="stat-number">{estadisticas.empleadosActivos}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>Asistencias del Mes</h3>
                <p className="stat-number">{estadisticas.asistenciasMes}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📆</div>
              <div className="stat-info">
                <h3>Asistencias Hoy</h3>
                <p className="stat-number">{estadisticas.asistenciasHoy}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {seccionActiva === 'rol_pagos' && (
        <div className="rh-content">
          <div className="rh-actions">
            <h2>Generación de Nómina</h2>
          </div>
          <div className="form-container" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Generar Rol de Pagos Mensual</h3>
            <p>Esto calculará los sueldos, aportes al IESS y generará automáticamente el <strong>Asiento Contable</strong> de nómina.</p>
            <br />
            <button
              className="btn-primary"
              style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
              onClick={async () => {
                if (!window.confirm('¿Confirma generar el rol de pagos de este mes? Se creará el asiento contable.')) return;
                try {
                  const fecha = new Date().toISOString().slice(0, 7); // YYYY-MM
                  const res = await axios.post(`${API_URL}/recursos-humanos/generar-rol`, { periodo: fecha });
                  alert(`✅ Éxito: ${res.data.mensaje}\n\nDetalles:\n- Asiento Contable: ${res.data.detalles.asientoContable}\n- Total Nómina: $${res.data.detalles.totalNomina}`);
                } catch (error) {
                  console.error(error);
                  alert('Error al generar rol: ' + (error.response?.data?.message || error.message));
                }
              }}
            >
              💸 Generar Rol de Pagos
            </button>
          </div>
        </div>
      )}

      {/* Sección Contratos */}
      {seccionActiva === 'contratos' && (
        <div className="rh-content">
          <div className="rh-actions">
            <button
              className="btn-primary"
              onClick={() => setMostrarFormularioContrato(true)}
            >
              + Nuevo Contrato
            </button>
            <button
              className="btn-secondary"
              onClick={() => setMostrarCodigoTrabajo(true)}
              style={{ marginLeft: '10px', background: '#059669', color: 'white' }}
            >
              📚 Ver Código del Trabajo Ecuador
            </button>
          </div>

          {/* Modal Visor Código del Trabajo */}
          {mostrarCodigoTrabajo && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '95%',
                height: '95%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ margin: 0, color: '#111827' }}>📚 Código del Trabajo del Ecuador</h2>
                  <button
                    onClick={() => setMostrarCodigoTrabajo(false)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ✕ Cerrar
                  </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <iframe
                    src="https://www.trabajo.gob.ec/wp-content/uploads/downloads/2012/11/C%C3%B3digo-de-Tabajo-PDF.pdf"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title="Código del Trabajo Ecuador"
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '3rem', marginBottom: '20px' }}>📄</p>
            <h3 style={{ marginBottom: '10px' }}>Gestión de Contratos Laborales</h3>
            <p>Control de contratos de empleados, renovaciones y finalizaciones</p>

            {/* Recursos legales */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
              marginBottom: '20px',
              maxWidth: '700px',
              margin: '20px auto'
            }}>
              <h4 style={{ color: '#065f46', marginBottom: '15px' }}>📖 Recursos Legales Ecuador</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                <a
                  href="https://www.trabajo.gob.ec/wp-content/uploads/downloads/2012/11/C%C3%B3digo-de-Tabajo-PDF.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#047857', textDecoration: 'none', padding: '8px', borderRadius: '4px', background: 'white' }}
                >
                  📜 Código del Trabajo de Ecuador (PDF oficial)
                </a>
                <a
                  href="https://www.trabajo.gob.ec/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#047857', textDecoration: 'none', padding: '8px', borderRadius: '4px', background: 'white' }}
                >
                  🏛️ Ministerio del Trabajo - Portal Oficial
                </a>
                <a
                  href="https://www.lexis.com.ec/wp-content/uploads/2018/07/LI-CODIGO-DEL-TRABAJO.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#047857', textDecoration: 'none', padding: '8px', borderRadius: '4px', background: 'white' }}
                >
                  ⚖️ Código del Trabajo Actualizado (Lexis)
                </a>
              </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto 0' }}>
              <h4>Funcionalidades:</h4>
              <ul style={{ lineHeight: '2' }}>
                <li>✓ Registro de contratos (plazo fijo, indefinido, temporal)</li>
                <li>✓ Control de fechas de vencimiento</li>
                <li>✓ Alertas de renovación</li>
                <li>✓ Historial de contratos por empleado</li>
                <li>✓ Documentación asociada</li>
              </ul>
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '20px', color: '#9ca3af' }}>
              <em>Módulo pendiente de implementación completa</em>
            </p>
          </div>
        </div>
      )}

      {/* Sección IESS */}
      {seccionActiva === 'iess' && (
        <div className="rh-content">
          <div className="rh-actions">
            <button
              className="btn-primary"
              onClick={() => setMostrarFormularioIESS(true)}
            >
              + Generar Reporte IESS
            </button>
          </div>

          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '3rem', marginBottom: '20px' }}>🏥</p>
            <h3 style={{ marginBottom: '10px' }}>Gestión de Aportes IESS</h3>
            <p>Administración de aportes y reportes al Instituto Ecuatoriano de Seguridad Social</p>
            <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto 0' }}>
              <h4>Funcionalidades:</h4>
              <ul style={{ lineHeight: '2' }}>
                <li>✓ Cálculo automático de aportes patronales y personales</li>
                <li>✓ Generación de planillas IESS</li>
                <li>✓ Reporte de novedades (ingresos, salidas, cambios salariales)</li>
                <li>✓ Control de pagos y fechas límite</li>
                <li>✓ Exportación de archivos para IESS en línea</li>
              </ul>
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '20px', color: '#9ca3af' }}>
              <em>Módulo pendiente de implementación completa</em>
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

export default RecursosHumanos
