import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Admin.css'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import { useAuth } from '../contexts/AuthContext'
import PuntosVenta from './admin/PuntosVenta'
import AdminConfiguracion from './admin/AdminConfiguracion'
import SystemHealthWidget from '../components/SystemHealthWidget'

function Admin({ socket }) {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [estadisticas, setEstadisticas] = useState(null)
  const [actividad, setActividad] = useState([])
  const [configuracion, setConfiguracion] = useState({})
  const [backups, setBackups] = useState([])
  const [tabActiva, setTabActiva] = useState('dashboard')
  const [mostrarInfoEmpresa, setMostrarInfoEmpresa] = useState(false)

  // Estados para información de empresa
  // @refresh reset
  const [empresa, setEmpresa] = useState(null)
  const [editandoEmpresa, setEditandoEmpresa] = useState(false)
  const [formDataEmpresa, setFormDataEmpresa] = useState({
    ruc: '',
    razon_social: '',
    nombre_comercial: '',
    direccion_matriz: '',
    direccion_establecimiento: '',
    telefono: '',
    email: '',
    contribuyente_especial: '',
    obligado_contabilidad: false
  })
  const [logotipoFile, setLogotipoFile] = useState(null)
  const [logotipoPreview, setLogotipoPreview] = useState(null)
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false)
  const [errorConexion, setErrorConexion] = useState(false)
  const [cargandoEmpresa, setCargandoEmpresa] = useState(false)
  const [puntosVenta, setPuntosVenta] = useState([]) // New state
  const [reporteFechaInicio, setReporteFechaInicio] = useState('')
  const [reporteFechaFin, setReporteFechaFin] = useState('')
  const [reporteDatos, setReporteDatos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [formDataUsuario, setFormDataUsuario] = useState({
    nombre_usuario: '',
    nombre_completo: '',
    password: '',
    email: '',
    activo: 1,
    rol_id: null
  })
  const [permisosUsuario, setPermisosUsuario] = useState({})

  const [roles, setRoles] = useState([])

  // Estados para Auditoría
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')

  // Estados para SRI
  const [certificadoInfo, setCertificadoInfo] = useState(null)
  const [loadingSRI, setLoadingSRI] = useState(false)
  const [errorSRI, setErrorSRI] = useState(null)
  const [successSRI, setSuccessSRI] = useState(null)
  const [uploadFile, setUploadFile] = useState(null)
  const [password, setPassword] = useState('')
  const [ruc, setRuc] = useState('')
  const [mostrarFormularioSRI, setMostrarFormularioSRI] = useState(false)
  const [ambiente, setAmbiente] = useState('pruebas')

  // Estados para Monitoreo de Recursos
  const [recursos, setRecursos] = useState(null)
  const [loadingRecursos, setLoadingRecursos] = useState(false)

  // Estados para Monitoreo SRI
  const [sriStatus, setSriStatus] = useState(null)

  // Estados para Documentos Pendientes SRI
  const [documentosPendientes, setDocumentosPendientes] = useState([])
  const [contadorDocumentos, setContadorDocumentos] = useState(null)
  const [loadingDocumentos, setLoadingDocumentos] = useState(false)
  const [filtroTipoDoc, setFiltroTipoDoc] = useState('')

  const modulos = [
    { id: 'facturacion', nombre: 'Facturación' },
    { id: 'contabilidad', nombre: 'Contabilidad' },
    { id: 'clientes', nombre: 'Clientes' },
    { id: 'productos', nombre: 'Productos' },
    { id: 'compras', nombre: 'Compras' },
    { id: 'admin', nombre: 'Administración' },
    { id: 'auditoría', nombre: 'Auditoría / Bitácora' }
  ]

  useEffect(() => {
    cargarDatos()
    cargarEmpresa()
    if (tabActiva === 'usuarios') {
      cargarUsuarios()
      cargarRoles()
    }
    if (tabActiva === 'auditoría') {
      cargarLogs()
    }
    if (tabActiva === 'backup') {
      cargarBackups()
    }
    if (tabActiva === 'monitoreo') {
      cargarRecursos()
      const interval = setInterval(cargarRecursos, 5000) // Actualizar cada 5 segundos
      return () => clearInterval(interval)
    }
    if (tabActiva === 'sri') {
      cargarInfoCertificado()
      cargarEstadoSRI()
      const interval = setInterval(cargarEstadoSRI, 30000) // Actualizar cada 30 segundos
      return () => clearInterval(interval)
    }
    if (tabActiva === 'documentos-pendientes') {
      cargarDocumentosPendientes()
      cargarContadorDocumentos()
      const interval = setInterval(() => {
        cargarDocumentosPendientes()
        cargarContadorDocumentos()
      }, 30000) // Actualizar cada 30 segundos
      return () => clearInterval(interval)
    }
  }, [tabActiva, filtroTipoDoc])

  const cargarLogs = async () => {
    try {
      setLoadingLogs(true)
      const res = await axios.get(`${API_URL}/audit`)
      // La respuesta viene como [data, count] desde getManyAndCount
      let data = []
      if (Array.isArray(res.data)) {
        if (Array.isArray(res.data[0]) && typeof res.data[1] === 'number') {
          data = res.data[0]
        } else {
          data = res.data
        }
      }
      setLogs(data)
    } catch (error) {
      console.error('Error al cargar logs:', error)
    } finally {
      setLoadingLogs(false)
    }
  }

  const cargarRecursos = async () => {
    try {
      setLoadingRecursos(true)
      const res = await axios.get(`${API_URL}/admin/resources`)
      setRecursos(res.data)
    } catch (error) {
      console.error('Error al cargar recursos:', error)
    } finally {
      setLoadingRecursos(false)
    }
  }

  const liberarMemoria = async () => {
    if (!window.confirm('  ¿Estás seguro de liberar memoria?\n\nEsto ejecutar el recolector de basura de Node.js para liberar memoria no utilizada.')) {
      return
    }

    try {
      const res = await axios.post(`${API_URL}/admin/clear-memory`)
      if (res.data.success) {
        alert(`? ${res.data.message}\n\nAntes: ${res.data.before?.heapUsed}\nDespués: ${res.data.after?.heapUsed}`)
        cargarRecursos() // Refresh data
      } else {
        alert(`? ${res.data.message}`)
      }
    } catch (error) {
      console.error('Error liberando memoria:', error)
      alert('? Error al intentar liberar memoria')
    }
  }

  const cargarEstadoSRI = async () => {
    try {
      setLoadingSRI(true)
      const res = await axios.get(`${API_URL}/admin/sri-status`)
      setSriStatus(res.data)
    } catch (error) {
      console.error('Error al cargar estado SRI:', error)
      setSriStatus({ overall: 'offline', error: error.message })
    } finally {
      setLoadingSRI(false)
    }
  }

  const cargarDocumentosPendientes = async () => {
    try {
      setLoadingDocumentos(true)
      const params = filtroTipoDoc ? `?tipo=${filtroTipoDoc}` : ''
      const res = await axios.get(`${API_URL}/admin/documentos-pendientes${params}`)
      setDocumentosPendientes(res.data)
    } catch (error) {
      console.error('Error al cargar documentos pendientes:', error)
      setDocumentosPendientes([])
    } finally {
      setLoadingDocumentos(false)
    }
  }

  const cargarContadorDocumentos = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/contador-documentos-represados`)
      setContadorDocumentos(res.data)
    } catch (error) {
      console.error('Error al cargar contador:', error)
      setContadorDocumentos({ total: 0, facturas: 0, notasCredito: 0, anulaciones: 0, retenciones: 0 })
    }
  }

  const reintentarEnvioDocumento = async (id) => {
    if (!window.confirm('¿Deseas reintentar el envío de este documento al SRI?')) {
      return
    }

    try {
      const res = await axios.post(`${API_URL}/admin/reintentar-envio/${id}`)
      if (res.data.exito) {
        alert(`? ${res.data.mensaje}`)
        cargarDocumentosPendientes()
        cargarContadorDocumentos()
      } else {
        alert(`? ${res.data.mensaje}`)
      }
    } catch (error) {
      console.error('Error reintentando envío:', error)
      alert('? Error al intentar reenviar el documento')
    }
  }

  const procesarColaNow = async () => {
    if (!window.confirm('¿Deseas procesar toda la cola de documentos pendientes ahora?')) {
      return
    }

    try {
      const res = await axios.post(`${API_URL}/admin/procesar-cola-contingencia`)
      alert(`? Procesamiento completado:\\n\\nProcesados: ${res.data.procesados}\\nExitosos: ${res.data.exitosos}\\nFallidos: ${res.data.fallidos}`)
      cargarDocumentosPendientes()
      cargarContadorDocumentos()
    } catch (error) {
      console.error('Error procesando cola:', error)
      alert('? Error al procesar la cola')
    }
  }

  // Cargar información de la empresa
  const cargarEmpresa = async () => {
    setCargandoEmpresa(true)
    setErrorConexion(false)
    try {
      const token = await getToken()
      if (!token) {
        console.warn('No hay token de autenticación disponible')
        setCargandoEmpresa(false)
        return
      }

      const res = await axios.get(`${API_URL}/empresa/activa`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 segundos de timeout
      })

      if (res.data) {
        setEmpresa(res.data)
        setFormDataEmpresa({
          ruc: res.data.ruc || '',
          razon_social: res.data.razon_social || '',
          nombre_comercial: res.data.nombre_comercial || '',
          direccion_matriz: res.data.direccion_matriz || res.data.direccion || '',
          direccion_establecimiento: res.data.direccion_establecimiento || '',
          telefono: res.data.telefono || '',
          email: res.data.email || '',
          contribuyente_especial: res.data.contribuyente_especial || '',
          obligado_contabilidad: res.data.obligado_contabilidad || false
        })

        // Cargar preview del logotipo si existe
        if (res.data.id) {
          try {
            const logoRes = await axios.get(`${API_URL}/empresa/${res.data.id}/logotipo`, {
              headers: { Authorization: `Bearer ${token}` },
              responseType: 'blob',
              timeout: 10000
            })
            const logoUrl = URL.createObjectURL(logoRes.data)
            setLogotipoPreview(logoUrl)
          } catch (error) {
            // No hay logotipo, está bien
            setLogotipoPreview(null)
          }
        }
      }
      setErrorConexion(false)
    } catch (error) {
      console.error('Error al cargar empresa:', error)
      setErrorConexion(true)

      // Verificar si es un error de conexión
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.error('? No hay conexión con el servidor. Verifica que el backend está corriendo.')
      } else if (error.response?.status === 404) {
        // No hay empresa activa, está bien
        setErrorConexion(false)
      }
    } finally {
      setCargandoEmpresa(false)
    }
  }

  // Manejar cambio de logotipo
  const handleLogotipoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogotipoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogotipoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Consultar SRI para autocompletar datos de empresa
  const consultarSRI = async () => {
    if (!formDataEmpresa.ruc) {
      alert('Por favor ingrese un RUC válido')
      return
    }

    try {
      const token = await getToken()
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await axios.get(`${API_URL}/sri/contribuyente/${formDataEmpresa.ruc}`, { headers })
      const data = response.data

      if (data) {
        setFormDataEmpresa(prev => ({
          ...prev,
          razon_social: data.razonSocial || prev.razon_social,
          nombre_comercial: data.nombreComercial || prev.nombre_comercial,
          direccion_matriz: data.direccionMatriz || prev.direccion_matriz,
          direccion_establecimiento: data.direccionEstablecimiento || prev.direccion_establecimiento,
          obligado_contabilidad: data.obligadoContabilidad === 'SI',
          contribuyente_especial: data.contribuyenteEspecial || prev.contribuyente_especial
        }))
        alert('✅ Datos consultados correctamente del SRI')
      }
    } catch (error) {
      console.error('Error al consultar SRI:', error)
      alert('❌ No se pudo obtener información del SRI. Verifique el RUC o intente manualmente.')
    }
  }

  // Guardar información de empresa
  const guardarEmpresa = async () => {
    setGuardandoEmpresa(true)
    setErrorConexion(false)
    try {
      const token = await getToken()
      if (!token) {
        alert('Error: No se pudo obtener el token de autenticación. Por favor, inicia sesión.')
        setGuardandoEmpresa(false)
        return
      }

      let empresaExistente = empresa

      if (!empresaExistente) {
        try {
          const resActiva = await axios.get(`${API_URL}/empresa/activa`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (resActiva.data) {
            empresaExistente = resActiva.data
          }
        } catch (error) {
          // Si no hay empresa activa, continuar con creación
        }
      }

      if (empresaExistente) {
        // Filtrar valores undefined o null antes de enviar
        const datosActualizacion = Object.fromEntries(
          Object.entries(formDataEmpresa).filter(([, value]) => value !== undefined && value !== null && value !== '')
        )

        const resActualizada = await axios.patch(`${API_URL}/empresa/${empresaExistente.id}`, datosActualizacion, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (resActualizada.data) {
          setEmpresa(resActualizada.data)
          setFormDataEmpresa({
            ruc: resActualizada.data.ruc || '',
            razon_social: resActualizada.data.razon_social || '',
            nombre_comercial: resActualizada.data.nombre_comercial || '',
            direccion_matriz: resActualizada.data.direccion_matriz || resActualizada.data.direccion || '',
            direccion_establecimiento: resActualizada.data.direccion_establecimiento || '',
            telefono: resActualizada.data.telefono || '',
            email: resActualizada.data.email || '',
            contribuyente_especial: resActualizada.data.contribuyente_especial || '',
            obligado_contabilidad: resActualizada.data.obligado_contabilidad || false
          })
        }

        if (logotipoFile) {
          const formData = new FormData()
          formData.append('logotipo', logotipoFile)
          await axios.post(`${API_URL}/empresa/${empresaExistente.id}/logotipo`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          })
          // Recargar preview del logotipo
          const logoRes = await axios.get(`${API_URL}/empresa/${empresaExistente.id}/logotipo`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          })
          const logoUrl = URL.createObjectURL(logoRes.data)
          setLogotipoPreview(logoUrl)
        }

        alert('? Información de la empresa actualizada exitosamente')
      } else {
        const res = await axios.post(`${API_URL}/empresa`, {
          ...formDataEmpresa,
          activa: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (logotipoFile && res.data.id) {
          const formData = new FormData()
          formData.append('logotipo', logotipoFile)
          await axios.post(`${API_URL}/empresa/${res.data.id}/logotipo`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          })
        }

        alert('? Información de la empresa guardada exitosamente')
        await cargarEmpresa()
      }

      setEditandoEmpresa(false)
      setLogotipoFile(null)
      setErrorConexion(false)
    } catch (error) {
      console.error('Error al guardar empresa:', error)
      setErrorConexion(true)

      let mensajeError = 'Error al guardar empresa'
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        mensajeError = '? No hay conexión con el servidor. Verifica que el backend está corriendo.'
      } else if (error.response?.status === 401) {
        mensajeError = 'Error de autenticación. Por favor, inicia sesión nuevamente.'
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message
      } else {
        mensajeError = error.message || mensajeError
      }

      alert(mensajeError)
    } finally {
      setGuardandoEmpresa(false)
    }
  }

  // Backups Logic
  const cargarPuntosVenta = async () => {
    try {
      const res = await axios.get(`${API_URL}/puntos-venta`)
      setPuntosVenta(res.data)
    } catch (error) {
      console.error('Error cargando puntos venta:', error)
    }
  }

  const cargarBackups = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/backups`)
      setBackups(res.data)
    } catch (error) {
      console.error('Error cargando backups:', error)
    }
  }

  const crearBackup = async () => {
    try {
      if (!window.confirm('¿Estás seguro de generar un nuevo respaldo manual?')) return

      const token = await getToken()
      const res = await axios.post(`${API_URL}/admin/backup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        alert('✅ Respaldo creado exitosamente: ' + res.data.archivo)
        cargarBackups()
      } else {
        alert('❌ Error: ' + res.data.message)
      }
    } catch (error) {
      console.error('Error creando backup:', error)
      alert('❌ Error en la solicitud de respaldo')
    }
  }

  const restaurarBackup = async (archivo) => {
    if (!window.confirm(`⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nEstás a punto de restaurar la base de datos desde "${archivo}".\n\nESTO SOBREESCRIBIRÁ TODOS LOS DATOS ACTUALES.\n\n¿Estás absolutamente seguro de continuar?`)) return

    try {
      const token = await getToken()
      const res = await axios.post(`${API_URL}/admin/restaurar`, { archivo }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        alert('✅ Restauración completada: ' + res.data.message)
      } else {
        alert('❌ Error: ' + res.data.message)
      }
    } catch (error) {
      console.error('Error restaurando backup:', error)
      alert('❌ Error al intentar restaurar')
    }
  }

  // Cancelar edición
  const cancelarEdicionEmpresa = () => {
    if (empresa) {
      setFormDataEmpresa({
        ruc: empresa.ruc || '',
        razon_social: empresa.razon_social || '',
        direccion: empresa.direccion || ''
      })
    }
    setEditandoEmpresa(false)
    setLogotipoFile(null)
    // Recargar el preview del logotipo original si existe
    if (empresa?.id) {
      getToken().then(token => {
        if (token) {
          axios.get(`${API_URL}/empresa/${empresa.id}/logotipo`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }).then(logoRes => {
            const logoUrl = URL.createObjectURL(logoRes.data)
            setLogotipoPreview(logoUrl)
          }).catch(() => {
            setLogotipoPreview(null)
          })
        }
      })
    } else {
      setLogotipoPreview(null)
    }
  }

  const cargarDatos = async () => {
    await Promise.all([
      cargarEstadisticas(),
      cargarActividad(),
      cargarConfiguracion(),
      cargarBackups(),
      cargarPuntosVenta()
    ])
  }

  const cargarEstadisticas = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/estadisticas`)
      setEstadisticas(res.data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const cargarActividad = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/actividad`)
      setActividad(res.data)
    } catch (error) {
      console.error('Error al cargar actividad:', error)
    }
  }

  const cargarConfiguracion = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/configuracion`)
      const configObj = {}
      res.data.forEach(item => {
        configObj[item.clave] = item
      })
      setConfiguracion(configObj)
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    }
  }



  const guardarConfiguracion = async () => {
    try {
      await axios.put(`${API_URL}/admin/configuracion`, configuracion)
      alert('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      alert('Error al guardar configuración')
    }
  }



  const limpiarDatos = async (tipo, dias) => {
    if (!window.confirm(`Está seguro de eliminar ${tipo} anteriores a ${dias} das?`)) {
      return
    }

    try {
      const res = await axios.post(`${API_URL}/admin/limpiar`, { tipo, dias })
      alert(`${res.data.registros_eliminados} registros eliminados`)
      cargarEstadisticas()
    } catch (error) {
      console.error('Error al limpiar datos:', error)
      alert('Error al limpiar datos')
    }
  }

  const generarReporte = async (tipo) => {
    try {
      const res = await axios.get(`${API_URL}/admin/reportes`, {
        params: {
          tipo,
          fecha_inicio: reporteFechaInicio || '2020-01-01',
          fecha_fin: reporteFechaFin || new Date().toISOString().split('T')[0]
        }
      })
      setReporteDatos(res.data)
    } catch (error) {
      console.error('Error al generar reporte:', error)
      alert('Error al generar reporte')
    }
  }

  const cargarUsuarios = async () => {
    try {
      console.log('Cargando usuarios desde:', `${API_URL}/usuarios`)
      const res = await axios.get(`${API_URL}/usuarios`)
      console.log('Usuarios recibidos:', res.data)
      if (Array.isArray(res.data)) {
        setUsuarios(res.data)
      } else {
        console.warn('La respuesta no es un array:', res.data)
        setUsuarios([])
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      })

      let mensajeError = 'Error al cargar usuarios'
      if (error.response?.status === 404) {
        mensajeError = 'Endpoint de usuarios no encontrado. Verifica que el backend está corriendo.'
      } else if (error.response?.status === 500) {
        mensajeError = 'Error en el servidor. Revisa la consola del backend.'
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        mensajeError = 'No se puede conectar al servidor. Verifica que el backend está corriendo en http://localhost:3001'
      }

      alert(mensajeError)
      setUsuarios([])
    }
  }

  const cargarRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios/roles`)
      console.log('Roles cargados:', res.data)
      if (res.data && res.data.length > 0) {
        setRoles(res.data)
      } else {
        console.warn('No se encontraron roles. Los roles se crearán automáticamente al iniciar el servidor.')
        setRoles([])
      }
    } catch (error) {
      console.error('Error al cargar roles:', error)
      console.error('Detalles del error:', error.response?.data || error.message)
      // Mostrar mensaje ms informativo
      if (error.response?.status === 404) {
        console.warn('Endpoint de roles no encontrado. Verifica que el backend está corriendo.')
      }
      setRoles([])
    }
  }

  const cargarPermisosUsuario = async (usuarioId) => {
    try {
      const res = await axios.get(`${API_URL}/usuarios/${usuarioId}/permisos`)
      const permisosObj = {}
      res.data.forEach(permiso => {
        permisosObj[permiso.modulo] = permiso.tiene_acceso === 1
      })
      setPermisosUsuario(permisosObj)
    } catch (error) {
      console.error('Error al cargar permisos:', error)
    }
  }

  const abrirFormularioUsuario = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario)
      setFormDataUsuario({
        nombre_usuario: usuario.nombre_usuario,
        nombre_completo: usuario.nombre_completo,
        password: '',
        email: usuario.email || '',
        activo: usuario.activo,
        rol_id: usuario.rol_id || null
      })
      cargarPermisosUsuario(usuario.id)
    } else {
      setUsuarioEditando(null)
      setFormDataUsuario({
        nombre_usuario: '',
        nombre_completo: '',
        password: '',
        email: '',
        activo: 1,
        rol_id: null
      })
      setPermisosUsuario({})
    }
    setMostrarFormularioUsuario(true)
  }

  const cerrarFormularioUsuario = () => {
    setMostrarFormularioUsuario(false)
    setUsuarioEditando(null)
    setFormDataUsuario({
      nombre_usuario: '',
      nombre_completo: '',
      password: '',
      email: '',
      activo: 1,
      rol_id: null
    })
    setPermisosUsuario({})
  }

  const guardarUsuario = async (e) => {
    e.preventDefault()
    try {
      const permisosArray = modulos.map(modulo => ({
        modulo: modulo.id,
        tiene_acceso: permisosUsuario[modulo.id] || false
      }))

      if (usuarioEditando) {
        // Actualizar usuario
        const datosActualizacion = {
          nombre_usuario: formDataUsuario.nombre_usuario,
          nombre_completo: formDataUsuario.nombre_completo,
          email: formDataUsuario.email,
          activo: formDataUsuario.activo,
          rol_id: formDataUsuario.rol_id ? parseInt(formDataUsuario.rol_id) : null
        }

        if (formDataUsuario.password) {
          datosActualizacion.password = formDataUsuario.password
        }

        await axios.put(`${API_URL}/usuarios/${usuarioEditando.id}`, datosActualizacion)
        await axios.put(`${API_URL}/usuarios/${usuarioEditando.id}/permisos`, { permisos: permisosArray })
        alert('Usuario actualizado exitosamente')
      } else {
        // Crear nuevo usuario
        if (!formDataUsuario.password) {
          alert('La contraseña es requerida para nuevos usuarios')
          return
        }
        const res = await axios.post(`${API_URL}/usuarios`, formDataUsuario)
        await axios.put(`${API_URL}/usuarios/${res.data.id}/permisos`, { permisos: permisosArray })
        alert('Usuario creado exitosamente')
      }
      cerrarFormularioUsuario()
      cargarUsuarios()
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      const errorMessage = error.response?.data?.message
        ? (Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message)
        : (error.response?.data?.error || 'Error al guardar usuario');
      alert(errorMessage)
    }
  }

  const eliminarUsuario = async (usuarioId) => {
    if (!window.confirm('Está seguro de eliminar este usuario?')) {
      return
    }

    try {
      const res = await axios.delete(`${API_URL}/usuarios/${usuarioId}`)
      alert(res.data.message || 'Usuario eliminado exitosamente')
      cargarUsuarios()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      alert(error.response?.data?.error || 'Error al eliminar usuario')
    }
  }

  // Funciones para SRI
  const cargarInfoCertificado = async () => {
    try {
      setLoadingSRI(true)
      setErrorSRI(null)
      const token = await getToken()
      const response = await axios.get(`${API_URL}/sri/certificado/info`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCertificadoInfo(response.data.certificado)
      setMostrarFormularioSRI(false)
    } catch (error) {
      if (error.response?.status === 404) {
        setCertificadoInfo(null)
        setMostrarFormularioSRI(true)
      } else {
        setErrorSRI(error.response?.data?.message || 'Error al cargar información del certificado')
      }
    } finally {
      setLoadingSRI(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.endsWith('.p12')) {
        setErrorSRI('El archivo debe ser un certificado .p12')
        return
      }
      setUploadFile(file)
      setErrorSRI(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!uploadFile) {
      setErrorSRI('Por favor selecciona un archivo .p12')
      return
    }

    if (!password) {
      setErrorSRI('Por favor ingresa la contraseña del certificado')
      return
    }

    if (!ruc || ruc.length !== 13) {
      setErrorSRI('Por favor ingresa un RUC válido (13 dígitos)')
      return
    }

    try {
      setLoadingSRI(true)
      setErrorSRI(null)
      setSuccessSRI(null)

      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('password', password)
      formData.append('ruc', ruc)

      await axios.post(`${API_URL}/sri/certificado/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccessSRI('Certificado cargado exitosamente')
      setPassword('')
      setRuc('')
      setUploadFile(null)

      await cargarInfoCertificado()

      const fileInput = document.getElementById('certificado-file')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      setErrorSRI(error.response?.data?.message || 'Error al cargar el certificado')
    } finally {
      setLoadingSRI(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const diasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) return 0
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diffTime = vencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPermisosPorRol = (nombreRol) => {
    const permisosPorRol = {
      admin: ['facturacion', 'contabilidad', 'clientes', 'productos', 'compras', 'admin', 'reportes'],
      'gestor de sistema': ['facturacion', 'contabilidad', 'clientes', 'productos', 'compras', 'admin', 'reportes'],
      gerente: ['facturacion', 'contabilidad', 'clientes', 'productos', 'compras', 'reportes'],
      vendedor: ['facturacion', 'clientes', 'productos'],
      contador: ['contabilidad', 'facturacion', 'reportes']
    }
    return permisosPorRol[nombreRol.toLowerCase()] || []
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>Administración</h3>
        </div>
        <div className="admin-sidebar-menu">
          <button
            className={`admin-menu-item ${tabActiva === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('dashboard')
              setMostrarInfoEmpresa(false)
              setEditandoEmpresa(false)
            }}
          >
            <span>📊</span> Resumen
          </button>
          <div style={{ margin: '15px 0 5px 0', fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', paddingLeft: '10px', letterSpacing: '0.5px' }}>PERFIL DE EMPRESA</div>
          <button
            className={`admin-menu-item ${tabActiva === 'configuracion' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('configuracion')
              setMostrarInfoEmpresa(true)
            }}
          >
            <span>🏢</span> Datos Legales & Logo
          </button>
          <button
            className={`admin-menu-item ${tabActiva === 'advanced-config' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('advanced-config')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>🛠️</span> Configuración Avanzada
          </button>
          <button
            className={`admin-menu-item ${tabActiva === 'puntos-venta' ? 'active' : ''}`}
            onClick={() => {
              navigate('/admin/puntos-venta')
            }}
          >
            <span>🏢</span> Puntos de Venta y Bodegas
          </button>
          <div style={{ margin: '15px 0 5px 0', fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', paddingLeft: '10px', letterSpacing: '0.5px' }}>USUARIOS Y SEGURIDAD</div>
          <button
            className={`admin-menu-item ${tabActiva === 'usuarios' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('usuarios')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>👥</span> Gestión de Usuarios
          </button>
          <div style={{ margin: '15px 0 5px 0', fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', paddingLeft: '10px', letterSpacing: '0.5px' }}>PARÁMETROS SRI</div>
          <button
            className={`admin-menu-item ${tabActiva === 'sri' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('sri')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>⚙️</span> Configuración SRI
          </button>
          <button
            className={`admin-menu-item ${tabActiva === 'documentos-pendientes' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('documentos-pendientes')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>📄</span> Documentos Pendientes SRI
          </button>
          <div style={{ margin: '15px 0 5px 0', fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', paddingLeft: '10px', letterSpacing: '0.5px' }}>LOGS DE AUDITORÍA</div>
          <button
            className={`admin-menu-item ${tabActiva === 'auditoría' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('auditoría')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>📜</span> Historial de Cambios
          </button>
          <div style={{ margin: '15px 0 5px 0', fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', paddingLeft: '10px', letterSpacing: '0.5px' }}>HERRAMIENTAS</div>
          <button
            className={`admin-menu-item ${tabActiva === 'backup' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('backup')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>💾</span> Backups
          </button>
          <button
            className={`admin-menu-item ${tabActiva === 'mantenimiento' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('mantenimiento')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>🔧</span> Mantenimiento
          </button>
          <button
            className={`admin-menu-item ${tabActiva === 'reportes' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('reportes')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>📈</span> Reportes de Sistema
          </button>
          <button
            className={`admin-menu-item ${tabActiva === 'monitoreo' ? 'active' : ''}`}
            onClick={() => {
              setTabActiva('monitoreo')
              setMostrarInfoEmpresa(false)
            }}
          >
            <span>🖥️</span> Monitoreo de Recursos
          </button>
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button
              className="admin-menu-item"
              style={{ color: '#ef4444' }}
              onClick={() => navigate('/')}
            >
              <span>⬅️</span> Volver al Inicio
            </button>
          </div>
        </div >
      </div >

      <div className="admin-content-area">

        {/* Sección de Información de la Empresa - Visible solo cuando está en configuración y activada */}
        {tabActiva === 'configuracion' && mostrarInfoEmpresa && (
          <div className="empresa-info-section">
            <div className="empresa-info-header">
              <h2>  Información de la Empresa</h2>
              {!editandoEmpresa ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {cargandoEmpresa && <span style={{ color: '#6b7280', fontSize: '14px' }}>Cargando...</span>}
                  <button
                    className="btn-editar-empresa"
                    onClick={() => setEditandoEmpresa(true)}
                    disabled={cargandoEmpresa}
                    style={{ backgroundColor: '#f97316' }}
                  >
                    <span>📝</span> Editar / Importar SRI
                  </button>
                </div>
              ) : (
                <div className="empresa-actions">
                  <button
                    className="btn-cancelar-empresa"
                    onClick={cancelarEdicionEmpresa}
                    disabled={guardandoEmpresa}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-guardar-empresa"
                    onClick={guardarEmpresa}
                    disabled={guardandoEmpresa}
                  >
                    {guardandoEmpresa ? 'Guardando...' : '💾 Guardar'}
                  </button>
                </div>
              )}
            </div>

            {errorConexion && (
              <div className="alert-error" style={{ marginBottom: '20px', padding: '15px', borderRadius: '8px' }}>
                <strong>  Error de Conexión:</strong> No se pudo conectar con el servidor.
                <br />
                <small>Verifica que el backend está corriendo en: <code>{API_URL}</code></small>
                <br />
                <button
                  onClick={cargarEmpresa}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <span>🔄</span> Reintentar
                </button>
              </div>
            )}

            <div className="empresa-info-content" style={{ border: '1px solid #e5e7eb', padding: '20px', minHeight: '300px' }}>
              {console.log('INTENTANDO RENDERIZAR CAMPOS. Editando:', editandoEmpresa, 'Data:', formDataEmpresa)}
              {!editandoEmpresa && (
                <div style={{ background: '#fff7ed', color: '#c2410c', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #fdba74', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>👈</span>
                  <strong>Para importar datos del SRI, haga clic en el botón naranja "Editar / Importar SRI" arriba a la derecha.</strong>
                </div>
              )}
              <div className="empresa-info-grid">
                <div className="empresa-field">
                  <label>RUC *</label>
                  {editandoEmpresa ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formDataEmpresa.ruc || ''}
                        onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, ruc: e.target.value })}
                        placeholder="Ingrese el RUC"
                        style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%', flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={consultarSRI}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0 15px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Consultar datos en SRI"
                      >
                        <span>🔍</span> Consultar SRI
                      </button>
                    </div>
                  ) : (
                    <div className="empresa-value">{empresa?.ruc || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Razón Social *</label>
                  {editandoEmpresa ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formDataEmpresa.razon_social || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, razon_social: e.target.value })}
                      placeholder="Ingrese la razón social"
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.razon_social || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Nombre Comercial</label>
                  {editandoEmpresa ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formDataEmpresa.nombre_comercial || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, nombre_comercial: e.target.value.toUpperCase() })}
                      placeholder="Ingrese el nombre comercial"
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.nombre_comercial || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Dirección Matriz *</label>
                  {editandoEmpresa ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formDataEmpresa.direccion_matriz || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, direccion_matriz: e.target.value.toUpperCase() })}
                      placeholder="Ingrese la dirección matriz"
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.direccion_matriz || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Dirección Establecimiento</label>
                  {editandoEmpresa ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formDataEmpresa.direccion_establecimiento || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, direccion_establecimiento: e.target.value.toUpperCase() })}
                      placeholder="Ingrese la dirección del establecimiento"
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.direccion_establecimiento || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Teléfono</label>
                  {editandoEmpresa ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formDataEmpresa.telefono || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, telefono: e.target.value })}
                      placeholder="Ingrese el teléfono"
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.telefono || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Email</label>
                  {editandoEmpresa ? (
                    <input
                      type="email"
                      className="form-control"
                      value={formDataEmpresa.email || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, email: e.target.value.toLowerCase() })}
                      placeholder="Ingrese el email"
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.email || 'No especificado'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Contribuyente Especial</label>
                  {editandoEmpresa ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formDataEmpresa.contribuyente_especial || ''}
                      onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, contribuyente_especial: e.target.value })}
                      placeholder="Resolución No."
                      style={{ border: '1px solid #ccc', padding: '8px', display: 'block', width: '100%' }}
                    />
                  ) : (
                    <div className="empresa-value">{empresa?.contribuyente_especial || 'No'}</div>
                  )}
                </div>

                <div className="empresa-field">
                  <label>Obligado a Contabilidad</label>
                  {editandoEmpresa ? (
                    <div style={{ padding: '10px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formDataEmpresa.obligado_contabilidad === true}
                          onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, obligado_contabilidad: e.target.checked })}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <span>{formDataEmpresa.obligado_contabilidad ? 'SI' : 'NO'}</span>
                      </label>
                    </div>
                  ) : (
                    <div className="empresa-value">{empresa?.obligado_contabilidad ? 'SI' : 'NO'}</div>
                  )}
                </div>

                <div className="empresa-field empresa-logo-field">
                  <label>Logotipo</label>
                  {editandoEmpresa ? (
                    <div className="logo-upload-container">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogotipoChange}
                        id="logotipo-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logotipo-input" className="btn-subir-logo">
                        {logotipoFile ? 'Cambiar Logo' : 'Subir Logo'}
                      </label>
                      {logotipoPreview && (
                        <div className="logo-preview">
                          <img src={logotipoPreview} alt="Preview del logotipo" style={{ maxWidth: '200px' }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="logo-display">
                      {logotipoPreview ? (
                        <img src={logotipoPreview} alt="Logotipo de la empresa" style={{ maxWidth: '200px' }} />
                      ) : (
                        <div className="logo-placeholder">No hay logotipo cargado</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



        {tabActiva === 'dashboard' && (
          <div className="admin-content">
            <SystemHealthWidget />
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>Facturas</h3>
                  <p className="stat-number">{estadisticas?.facturas || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>Compras</h3>
                  <p className="stat-number">{estadisticas?.compras || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Clientes</h3>
                  <p className="stat-number">{estadisticas?.clientes || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🤝</div>
                <div className="stat-info">
                  <h3>Proveedores</h3>
                  <p className="stat-number">{estadisticas?.proveedores || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>Productos</h3>
                  <p className="stat-number">{estadisticas?.productos || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Ventas del Mes</h3>
                  <p className="stat-number">${parseFloat(estadisticas?.ventas_mes || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧾</div>
                <div className="stat-info">
                  <h3>Compras del Mes</h3>
                  <p className="stat-number">${parseFloat(estadisticas?.compras_mes || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>Utilidad del Mes</h3>
                  <p className={`stat-number ${(estadisticas?.utilidad_mes || 0) >= 0 ? 'positive' : 'negative'}`}>
                    ${parseFloat(estadisticas?.utilidad_mes || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>Stock Total</h3>
                  <p className="stat-number">{estadisticas?.stock_total || 0}</p>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>Stock Bajo</h3>
                  <p className="stat-number">{estadisticas?.productos_stock_bajo || 0}</p>
                </div>
              </div>
            </div>

            <div className="actividad-reciente">
              <h2>Actividad Reciente</h2>
              <table className="tabla-actividad">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Referencia</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {actividad.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        No hay actividad reciente
                      </td>
                    </tr>
                  ) : (
                    actividad.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <span className={`badge-tipo ${item.tipo}`}>
                            {item.tipo === 'factura' ? '📄' : '🛒'} {item.tipo}
                          </span>
                        </td>
                        <td>{item.referencia}</td>
                        <td>{new Date(item.fecha_actividad).toLocaleDateString()}</td>
                        <td>${parseFloat(item.monto).toFixed(2)}</td>
                        <td>{item.descripcion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabActiva === 'advanced-config' && (
          <div className="admin-content">
            <AdminConfiguracion
              configuracion={configuracion}
              puntosVenta={puntosVenta}
              onSave={async (newConfig) => {
                // Adaptar el formato si es necesario, AdminConfiguracion devuelve objeto completo
                // AdminService espera objeto tb.
                try {
                  await axios.put(`${API_URL}/admin/configuracion`, newConfig)
                  alert('Configuración guardada exitosamente')
                  cargarConfiguracion() // Recargar para asegurar sincro
                } catch (error) {
                  console.error('Error al guardar:', error)
                  alert('Error al guardar configuración')
                }
              }}
              loading={false} // Se puede mejorar gestionando estado de carga aquí
            />
          </div>
        )}

        {tabActiva === 'backup' && (
          <div className="admin-content">
            <h2>Gestión de Backups</h2>
            <div className="backup-section">
              <div className="backup-status-card">
                {backups.length > 0 && backups[0].estado === 'SUCCESS' ? (
                  <div className="status-success">
                    <h3>✅ Último Respaldo Exitoso</h3>
                    <p>{new Date(backups[0].fecha_creacion).toLocaleString()}</p>
                    <p>{(backups[0].tamano / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : backups.length > 0 && backups[0].estado === 'ERROR' ? (
                  <div className="status-error">
                    <h3>❌ Falló el último respaldo</h3>
                    <p>{new Date(backups[0].fecha_creacion).toLocaleString()}</p>
                    <p className="error-msg">{backups[0].mensaje_error}</p>
                    <button className="btn-retry" onClick={crearBackup}>🔄 Reintentar Ahora</button>
                  </div>
                ) : (
                  <div className="status-neutral">
                    <h3>❓ Estado desconocido</h3>
                    <p>No hay registros recientes</p>
                  </div>
                )}
              </div>

              <div className="backup-actions">
                <button className="btn-crear-backup" onClick={crearBackup}>
                  Crear Backup Manual
                </button>
              </div>

              <div className="backups-list">
                <h3>Historial de Respaldos</h3>
                {backups.length === 0 ? (
                  <p>No hay backups disponibles</p>
                ) : (
                  <table className="tabla-backups">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Archivo</th>
                        <th>Tamaño</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup, index) => (
                        <tr key={index}>
                          <td>{new Date(backup.fecha_creacion).toLocaleString()}</td>
                          <td>{backup.archivo || '-'}</td>
                          <td>{backup.tamano ? (backup.tamano / 1024).toFixed(2) + ' KB' : '-'}</td>
                          <td>
                            <span className={`status-badge ${backup.estado?.toLowerCase()}`}>
                              {backup.estado}
                            </span>
                          </td>
                          <td>
                            {backup.estado === 'SUCCESS' && (
                              <button
                                className="btn-restaurar"
                                onClick={() => restaurarBackup(backup.archivo)}
                              >
                                Restaurar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'reportes' && (
          <div className="admin-content">
            <h2>Reportes del Sistema</h2>
            <div className="reportes-section">
              <div className="filtros-reporte">
                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    value={reporteFechaInicio}
                    onChange={(e) => setReporteFechaInicio(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={reporteFechaFin}
                    onChange={(e) => setReporteFechaFin(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>&nbsp;</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-generar-reporte" onClick={() => generarReporte('ventas')}>
                      Reporte de Ventas
                    </button>
                    <button className="btn-generar-reporte" onClick={() => generarReporte('compras')}>
                      Reporte de Compras
                    </button>
                  </div>
                </div>
              </div>

              {reporteDatos.length > 0 && (
                <div className="reporte-resultado">
                  <table className="tabla-reporte">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteDatos.map((item, index) => (
                        <tr key={index}>
                          <td>{new Date(item.fecha).toLocaleDateString()}</td>
                          <td>{item.cantidad}</td>
                          <td>${parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tabActiva === 'mantenimiento' && (
          <div className="admin-content">
            <h2>Mantenimiento del Sistema</h2>
            <div className="mantenimiento-section">
              <div className="mantenimiento-card">
                <h3>Limpiar Datos Antiguos</h3>
                <p>Eliminar registros antiguos para optimizar el sistema</p>
                <div className="limpiar-opciones">
                  <div className="limpiar-item">
                    <label>Facturas Canceladas</label>
                    <input type="number" id="dias-facturas" placeholder="Días" defaultValue="365" />
                    <button
                      className="btn-limpiar"
                      onClick={() => {
                        const dias = document.getElementById('dias-facturas').value
                        limpiarDatos('facturas', parseInt(dias))
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="limpiar-item">
                    <label>Compras Antiguas</label>
                    <input type="number" id="dias-compras" placeholder="Días" defaultValue="365" />
                    <button
                      className="btn-limpiar"
                      onClick={() => {
                        const dias = document.getElementById('dias-compras').value
                        limpiarDatos('compras', parseInt(dias))
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="limpiar-item">
                    <label>Movimientos de Inventario</label>
                    <input type="number" id="dias-movimientos" placeholder="Días" defaultValue="180" />
                    <button
                      className="btn-limpiar"
                      onClick={() => {
                        const dias = document.getElementById('dias-movimientos').value
                        limpiarDatos('movimientos', parseInt(dias))
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              <div className="mantenimiento-card">
                <h3>Información del Sistema</h3>
                <div className="info-sistema">
                  <p><strong>Versión:</strong> 1.0.0</p>
                  <p><strong>Base de Datos:</strong> PostgreSQL</p>
                  <p><strong>Última Actualización:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'usuarios' && (
          <div className="admin-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Gestión de Usuarios</h2>
              <button className="btn-crear-usuario" onClick={() => abrirFormularioUsuario()}>
                + Nuevo Usuario
              </button>
            </div>

            <div className="usuarios-list">
              {usuarios.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ marginBottom: '10px' }}>No hay usuarios registrados</p>
                  <small style={{ color: '#6b7280' }}>
                    Los usuarios de prueba se crearán automáticamente al reiniciar el servidor backend.
                    <br />
                    Verifica la consola del backend para ver los mensajes de creación.
                  </small>
                </div>
              ) : (
                <table className="tabla-usuarios">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre Completo</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.nombre_usuario}</td>
                        <td>{usuario.nombre_completo}</td>
                        <td>{usuario.email || '-'}</td>
                        <td>
                          <span className="badge-rol">
                            {usuario.rol ? usuario.rol.nombre : 'Sin rol'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-estado ${usuario.activo ? 'activo' : 'inactivo'}`}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-editar"
                            onClick={() => abrirFormularioUsuario(usuario)}
                          >
                            Editar
                          </button>
                          {usuario.nombre_usuario !== 'admin' && (
                            <button
                              className="btn-eliminar"
                              onClick={() => eliminarUsuario(usuario.id)}
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Pestaña de Auditoría */}
        {tabActiva === 'auditoría' && (
          <div className="configuracion-section">
            <h2>  Bitácora de Auditoría (Audit Trail)</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Registro detallado de todas las actividades críticas y cambios en el sistema.
            </p>

            <div className="mantenimiento-card">
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla-reporte" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Módulo</th>
                      <th>Acción</th>
                      <th>Detalles (Cambios)</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLogs ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Cargando bitcora...</td></tr>
                    ) : logs.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay registros de actividad aun.</td></tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                          <td>
                            <strong>{log.usuario_nombre || 'Sistema'}</strong>
                            {log.usuario && <div style={{ fontSize: '10px', color: '#6b7280' }}>{log.usuario.email}</div>}
                          </td>
                          <td><span className="badge-rol" style={{ background: '#e0e7ff', color: '#4338ca' }}>{log.modulo}</span></td>
                          <td>
                            <strong style={{ color: log.accion.includes('DELETE') ? '#ef4444' : '#374151' }}>
                              {log.accion}
                            </strong>
                          </td>
                          <td>
                            {log.valor_anterior && (
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Haber:</span>
                                <code style={{ background: '#fee2e2', padding: '2px 4px', borderRadius: '4px', fontSize: '10px', marginLeft: '5px' }}>
                                  {log.valor_anterior.length > 50 ? log.valor_anterior.substring(0, 50) + '...' : log.valor_anterior}
                                </code>
                              </div>
                            )}
                            {log.valor_nuevo && (
                              <div>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>Debe:</span>
                                <code style={{ background: '#d1fae5', padding: '2px 4px', borderRadius: '4px', fontSize: '10px', marginLeft: '5px' }}>
                                  {(typeof log.valor_nuevo === 'object' ? JSON.stringify(log.valor_nuevo) : String(log.valor_nuevo)).substring(0, 50) + '...'}
                                </code>
                              </div>
                            )}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.ip_address}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {mostrarFormularioUsuario && (
          <div className="modal-overlay" onClick={cerrarFormularioUsuario}>
            <div className="modal-content modal-usuario" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <button className="btn-cerrar-modal" onClick={cerrarFormularioUsuario}></button>
              </div>
              <form onSubmit={guardarUsuario}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre de Usuario *</label>
                    <input
                      type="text"
                      value={formDataUsuario.nombre_usuario}
                      onChange={(e) => setFormDataUsuario({ ...formDataUsuario, nombre_usuario: e.target.value })}
                      required
                      disabled={usuarioEditando?.nombre_usuario === 'admin'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      value={formDataUsuario.nombre_completo}
                      onChange={(e) => setFormDataUsuario({ ...formDataUsuario, nombre_completo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contraseña {usuarioEditando ? '(dejar vaco para no cambiar)' : '*'}</label>
                    <input
                      type="password"
                      value={formDataUsuario.password}
                      onChange={(e) => setFormDataUsuario({ ...formDataUsuario, password: e.target.value })}
                      required={!usuarioEditando}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formDataUsuario.email}
                      onChange={(e) => setFormDataUsuario({ ...formDataUsuario, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol</label>
                    <select
                      value={formDataUsuario.rol_id || ''}
                      onChange={(e) => {
                        const rolId = e.target.value ? parseInt(e.target.value) : null
                        setFormDataUsuario({ ...formDataUsuario, rol_id: rolId })
                        // Si se selecciona un rol, aplicar permisos automáticamente
                        if (rolId) {
                          const rolSeleccionado = roles.find(r => r.id === rolId)
                          if (rolSeleccionado) {
                            const permisosPorRol = getPermisosPorRol(rolSeleccionado.nombre)
                            const nuevosPermisos = {}
                            permisosPorRol.forEach(modulo => {
                              nuevosPermisos[modulo] = true
                            })
                            setPermisosUsuario(nuevosPermisos)
                          }
                        }
                      }}
                    >
                      <option value="">Sin rol</option>
                      {roles.length === 0 ? (
                        <option value="" disabled>Cargando roles...</option>
                      ) : (
                        roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre} {rol.descripcion ? `- ${rol.descripcion.substring(0, 50)}...` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    {roles.length === 0 && (
                      <small style={{ color: '#f59e0b', display: 'block', marginTop: '5px' }}>
                        No hay roles disponibles. Los roles se crearán automáticamente al reiniciar el servidor.
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={formDataUsuario.activo}
                      onChange={(e) => setFormDataUsuario({ ...formDataUsuario, activo: parseInt(e.target.value) })}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="permisos-section">
                  <h3>Permisos por Módulo</h3>
                  <div className="permisos-grid">
                    {modulos.map((modulo) => (
                      <div key={modulo.id} className="permiso-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={permisosUsuario[modulo.id] || false}
                            onChange={(e) => {
                              setPermisosUsuario({
                                ...permisosUsuario,
                                [modulo.id]: e.target.checked
                              })
                            }}
                          />
                          <span>{modulo.nombre}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={cerrarFormularioUsuario} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tabActiva === 'sri' && (
          <div className="admin-content">
            <div className="sri-header-section">
              <h2>  Configuración SRI - Facturación Electrónica</h2>
              <p>Gestiona tu certificado de firma electrónica para facturar</p>
            </div>

            {errorSRI && (
              <div className="alert alert-error">
                <strong>Error:</strong> {errorSRI}
              </div>
            )}

            {successSRI && (
              <div className="alert alert-success">
                <strong>Éxito:</strong> {successSRI}
              </div>
            )}

            {/* SRI Status Monitor Widget */}
            {sriStatus && (
              <div style={{
                background: sriStatus.overall === 'offline' ? '#fee2e2' : sriStatus.overall === 'degraded' ? '#fef3c7' : '#d1fae5',
                border: `2px solid ${sriStatus.overall === 'offline' ? '#ef4444' : sriStatus.overall === 'degraded' ? '#f59e0b' : '#10b981'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {sriStatus.overall === 'online' ? '✅ Servidores SRI Operativos' :
                      sriStatus.overall === 'degraded' ? '⚠️ Servidores SRI Degradados' :
                        '❌ Servidores SRI Fuera de Línea'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Ambiente: {sriStatus.ambiente === 'produccion' ? 'Producción' : 'Pruebas'}
                  </span>
                </div>

                {sriStatus.overall === 'offline' && (
                  <div style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    fontWeight: '600'
                  }}>
                    MODO CONTINGENCIA ACTIVADO - Los servidores del SRI no están disponibles
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>  Recepción</span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: sriStatus.recepcion?.status === 'online' ? '#d1fae5' : sriStatus.recepcion?.status === 'degraded' ? '#fef3c7' : '#fee2e2',
                        color: sriStatus.recepcion?.status === 'online' ? '#065f46' : sriStatus.recepcion?.status === 'degraded' ? '#92400e' : '#991b1b'
                      }}>
                        {sriStatus.recepcion?.status === 'online' ? 'Online' : sriStatus.recepcion?.status === 'degraded' ? 'Lento' : 'Offline'}
                      </span>
                    </div>
                    {sriStatus.recepcion?.latency > 0 && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        Latencia: {sriStatus.recepcion.latency}ms
                      </p>
                    )}
                    {sriStatus.recepcion?.error && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#dc2626' }}>
                        {sriStatus.recepcion.error}
                      </p>
                    )}
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>? Autorización</span>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: sriStatus.autorizacion?.status === 'online' ? '#d1fae5' : sriStatus.autorizacion?.status === 'degraded' ? '#fef3c7' : '#fee2e2',
                        color: sriStatus.autorizacion?.status === 'online' ? '#065f46' : sriStatus.autorizacion?.status === 'degraded' ? '#92400e' : '#991b1b'
                      }}>
                        {sriStatus.autorizacion?.status === 'online' ? 'Online' : sriStatus.autorizacion?.status === 'degraded' ? 'Lento' : 'Offline'}
                      </span>
                    </div>
                    {sriStatus.autorizacion?.latency > 0 && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        Latencia: {sriStatus.autorizacion.latency}ms
                      </p>
                    )}
                    {sriStatus.autorizacion?.error && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#dc2626' }}>
                        {sriStatus.autorizacion.error}
                      </p>
                    )}
                  </div>
                </div>

                <p style={{ margin: '15px 0 0 0', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                  Actualización automática cada 30 segundos
                </p>
              </div>
            )}

            {loadingSRI && (
              <div className="loading">
                <p>Cargando...</p>
              </div>
            )}

            {/* Información del certificado cargado */}
            {certificadoInfo && (
              <div className="certificado-info-card">
                <div className="certificado-header">
                  <div className="certificado-titles">
                    <h3>Certificado Actual</h3>
                    <p className="certificado-subtitle">Firma Electrónica configurada para emisión de comprobantes</p>
                  </div>
                  <div className="vigencia-container">
                    <div className={`vigencia-widget ${diasRestantes(certificadoInfo.fechaVencimiento) > 30 ? 'safe' :
                      diasRestantes(certificadoInfo.fechaVencimiento) > 15 ? 'warning' : 'danger'
                      }`}>
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                          strokeDasharray={`${Math.min(100, Math.max(0, (diasRestantes(certificadoInfo.fechaVencimiento) / 365) * 100))}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">{diasRestantes(certificadoInfo.fechaVencimiento)}</text>
                        <text x="18" y="26" className="label-text">Días</text>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="certificado-details">
                  <div className="detail-row">
                    <span className="detail-label">RUC:</span>
                    <span className="detail-value">{certificadoInfo.ruc}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Razón Social:</span>
                    <span className="detail-value">{certificadoInfo.razonSocial}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Número de Serie:</span>
                    <span className="detail-value">{certificadoInfo.numeroSerie}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha de Emisión:</span>
                    <span className="detail-value">{formatearFecha(certificadoInfo.fechaEmision)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha de Vencimiento:</span>
                    <span className="detail-value">{formatearFecha(certificadoInfo.fechaVencimiento)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className={`detail-value status ${certificadoInfo.vigente ? 'vigente' : 'vencido'}`}>
                      {certificadoInfo.vigente ? (
                        <>
                          ✅ Vigente
                          {diasRestantes(certificadoInfo.fechaVencimiento) > 0 && (
                            <span className="dias-restantes">
                              ({diasRestantes(certificadoInfo.fechaVencimiento)} días restantes)
                            </span>
                          )}
                        </>
                      ) : (
                        '❌ Vencido'
                      )}
                    </span>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <button
                      className="btn-cambiar-certificado"
                      onClick={() => setMostrarFormularioSRI(true)}
                    >
                      <span>🔄</span> Cambiar Certificado
                    </button>
                  </div>
                </div>

                {!certificadoInfo.vigente && (
                  <div className="alert alert-warning">
                    <strong>Advertencia:</strong> El certificado está vencido. Debes renovarlo para continuar facturando.
                  </div>
                )}

                {certificadoInfo.vigente && diasRestantes(certificadoInfo.fechaVencimiento) <= 30 && (
                  <div className="alert alert-warning">
                    <strong>Advertencia:</strong> El certificado vencerá pronto. Considera renovarlo.
                  </div>
                )}
              </div>
            )}

            {/* Formulario para cargar certificado */}
            {(mostrarFormularioSRI || !certificadoInfo) && (
              <div className="certificado-upload">
                <h3>{certificadoInfo ? 'Cambiar Certificado' : 'Cargar Certificado'}</h3>
                <p>Sube tu certificado de firma electrónica (.p12) proporcionado por el SRI</p>

                <form onSubmit={handleUpload}>
                  <div className="form-group">
                    <label htmlFor="certificado-file">Archivo Certificado (.p12)</label>
                    <input
                      type="file"
                      id="certificado-file"
                      accept=".p12"
                      onChange={handleFileChange}
                      required
                    />
                    {uploadFile && (
                      <span className="file-name">📄 {uploadFile.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="ruc">RUC del Emisor</label>
                    <input
                      type="text"
                      id="ruc"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 13))}
                      placeholder="0999999999001"
                      required
                      maxLength={13}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Contraseña del Certificado</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa la contraseña del certificado"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loadingSRI}
                    >
                      {loadingSRI ? 'Cargando...' : 'Cargar Certificado'}
                    </button>
                    {certificadoInfo && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setMostrarFormularioSRI(false)
                          setErrorSRI(null)
                          setPassword('')
                          setRuc('')
                          setUploadFile(null)
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Configuración de ambiente */}
            <div className="ambiente-config">
              <h3>Configuración del Ambiente</h3>
              <div className="ambiente-selector">
                <label>
                  <input
                    type="radio"
                    name="ambiente"
                    value="pruebas"
                    checked={ambiente === 'pruebas'}
                    onChange={(e) => setAmbiente(e.target.value)}
                  />
                  <span>Ambiente de Pruebas</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="ambiente"
                    value="produccion"
                    checked={ambiente === 'produccion'}
                    onChange={(e) => setAmbiente(e.target.value)}
                  />
                  <span>Ambiente de Producción</span>
                </label>
              </div>
              <p className="ambiente-info">
                {ambiente === 'pruebas'
                  ? 'Las facturas se enviarán al ambiente de pruebas del SRI. Úsalo para validar antes de producción.'
                  : 'Las facturas se enviarán al ambiente de producción del SRI. Solo úsalo cuando estés listo para facturar reales.'}
              </p>
            </div>

            {/* Información adicional */}
            <div className="sri-info">
              <h3>Información Importante</h3>
              <ul>
                <li>El certificado debe ser un archivo .p12 válido proporcionado por el SRI</li>
                <li>La contraseña será encriptada y almacenada de forma segura</li>
                <li>El certificado debe estar vigente para poder facturar</li>
                <li>Se recomienda renovar el certificado antes de que expire</li>
                <li>En ambiente de pruebas, puedes probar sin afectar facturas reales</li>
              </ul>
            </div>
          </div>
        )}

        {tabActiva === 'monitoreo' && (
          <div className="admin-content">
            <h2>  Monitoreo de Recursos del Servidor</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>
              Visualiza el consumo de CPU y RAM en tiempo real para prevenir caídas durante horas pico.
            </p>

            {loadingRecursos && !recursos && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando información del sistema...</p>
              </div>
            )}

            {recursos && (
              <div className="recursos-grid">
                <div className="recurso-card">
                  <div className="recurso-header">
                    <h3> ? CPU</h3>
                    <span className="recurso-valor">{recursos.cpu}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${recursos.cpu > 80 ? 'danger' :
                        recursos.cpu > 60 ? 'warning' :
                          'success'
                        }`}
                      style={{ width: `${recursos.cpu}%` }}
                    ></div>
                  </div>
                  <p className="recurso-descripcion">
                    {recursos.cpu > 80 ? '  Carga alta - Considere optimizar procesos' :
                      recursos.cpu > 60 ? '? Carga moderada' :
                        '? Carga normal'}
                  </p>
                </div>

                <div className="recurso-card">
                  <div className="recurso-header">
                    <h3>  Memoria RAM</h3>
                    <span className="recurso-valor">{recursos.memory?.usagePercentage}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${recursos.memory?.usagePercentage > 80 ? 'danger' :
                        recursos.memory?.usagePercentage > 60 ? 'warning' :
                          'success'
                        }`}
                      style={{ width: `${recursos.memory?.usagePercentage}%` }}
                    ></div>
                  </div>
                  <p className="recurso-descripcion">
                    {(recursos.memory?.used / 1024 / 1024 / 1024).toFixed(2)} GB / {(recursos.memory?.total / 1024 / 1024 / 1024).toFixed(2)} GB
                  </p>
                  <p className="recurso-descripcion">
                    {recursos.memory?.usagePercentage > 80 ? '  Memoria alta - Considere reiniciar servicios' :
                      recursos.memory?.usagePercentage > 60 ? '? Uso moderado' :
                        '? Uso normal'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}



        {tabActiva === 'documentos-pendientes' && (
          <div className="admin-content">
            <h2> Documentos Pendientes SRI</h2>
            <p>Documentos en cola esperando ser enviados al SRI cuando el servicio está disponible.
            </p>

            {contadorDocumentos && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{contadorDocumentos.total}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>Total Pendientes</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{contadorDocumentos.facturas}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}> Facturas</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{contadorDocumentos.notasCredito}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}> Notas Crédito</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{contadorDocumentos.anulaciones}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}> Anulaciones</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{contadorDocumentos.retenciones}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}> Retenciones</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={procesarColaNow}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Procesar Cola Ahora
              </button>
            </div>

            {loadingDocumentos ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando documentos...</p>
              </div>
            ) : documentosPendientes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}> No hay documentos pendientes</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <p>Tabla de documentos aqu (simplificada por ahora)</p>
              </div>
            )}
          </div>
        )}

        {tabActiva === 'puntos-venta' && (
          <div className="admin-content">
            <PuntosVenta />
          </div>
        )}
      </div>
    </div >
  )
}

export default Admin








