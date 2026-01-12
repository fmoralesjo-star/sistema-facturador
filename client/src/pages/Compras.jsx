import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Compras.css'

import { API_URL } from '../config/api'
import { redondear4Decimales, redondear2Decimales, formatearNumero, formatearMoneda, parsearNumero, formatearComprobante } from '../utils/formateo'
import CajaChicaModal from '../components/CajaChicaModal'

function Compras({ socket }) {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [compras, setCompras] = useState([])
  const [mostrarCompras, setMostrarCompras] = useState(false)
  const [mostrarCajaChica, setMostrarCajaChica] = useState(false)
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState(null)

  // Estados para tabs y retenciones
  const [tabActiva, setTabActiva] = useState('compras') // 'compras' | 'retenciones'
  const [retenciones, setRetenciones] = useState([])
  const [retencionSeleccionada, setRetencionSeleccionada] = useState(null)
  const [mostrarDetalleRetencion, setMostrarDetalleRetencion] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Estados para Liquidaciones de Compra
  const [liquidaciones, setLiquidaciones] = useState([])
  const [mostrarDetalleliquidacion, setMostrarDetalleLiquidacion] = useState(false)
  const [liquidacionSeleccionada, setLiquidacionSeleccionada] = useState(null)
  const [formLiquidacion, setFormLiquidacion] = useState({
    fecha_emision: new Date().toISOString().split('T')[0],
    proveedor_identificacion: '',
    proveedor_nombre: '',
    proveedor_direccion: '',
    proveedor_telefono: '',
    proveedor_email: '',
    concepto: '',
    subtotal_0: 0,
    subtotal_12: 0,
    iva: 0,
    total: 0,
    retencion_renta: 0,
    retencion_iva: 0,
    codigo_retencion_renta: '',
    codigo_retencion_iva: '',
    observaciones: ''
  })

  const [formData, setFormData] = useState({
    numero_comprobante: '',
    autorizacion: '', // Nuevo campo para guardar la clave de acceso del XML
    tipo_comprobante: 'Credito Fiscal',
    fecha_compra: new Date().toISOString().split('T')[0],
    fecha_libro: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    proveedor_id: '',
    tipo_compra: 'Gravada',
    forma_pago: 'Contado',
    origen: 'Local',
    aplicar_retencion: false,
    numero_comprobante_retencion: '',
    concepto_retencion: '',
    detalles: []
  })

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState({
    codigo: '',
    nombre: '',
    direccion: '',
    numero_registro: '',
    nit: ''
  })

  const [productoSeleccionado, setProductoSeleccionado] = useState({
    codigo: '',
    producto_id: '',
    cantidad: 1,
    bodega: '001',
    lote: '',
    costo_unitario: 0,
    porcentaje: 0
  })

  const fileInputRef = React.useRef(null)

  // Estados Sincronización SRI
  const [mostrarModalSRI, setMostrarModalSRI] = useState(false)
  const [comprobantesSRI, setComprobantesSRI] = useState([])
  const [cargandoSRI, setCargandoSRI] = useState(false)
  const [comprobantesSeleccionados, setComprobantesSeleccionados] = useState([])
  const [fechaInicioSRI, setFechaInicioSRI] = useState('')
  const [fechaFinSRI, setFechaFinSRI] = useState('')
  const [pendientesSRI, setPendientesSRI] = useState(0)

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const token = getToken()
        const res = await axios.get(`${API_URL}/sri/comprobantes-recibidos/conteo-pendientes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPendientesSRI(res.data.pendientes || 0)
      } catch (error) {
        console.error(error)
      }
    }
    fetchPendientes()
  }, [])

  useEffect(() => {
    // Cargar punto de venta seleccionado
    const puntoVentaGuardado = localStorage.getItem('puntoVentaSeleccionado')
    if (puntoVentaGuardado) {
      try {
        const puntoVentaData = JSON.parse(puntoVentaGuardado)
        setPuntoVentaSeleccionado(puntoVentaData)
      } catch (error) {
        console.error('Error al cargar punto de venta:', error)
      }
    }

    cargarDatos()

    socket.on('compra-creada', () => {
      cargarCompras()
    })

    socket.on('inventario-actualizado', () => {
      cargarProductos() // Recargar productos para ver stock actualizado
    })

    return () => {
      socket.off('compra-creada')
      socket.off('inventario-actualizado')
    }
  }, [socket])

  // Inicialización fechas SRI
  useEffect(() => {
    const hoy = new Date()
    const mesPasado = new Date()
    mesPasado.setDate(hoy.getDate() - 30)
    setFechaFinSRI(hoy.toISOString().split('T')[0])
    setFechaInicioSRI(mesPasado.toISOString().split('T')[0])
  }, [])

  const abrirModalSRI = () => {
    setMostrarModalSRI(true)
    consultarSRI()
  }

  const consultarSRI = async () => {
    setCargandoSRI(true)
    try {
      const fin = fechaFinSRI || new Date().toISOString().split('T')[0]
      const inicio = fechaInicioSRI

      const response = await axios.get(`${API_URL}/sri/comprobantes-recibidos?fechaInicio=${inicio}&fechaFin=${fin}`)
      setComprobantesSRI(response.data)
      setComprobantesSeleccionados([])
    } catch (error) {
      console.error('Error al consultar SRI:', error)
      alert('Error al consultar SRI: ' + error.message)
    } finally {
      setCargandoSRI(false)
    }
  }

  const toggleSeleccionSRI = (comprobante) => {
    const yaSeleccionado = comprobantesSeleccionados.find(c => c.claveAcceso === comprobante.claveAcceso)
    if (yaSeleccionado) {
      setComprobantesSeleccionados(comprobantesSeleccionados.filter(c => c.claveAcceso !== comprobante.claveAcceso))
    } else {
      setComprobantesSeleccionados([...comprobantesSeleccionados, comprobante])
    }
  }

  const importarSeleccionadosSRI = async () => {
    if (comprobantesSeleccionados.length === 0) return

    // Si es solo uno, podemos cargarlo en el formulario principal para edición
    if (comprobantesSeleccionados.length === 1) {
      const comp = comprobantesSeleccionados[0]
      // Precargar formulario
      setFormData(prev => ({
        ...prev,
        numero_comprobante: comp.serie + '-' + comp.numeroComprobante.split('-')[2],
        autorizacion: comp.claveAcceso,
        tipo_comprobante: comp.tipoComprobante === 'FACTURA' ? 'Factura' : 'Otros',
        fecha_compra: comp.fechaEmision.split('/').reverse().join('-'), // dd/mm/yyyy -> yyyy-mm-dd
      }))

      // Intentar buscar proveedor por RUC y asignarlo
      const provEncontrado = proveedores.find(p => p.identificacion === comp.rucEmisor)
      if (provEncontrado) {
        setProveedorSeleccionado(provEncontrado)
        setFormData(prev => ({ ...prev, proveedor_id: provEncontrado.id }))
      } else {
        setProveedorSeleccionado({
          codigo: '',
          nombre: comp.razonSocialEmisor,
          identificacion: comp.rucEmisor,
          direccion: 'Dirección del SRI',
          numero_registro: '',
          nit: ''
        })
        alert(`El proveedor ${comp.razonSocialEmisor} no existe. Se han precargado sus datos.`)
      }

      alert('Comprobante cargado. Verifica los detalles y guarda la compra.')
      setMostrarModalSRI(false)
      setMostrarCompras(false)
      return
    }

    alert(`Se comenzarían a procesar ${comprobantesSeleccionados.length} comprobantes. (Funcionalidad Masiva en construcción)`)
  }

  const handleImportarXml = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const res = await axios.post(`${API_URL}/compras/importar-xml`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { proveedor, compra, detalles } = res.data

      // Actualizar proveedor
      setProveedorSeleccionado({
        codigo: proveedor.codigo || '',
        nombre: proveedor.nombre || '',
        direccion: proveedor.direccion || '',
        numero_registro: '', // No siempre viene en XML
        nit: '', // No siempre viene en XML
        origen: 'Local' // Asumir local por defecto
      })

      // Actualizar formulario principal
      setFormData(prev => ({
        ...prev,
        numero_comprobante: compra.numero_comprobante,
        fecha_compra: compra.fecha_compra,
        autorizacion: compra.autorizacion || '', // Llenar con la clave de acceso del XML
        proveedor_id: proveedor.id || '', // Si existe
        tipo_comprobante: 'Factura', // Asumido del XML
        detalles: detalles.map(d => ({
          producto_id: d.producto_id,
          codigo: d.codigo,
          nombre: d.descripcion,
          cantidad: d.cantidad,
          costo_unitario: d.precio_unitario,
          subtotal: d.subtotal,
          bodega: '001', // Default
          porcentaje: 0 // Default
        }))
      }))

      alert('Factura importada correctamente. Por favor verifique los datos antes de guardar.')
    } catch (error) {
      console.error('Error importing XML:', error)
      alert('Error al importar el XML: ' + (error.response?.data?.message || error.message))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const cargarDatos = async () => {
    await Promise.all([
      cargarProveedores(),
      cargarProductos(),
      cargarCompras()
    ])
  }

  const cargarProveedores = async () => {
    try {
      const res = await axios.get(`${API_URL}/proveedores`)
      setProveedores(res.data)
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
    }
  }

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/productos`)
      setProductos(res.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  // Función para consultar RUC manual (Botón Consultar)
  const handleConsultarRuc = async () => {
    const ruc = proveedorSeleccionado.codigo;
    if (!ruc) return alert('Ingrese un RUC o Cédula');

    setCargandoSRI(true);
    try {
      // 1. Buscar Localmente Primero (Exhaustivo)
      const local = proveedores.find(p => p.codigo === ruc || p.identificacion === ruc);
      if (local) {
        setProveedorSeleccionado(local);
        setFormData(prev => ({ ...prev, proveedor_id: local.id }));
        alert('Proveedor encontrado en base de datos local.');
        setCargandoSRI(false);
        return;
      }

      // 2. Si no esta local, intentar "External API" (API Real backend -> SRI)
      const res = await axios.get(`${API_URL}/sri/contribuyente/${ruc}`);

      if (res.data) {
        const contribuyente = res.data;

        // Inferencia de Tipo de Contribuyente según clase/categoria del SRI
        let tipoInfe = 'OTROS';
        const clase = (contribuyente.clase || '').toUpperCase();

        if (clase.includes('ESPECIAL')) tipoInfe = 'CONTRIBUYENTE_ESPECIAL';
        else if (clase.includes('RIMPE') && (clase.includes('POPULAR') || clase.includes('NEGOCIO'))) tipoInfe = 'RIMPE_NEGOCIO_POPULAR';
        else if (clase.includes('RIMPE')) tipoInfe = 'RIMPE_EMPRENDEDOR';
        else if (clase.includes('AGENTE')) tipoInfe = 'AGENTE_RETENCION';

        const nuevoProv = {
          codigo: ruc,
          nombre: contribuyente.nombre || contribuyente.razonSocial,
          direccion: contribuyente.direccion || 'Dirección obtenida del SRI',
          numero_registro: contribuyente.clase || '', // Contribuyente Especial, etc
          nit: '',
          origen: 'Local',
          identificacion: ruc,
          tipo_contribuyente: tipoInfe, // Nuevo campo inferido
          es_nuevo: true // Flag para saber que vino del SRI
        };
        setProveedorSeleccionado(nuevoProv);
        alert(`Datos encontrados en SRI: ${nuevoProv.nombre}`);
      } else {
        alert('No se encontraron datos en el SRI para este RUC.');
      }

    } catch (error) {
      console.error("Error consulta SRI:", error);
      const mensaje = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al consultar SRI: ${mensaje}`);
    } finally {
      setCargandoSRI(false);
    }
  }

  const cargarCompras = async () => {
    try {
      const res = await axios.get(`${API_URL}/compras`)
      setCompras(res.data)
    } catch (error) {
      console.error('Error al cargar compras:', error)
    }
  }

  const buscarProveedor = async (codigo) => {
    try {
      const proveedor = proveedores.find(p => p.codigo === codigo)
      if (proveedor) {
        setProveedorSeleccionado({
          codigo: proveedor.codigo,
          nombre: proveedor.nombre,
          direccion: proveedor.direccion || '',
          numero_registro: proveedor.numero_registro || '',
          nit: proveedor.nit || ''
        })
        setFormData({ ...formData, proveedor_id: proveedor.id })
      } else {
        // Si no existe, crear uno nuevo
        const nuevoProveedor = {
          codigo: codigo,
          nombre: '',
          direccion: '',
          numero_registro: '',
          nit: '',
          origen: 'Local'
        }
        setProveedorSeleccionado(nuevoProveedor)
      }
    } catch (error) {
      console.error('Error al buscar proveedor:', error)
    }
  }

  const guardarProveedor = async () => {
    if (!proveedorSeleccionado.codigo || !proveedorSeleccionado.nombre) {
      alert('Complete el código y nombre del proveedor')
      return
    }

    try {
      if (formData.proveedor_id) {
        await axios.put(`${API_URL}/proveedores/${formData.proveedor_id}`, proveedorSeleccionado)
      } else {
        const res = await axios.post(`${API_URL}/proveedores`, proveedorSeleccionado)
        setFormData({ ...formData, proveedor_id: res.data.id })
      }
      cargarProveedores()
      alert('Proveedor guardado')
    } catch (error) {
      console.error('Error al guardar proveedor:', error)
      alert('Error al guardar proveedor')
    }
  }

  const agregarProducto = () => {
    if (!productoSeleccionado.producto_id || !productoSeleccionado.cantidad || productoSeleccionado.cantidad <= 0) {
      alert('Seleccione un producto y cantidad válida')
      return
    }

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado.producto_id))
    if (!producto) return

    const cantidad = redondear4Decimales(parseFloat(productoSeleccionado.cantidad) || 0)
    const costoUnitario = redondear4Decimales(parseFloat(productoSeleccionado.costo_unitario) || 0)
    const subtotal = redondear2Decimales(cantidad * costoUnitario)

    const nuevoDetalle = {
      producto_id: producto.id,
      codigo: producto.codigo,
      referencia: producto.referencia || '',
      nombre: producto.nombre,
      cantidad: cantidad,
      bodega: productoSeleccionado.bodega,
      lote: productoSeleccionado.lote,
      costo_unitario: costoUnitario,
      porcentaje: redondear4Decimales(parseFloat(productoSeleccionado.porcentaje) || 0),
      subtotal: subtotal
    }

    setFormData({
      ...formData,
      detalles: [...formData.detalles, nuevoDetalle]
    })

    setProductoSeleccionado({
      codigo: '',
      producto_id: '',
      cantidad: 1,
      bodega: '001',
      lote: '',
      costo_unitario: 0,
      porcentaje: 0
    })
  }

  const eliminarDetalle = (index) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    })
  }

  const handleProductoChange = (e) => {
    const productoId = e.target.value
    const producto = productos.find(p => p.id === parseInt(productoId))

    if (producto) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        codigo: producto.codigo,
        producto_id: productoId,
        costo_unitario: producto.precio || 0
      })
    }
  }

  const calcularSubtotal = () => {
    const subtotal = formData.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)
    return redondear2Decimales(subtotal)
  }

  const calcularIVA = () => {
    const subtotal = calcularSubtotal()
    return redondear2Decimales(subtotal * 0.13) // IVA del 13%
  }

  const calcularRetencionIVA = () => {
    if (!formData.aplicar_retencion) return 0
    const subtotal = calcularSubtotal()
    return redondear2Decimales(subtotal * 0.01) // Retención del 1%
  }

  const calcularTotal = () => {
    return redondear2Decimales(calcularSubtotal() + calcularIVA() - calcularRetencionIVA())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.proveedor_id || formData.detalles.length === 0 || !formData.numero_comprobante) {
      alert('Complete todos los campos requeridos')
      return
    }

    try {
      const compraData = {
        numero: formData.numero_comprobante,
        autorizacion: formData.autorizacion, // Enviar al backend
        fecha: formData.fecha_compra,
        fecha_vencimiento: formData.fecha_vencimiento,
        proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null,
        punto_venta_id: puntoVentaSeleccionado?.id || null,
        detalles: formData.detalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          precio_unitario: d.costo_unitario,
        })),
        impuesto: calcularIVA(),
        observaciones: `Tipo: ${formData.tipo_compra}, Forma Pago: ${formData.forma_pago}, Origen: ${formData.origen}${formData.aplicar_retencion ? `, Retención: ${formData.numero_comprobante_retencion}` : ''}`
      }

      await axios.post(`${API_URL}/compras`, compraData)

      // Limpiar formulario
      setFormData({
        numero_comprobante: '',
        autorizacion: '',
        tipo_comprobante: 'Credito Fiscal',
        fecha_compra: new Date().toISOString().split('T')[0],
        fecha_libro: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        proveedor_id: '',
        tipo_compra: 'Gravada',
        forma_pago: 'Contado',
        origen: 'Local',
        aplicar_retencion: false,
        numero_comprobante_retencion: '',
        concepto_retencion: '',
        detalles: []
      })

      setProveedorSeleccionado({
        codigo: '',
        nombre: '',
        direccion: '',
        numero_registro: '',
        nit: ''
      })

      alert('Compra guardada exitosamente')
      cargarCompras()
    } catch (error) {
      console.error('Error al guardar compra:', error)
      alert('Error al guardar la compra: ' + (error.response?.data?.error || error.message))
    }
  }

  // Funciones para Retenciones
  const cargarRetenciones = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroFechaDesde) params.append('desde', filtroFechaDesde)
      if (filtroFechaHasta) params.append('hasta', filtroFechaHasta)
      if (filtroEstado) params.append('estado', filtroEstado)

      const res = await axios.get(`${API_URL}/retenciones?${params}`)
      setRetenciones(res.data)
    } catch (error) {
      console.error('Error cargando retenciones:', error)
    }
  }

  const verDetalleRetencion = (retencion) => {
    setRetencionSeleccionada(retencion)
    setMostrarDetalleRetencion(true)
  }

  const descargarXMLRetencion = async (id) => {
    window.open(`${API_URL}/retenciones/${id}/xml`, '_blank')
  }

  const descargarPDFRetencion = async (id) => {
    window.open(`${API_URL}/retenciones/${id}/pdf`, '_blank')
  }

  const anularRetencion = async (id) => {
    if (!confirm('¿Está seguro de anular esta retención? Esta acción no se puede deshacer.')) return

    try {
      await axios.patch(`${API_URL}/retenciones/${id}/anular`)
      alert('Retención anulada correctamente')
      cargarRetenciones()
      if (mostrarDetalleRetencion) setMostrarDetalleRetencion(false)
    } catch (error) {
      alert('Error al anular: ' + (error.response?.data?.message || error.message))
    }
  }

  const calcularTotalRetenido = (retencion) => {
    if (!retencion.detalles) return 0
    return retencion.detalles.reduce((sum, det) => sum + parseFloat(det.valor_retenido || 0), 0)
  }

  useEffect(() => {
    if (tabActiva === 'retenciones') cargarRetenciones()
    if (tabActiva === 'liquidaciones') cargarLiquidaciones()
  }, [tabActiva, filtroEstado, filtroFechaDesde, filtroFechaHasta])

  // Funciones para Liquidaciones
  const cargarLiquidaciones = async () => {
    try {
      const params = new URLSearchParams()
      if (filtroFechaDesde) params.append('desde', filtroFechaDesde)
      if (filtroFechaHasta) params.append('hasta', filtroFechaHasta)
      if (filtroEstado) params.append('estado', filtroEstado)

      const res = await axios.get(`${API_URL}/liquidaciones-compra?${params}`)
      setLiquidaciones(res.data)
    } catch (error) {
      console.error('Error cargando liquidaciones:', error)
    }
  }

  const handleSubmitLiquidacion = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/liquidaciones-compra`, formLiquidacion)
      alert('Liquidación de compra creada exitosamente')
      cargarLiquidaciones()
      // Resetear formulario
      setFormLiquidacion({
        fecha_emision: new Date().toISOString().split('T')[0],
        proveedor_identificacion: '',
        proveedor_nombre: '',
        proveedor_direccion: '',
        proveedor_telefono: '',
        proveedor_email: '',
        concepto: '',
        subtotal_0: 0,
        subtotal_12: 0,
        iva: 0,
        total: 0,
        retencion_renta: 0,
        retencion_iva: 0,
        codigo_retencion_renta: '',
        codigo_retencion_iva: '',
        observaciones: ''
      })
    } catch (error) {
      alert('Error al crear liquidación: ' + (error.response?.data?.message || error.message))
    }
  }

  const anularLiquidacion = async (id) => {
    if (!confirm('¿Está seguro de anular esta liquidación?')) return
    try {
      await axios.patch(`${API_URL}/liquidaciones-compra/${id}/anular`)
      alert('Liquidación anulada')
      cargarLiquidaciones()
    } catch (error) {
      alert('Error al anular: ' + (error.response?.data?.message || error.message))
    }
  }

  const calcularTotalesLiquidacion = (campo, valor) => {
    const updatedForm = { ...formLiquidacion, [campo]: valor }

    if (campo === 'subtotal_12') {
      updatedForm.iva = valor * 0.12
    }

    updatedForm.total = updatedForm.subtotal_0 + updatedForm.subtotal_12 + updatedForm.iva

    setFormLiquidacion(updatedForm)
  }

  return (
    <div className="compras-container">
      <div className="compras-header" style={{
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
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: 700 }}>🛒 Compras</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-header"
            style={{
              backgroundColor: '#fd7e14',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setMostrarCajaChica(true)}
          >
            💸 Gastos / Caja Chica
          </button>
          <button
            className="btn-header"
            style={{ backgroundColor: '#17a2b8', fontWeight: 'bold', position: 'relative' }}
            onClick={abrirModalSRI}
          >
            ☁️ Sincronizar SRI
            {pendientesSRI > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ff0000',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                border: '2px solid white',
                animation: 'pulse 2s infinite'
              }}>
                {pendientesSRI}
              </span>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xml"
            onChange={handleImportarXml}
          />
          <button
            className="btn-header"
            style={{ backgroundColor: '#28a745' }}
            onClick={() => fileInputRef.current.click()}
          >
            📂 Importar XML
          </button>
          <button
            className={`btn-header ${!mostrarCompras ? 'active' : ''}`}
            onClick={() => {
              setMostrarCompras(false)
              setTabActiva('compras')
            }}
          >
            Nueva Compra
          </button>
          <button
            className={`btn-header ${mostrarCompras ? 'active' : ''}`}
            onClick={() => {
              setMostrarCompras(true)
              setTabActiva('compras')
            }}
          >
            Ver Compras
          </button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="compras-tabs" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          className={tabActiva === 'compras' ? 'active' : ''}
          onClick={() => setTabActiva('compras')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: tabActiva === 'compras' ? '3px solid #3b82f6' : '3px solid transparent',
            color: tabActiva === 'compras' ? '#3b82f6' : '#6b7280',
            fontWeight: tabActiva === 'compras' ? 600 : 400,
            transition: 'all 0.3s'
          }}
        >
          🛒 Compras
        </button>
        <button
          className={tabActiva === 'retenciones' ? 'active' : ''}
          onClick={() => setTabActiva('retenciones')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: tabActiva === 'retenciones' ? '3px solid #3b82f6' : '3px solid transparent',
            color: tabActiva === 'retenciones' ? '#3b82f6' : '#6b7280',
            fontWeight: tabActiva === 'retenciones' ? 600 : 400,
            transition: 'all 0.3s'
          }}
        >
          📋 Retenciones
        </button>
        <button
          className={tabActiva === 'liquidaciones' ? 'active' : ''}
          onClick={() => setTabActiva('liquidaciones')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'transparent',
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: tabActiva === 'liquidaciones' ? '3px solid #3b82f6' : '3px solid transparent',
            color: tabActiva === 'liquidaciones' ? '#3b82f6' : '#6b7280',
            fontWeight: tabActiva === 'liquidaciones' ? 600 : 400,
            transition: 'all 0.3s'
          }}
        >
          📝 Liquidaciones de Compra
        </button>
      </div>

      {tabActiva === 'compras' && (
        <>
          {
            !mostrarCompras && (
              <form onSubmit={handleSubmit} className="form-compras">
                <div className="compras-section">
                  <div className="form-row-header">
                    <div className="form-group">
                      <label>No. de Comprobante</label>
                      <input
                        type="text"
                        value={formData.numero_comprobante}
                        onChange={(e) => setFormData({ ...formData, numero_comprobante: formatearComprobante(e.target.value) })}
                        placeholder="001-001-000000001"
                        maxLength="17"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Autorización / Clave Acceso</label>
                      <input
                        type="text"
                        value={formData.autorizacion || ''}
                        onChange={async (e) => {
                          const val = e.target.value.replace(/\D/g, ''); // Solo números
                          setFormData({ ...formData, autorizacion: val });

                          // Auto-fetch si son 49 dígitos (Clave Acceso)
                          if (val.length === 49) {
                            try {
                              // Simulación de fetch automático o llamada real si existiera endpoint público
                              // Por ahora, mostrar feedback visual de que es válido
                              console.log("Clave de acceso válida detectada:", val);
                              // Aquí se podría llamar a una función para consultar al SRI si fuera necesario
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                        placeholder="49 dígitos (Electrónica) o 10 (Física)"
                        maxLength="49"
                        style={{
                          fontSize: '0.9em',
                          letterSpacing: '0.5px',
                          borderColor: (formData.autorizacion && (formData.autorizacion.length === 10 || formData.autorizacion.length === 49)) ? '#28a745' : ''
                        }}
                      />
                      {formData.autorizacion && formData.autorizacion.length !== 10 && formData.autorizacion.length !== 49 && (
                        <small style={{ color: 'red', display: 'block', marginTop: '4px' }}>
                          Debe tener 10 (Física) o 49 (Electrónica) dígitos
                        </small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Tipo de comprobante</label>
                      <select
                        value={formData.tipo_comprobante}
                        onChange={(e) => setFormData({ ...formData, tipo_comprobante: e.target.value })}
                      >
                        <option value="Credito Fiscal">Credito Fiscal</option>
                        <option value="Factura">Factura</option>
                        <option value="Recibo">Recibo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fecha compra</label>
                      <input
                        type="date"
                        value={formData.fecha_compra}
                        onChange={(e) => {
                          const nuevaFecha = e.target.value;
                          const plazo = formData.plazo || '0';
                          const fechaBase = new Date(nuevaFecha);
                          fechaBase.setDate(fechaBase.getDate() + parseInt(plazo)); // Recalcular vencimiento al cambiar fecha compra

                          setFormData({
                            ...formData,
                            fecha_compra: nuevaFecha,
                            fecha_vencimiento: fechaBase.toISOString().split('T')[0]
                          });
                        }}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha del libro</label>
                      <input
                        type="date"
                        value={formData.fecha_libro}
                        onChange={(e) => setFormData({ ...formData, fecha_libro: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Términos de Pago</label>
                      <select
                        value={formData.plazo || '0'}
                        onChange={(e) => {
                          const plazo = e.target.value;
                          const fechaBase = new Date(formData.fecha_compra);
                          // Sumar días (ojo con zona horaria, simple cálculo de días)
                          fechaBase.setDate(fechaBase.getDate() + parseInt(plazo) + 1); // +1 corrección por timezone local

                          setFormData({
                            ...formData,
                            plazo: plazo,
                            forma_pago: plazo === '0' ? 'Contado' : 'Crédito',
                            fecha_vencimiento: fechaBase.toISOString().split('T')[0]
                          });
                        }}
                        style={{ fontWeight: 'bold', color: formData.plazo !== '0' ? '#d97706' : '#059669' }}
                      >
                        <option value="0">Contado (Inmediato)</option>
                        <option value="15">Crédito 15 días</option>
                        <option value="30">Crédito 30 días</option>
                        <option value="45">Crédito 45 días</option>
                        <option value="60">Crédito 60 días</option>
                        <option value="90">Crédito 90 días</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fecha de Vencto.</label>
                      <input
                        type="date"
                        value={formData.fecha_vencimiento}
                        onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                        style={{
                          backgroundColor: formData.plazo !== '0' ? '#fffbeb' : '#f0fdf4',
                          borderColor: formData.plazo !== '0' ? '#f59e0b' : '#22c55e'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="proveedor-section">
                    <div className="form-row-proveedor">
                      <div className="form-group">
                        <label>Cód. del proveedor (RUC/Cédula)</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <div className="input-with-icon" style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={proveedorSeleccionado.codigo}
                              onChange={(e) => {
                                setProveedorSeleccionado({ ...proveedorSeleccionado, codigo: e.target.value })
                                if (e.target.value) {
                                  buscarProveedor(e.target.value)
                                }
                              }}
                              placeholder="Ingrese RUC o Cédula"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleConsultarRuc();
                                }
                              }}
                            />
                            <span className="icon-search">🔍</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleConsultarRuc}
                            className="btn-consultar-ruc"
                            title="Consultar en Base de Datos Local y SRI"
                            disabled={cargandoSRI}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0 10px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}
                          >
                            {cargandoSRI ? '...' : 'CONSULTAR'}
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={proveedorSeleccionado.nombre}
                          onChange={(e) => setProveedorSeleccionado({ ...proveedorSeleccionado, nombre: e.target.value })}
                          onBlur={guardarProveedor}
                        />
                      </div>
                      <div className="form-group">
                        <label>Dirección</label>
                        <input
                          type="text"
                          value={proveedorSeleccionado.direccion}
                          onChange={(e) => setProveedorSeleccionado({ ...proveedorSeleccionado, direccion: e.target.value })}
                          onBlur={guardarProveedor}
                        />
                      </div>
                      <div className="form-group">
                        <label>Numero Registro</label>
                        <input
                          type="text"
                          value={proveedorSeleccionado.numero_registro}
                          onChange={(e) => setProveedorSeleccionado({ ...proveedorSeleccionado, numero_registro: e.target.value })}
                          onBlur={guardarProveedor}
                        />
                      </div>
                      <div className="form-group" style={{ minWidth: '200px' }}>
                        <label>Tipo Contribuyente / Régimen</label>
                        <select
                          value={proveedorSeleccionado.tipo_contribuyente || 'OTROS'}
                          onChange={(e) => setProveedorSeleccionado({ ...proveedorSeleccionado, tipo_contribuyente: e.target.value })}
                          onBlur={guardarProveedor}
                          style={{ borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}
                        >
                          <option value="OTROS">Régimen General / Otros</option>
                          <option value="CONTRIBUYENTE_ESPECIAL">Contribuyente Especial</option>
                          <option value="AGENTE_RETENCION">Agente de Retención</option>
                          <option value="RIMPE_EMPRENDEDOR">Régimen RIMPE - Emprendedor</option>
                          <option value="RIMPE_NEGOCIO_POPULAR">Régimen RIMPE - Negocio Popular</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Origen</label>
                        <select
                          value={formData.origen}
                          onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                        >
                          <option value="Local">Local</option>
                          <option value="Importacion">Importación</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tipo de compra</label>
                        <select
                          value={formData.tipo_compra}
                          onChange={(e) => setFormData({ ...formData, tipo_compra: e.target.value })}
                        >
                          <option value="Gravada">Gravada</option>
                          <option value="Exenta">Exenta</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Forma de pago</label>
                        <select
                          value={formData.forma_pago}
                          onChange={(e) => setFormData({ ...formData, forma_pago: e.target.value })}
                        >
                          <option value="Contado">Contado</option>
                          <option value="Credito">Crédito</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>NIT</label>
                        <input
                          type="text"
                          value={proveedorSeleccionado.nit}
                          onChange={(e) => setProveedorSeleccionado({ ...proveedorSeleccionado, nit: e.target.value })}
                          onBlur={guardarProveedor}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="productos-section">
                    <h3>Productos</h3>
                    <div className="agregar-producto-row">
                      <div className="form-group">
                        <label>Código</label>
                        <select
                          value={productoSeleccionado.producto_id}
                          onChange={handleProductoChange}
                        >
                          <option value="">Seleccione</option>
                          {productos.map(producto => (
                            <option key={producto.id} value={producto.id}>
                              {producto.codigo?.substring(0, 15) || ''} - {producto.referencia || ''} - {producto.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          min="0.0001"
                          step="0.0001"
                          value={productoSeleccionado.cantidad}
                          onChange={(e) => {
                            const valor = parsearNumero(e.target.value)
                            setProductoSeleccionado({ ...productoSeleccionado, cantidad: valor > 0 ? valor : 1 })
                          }}
                          onBlur={(e) => {
                            const valor = parsearNumero(e.target.value)
                            setProductoSeleccionado({ ...productoSeleccionado, cantidad: valor > 0 ? valor : 1 })
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bdga</label>
                        <input
                          type="text"
                          value={productoSeleccionado.bodega}
                          onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, bodega: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Lote</label>
                        <input
                          type="text"
                          value={productoSeleccionado.lote}
                          onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, lote: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Descripción</label>
                        <input
                          type="text"
                          value={productoSeleccionado.producto_id ? productos.find(p => p.id === parseInt(productoSeleccionado.producto_id))?.nombre || '' : ''}
                          readOnly
                        />
                      </div>
                      <div className="form-group">
                        <label>Costo Unit.</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={productoSeleccionado.costo_unitario}
                          onChange={(e) => {
                            const valor = parsearNumero(e.target.value)
                            setProductoSeleccionado({ ...productoSeleccionado, costo_unitario: valor })
                          }}
                          onBlur={(e) => {
                            const valor = parsearNumero(e.target.value)
                            setProductoSeleccionado({ ...productoSeleccionado, costo_unitario: valor })
                          }}
                          className="costo-unitario-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>%</label>
                        <input
                          type="number"
                          step="0.01"
                          value={productoSeleccionado.porcentaje}
                          onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, porcentaje: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Sub Total</label>
                        <input
                          type="text"
                          value={formatearNumero(productoSeleccionado.cantidad * productoSeleccionado.costo_unitario)}
                          readOnly
                          className="subtotal-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button type="button" className="btn-agregar" onClick={agregarProducto}>
                          Agregar
                        </button>
                      </div>
                    </div>

                    {formData.detalles.length > 0 && (
                      <table className="tabla-productos">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Cantidad</th>
                            <th>Bdga</th>
                            <th>Lote</th>
                            <th>Descripción</th>
                            <th>Costo Unit.</th>
                            <th>%</th>
                            <th>Sub Total</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.detalles.map((detalle, index) => (
                            <tr key={index}>
                              <td>{detalle.codigo}</td>
                              <td>{formatearNumero(detalle.cantidad)}</td>
                              <td>{detalle.bodega}</td>
                              <td>{detalle.lote || ''}</td>
                              <td>{detalle.nombre}</td>
                              <td className="costo-cell">${formatearNumero(detalle.costo_unitario)}</td>
                              <td>{formatearNumero(detalle.porcentaje)}</td>
                              <td className="subtotal-cell">${formatearNumero(detalle.subtotal)}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-eliminar"
                                  onClick={() => eliminarDetalle(index)}
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <div className="footer-compras">
                      <div className="footer-left">
                        <button type="button" className="btn-crear-productos">
                          Crear Productos
                        </button>
                        <div className="retencion-section">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.aplicar_retencion}
                              onChange={(e) => setFormData({ ...formData, aplicar_retencion: e.target.checked })}
                            />
                            Aplicar Retención
                          </label>
                          {formData.aplicar_retencion && (
                            <>
                              <label>No. Comprobante:</label>
                              <input
                                type="text"
                                value={formData.numero_comprobante_retencion}
                                onChange={(e) => setFormData({ ...formData, numero_comprobante_retencion: e.target.value })}
                                style={{ width: '100px', marginRight: '10px' }}
                              />
                              <label>Concepto/</label>
                              <input
                                type="text"
                                value={formData.concepto_retencion}
                                onChange={(e) => setFormData({ ...formData, concepto_retencion: e.target.value })}
                                style={{ width: '300px' }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="footer-right">
                        <button type="submit" className="btn-guardar">
                          Guardar
                        </button>
                        <div className="totales-footer">
                          <div className="total-item">
                            <label>Sub-Total:</label>
                            <span>${formatearNumero(calcularSubtotal())}</span>
                          </div>
                          <div className="total-item">
                            <label>IVA:</label>
                            <span>${formatearNumero(calcularIVA())}</span>
                          </div>
                          <div className="total-item">
                            <label>Retencion IVA:</label>
                            <span>${formatearNumero(calcularRetencionIVA())}</span>
                          </div>
                          <div className="total-item total-final">
                            <label>Total:</label>
                            <span>${formatearNumero(calcularTotal())}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )
          }

          {
            mostrarCompras && (
              <div className="compras-registradas">
                <h2 style={{ marginBottom: '1rem', flexShrink: 0 }}>Compras Registradas</h2>
                <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <table className="tabla-compras">
                    <thead>
                      <tr>
                        <th>No. Comprobante</th>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compras.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No hay compras registradas
                          </td>
                        </tr>
                      ) : (
                        compras.map(compra => (
                          <tr key={compra.id}>
                            <td>{compra.numero_comprobante}</td>
                            <td>{compra.proveedor_nombre}</td>
                            <td>{new Date(compra.fecha_compra).toLocaleDateString()}</td>
                            <td>${formatearNumero(compra.total)}</td>
                            <td>
                              <button className="btn-ver" onClick={() => alert('Ver detalles')}>
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }

          {/* Modal de Caja Chica / Gastos Menores */}
          {
            mostrarCajaChica && (
              <CajaChicaModal
                onClose={() => setMostrarCajaChica(false)}
                puntoVentaId={puntoVentaSeleccionado?.id || 1}
                usuarioId={1}
              />
            )
          }
        </>
      )}

      {/* Tab Retenciones */}
      {tabActiva === 'retenciones' && (
        <div className="retenciones-container">
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>📋 Comprobantes de Retención Emitidos</h2>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Desde:</label>
                <input
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Hasta:</label>
                <input
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="">Todos</option>
                  <option value="AUTORIZADA">Autorizadas</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="ANULADA">Anuladas</option>
                </select>
              </div>
            </div>

            {/* Tabla de Retenciones */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Número</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Proveedor</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Total Retenido</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {retenciones.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        No hay retenciones registradas
                      </td>
                    </tr>
                  ) : (
                    retenciones.map((ret) => (
                      <tr key={ret.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{ret.fecha_emision?.split('T')[0]}</td>
                        <td style={{ padding: '12px' }}>
                          {ret.establecimiento}-{ret.punto_emision}-{ret.secuencial}
                        </td>
                        <td style={{ padding: '12px' }}>{ret.compra?.proveedor?.razon_social || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{formatearMoneda(calcularTotalRetenido(ret))}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            background: ret.estado === 'AUTORIZADA' ? '#d1fae5' : ret.estado === 'ANULADA' ? '#fee2e2' : '#fef3c7',
                            color: ret.estado === 'AUTORIZADA' ? '#065f46' : ret.estado === 'ANULADA' ? '#991b1b' : '#92400e'
                          }}>
                            {ret.estado}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => verDetalleRetencion(ret)}
                              style={{ padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
                              title="Ver detalle"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => descargarPDFRetencion(ret.id)}
                              style={{ padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
                              title="Descargar PDF"
                            >
                              🖨️
                            </button>
                            {ret.estado === 'AUTORIZADA' && (
                              <button
                                onClick={() => anularRetencion(ret.id)}
                                style={{ padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer', background: '#fee2e2', color: '#991b1b' }}
                                title="Anular"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Retención */}
      {mostrarDetalleRetencion && retencionSeleccionada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Detalle de Retención #{retencionSeleccionada.secuencial}</h3>
              <button
                onClick={() => setMostrarDetalleRetencion(false)}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                ✕ Cerrar
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4>Información General</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><strong>Fecha Emisión:</strong> {retencionSeleccionada.fecha_emision?.split('T')[0]}</div>
                <div><strong>Estado:</strong> {retencionSeleccionada.estado}</div>
                <div><strong>Autorización:</strong> {retencionSeleccionada.numero_autorizacion || 'Pendiente'}</div>
                <div><strong>Proveedor:</strong> {retencionSeleccionada.compra?.proveedor?.razon_social}</div>
              </div>
            </div>

            <div>
              <h4>Detalle de Impuestos Retenidos</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Impuesto</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Código</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Base</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>%</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {retencionSeleccionada.detalles?.map((det, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>{det.codigo_impuesto === '1' ? 'Renta' : 'IVA'}</td>
                      <td style={{ padding: '10px' }}>{det.codigo_retencion}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{formatearMoneda(det.base_imponible)}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{det.porcentaje_retener}%</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{formatearMoneda(det.valor_retenido)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 'bold', background: '#f9fafb' }}>
                    <td colSpan="4" style={{ padding: '10px', textAlign: 'right' }}>Total Retenido:</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{formatearMoneda(calcularTotalRetenido(retencionSeleccionada))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => descargarPDFRetencion(retencionSeleccionada.id)}
                style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🖨️ Imprimir PDF
              </button>
              {retencionSeleccionada.estado === 'AUTORIZADA' && (
                <button
                  onClick={() => anularRetencion(retencionSeleccionada.id)}
                  style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ❌ Anular Retención
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Liquidaciones de Compra */}
      {tabActiva === 'liquidaciones' && (
        <div className="liquidaciones-container" style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>📝 Emisión de Liquidación de Compra</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Para compras a personas naturales sin obligación de emitir comprobantes (artesanos, servicios ocasionales, agricultores)
          </p>

          <form onSubmit={handleSubmitLiquidacion} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
            {/* Datos del Proveedor */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#111827' }}>Datos del Proveedor (Persona Natural)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Cédula / Identificación *</label>
                  <input
                    type="text"
                    value={formLiquidacion.proveedor_identificacion}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, proveedor_identificacion: e.target.value })}
                    placeholder="1234567890"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formLiquidacion.proveedor_nombre}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, proveedor_nombre: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Dirección</label>
                  <input
                    type="text"
                    value={formLiquidacion.proveedor_direccion}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, proveedor_direccion: e.target.value })}
                    placeholder="Calle Principal"
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Teléfono</label>
                  <input
                    type="text"
                    value={formLiquidacion.proveedor_telefono}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, proveedor_telefono: e.target.value })}
                    placeholder="0987654321"
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Email</label>
                  <input
                    type="email"
                    value={formLiquidacion.proveedor_email}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, proveedor_email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Fecha Emisión *</label>
                  <input
                    type="date"
                    value={formLiquidacion.fecha_emision}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, fecha_emision: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Detalle de la Compra */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#111827' }}>Detalle de la Compra</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Concepto / Descripción *</label>
                <textarea
                  rows="3"
                  value={formLiquidacion.concepto}
                  onChange={(e) => setFormLiquidacion({ ...formLiquidacion, concepto: e.target.value })}
                  placeholder="Ej: Compra de productos agrícolas, Servicio de plomería, Trabajo artesanal, etc."
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Subtotal Gravado 0%</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formLiquidacion.subtotal_0}
                    onChange={(e) => calcularTotalesLiquidacion('subtotal_0', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Subtotal Gravado 12%</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formLiquidacion.subtotal_12}
                    onChange={(e) => calcularTotalesLiquidacion('subtotal_12', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>IVA 12%</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formLiquidacion.iva.toFixed(2)}
                    readOnly
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', background: '#f3f4f6' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#059669' }}>Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formLiquidacion.total.toFixed(2)}
                    readOnly
                    style={{ width: '100%', padding: '8px', border: '2px solid #059669', borderRadius: '4px', background: '#d1fae5', fontWeight: 'bold', fontSize: '1.1rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Retenciones (Opcional) */}
            <div style={{ marginBottom: '30px', background: '#fef3c7', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '15px', color: '#92400e' }}>Retenciones (Opcional)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Código Retención Renta</label>
                  <select
                    value={formLiquidacion.codigo_retencion_renta}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, codigo_retencion_renta: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  >
                    <option value="">Sin retención</option>
                    <option value="303">303 - 1% Honorarios profesionales</option>
                    <option value="304">304 - 2% Servicios</option>
                    <option value="307">307 - 8% Arrendamiento inmuebles</option>
                    <option value="319">319 - 1% Publicidad</option>
                    <option value="320">320 - 1% Transporte privado</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Valor Retención Renta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formLiquidacion.retencion_renta}
                    onChange={(e) => setFormLiquidacion({ ...formLiquidacion, retencion_renta: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Observaciones</label>
              <textarea
                rows="2"
                value={formLiquidacion.observaciones}
                onChange={(e) => setFormLiquidacion({ ...formLiquidacion, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '12px 30px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Emitir Liquidación de Compra
            </button>
          </form>

          {/* Listado de Liquidaciones Emitidas */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '20px' }}>Liquidaciones Emitidas</h3>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Desde:</label>
                <input
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Hasta:</label>
                <input
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="AUTORIZADA">Autorizadas</option>
                  <option value="ANULADA">Anuladas</option>
                </select>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Número</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Proveedor</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Concepto</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {liquidaciones.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No hay liquidaciones registradas
                    </td>
                  </tr>
                ) : (
                  liquidaciones.map((liq) => (
                    <tr key={liq.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>{liq.fecha_emision?.split('T')[0]}</td>
                      <td style={{ padding: '12px' }}>
                        {liq.establecimiento}-{liq.punto_emision}-{liq.secuencial}
                      </td>
                      <td style={{ padding: '12px' }}>{liq.proveedor_nombre}</td>
                      <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {liq.concepto}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatearMoneda(liq.total)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          background: liq.estado === 'AUTORIZADA' ? '#d1fae5' : liq.estado === 'ANULADA' ? '#fee2e2' : '#fef3c7',
                          color: liq.estado === 'AUTORIZADA' ? '#065f46' : liq.estado === 'ANULADA' ? '#991b1b' : '#92400e'
                        }}>
                          {liq.estado}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={() => alert('Detalle en desarrollo')}
                            style={{ padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
                            title="Ver detalle"
                          >
                            👁️
                          </button>
                          {liq.estado !== 'ANULADA' && (
                            <button
                              onClick={() => anularLiquidacion(liq.id)}
                              style={{ padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer', background: '#fee2e2', color: '#991b1b' }}
                              title="Anular"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Sincronización SRI */}
      {mostrarModalSRI && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>☁️ Sincronización SRI</h2>
              <button onClick={() => setMostrarModalSRI(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'end', marginBottom: '20px', background: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Desde:</label>
                <input type="date" value={fechaInicioSRI} onChange={e => setFechaInicioSRI(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Hasta:</label>
                <input type="date" value={fechaFinSRI} onChange={e => setFechaFinSRI(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button
                onClick={consultarSRI}
                disabled={cargandoSRI}
                style={{ padding: '9px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', height: '38px', opacity: cargandoSRI ? 0.7 : 1 }}>
                {cargandoSRI ? 'Consultando...' : '🔍 Consultar'}
              </button>
            </div>

            {cargandoSRI ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p>Conectando con SRI...</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>#</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Emisor</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Comprobante</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>XML</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobantesSRI.length > 0 ? comprobantesSRI.map((comp) => {
                        const seleccionado = comprobantesSeleccionados.some(c => c.claveAcceso === comp.claveAcceso)
                        return (
                          <tr key={comp.claveAcceso} style={{ borderBottom: '1px solid #e5e7eb', background: seleccionado ? '#eff6ff' : 'white' }}>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={seleccionado}
                                onChange={() => toggleSeleccionSRI(comp)}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 600 }}>{comp.razonSocialEmisor}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{comp.rucEmisor}</div>
                            </td>
                            <td style={{ padding: '12px' }}>{comp.fechaEmision}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#e5e7eb', fontSize: '0.8rem', fontWeight: 500 }}>
                                {comp.tipoComprobante}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {comp.serie}-{comp.numeroComprobante.split('-')[2]}
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }} title={comp.claveAcceso}>
                                {comp.claveAcceso.substring(0, 10)}...
                              </div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>${comp.importeTotal}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <a href={comp.xmlUrl} target="_blank" rel="noreferrer" title="Ver XML" style={{ textDecoration: 'none' }}>📄</a>
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                            No se encontraron comprobantes en el rango seleccionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                  <div style={{ color: '#6b7280' }}>
                    {comprobantesSeleccionados.length} comprobantes seleccionados
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setMostrarModalSRI(false)}
                      style={{ padding: '10px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={importarSeleccionadosSRI}
                      disabled={comprobantesSeleccionados.length === 0}
                      style={{
                        padding: '10px 20px',
                        background: comprobantesSeleccionados.length > 0 ? '#10b981' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: comprobantesSeleccionados.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📥 Importar Seleccionados
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Sincronización SRI */}
      {mostrarModalSRI && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#111827' }}>☁️ Sincronización SRI</h2>
              <button onClick={() => setMostrarModalSRI(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'end', marginBottom: '20px', background: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Desde:</label>
                <input type="date" value={fechaInicioSRI} onChange={e => setFechaInicioSRI(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Hasta:</label>
                <input type="date" value={fechaFinSRI} onChange={e => setFechaFinSRI(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button
                onClick={consultarSRI}
                disabled={cargandoSRI}
                style={{ padding: '9px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', height: '38px', opacity: cargandoSRI ? 0.7 : 1 }}>
                {cargandoSRI ? 'Consultando...' : '🔍 Consultar'}
              </button>
            </div>

            {cargandoSRI ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p>Conectando con SRI...</p>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}>#</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Emisor</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Comprobante</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>XML</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobantesSRI.length > 0 ? comprobantesSRI.map((comp) => {
                        const seleccionado = comprobantesSeleccionados.some(c => c.claveAcceso === comp.claveAcceso)
                        return (
                          <tr key={comp.claveAcceso} style={{ borderBottom: '1px solid #e5e7eb', background: seleccionado ? '#eff6ff' : 'white' }}>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={seleccionado}
                                onChange={() => toggleSeleccionSRI(comp)}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 600 }}>{comp.razonSocialEmisor}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{comp.rucEmisor}</div>
                            </td>
                            <td style={{ padding: '12px' }}>{comp.fechaEmision}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#e5e7eb', fontSize: '0.8rem', fontWeight: 500 }}>
                                {comp.tipoComprobante}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {comp.serie}-{comp.numeroComprobante.split('-')[2]}
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }} title={comp.claveAcceso}>
                                {comp.claveAcceso.substring(0, 10)}...
                              </div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>${comp.importeTotal}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <a href={comp.xmlUrl} target="_blank" rel="noreferrer" title="Ver XML" style={{ textDecoration: 'none' }}>📄</a>
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                            No se encontraron comprobantes en el rango seleccionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                  <div style={{ color: '#6b7280' }}>
                    {comprobantesSeleccionados.length} comprobantes seleccionados
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setMostrarModalSRI(false)}
                      style={{ padding: '10px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={importarSeleccionadosSRI}
                      disabled={comprobantesSeleccionados.length === 0}
                      style={{
                        padding: '10px 20px',
                        background: comprobantesSeleccionados.length > 0 ? '#10b981' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: comprobantesSeleccionados.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📥 Importar Seleccionados
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Compras





