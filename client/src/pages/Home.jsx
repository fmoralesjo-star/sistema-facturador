import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './Home.css'
import { API_URL } from '../config/api'
import VentasDashboard from '../components/VentasDashboard'

function Home() {
  const { logout, currentUser, isAuthenticated, getToken } = useAuth()
  const navigate = useNavigate()

  const modulosIniciales = [
    {
      id: 1,
      titulo: 'Facturación',
      descripcion: 'Crear y gestionar facturas, control de ventas',
      icono: '📄',
      ruta: '/facturacion',
      color: '#667eea',
      gradiente: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 6,
      titulo: 'Compras',
      descripcion: 'Registro de compras a proveedores con retenciones',
      icono: '🛒',
      ruta: '/compras',
      color: '#06b6d4',
      gradiente: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      id: 2,
      titulo: 'Contabilidad',
      descripcion: 'Balance general, asientos contables y reportes',
      icono: '📊',
      ruta: '/contabilidad',
      color: '#10b981',
      gradiente: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 17,
      titulo: 'Tesorería',
      descripcion: 'Cheques y Conciliación Bancaria',
      icono: '🏦',
      ruta: '/tesoreria',
      color: '#0ea5e9',
      gradiente: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    },
    {
      id: 16,
      titulo: 'Notas de Crédito',
      descripcion: 'Emisión de notas de crédito y devoluciones',
      icono: '📑',
      ruta: '/notas-credito',
      color: '#8b5cf6',
      gradiente: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
    },
    {
      id: 10,
      titulo: 'Bancos',
      descripcion: 'Gestión de cuentas bancarias y movimientos',
      icono: '🏦',
      ruta: '/bancos',
      color: '#14b8a6',
      gradiente: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
    },
    {
      id: 3,
      titulo: 'Clientes',
      descripcion: 'Gestión de base de datos de clientes',
      icono: '👥',
      ruta: '/clientes',
      color: '#3b82f6',
      gradiente: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      id: 4,
      titulo: 'Productos',
      descripcion: 'Control de inventario y catálogo de productos',
      icono: '📦',
      ruta: '/productos',
      color: '#f59e0b',
      gradiente: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 5,
      titulo: 'Inventario',
      descripcion: 'Gestión de inventario por punto de venta',
      icono: '📋',
      ruta: '/inventario',
      color: '#ec4899',
      gradiente: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    },
    {
      id: 13,
      titulo: 'Promociones',
      descripcion: 'Gestión de promociones y descuentos',
      icono: '🎁',
      ruta: '/promociones',
      color: '#e11d48',
      gradiente: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'
    },
    {
      id: 14,
      titulo: 'Dashboard',
      descripcion: 'Vista general y estadísticas del sistema',
      icono: '📊',
      ruta: '/dashboard',
      color: '#0ea5e9',
      gradiente: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    },
    {
      id: 7,
      titulo: 'Administración',
      descripcion: 'Configuración, backups, reportes, mantenimiento y SRI',
      icono: '⚙️',
      ruta: '/admin',
      color: '#6366f1',
      gradiente: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    },
    {
      id: 15,
      titulo: 'Reportes Consolidados',
      descripcion: 'Reportes avanzados y análisis consolidados',
      icono: '📑',
      ruta: '/reportes-consolidados',
      color: '#64748b',
      gradiente: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
    },
    {
      id: 18,
      titulo: 'Recursos Humanos',
      descripcion: 'Gestión de empleados, asistencia y roles de pago',
      icono: '👥',
      ruta: '/recursos-humanos',
      color: '#ec4899',
      gradiente: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    },
    {
      id: 19,
      titulo: 'Administración TI',
      descripcion: 'Gestión técnica, logs y mantenimiento del sistema',
      icono: '💻',
      ruta: '/administracion-ti',
      color: '#4f46e5',
      gradiente: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
    },
    {
      id: 20,
      titulo: 'Cartera',
      descripcion: 'Cuentas por cobrar y por pagar (Flujo de Caja)',
      icono: '💰',
      ruta: '/cartera',
      color: '#10b981',
      gradiente: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    // Nuevos módulos para la reorganización por áreas
    {
      id: 21,
      titulo: 'Proveedores',
      descripcion: 'Gestión de proveedores y acreedores',
      icono: '🚛',
      ruta: '/proveedores', // Alias a compras por ahora
      color: '#0891b2',
      gradiente: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
    },
    {
      id: 22,
      titulo: 'Cajas Chicas',
      descripcion: 'Control de gastos menores y reposiciones',
      icono: '🪙',
      ruta: '/tesoreria', // Alias a tesorería
      color: '#f59e0b',
      gradiente: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },

    {
      id: 25,
      titulo: 'Activos Fijos',
      descripcion: 'Depreciación y control de activos',
      icono: '🏢',
      ruta: '/contabilidad', // Alias a contabilidad
      color: '#059669',
      gradiente: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    },
    {
      id: 26,
      titulo: 'NC Compras',
      descripcion: 'Notas de crédito de proveedores',
      icono: '📄',
      ruta: '/compras?mode=nc', // Alias con query param
      color: '#0e7490',
      gradiente: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)'
    },
    {
      id: 27,
      titulo: 'TIENDA URBAN STYLE',
      descripcion: 'Gestión de catálogo online y pedidos web',
      icono: '🛍️',
      ruta: '/store',
      color: '#ec4899', // Pinkish/Purple
      gradiente: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
    }

  ]

  const [certificadoAlerta, setCertificadoAlerta] = useState(null)
  const [mostrarAlertaSRI, setMostrarAlertaSRI] = useState(false)
  const [pendientesSRI, setPendientesSRI] = useState(0)

  useEffect(() => {
    const consultarPendientesSRI = async () => {
      if (!isAuthenticated) return
      try {
        const token = getToken()
        // Consulta silenciosa, sin loader global
        const res = await axios.get(`${API_URL}/sri/comprobantes-recibidos/conteo-pendientes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPendientesSRI(res.data.pendientes || 0)
      } catch (error) {
        console.error('Error consultando pendientes SRI:', error)
      }
    }

    consultarPendientesSRI()
  }, [isAuthenticated, getToken])

  // Cargar orden guardado desde localStorage
  const [modulos, setModulos] = useState(() => {
    const ordenGuardado = localStorage.getItem('modulosOrden')
    if (ordenGuardado) {
      try {
        const orden = JSON.parse(ordenGuardado)
        // Reordenar módulos según el orden guardado
        return orden.map(id => modulosIniciales.find(m => m.id === id)).filter(Boolean)
      } catch (e) {
        return modulosIniciales
      }
    }
    return modulosIniciales
  })

  // Estado para la categoría activa
  const [activeCategory, setActiveCategory] = useState('Ventas')
  // Estado para colapsar/expandir el dashboard de ventas
  const [ventasDashboardExpanded, setVentasDashboardExpanded] = useState(false)

  const [modoEdicion, setModoEdicion] = useState(false)
  const [moduloArrastrando, setModuloArrastrando] = useState(null)
  const [moduloSobre, setModuloSobre] = useState(null)

  // Guardar orden en localStorage
  const guardarOrden = (nuevoOrden) => {
    const ordenIds = nuevoOrden.map(m => m.id)
    localStorage.setItem('modulosOrden', JSON.stringify(ordenIds))
    setModulos(nuevoOrden)
  }

  // Definición de Áreas
  const areasConfig = {
    'Ventas': {
      ids: [1, 16, 3, 13] // Facturación, Notas Crédito, Clientes, Promociones
    },
    'Compras': {
      ids: [6, 26, 21] // Compras, NC Compras, Proveedores
    },
    'Tesorería': {
      ids: [10, 17, 22, 20] // Bancos, Tesorería, Cajas Chicas, Cartera
    },
    'Inventario': {
      ids: [4, 5] // Productos, Inventario
    },
    'Financiero': {
      ids: [2, 15, 25] // Contabilidad, Reportes, Activos Fijos
    },
    'Administración': {
      ids: [14, 7, 18, 19, 27] // Dashboard, Administración, RRHH, Admin TI, App Móvil
    }
  }


  // Helper para obtener módulos de un área
  const getModulosArea = (areaNombre) => {
    const config = areasConfig[areaNombre]
    if (!config) return []
    return config.ids.map(id => modulosIniciales.find(m => m.id === id)).filter(Boolean)
  }

  // Módulos que no están en ninguna área (Otros)
  const todosLosIdsEnAreas = Object.values(areasConfig).flatMap(config => config.ids)
  const modulosOtros = modulosIniciales.filter(m => !todosLosIdsEnAreas.includes(m.id))

  const handleDragStart = (e, modulo) => {
    // Deshabilitar drag and drop por ahora en la vista por áreas
    if (!modoEdicion) return
  }


  // Manejar cuando se arrastra sobre otro módulo
  const handleDragOver = (e, modulo) => {
    if (!modoEdicion || !moduloArrastrando) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setModuloSobre(modulo.id)
  }

  // Manejar cuando se sale de un módulo
  const handleDragLeave = (e) => {
    setModuloSobre(null)
  }

  // Manejar soltar
  const handleDrop = (e, moduloDestino) => {
    if (!modoEdicion || !moduloArrastrando) return
    e.preventDefault()

    if (moduloArrastrando.id === moduloDestino.id) {
      setModuloArrastrando(null)
      setModuloSobre(null)
      return
    }

    const nuevoOrden = [...modulos]
    const indiceOrigen = nuevoOrden.findIndex(m => m.id === moduloArrastrando.id)
    const indiceDestino = nuevoOrden.findIndex(m => m.id === moduloDestino.id)

    // Remover el módulo de su posición original
    nuevoOrden.splice(indiceOrigen, 1)
    // Insertar en la nueva posición
    nuevoOrden.splice(indiceDestino, 0, moduloArrastrando)

    guardarOrden(nuevoOrden)
    setModuloArrastrando(null)
    setModuloSobre(null)
  }

  // Manejar fin de arrastre
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setModuloArrastrando(null)
    setModuloSobre(null)
  }

  // Resetear orden
  const resetearOrden = () => {
    if (window.confirm('¿Desea restaurar el orden original de los módulos?')) {
      localStorage.removeItem('modulosOrden')
      setModulos(modulosIniciales)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Verificar vigencia de firma electrónica
  useEffect(() => {
    const verificarFirma = async () => {
      if (!isAuthenticated) return

      try {
        const token = getToken()
        const response = await axios.get(`${API_URL}/sri/certificado/info`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data && response.data.certificado && response.data.certificado.fechaVencimiento) {
          const hoy = new Date()
          const vencimiento = new Date(response.data.certificado.fechaVencimiento)
          const diffTime = vencimiento - hoy
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays < 15) {
            setCertificadoAlerta({
              diasRestantes: diffDays,
              vencido: diffDays <= 0,
              fechaCaducidad: response.data.certificado.fechaVencimiento
            })
            setMostrarAlertaSRI(true)
          }
        }
      } catch (error) {
        console.error('Error al verificar firma electrónica:', error)
      }
    }

    verificarFirma()
  }, [isAuthenticated, getToken])

  // Verificar si Firebase está configurado (Eliminado)

  return (
    <div className="home-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1>Panel Principal</h1>
          <p className="fecha-actual">
            {new Date().toLocaleDateString('es-EC', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <button className="btn-logout-panel" onClick={handleLogout} title="Cerrar Sesión">
          🚪 Cerrar Sesión
        </button>
      </div>

      {/* Alerta Inline */}
      {mostrarAlertaSRI && certificadoAlerta && (
        <div className={`alerta-certificado ${certificadoAlerta.diasRestantes <= 15 ? 'critico' : 'advertencia'}`}>
          <div className="alerta-icono">⚠️</div>
          <div className="alerta-contenido">
            <h3>Certificado Digital Próximo a Vencer</h3>
            <p>Su firma electrónica caduca en <strong>{certificadoAlerta.diasRestantes} días</strong> ({new Date(certificadoAlerta.fechaCaducidad).toLocaleDateString()}).</p>
            <button onClick={() => navigate('/admin')} className="btn-renovar">
              Gestionar en Admin
            </button>
          </div>
          <button className="btn-cerrar-alerta" onClick={() => setMostrarAlertaSRI(false)}>×</button>
        </div>
      )}

      {/* Layout Principal: Sidebar Izquierdo + Contenido Derecho */}
      <div className="dashboard-main-layout">

        {/* Sidebar de Categorías */}
        <div className="dashboard-sidebar">
          {Object.keys(areasConfig).map(categoria => (
            <button
              key={categoria}
              className={`sidebar-item ${activeCategory === categoria ? 'active' : ''}`}
              onClick={() => setActiveCategory(categoria)}
            >
              <div className="sidebar-icon">
                {/* Iconos simples para las categorías */}
                {categoria === 'Ventas' && '📈'}
                {categoria === 'Compras' && '🛒'}
                {categoria === 'Tesorería' && '💰'}
                {categoria === 'Inventario' && '📦'}
                {categoria === 'Financiero' && '📊'}
                {categoria === 'Administración' && '⚙️'}
              </div>
              <span>{categoria}</span>
              {categoria === 'Compras' && pendientesSRI > 0 && (
                <span className="badge-notification">{pendientesSRI}</span>
              )}
            </button>
          ))}
        </div>

        {/* Área de Contenido (Módulos) */}
        <div className="dashboard-content">
          <div className="category-header">
            <h2>{activeCategory}</h2>
            <p className="category-description">
              {activeCategory === 'Ventas' && 'Gestión de facturación, clientes y notas de crédito.'}
              {activeCategory === 'Compras' && 'Control de adquisiciones y proveedores.'}
              {activeCategory === 'Tesorería' && 'Manejo de flujo de caja, bancos y pagos.'}
              {activeCategory === 'Inventario' && 'Control de stock y productos.'}
              {activeCategory === 'Financiero' && 'Contabilidad y reportes financieros.'}
              {activeCategory === 'Administración' && 'Configuración del sistema y gestión de usuarios.'}
            </p>

          </div>

          {activeCategory === 'Ventas' && (
            <VentasDashboard />
          )}

          <div className="modules-grid-large">
            {getModulosArea(activeCategory).map(modulo => (
              <Link
                to={modulo.ruta}
                key={modulo.id}
                className="module-card-large"
              >
                <div className="module-icon-large" style={{ background: modulo.gradiente || '#3b82f6' }}>
                  {modulo.icono}
                </div>
                <div className="module-info-large">
                  <h3>{modulo.titulo}</h3>
                  <p>{modulo.descripcion}</p>
                </div>
                {modulo.id === 6 && pendientesSRI > 0 && (
                  <div className="module-badge">{pendientesSRI}</div>
                )}
              </Link>
            ))}
          </div>

          {/* Mostrar 'Otros' solo si están en la categoría activa (opcional, o moverlos a Admin) */}
          {/* Por simplicidad del requerimiento, asumimos que todos los módulos importantes están en las categorías definidas. */}
        </div>
      </div>
    </div >
  )
}

export default Home
