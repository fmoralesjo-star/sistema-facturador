import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './Contabilidad.css'
import { API_URL } from '../config/api'
import { redondear4Decimales, redondear2Decimales, formatearNumero, formatearMoneda, parsearNumero } from '../utils/formateo'
import PlanCuentasModal from '../components/PlanCuentasModal'
import GeneradorATS from './admin/GeneradorATS'
import DashboardFinanciero from './contabilidad/DashboardFinanciero'

function Contabilidad({ socket }) {
  const navigate = useNavigate()

  // Estados para secciones expandibles
  const [sectionsExpanded, setSectionsExpanded] = useState({
    planCuentas: false,
    asientos: false,
    reportes: false,
    ats: false,
    kpis: false
  })

  const [asientos, setAsientos] = useState([])
  const [balance, setBalance] = useState(null)
  const [resumen, setResumen] = useState([])
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Estados para reportes financieros
  const [balanceGeneral, setBalanceGeneral] = useState(null)
  const [perdidasGanancias, setPerdidasGanancias] = useState(null)
  const [libroMayor, setLibroMayor] = useState(null)
  const [cuentas, setCuentas] = useState([])
  const [loadingReportes, setLoadingReportes] = useState(false)

  // Estados para Plan de Cuentas
  const [cuentasTree, setCuentasTree] = useState([])
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [showPlanCuentasModal, setShowPlanCuentasModal] = useState(false)
  const [cuentaEditar, setCuentaEditar] = useState(null)
  const [cuentaPadre, setCuentaPadre] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState({})

  // Filtros para reportes
  const [fechaCorteBG, setFechaCorteBG] = useState(new Date().toISOString().split('T')[0])
  const [fechaInicioPL, setFechaInicioPL] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [fechaFinPL, setFechaFinPL] = useState(new Date().toISOString().split('T')[0])
  const [cuentaIdLibroMayor, setCuentaIdLibroMayor] = useState('')
  const [fechaInicioLM, setFechaInicioLM] = useState('')
  const [fechaFinLM, setFechaFinLM] = useState(new Date().toISOString().split('T')[0])

  // Función para expandir/colapsar secciones
  const toggleSection = (section) => {
    setSectionsExpanded(prev => {
      // Si la sección ya está abierta, cerrarla
      if (prev[section]) {
        return { ...prev, [section]: false }
      }
      // Si no, cerrar todas las otras y abrir solo esta
      const newState = {}
      Object.keys(prev).forEach(key => {
        newState[key] = false
      })
      newState[section] = true
      return newState
    })
  }

  useEffect(() => {
    cargarDatos()
    cargarCuentas()

    socket.on('contabilidad-actualizada', () => {
      cargarDatos()
      if (seccionActiva === 'plan-cuentas') cargarPlanCuentas()
    })

    return () => {
      socket.off('contabilidad-actualizada')
    }
  }, [socket])

  // Cargar reportes cuando se expanden las secciones
  useEffect(() => {
    if (sectionsExpanded.reportes && !balanceGeneral) {
      cargarBalanceGeneral()
    }
    if (sectionsExpanded.reportes && !perdidasGanancias) {
      cargarPerdidasGanancias()
    }
    if (sectionsExpanded.planCuentas && cuentasTree.length === 0) {
      cargarPlanCuentas()
    }
  }, [sectionsExpanded])

  const cargarDatos = async () => {
    await Promise.all([
      cargarAsientos(),
      cargarBalance(),
      cargarResumen()
    ])
  }

  const cargarAsientos = async () => {
    try {
      const res = await axios.get(`${API_URL}/contabilidad/asientos`)
      setAsientos(res.data)
    } catch (error) {
      console.error('Error al cargar asientos:', error)
    }
  }

  const cargarBalance = async () => {
    try {
      const res = await axios.get(`${API_URL}/contabilidad/balance`)
      setBalance(res.data)
    } catch (error) {
      console.error('Error al cargar balance:', error)
    }
  }

  const cargarResumen = async () => {
    try {
      const params = fechaInicio && fechaFin
        ? `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
        : ''
      const res = await axios.get(`${API_URL}/contabilidad/resumen${params}`)
      setResumen(res.data)
    } catch (error) {
      console.error('Error al cargar resumen:', error)
    }
  }

  const handleFiltrar = () => {
    cargarResumen()
  }

  const generarDatosEjemplo = async () => {
    if (!confirm('¿Generar datos de ejemplo? Esto creará asientos contables de prueba.')) {
      return
    }
    try {
      const res = await axios.post(`${API_URL}/contabilidad/datos-ejemplo/generar`)
      alert(`Datos de ejemplo generados:\n- Asientos: ${res.data.asientos_creados}\n- Total ventas: ${formatearMoneda(res.data.resumen.total_ventas)}\n- Total IVA: ${formatearMoneda(res.data.resumen.total_iva)}`)
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar datos de ejemplo: ' + (error.response?.data?.message || error.message))
    }
  }

  const limpiarDatosEjemplo = async () => {
    if (!confirm('¿Eliminar datos de ejemplo? Esto solo eliminará los asientos que comienzan con "AS-EJEMPLO-".')) {
      return
    }
    try {
      const res = await axios.post(`${API_URL}/contabilidad/datos-ejemplo/limpiar`)
      alert(`Datos de ejemplo eliminados: ${res.data.asientos_eliminados} asientos`)
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al limpiar datos de ejemplo: ' + (error.response?.data?.message || error.message))
    }
  }

  const cargarCuentas = async () => {
    try {
      const res = await axios.get(`${API_URL}/plan-cuentas`)
      // Aplanar para el select
      const aplanar = (nodos) => {
        let flat = []
        nodos.forEach(n => {
          flat.push(n)
          if (n.hijos) flat = flat.concat(aplanar(n.hijos))
        })
        return flat
      }
      const planas = aplanar(res.data)
      setCuentas(planas)
    } catch (error) {
      console.error('Error al cargar cuentas:', error)
    }
  }

  // --- Lógica del Plan de Cuentas ---

  const cargarPlanCuentas = async () => {
    setLoadingCuentas(true)
    try {
      const res = await axios.get(`${API_URL}/plan-cuentas`)
      setCuentasTree(res.data)
      // Expandir primer nivel por defecto
      const initialExpanded = {}
      res.data.forEach(c => initialExpanded[c.id] = true)
      setExpandedNodes(prev => ({ ...initialExpanded, ...prev }))
    } catch (error) {
      console.error('Error cargando plan de cuentas:', error)
    } finally {
      setLoadingCuentas(false)
    }
  }

  const inicializarPlan = async () => {
    if (!confirm('¿Está seguro de inicializar el plan de cuentas básico SRI? Esto creará la estructura estándar.')) return
    try {
      await axios.get(`${API_URL}/plan-cuentas/inicializar`)
      alert('Plan de cuentas inicializado correctamente')
      cargarPlanCuentas()
      cargarCuentas() // Refresh select lists
    } catch (error) {
      console.error('Error inicializando plan:', error)
      const msg = error.response?.data?.message || error.message || 'Error desconocido'
      alert('Error inicializando plan: ' + msg)
    }
  }

  const handleSaveCuenta = async (formData) => {
    try {
      if (cuentaEditar) {
        await axios.patch(`${API_URL}/plan-cuentas/${cuentaEditar.id}`, formData)
      } else {
        await axios.post(`${API_URL}/plan-cuentas`, formData)
      }
      setShowPlanCuentasModal(false)
      setCuentaEditar(null)
      setCuentaPadre(null)
      cargarPlanCuentas()
      cargarCuentas()
    } catch (error) {
      alert('Error guardando cuenta: ' + error.response?.data?.message)
    }
  }

  const handleDeleteCuenta = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta cuenta? Solo se pueden eliminar cuentas sin hijos ni movimientos.')) return
    try {
      await axios.delete(`${API_URL}/plan-cuentas/${id}`)
      cargarPlanCuentas()
      cargarCuentas()
    } catch (error) {
      alert('Error eliminando cuenta: ' + error.response?.data?.message)
    }
  }

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Componente recursivo para renderizar árbol
  const CuentaTreeNode = ({ cuenta, level = 0 }) => {
    const hasChildren = cuenta.hijos && cuenta.hijos.length > 0
    const isExpanded = expandedNodes[cuenta.id]

    return (
      <>
        <tr className="cuenta-row" style={{ backgroundColor: level === 0 ? '#f8f9fa' : 'white' }}>
          <td style={{ paddingLeft: `${level * 20 + 10}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {hasChildren && (
                <button
                  onClick={() => toggleNode(cuenta.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', width: '20px', fontWeight: 'bold', color: '#0f766e' }}
                >
                  {isExpanded ? '−' : '+'}
                </button>
              )}
              <span style={{ fontWeight: level < 2 ? 'bold' : 'normal', marginLeft: hasChildren ? 0 : '20px' }}>
                {cuenta.codigo}
              </span>
            </div>
          </td>
          <td>
            <span style={{ fontWeight: level < 2 ? 'bold' : 'normal' }}>
              {cuenta.nombre}
            </span>
          </td>
          <td>
            <span className={`badge badge-${cuenta.tipo.toLowerCase()}`} style={{ fontSize: '10px' }}>
              {cuenta.tipo}
            </span>
          </td>
          <td style={{ textAlign: 'center' }}>
            {cuenta.permite_movimiento ? '✅' : '-'}
          </td>
          <td>
            <div className="action-buttons" style={{ display: 'flex', gap: '5px' }}>
              <button
                className="btn-icon"
                title="Agregar Subcuenta"
                onClick={() => {
                  setCuentaPadre(cuenta)
                  setCuentaEditar(null)
                  setShowPlanCuentasModal(true)
                }}
                style={{ padding: '2px 6px', fontSize: '12px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Subcuenta
              </button>
              <button
                className="btn-icon"
                title="Editar"
                onClick={() => {
                  setCuentaEditar(cuenta)
                  setCuentaPadre(null)
                  setShowPlanCuentasModal(true)
                }}
                style={{ padding: '2px 6px', fontSize: '12px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                ✏️
              </button>
              {!hasChildren && (
                <button
                  className="btn-icon"
                  title="Eliminar"
                  onClick={() => handleDeleteCuenta(cuenta.id)}
                  style={{ padding: '2px 6px', fontSize: '12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              )}
            </div>
          </td>
        </tr>
        {isExpanded && hasChildren && cuenta.hijos.map(hijo => (
          <CuentaTreeNode key={hijo.id} cuenta={hijo} level={level + 1} />
        ))}
      </>
    )
  }

  // --- Fin Lógica Plan de Cuentas ---



  const cargarBalanceGeneral = async () => {
    setLoadingReportes(true)
    try {
      const params = fechaCorteBG ? `?fechaCorte=${fechaCorteBG}` : ''
      const res = await axios.get(`${API_URL}/contabilidad/reportes/balance-general${params}`)
      setBalanceGeneral(res.data)
    } catch (error) {
      console.error('Error al cargar balance general:', error)
      alert('Error al cargar balance general: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoadingReportes(false)
    }
  }

  const cargarPerdidasGanancias = async () => {
    if (!fechaInicioPL || !fechaFinPL) return

    setLoadingReportes(true)
    try {
      const params = `?fechaInicio=${fechaInicioPL}&fechaFin=${fechaFinPL}`
      const res = await axios.get(`${API_URL}/contabilidad/reportes/perdidas-ganancias${params}`)
      setPerdidasGanancias(res.data)
    } catch (error) {
      console.error('Error al cargar pérdidas y ganancias:', error)
      alert('Error al cargar pérdidas y ganancias: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoadingReportes(false)
    }
  }

  const cargarLibroMayor = async () => {
    if (!cuentaIdLibroMayor) {
      alert('Por favor selecciona una cuenta')
      return
    }

    setLoadingReportes(true)
    try {
      let params = `?cuentaId=${cuentaIdLibroMayor}`
      if (fechaInicioLM) params += `&fechaInicio=${fechaInicioLM}`
      if (fechaFinLM) params += `&fechaFin=${fechaFinLM}`

      const res = await axios.get(`${API_URL}/contabilidad/reportes/libro-mayor/${cuentaIdLibroMayor}${params.replace('?cuentaId=' + cuentaIdLibroMayor, '')}`)
      setLibroMayor(res.data)
    } catch (error) {
      console.error('Error al cargar libro mayor:', error)
      alert('Error al cargar libro mayor: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoadingReportes(false)
    }
  }

  // --- Componentes para Reportes ---

  const ReporteTreeNode = ({ cuenta, level = 0 }) => {
    const hasChildren = cuenta.hijos && cuenta.hijos.length > 0
    // Auto-expandir niveles superiores
    const [isExpanded, setIsExpanded] = useState(level < 2)

    return (
      <>
        <tr className="reporte-row" style={{ backgroundColor: level === 0 ? '#f0f9ff' : 'white', borderBottom: '1px solid #eee' }}>
          <td style={{ paddingLeft: `${level * 20 + 10}px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {hasChildren && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '10px', width: '15px', color: '#666' }}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span style={{ fontWeight: hasChildren ? '600' : 'normal', marginLeft: hasChildren ? 0 : '20px', fontSize: '0.9rem' }}>
                {cuenta.codigo} - {cuenta.nombre}
              </span>
            </div>
          </td>
          <td style={{ textAlign: 'right', fontWeight: level === 0 ? '700' : 'normal' }}>
            {/* Mostrar saldo solo si tiene saldo distinto de 0 o es nodo hoja */}
            {formatearMoneda(Math.abs(cuenta.saldo))}
          </td>
        </tr>
        {isExpanded && hasChildren && cuenta.hijos.map(hijo => (
          <ReporteTreeNode key={hijo.id} cuenta={hijo} level={level + 1} />
        ))}
      </>
    )
  }

  const renderSeccionBalance = (titulo, cuentas, total) => (
    <div className="reporte-seccion" style={{ marginBottom: '20px' }}>
      <h3 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '5px', color: '#1e3a8a' }}>
        {titulo} <span style={{ float: 'right' }}>{formatearMoneda(total)}</span>
      </h3>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {cuentas.map(c => <ReporteTreeNode key={c.id} cuenta={c} />)}
        </tbody>
      </table>
    </div>
  )

  const renderSeccionPG = (titulo, cuentas, total, signo = 1) => (
    <div className="reporte-seccion" style={{ marginBottom: '20px' }}>
      <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '5px', color: '#064e3b' }}>
        {titulo} <span style={{ float: 'right' }}>{formatearMoneda(Math.abs(total))}</span>
      </h3>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {cuentas.map(c => <ReporteTreeNode key={c.id} cuenta={c} />)}
        </tbody>
      </table>
    </div>
  )

  // Componente para sección expandible reutilizable
  const SeccionExpandible = ({ id, titulo, children, defaultOpen = false }) => {
    const isOpen = sectionsExpanded[id]

    return (
      <div className={`seccion-expandible ${!isOpen ? 'collapsed' : ''}`}>
        <div className="seccion-header" onClick={() => toggleSection(id)}>
          <span>{titulo}</span>
          <span className="seccion-toggle">{isOpen ? '−' : '+'}</span>
        </div>
        {isOpen && (
          <div className="seccion-content">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="contabilidad">
      {/* Header Simplificado */}
      <div className="contabilidad-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
            title="Volver a la pantalla principal"
          >
            Inicio
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: 700 }}>📊 Centro de Trabajo Contable</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={generarDatosEjemplo} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            📊 Generar Datos
          </button>
          <button className="btn btn-secondary" onClick={limpiarDatosEjemplo} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            🗑️ Limpiar Datos
          </button>
        </div></div>

      {/* Workspace Unificado: Sidebar + Contenido */}
      <div className="contabilidad-workspace">
        {/* Sidebar de Navegación */}
        <div className="sidebar-contable">
          <div className="sidebar-nav">
            <button className="sidebar-item" onClick={() => toggleSection('indicadores')}>
              📊 Indicadores
            </button>
            <button className="sidebar-item" onClick={() => toggleSection('planCuentas')}>
              🗂️ Plan de Cuentas
            </button>
            <button className="sidebar-item" onClick={() => toggleSection('asientos')}>
              📝 Asientos
            </button>
            <button className="sidebar-item" onClick={() => toggleSection('kpis')}>
              📊 Dashboard Financiero
            </button>
            <button className="sidebar-item" onClick={() => toggleSection('reportes')}>
              📈 Reportes
            </button>
            <button className="sidebar-item" onClick={() => toggleSection('ats')}>
              📊 Generador ATS
            </button>
            <div className="sidebar-divider"></div>
            <button
              className="sidebar-item"
              onClick={generarDatosEjemplo}
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
            >
              ⚡ Generar Ejemplos
            </button>
          </div>
        </div>

        {/* Área de Trabajo Principal */}
        <div className="main-workspace">
          {/* Quick Stats - Siempre Visibles */}
          <div className="quick-stats">
            {balance && (
              <>
                <div className="stat-card-mini ingresos">
                  <h4>💰 Ingresos</h4>
                  <p className="amount">{formatearMoneda(balance.ingresos || 0)}</p>
                </div>
                <div className="stat-card-mini gastos">
                  <h4>📉 Gastos</h4>
                  <p className="amount">{formatearMoneda(balance.gastos || 0)}</p>
                </div>
                <div className="stat-card-mini utilidad">
                  <h4>✨ Utilidad</h4>
                  <p className="amount">{formatearMoneda(balance.utilidad || 0)}</p>
                </div>
                <div className="stat-card-mini activo">
                  <h4>🏦 Activos</h4>
                  <p className="amount">{formatearMoneda(balance.activos || 0)}</p>
                </div>
              </>
            )}
          </div>

          {/* Sección Expandible: Plan de Cuentas */}
          <SeccionExpandible id="planCuentas" titulo="🗂️ Plan de Cuentas">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Estructura Contable</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {cuentasTree.length === 0 && (
                  <button
                    className="btn btn-warning"
                    onClick={inicializarPlan}
                    style={{ background: '#f59e0b', color: 'white' }}
                  >
                    ⚡ Inicializar Plan SRI
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setCuentaPadre(null)
                    setCuentaEditar(null)
                    setShowPlanCuentasModal(true)
                  }}
                >
                  + Nueva Cuenta
                </button>
              </div>
            </div>

            {loadingCuentas ? (
              <p>Cargando plan de cuentas...</p>
            ) : cuentasTree.length > 0 ? (
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Movimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasTree.map(cuenta => <CuentaTreeNode key={cuenta.id} cuenta={cuenta} level={0} />)}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>No hay cuentas configuradas.</p>
                <p>Usa el botón "Inicializar Plan SRI" para crear la estructura base.</p>
              </div>
            )}
          </SeccionExpandible>

          {/* Sección Expandible: Asientos Contables */}
          <SeccionExpandible id="asientos" titulo="📝 Asientos Contables">
            <div style={{ marginBottom: '20px' }}>
              <h3>Registro de Asientos</h3>
              {asientos.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Tipo</th>
                      <th>Debe</th>
                      <th>Haber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asientos.map(asiento => (
                      <tr key={asiento.id}>
                        <td>{asiento.numero_asiento}</td>
                        <td>{new Date(asiento.fecha).toLocaleDateString()}</td>
                        <td>{asiento.descripcion}</td>
                        <td>
                          <span className={`badge badge-${asiento.tipo?.toLowerCase()}`}>
                            {asiento.tipo || 'MANUAL'}
                          </span>
                        </td>
                        <td>{formatearMoneda(asiento.total_debe)}</td>
                        <td>{formatearMoneda(asiento.total_haber)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No hay asientos registrados</p>
              )}
            </div>
          </SeccionExpandible>

          {/* Sección Expandible: Reportes Financieros */}
          <SeccionExpandible id="reportes" titulo="📈 Reportes Financieros">
            <div className="reportes-container">
              {/* Balance General */}
              <div className="reporte-card">
                <div className="reporte-header">
                  <h3>⚖️ Balance General</h3>
                  <div className="reporte-controls">
                    <label>Fecha Corte:</label>
                    <input type="date" value={fechaCorteBG} onChange={e => setFechaCorteBG(e.target.value)} />
                    <button className="btn btn-primary" onClick={cargarBalanceGeneral}>Generar</button>
                  </div>
                </div>

                {balanceGeneral && (
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {renderSeccionBalance('ACTIVOS', balanceGeneral.activos, balanceGeneral.resumen.total_activos)}
                    {renderSeccionBalance('PASIVOS', balanceGeneral.pasivos, balanceGeneral.resumen.total_pasivos)}
                    {renderSeccionBalance('PATRIMONIO', balanceGeneral.patrimonio, balanceGeneral.resumen.total_patrimonio)}
                  </div>
                )}
              </div>

              {/* Estado de Resultados */}
              <div className="reporte-card">
                <div className="reporte-header">
                  <h3>📊 Estado de Resultados</h3>
                  <div className="reporte-controls">
                    <label>Desde:</label>
                    <input type="date" value={fechaInicioPL} onChange={e => setFechaInicioPL(e.target.value)} />
                    <label>Hasta:</label>
                    <input type="date" value={fechaFinPL} onChange={e => setFechaFinPL(e.target.value)} />
                    <button className="btn btn-primary" onClick={cargarPerdidasGanancias}>Generar</button>
                  </div>
                </div>

                {perdidasGanancias && (
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {renderSeccionPG('INGRESOS', perdidasGanancias.ingresos, perdidasGanancias.resumen.total_ingresos)}
                    {renderSeccionPG('COSTOS', perdidasGanancias.costos, perdidasGanancias.resumen.total_costos)}
                    {renderSeccionPG('GASTOS', perdidasGanancias.gastos, perdidasGanancias.resumen.total_gastos)}
                    <div style={{ marginTop: '20px', padding: '15px', background: '#ecfdf5', borderRadius: '8px', textAlign: 'right' }}>
                      <h3 style={{ color: '#065f46', margin: 0 }}>
                        UTILIDAD: {formatearMoneda(perdidasGanancias.resumen.utilidad_ejercicio)}
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              {/* Libro Mayor */}
              <div className="reporte-card">
                <div className="reporte-header">
                  <h3>📒 Libro Mayor</h3>
                  <div className="reporte-controls">
                    <label>Cuenta:</label>
                    <select
                      style={{ minWidth: '200px', maxWidth: '300px' }}
                      value={cuentaIdLibroMayor}
                      onChange={e => setCuentaIdLibroMayor(e.target.value)}
                    >
                      <option value="">Seleccione...</option>
                      {cuentas.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.codigo} - {c.nombre}
                        </option>
                      ))}
                    </select>
                    <label>Desde:</label>
                    <input type="date" value={fechaInicioLM} onChange={e => setFechaInicioLM(e.target.value)} />
                    <label>Hasta:</label>
                    <input type="date" value={fechaFinLM} onChange={e => setFechaFinLM(e.target.value)} />
                    <button className="btn btn-primary" onClick={cargarLibroMayor}>Consultar</button>
                  </div>
                </div>

                {libroMayor && libroMayor.map((mayorCuenta, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#f1f5f9', padding: '10px 15px', fontWeight: 'bold' }}>
                      {mayorCuenta.codigo} - {mayorCuenta.nombre}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table" style={{ margin: 0, width: '100%' }}>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Asiento</th>
                            <th>Descripción</th>
                            <th>Debe</th>
                            <th>Haber</th>
                            <th>Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mayorCuenta.movimientos.map((mov, i) => (
                            <tr key={i}>
                              <td>{new Date(mov.fecha).toLocaleDateString()}</td>
                              <td>{mov.asiento}</td>
                              <td>{mov.descripcion}</td>
                              <td>{formatearMoneda(mov.debe)}</td>
                              <td>{formatearMoneda(mov.haber)}</td>
                              <td style={{ fontWeight: 600 }}>{formatearMoneda(mov.saldo_parcial)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SeccionExpandible>

          {/* Modal de Plan de Cuentas */}
          <PlanCuentasModal
            isOpen={showPlanCuentasModal}
            onClose={() => setShowPlanCuentasModal(false)}
            onSave={handleSaveCuenta}
            cuentaEditar={cuentaEditar}
            cuentaPadre={cuentaPadre}
            cuentas={cuentas}
          />


          {/* Sección Generador ATS */}
          {sectionsExpanded.ats && (
            <div className="section-content">
              <GeneradorATS />
            </div>
          )}

          {/* Sección Dashboard Financiero */}
          {sectionsExpanded.kpis && (
            <div className="section-content">
              <DashboardFinanciero />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Contabilidad
