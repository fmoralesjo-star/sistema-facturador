import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import { useAuth } from '../contexts/AuthContext'
import './Facturacion.css'
import BuscarFacturasModal from '../components/BuscarFacturasModal'
import CajaChicaModal from '../components/CajaChicaModal'

function Facturacion({ socket }) {
  // DEPLOY TRIGGER: 2026-01-12 12:05
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // Debug: Verificar que el componente se está renderizando
  useEffect(() => {
    console.log('✅ Componente Facturacion montado correctamente')
    console.log('Socket disponible:', !!socket)
    console.log('Current user:', currentUser)
    console.log('URL actual:', window.location.href)
  }, [socket, currentUser])

  // Log antes del return
  console.log('🔍 Facturacion: Iniciando renderizado del JSX')
  // Función helper para obtener fecha en formato ISO (yyyy-MM-dd) para inputs type="date"
  const getFechaISO = (fecha) => {
    if (!fecha) return new Date().toISOString().split('T')[0]
    // Si ya está en formato ISO, retornarlo
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/
    if (isoRegex.test(fecha)) return fecha
    // Si es una fecha parseable, convertirla
    try {
      const dateObj = new Date(fecha)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0]
      }
    } catch (e) {
      // Si falla, usar fecha actual
    }
    return new Date().toISOString().split('T')[0]
  }

  // Función helper para obtener datos iniciales de factura desde localStorage
  const getInitialFacturaData = () => {
    try {
      const facturaGuardada = localStorage.getItem('facturaDataGuardada')
      if (facturaGuardada) {
        const data = JSON.parse(facturaGuardada)
        // Asegurar que la fecha esté en formato ISO si existe
        if (data.fecha) {
          data.fecha = getFechaISO(data.fecha)
        }
        return data
      }
    } catch (error) {
      console.error('Error al cargar facturaData:', error)
    }

    return {
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      fecha: new Date().toISOString().split('T')[0],
      vendedor: '',
      tipoPago: 'Transferencia',
      numero: '00001',
      clienteRucCedula: '',
      clienteNombre: '',
      clienteDireccion: '',
      clienteTelefono: '',
      clienteEmail: '',
      emisorRuc: '',
      emisorRazonSocial: '',
      emisorNombreComercial: '',
      emisorDireccionMatriz: '',
      emisorDireccionEstablecimiento: '',
      emisorTelefono: '',
      emisorEmail: '',
      establecimiento: '001',
      puntoEmision: '001',
      secuencial: '',
      tipoComprobante: '01',
      ambiente: '2',
      claveAcceso: '',
      autorizacion: '',
      fechaAutorizacion: '',
      formaPago: 'SIN UTILIZACION DEL SISTEMA FINANCIERO',
      condicionPago: 'CONTADO',
      metodoPago: 'EFECTIVO',
      fechaContable: new Date().toISOString().split('T')[0],
      cuenta: '',
      observaciones: ''
    }
  }

  // Función helper para obtener items iniciales desde localStorage
  const getInitialItems = () => {
    try {
      const itemsGuardados = localStorage.getItem('itemsGuardados')
      if (itemsGuardados) {
        const itemsCargados = JSON.parse(itemsGuardados)
        if (Array.isArray(itemsCargados)) {
          // Retornar array vacío si no hay items, para mostrar el mensaje
          if (itemsCargados.length === 0) {
            return []
          }
          return itemsCargados.map((item, index) => ({
            id: item.id || index + 1,
            codigo: item.codigo || '',
            descripcion: item.descripcion || '',
            cantidad: item.cantidad || 0,
            precio: item.precio || 0,
            descuento: item.descuento || 0,
            subtotal: item.subtotal || 0
          }))
        }
      }
    } catch (error) {
      console.error('Error al cargar items:', error)
    }

    // Por defecto, empezar con array vacío para mostrar el mensaje de agregar fila
    return []
  }

  const [facturaData, setFacturaData] = useState(() => getInitialFacturaData())
  const [items, setItems] = useState(() => getInitialItems())

  const [totales, setTotales] = useState({
    subtotal: 0,
    iva: 0,
    retenciones: 0,
    total: 0,
    totalLetras: 'CERO'
  })

  // Estado para configuración global (IVA, etc)
  const [configuracion, setConfiguracion] = useState({
    ivaPorcentaje: 15 // Valor por defecto seguro
  })

  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState(null)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [mostrarFormularioNuevoCliente, setMostrarFormularioNuevoCliente] = useState(false)
  const [formularioNuevoCliente, setFormularioNuevoCliente] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    esExtranjero: false,
    tipoDocumento: '' // 'RUC' o 'Cédula'
  })
  const [guardandoCliente, setGuardandoCliente] = useState(false)
  const [mostrarMensajeExito, setMostrarMensajeExito] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [emisorExpandido, setEmisorExpandido] = useState(false)
  const [contabilidadExpandida, setContabilidadExpandida] = useState(false)
  const [puntoVenta, setPuntoVenta] = useState(null)
  const [mostrarConfirmarNuevaFactura, setMostrarConfirmarNuevaFactura] = useState(false)
  const [mostrarBuscarCliente, setMostrarBuscarCliente] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [mostrarClienteEncontrado, setMostrarClienteEncontrado] = useState(false)
  const [modoEdicionDatosCliente, setModoEdicionDatosCliente] = useState(false)
  const [editandoDatosCliente, setEditandoDatosCliente] = useState(false)
  const [guardandoCambiosCliente, setGuardandoCambiosCliente] = useState(false)
  const [mostrarMensajeCambiosGuardados, setMostrarMensajeCambiosGuardados] = useState(false)
  const [datosClienteOriginales, setDatosClienteOriginales] = useState(null)
  const [mostrarCierreCaja, setMostrarCierreCaja] = useState(false)
  const [cargandoCierreCaja, setCargandoCierreCaja] = useState(false)
  const [resumenCierreCaja, setResumenCierreCaja] = useState(null)
  const [fechaDesdeCierre, setFechaDesdeCierre] = useState(new Date().toISOString().split('T')[0])
  const [fechaHastaCierre, setFechaHastaCierre] = useState(new Date().toISOString().split('T')[0])
  const [vendedorCierreCaja, setVendedorCierreCaja] = useState('')
  const [mostrarAlertaVendedor, setMostrarAlertaVendedor] = useState(false)
  const [mostrarBuscarFacturasModal, setMostrarBuscarFacturasModal] = useState(false)

  const [mostrarCajaChicaModal, setMostrarCajaChicaModal] = useState(false)

  // Estado para Cotizaciones / Proformas
  const [esProforma, setEsProforma] = useState(false)


  // Estados para Detalle de Factura
  const [mostrarDetalleFactura, setMostrarDetalleFactura] = useState(false)
  const [facturaDetalleSeleccionada, setFacturaDetalleSeleccionada] = useState(null)

  // Estado para la modal de retenciones
  const [mostrarModalRetencion, setMostrarModalRetencion] = useState(false)
  const [retencionData, setRetencionData] = useState({
    numero: '',
    valorIR: '',
    valorIVA: '',
    fecha: new Date().toISOString().split('T')[0]
  })

  // Estado para pagos múltiples y visibilidad
  const [listaPagos, setListaPagos] = useState([])
  const [cabeceraColapsada, setCabeceraColapsada] = useState(false)
  const [mostrarSeccionPago, setMostrarSeccionPago] = useState(false)
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [tipoPagoActual, setTipoPagoActual] = useState(null)
  const [montoPago, setMontoPago] = useState('')
  const [detallesPago, setDetallesPago] = useState({})

  // Handler para agregar pago
  const agregarPagoALista = () => {
    const monto = parseFloat(montoPago)
    if (!monto || monto <= 0) {
      alert('Ingrese un monto válido')
      return
    }

    const nuevoPago = {
      id: Date.now(),
      tipo: tipoPagoActual,
      monto: monto,
      detalles: { ...detallesPago }
    }

    setListaPagos([...listaPagos, nuevoPago])
    setMostrarModalPago(false)
    setMontoPago('')
    setDetallesPago({})

    // Actualizar datos generales para compatibilidad (usar el de mayor monto como principal)
    // Opcional: Podríamos dejar el último o el más alto.
  }

  const [cargandoDetalleFactura, setCargandoDetalleFactura] = useState(false)
  const [mostrarBuscarFactura, setMostrarBuscarFactura] = useState(false)
  const [mostrarBuscarFacturaGeneral, setMostrarBuscarFacturaGeneral] = useState(false)
  const [facturasCliente, setFacturasCliente] = useState([])
  const [facturasBuscadas, setFacturasBuscadas] = useState([])
  const [cargandoFacturas, setCargandoFacturas] = useState(false)
  const [cargandoFacturasGeneral, setCargandoFacturasGeneral] = useState(false)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)
  const [filtroBusqueda, setFiltroBusqueda] = useState({
    numero: '',
    fechaDesde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaHasta: new Date().toISOString().split('T')[0],
    cliente: ''
  })
  const [linkPago, setLinkPago] = useState('')
  const [mostrarLinkPago, setMostrarLinkPago] = useState(false)
  const [generandoLinkPago, setGenerandoLinkPago] = useState(false)
  const inputNombreRef = useRef(null)
  const inputRucRef = useRef(null)
  const [clienteOffsetY, setClienteOffsetY] = useState(0)
  const [isDraggingCliente, setIsDraggingCliente] = useState(false)
  const dragStartY = useRef(0)
  const clienteSectionRef = useRef(null)
  const [mostrarRegistrarCliente, setMostrarRegistrarCliente] = useState(false)
  const timeoutBusquedaRef = useRef(null)

  // Estado para los anchos de las columnas
  const getInitialColumnWidth = (columnName, defaultWidth) => {
    try {
      const width = localStorage.getItem(`${columnName}Width`)
      const parsedWidth = width ? parseInt(width) : defaultWidth
      // Para código de barras, limitar a máximo 300px (suficiente para muchos caracteres)
      if (columnName === 'codigoBarras' && parsedWidth > 300) {
        return 300
      }
      return parsedWidth
    } catch (error) {
      return defaultWidth
    }
  }

  const [columnWidths, setColumnWidths] = useState({
    codigo: getInitialColumnWidth('codigoBarras', 150),
    descripcion: getInitialColumnWidth('descripcion', 350),
    talla: getInitialColumnWidth('talla', 80),
    color: getInitialColumnWidth('color', 100),
    cantidad: getInitialColumnWidth('cantidad', 60),
    precio: getInitialColumnWidth('precio', 90),
    descuento: getInitialColumnWidth('descuento', 70),
    subtotal: getInitialColumnWidth('subtotal', 90)
  })

  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumn, setResizingColumn] = useState(null)
  const resizeStartX = useRef(0)
  const resizeStartWidth = useRef(0)

  // Cargar datos de la empresa (emisor) y punto de venta al inicio
  useEffect(() => {
    const cargarDatosEmisor = async () => {
      try {
        // 1. Primero cargar datos de la empresa
        const resEmpresa = await axios.get(`${API_URL}/empresa`)
        if (resEmpresa.data && resEmpresa.data.length > 0) {
          const empresa = resEmpresa.data[0]
          setFacturaData(prev => ({
            ...prev,
            emisorRuc: empresa.ruc || prev.emisorRuc,
            emisorRazonSocial: empresa.razon_social || prev.emisorRazonSocial,
            emisorNombreComercial: empresa.nombre_comercial || prev.emisorNombreComercial,
            emisorDireccionMatriz: empresa.direccion_matriz || prev.emisorDireccionMatriz,
            emisorDireccionEstablecimiento: empresa.direccion_establecimiento || prev.emisorDireccionEstablecimiento,
            emisorTelefono: empresa.telefono || prev.emisorTelefono,
            emisorEmail: empresa.email || prev.emisorEmail
          }))
        }
      } catch (error) {
        console.error('Error cargando datos de empresa:', error)
      }

      // 2. Luego aplicar datos del punto de venta (sobrescribe dirección establecimiento y teléfono)
      const puntoVentaGuardado = localStorage.getItem('puntoVentaSeleccionado')
      if (puntoVentaGuardado) {
        try {
          const puntoVentaData = JSON.parse(puntoVentaGuardado)
          setPuntoVenta(puntoVentaData)

          setFacturaData(prev => ({
            ...prev,
            // El punto de venta sobrescribe la dirección del establecimiento y teléfono
            emisorDireccionEstablecimiento: puntoVentaData.direccion || prev.emisorDireccionEstablecimiento,
            emisorTelefono: puntoVentaData.telefono || prev.emisorTelefono,
            establecimiento: puntoVentaData.codigo || prev.establecimiento
          }))
        } catch (error) {
          console.error('Error al cargar punto de venta:', error)
        }
      }
    }
    cargarDatosEmisor()
  }, [])

  // Cargar configuración global (IVA)
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/configuracion`)
        if (res.data) {
          // AdminService devuelve array de objetos { clave, valor }
          // Buscamos 'impuesto_iva_porcentaje'
          const configIva = res.data.find(c => c.clave === 'impuesto_iva_porcentaje')
          if (configIva) {
            setConfiguracion(prev => ({ ...prev, ivaPorcentaje: parseFloat(configIva.valor) }))
          }
        }
      } catch (error) {
        console.error('Error cargando configuración:', error)
      }
    }
    cargarConfiguracion()
  }, [])

  // Función para limpiar texto prohibido
  const cleanText = (text) => {
    if (!text) return ''
    const str = String(text)

    // 1. Eliminar la frase exacta completa primero
    const fraseCompleta = 'CONTRIBUYENTE RÉGIMEN RIMPE - EMPRENDEDOR / AGENTE DE RETENCIÓN RES. No. 00001'
    if (str.includes(fraseCompleta)) {
      return str.replace(fraseCompleta, '').trim()
    }

    // 2. Lista de textos a eliminar individualmente
    const unwanted = [
      'CONTRIBUYENTE RÉGIMEN RIMPE - EMPRENDEDOR / AGENTE DE RETENCIÓN RES. No. 00001',
      'CONTRIBUYENTE RÉGIMEN RIMPE',
      'CONTRIBUYENTE REGIMEN RIMPE',
      'RÉGIMEN RIMPE',
      'REGIMEN RIMPE',
      'RIMPE - EMPRENDEDOR',
      'AGENTE DE RETENCIÓN RES',
      'AGENTE DE RETENCION RES',
      'RES. No. 00001',
      'RIMPE',
      'CONTRIBUYENTE'
    ]

    let clean = str
    unwanted.forEach(u => {
      // Escapar caracteres especiales para regex
      const escaped = u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      clean = clean.replace(new RegExp(escaped, 'gi'), '')
    })

    // Limpiar guiones sobrantes, slashes o espacios dobles resultantes
    clean = clean.replace(/^[-\/\s]+/, '').replace(/[-\/\s]+$/, '')
    clean = clean.replace(/\s{2,}/g, ' ')

    return clean.trim()
  }

  // ELIMINAR COMPLETAMENTE el footer-banner que contiene el texto del régimen - VERSIÓN ULTRA AGRESIVA
  useEffect(() => {
    const eliminarFooterBanner = () => {
      const textosProhibidos = [
        'CONTRIBUYENTE RÉGIMEN RIMPE',
        'AGENTE DE RETENCIÓN RES',
        'EMPRENDEDOR / AGENTE',
        'RIMPE - EMPRENDEDOR',
        'RÉGIMEN RIMPE',
        'REGIMEN RIMPE',
        'RIMPE',
        'CONTRIBUYENTE',
        'RETENCIÓN',
        'RES. No. 00001'
      ]

      try {
        // 1. Buscar por clase y eliminar INMEDIATAMENTE
        // MODIFICADO: Ser más específico para NO borrar el footer principal
        const selectores = [
          '.footer-banner',
          '.rimpe-banner',
          '[class*="rimpe"]'
        ]

        document.querySelectorAll(selectores.join(', ')).forEach(el => {
          // NO eliminar si es nuestro footer visible
          if (el.classList.contains('footer-visible') || el.closest('.footer-visible')) return

          try {
            el.remove()
          } catch (e) {
            el.style.display = 'none'
          }
        })

        // 2. Buscar TODOS los elementos y verificar texto de forma profunda
        // Usar TreeWalker para buscar nodos de texto directamente
        const startNode = document.body
        const textWalker = document.createTreeWalker(
          startNode,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )

        let currentNode
        while (currentNode = textWalker.nextNode()) {
          const texto = (currentNode.nodeValue || '').toUpperCase()
          if (textosProhibidos.some(t => texto.includes(t.toUpperCase()))) {
            // Si es un nodo de texto, limpiarlo completamente
            currentNode.nodeValue = ''
            // Y eliminar/ocultar el padre
            if (currentNode.parentElement) {
              const parent = currentNode.parentElement

              // PROTECCIÓN: No eliminar si es parte del footer visible o sus botones
              if (parent.classList.contains('footer-visible') ||
                parent.closest('.footer-visible') ||
                parent.tagName === 'BUTTON' ||
                parent.closest('button')) {
                continue
              }

              const parentText = (parent.textContent || '').trim()
              // Si el padre contiene principalmente el texto prohibido, eliminarlo
              if (parentText.length < 200 || textosProhibidos.some(t => parentText.toUpperCase().includes(t.toUpperCase()))) {
                try {
                  parent.remove()
                } catch (e) {
                  parent.style.cssText = 'display: none !important;'
                }
              }
            }
          }
        }

        // 3. Buscar elementos contenedores (para elementos generados dinámicamente)
        const elementList = document.querySelectorAll('*')
        elementList.forEach(el => {
          // Saltar elementos críticos
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'META' ||
            el.tagName === 'HTML' || el.tagName === 'HEAD' || el.tagName === 'BODY' ||
            el.tagName === 'LINK' || el.tagName === 'TITLE' ||
            el.classList.contains('footer-visible') || el.closest('.footer-visible')) return

          const texto = (el.textContent || '').toUpperCase().trim()

          // Verificar si contiene texto prohibido
          const contieneTextoProhibido = textosProhibidos.some(t =>
            texto.includes(t.toUpperCase())
          )

          if (contieneTextoProhibido) {
            // Protección extra: asegurarse de que no eliminamos botones de acción
            if (el.tagName === 'BUTTON' || el.closest('button')) return

            // Si el elemento es pequeño o contiene principalmente el texto prohibido
            const esElementoPequeno = texto.length < 300
            const esPrincipalmenteTextoProhibido = textosProhibidos.some(t => {
              const porcentaje = (texto.split(t.toUpperCase()).length - 1) * t.length / texto.length
              return porcentaje > 0.3 // Más del 30% del texto es prohibido
            })

            if (esElementoPequeno || esPrincipalmenteTextoProhibido ||
              el.id.includes('rimpe')) {
              try {
                el.remove()
              } catch (e) {
                el.setAttribute('hidden', 'true')
              }
            }
          }
        })


      } catch (error) {
        console.error('Error eliminando footer banner:', error)
      }
    }

    // Ejecutar inmediatamente
    eliminarFooterBanner()

    // Ejecutar múltiples veces de forma ULTRA AGRESIVA
    const timeouts = []
    for (let i = 0; i < 100; i++) {
      timeouts.push(setTimeout(eliminarFooterBanner, i * 20))
    }

    // También ejecutar cada 50ms durante los primeros 15 segundos
    const intervalId = setInterval(eliminarFooterBanner, 50)
    setTimeout(() => clearInterval(intervalId), 15000)

    // Observar cambios en el DOM de forma CONTINUA Y AGRESIVA
    const observer = new MutationObserver(() => {
      eliminarFooterBanner()
    })

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true
      })
    }

    // También observar el documento completo
    if (document.documentElement) {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
      })
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      clearInterval(intervalId)
      observer.disconnect()
    }
  }, [])

  // Función convertirNumeroALetras definida antes de calcular
  const convertirNumeroALetras = (numero) => {
    // Función simplificada - deberías usar una librería más completa
    const enteros = Math.floor(numero)
    const decimales = Math.round((numero - enteros) * 100)

    if (enteros === 0) return 'CERO'

    // Implementación básica
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVETA']

    if (enteros < 10) {
      return `${unidades[enteros]} CON ${decimales.toString().padStart(2, '0')}/100 USD`
    }

    return `${enteros} CON ${decimales.toString().padStart(2, '0')}/100 USD`
  }

  // Verificar si es Nota de Crédito
  const esNotaCredito = facturaData.tipoComprobante === '04'

  // Función calcular definida después de convertirNumeroALetras
  const calcular = () => {
    if (!items || items.length === 0) {
      setTotales(prev => {
        if (prev.subtotal === 0 && prev.total === 0) return prev
        return {
          subtotal: 0,
          iva: 0,
          retenciones: 0,
          total: 0,
          totalLetras: 'CERO'
        }
      })
      return
    }

    let subtotalGeneral = 0
    const itemsConSubtotal = items.map(item => {
      let totalFila = (item.cantidad || 0) * (item.precio || 0)
      totalFila = totalFila - (totalFila * ((item.descuento || 0) / 100))
      // Si es Nota de Crédito, hacer el subtotal negativo
      if (esNotaCredito) {
        totalFila = -Math.abs(totalFila)
      }
      subtotalGeneral += totalFila
      return { ...item, subtotal: totalFila }
    })

    // Actualizar items solo si realmente cambiaron los subtotales
    const necesitaActualizarItems = itemsConSubtotal.some((item, index) => {
      const itemOriginal = items[index]
      if (!itemOriginal) return true
      const subtotalOriginal = itemOriginal.subtotal || 0
      return Math.abs(item.subtotal - subtotalOriginal) > 0.01
    })

    if (necesitaActualizarItems) {
      // Usar función de actualización para evitar loops
      setItems(prevItems => {
        if (prevItems.length !== itemsConSubtotal.length) {
          return itemsConSubtotal
        }
        const cambiaron = prevItems.some((item, i) => {
          const nuevo = itemsConSubtotal[i]
          return !nuevo || Math.abs((item.subtotal || 0) - (nuevo.subtotal || 0)) > 0.01
        })
        return cambiaron ? itemsConSubtotal : prevItems
      })
    }

    // Calcular IVA usando el porcentaje configurado
    const porcentajeIVA = (configuracion.ivaPorcentaje || 15) / 100
    const iva = subtotalGeneral * porcentajeIVA

    // Calcular retenciones desde los datos ingresados
    const valRetIR = parseFloat(retencionData.valorIR) || 0
    const valRetIVA = parseFloat(retencionData.valorIVA) || 0
    const retenciones = valRetIR + valRetIVA

    const total = subtotalGeneral + iva - retenciones

    setTotales(prev => {
      // Solo actualizar si cambió algo significativo
      if (Math.abs(prev.subtotal - subtotalGeneral) < 0.01 &&
        Math.abs(prev.total - total) < 0.01 &&
        Math.abs(prev.retenciones - retenciones) < 0.01) {
        return prev
      }

      return {
        subtotal: subtotalGeneral,
        iva: iva,
        retenciones: retenciones,
        total: total,
        totalLetras: convertirNumeroALetras(total)
      }
    })
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calcular()
    }, 0)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, retencionData, configuracion.ivaPorcentaje])

  // Deshabilitar zoom en la pantalla de facturación
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        return false
      }
    }

    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault()
        return false
      }
    }

    const preventTouchZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    let lastTouchEnd = 0
    const preventDoubleTapZoom = (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('wheel', preventWheelZoom, { passive: false })
    document.addEventListener('keydown', preventKeyZoom)
    document.addEventListener('touchstart', preventTouchZoom, { passive: false })
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })

    return () => {
      document.removeEventListener('wheel', preventWheelZoom)
      document.removeEventListener('keydown', preventKeyZoom)
      document.removeEventListener('touchstart', preventTouchZoom)
      document.removeEventListener('touchend', preventDoubleTapZoom)
    }
  }, [])

  // Manejar el arrastre de la sección de cliente
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingCliente) {
        const newOffset = e.clientY - dragStartY.current
        // Limitar el movimiento hacia arriba (no permitir valores negativos muy grandes)
        const clampedOffset = Math.max(0, newOffset)
        setClienteOffsetY(clampedOffset)
        console.log('Moviendo cliente, nuevo offset:', clampedOffset, 'clientY:', e.clientY, 'dragStartY:', dragStartY.current)
      }
    }

    const handleTouchMove = (e) => {
      if (isDraggingCliente) {
        const newOffset = e.touches[0].clientY - dragStartY.current
        setClienteOffsetY(Math.max(0, newOffset))
        e.preventDefault()
      }
    }

    const handleMouseUp = () => {
      setIsDraggingCliente(false)
    }

    const handleTouchEnd = () => {
      setIsDraggingCliente(false)
    }

    if (isDraggingCliente) {
      console.log('Agregando listeners de arrastre')
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDraggingCliente])

  // Guardar facturaData en localStorage cuando cambia (con debounce)
  useEffect(() => {
    if (!facturaData) return

    const timeoutId = setTimeout(() => {
      try {
        const dataParaGuardar = {
          ...facturaData,
          fecha: getFechaISO(facturaData.fecha),
          fechaContable: facturaData.fechaContable ? getFechaISO(facturaData.fechaContable) : ''
        }
        localStorage.setItem('facturaDataGuardada', JSON.stringify(dataParaGuardar))
      } catch (error) {
        console.error('Error al guardar facturaData:', error)
      }
    }, 300) // Debounce de 300ms para evitar escrituras excesivas

    return () => clearTimeout(timeoutId)
  }, [facturaData])

  // Guardar items en localStorage cuando cambian (con debounce)
  useEffect(() => {
    if (!items || !Array.isArray(items)) return

    const timeoutId = setTimeout(() => {
      try {
        if (items.length === 0) {
          localStorage.removeItem('itemsGuardados')
        } else {
          localStorage.setItem('itemsGuardados', JSON.stringify(items))
        }
      } catch (error) {
        console.error('Error al guardar items:', error)
      }
    }, 300) // Debounce de 300ms para evitar escrituras excesivas

    return () => clearTimeout(timeoutId)
  }, [items])

  // Guardar anchos de columnas en localStorage (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const codigoWidth = Math.min(columnWidths.codigo, 200)
        localStorage.setItem('codigoBarrasWidth', codigoWidth.toString())
        localStorage.setItem('descripcionWidth', columnWidths.descripcion.toString())
        localStorage.setItem('cantidadWidth', columnWidths.cantidad.toString())
        localStorage.setItem('precioWidth', columnWidths.precio.toString())
        localStorage.setItem('descuentoWidth', columnWidths.descuento.toString())
        localStorage.setItem('subtotalWidth', columnWidths.subtotal.toString())

        if (columnWidths.codigo > 200) {
          setColumnWidths(prev => ({ ...prev, codigo: 200 }))
        }
      } catch (error) {
        console.error('Error al guardar anchos de columnas:', error)
      }
    }, 300) // Debounce de 300ms para evitar escrituras excesivas

    return () => clearTimeout(timeoutId)
  }, [columnWidths])

  // Refs para el manejo de redimensionado sin problemas de closure
  const resizingState = useRef({
    isResizing: false,
    column: null,
    startX: 0,
    startWidth: 0
  });

  // Handler para iniciar resize
  const handleResizeStart = (e, column) => {
    e.preventDefault();
    e.stopPropagation();

    // Guardar estado en ref mutable (inmediato)
    resizingState.current = {
      isResizing: true,
      column: column,
      startX: e.clientX,
      startWidth: columnWidths[column]
    };

    setIsResizing(true); // Solo para cambios visuales si los hubiera
    setResizingColumn(column);

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  const handleResizeMove = useCallback((e) => {
    // Leer directamente del ref para evitar closures viejos
    const state = resizingState.current;
    if (!state.isResizing) return;

    const deltaX = e.clientX - state.startX;
    const newWidth = Math.max(40, state.startWidth + deltaX);

    // Actualizar estado de React para renderizar (usando callback para asegurar estado fresco)
    setColumnWidths(prev => ({
      ...prev,
      [state.column]: newWidth
    }));
  }, []); // Sin dependencias, siempre usa el ref

  const handleResizeEnd = useCallback(() => {
    resizingState.current.isResizing = false;
    resizingState.current.column = null;

    setIsResizing(false);
    setResizingColumn(null);

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResizeMove]); // Dependencia necesaria para remover el listener correcto

  // Efecto para limpiar listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    }
  }, [handleResizeMove, handleResizeEnd]);



  // Cargar clientes solo una vez al montar
  useEffect(() => {
    cargarClientes()
  }, [])

  // Enfocar el campo RUC cuando se abre el formulario (donde el usuario estaba escribiendo)
  useEffect(() => {
    if (mostrarFormularioNuevoCliente && inputRucRef.current) {
      setTimeout(() => {
        inputRucRef.current.focus()
        // Si el campo ya tiene texto, colocar el cursor al final
        if (inputRucRef.current.value) {
          inputRucRef.current.setSelectionRange(inputRucRef.current.value.length, inputRucRef.current.value.length)
        } else {
          inputRucRef.current.select()
        }
      }, 100)
    }
  }, [mostrarFormularioNuevoCliente])

  // Cargar clientes disponibles
  const cargarClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`)
      setClientes(res.data || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      setClientes([])
    }
  }

  // Función para detectar tipo de documento (RUC o Cédula)
  const detectarTipoDocumento = (rucCedula) => {
    const soloNumeros = rucCedula.replace(/\D/g, '')
    if (soloNumeros.length === 10) {
      return 'Cédula'
    } else if (soloNumeros.length === 13) {
      return 'RUC'
    }
    return ''
  }

  // Buscar cliente por RUC/Cédula y prellenar campos
  const buscarClientePorRuc = async (rucCedula) => {
    const rucLimpio = rucCedula.trim()

    if (!rucLimpio || rucLimpio.length < 3) {
      setMostrarFormularioNuevoCliente(false)
      return
    }

    setBuscandoCliente(true)
    setMostrarFormularioNuevoCliente(false)

    try {
      // Buscar en la lista local de clientes
      const soloNumerosBusqueda = rucLimpio.replace(/\D/g, '')
      const clienteEncontrado = clientes.find(cliente => {
        const clienteRuc = cliente.ruc ? cliente.ruc.toString().trim().replace(/\D/g, '') : ''
        return clienteRuc === soloNumerosBusqueda
      })

      if (clienteEncontrado) {
        // Cliente encontrado - prellenar datos
        setClienteId(clienteEncontrado.id)
        setFacturaData(prev => ({
          ...prev,
          clienteRucCedula: clienteEncontrado.ruc || rucLimpio,
          clienteNombre: clienteEncontrado.nombre || '',
          clienteDireccion: clienteEncontrado.direccion || '',
          clienteTelefono: clienteEncontrado.telefono || '',
          clienteEmail: clienteEncontrado.email || '',
          // Integración con campos extendidos (Crédito y Descuento)
          condicionPago: (clienteEncontrado.dias_credito && clienteEncontrado.dias_credito > 0) ? 'CREDITO' : 'CONTADO',
          observaciones: (clienteEncontrado.dias_credito > 0) ? `Crédito a ${clienteEncontrado.dias_credito} días.` : '',
          descuentoCliente: clienteEncontrado.descuento_porcentaje || 0
        }))
        setMostrarFormularioNuevoCliente(false)
        setMostrarRegistrarCliente(false)
        // Mostrar mensaje "Cliente encontrado"
        setMostrarClienteEncontrado(true)
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setMostrarClienteEncontrado(false)
        }, 3000)
      } else {
        // Cliente no encontrado - activar modo registro en el cuadro
        const soloNumeros = rucLimpio.replace(/\D/g, '')
        const tipoDocumento = detectarTipoDocumento(rucLimpio)

        // NO abrir el modal, solo activar el modo registro en el cuadro
        setMostrarFormularioNuevoCliente(false)
        setMostrarRegistrarCliente(true)

        // Limpiar los campos del cliente en facturaData para que el usuario los llene
        setFacturaData(prev => ({
          ...prev,
          clienteRucCedula: soloNumeros || rucLimpio,
          clienteNombre: '',
          clienteDireccion: '',
          clienteTelefono: '',
          clienteEmail: ''
        }))
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
      setMostrarFormularioNuevoCliente(false)
    } finally {
      setBuscandoCliente(false)
    }
  }

  // Guardar nuevo cliente o actualizar existente
  const guardarNuevoCliente = async () => {
    if (!formularioNuevoCliente.nombre || !formularioNuevoCliente.ruc) {
      alert('Nombre y RUC son requeridos')
      return
    }

    setGuardandoCliente(true)
    try {
      const clienteExistente = clientes.find(cliente =>
        cliente.ruc && cliente.ruc.toString().trim() === formularioNuevoCliente.ruc.trim()
      )

      let res
      if (clienteExistente) {
        res = await axios.put(`${API_URL}/clientes/${clienteExistente.id}`, formularioNuevoCliente)
      } else {
        res = await axios.post(`${API_URL}/clientes`, formularioNuevoCliente)
      }

      await cargarClientes()

      setClienteId(res.data.id || clienteExistente?.id)

      setFacturaData(prev => ({
        ...prev,
        clienteRucCedula: res.data.ruc || formularioNuevoCliente.ruc,
        clienteNombre: res.data.nombre || formularioNuevoCliente.nombre,
        clienteDireccion: res.data.direccion || formularioNuevoCliente.direccion,
        clienteTelefono: res.data.telefono || formularioNuevoCliente.telefono,
        clienteEmail: res.data.email || formularioNuevoCliente.email
      }))

      setMensajeExito(clienteExistente ? 'Cliente actualizado exitosamente' : 'Cliente guardado exitosamente')
      setMostrarMensajeExito(true)

      setTimeout(() => {
        setMostrarMensajeExito(false)
        setMostrarFormularioNuevoCliente(false)
        setMostrarRegistrarCliente(false)
        setFormularioNuevoCliente({
          nombre: '',
          ruc: '',
          direccion: '',
          telefono: '',
          email: '',
          fechaNacimiento: '',
          esExtranjero: false,
          tipoDocumento: ''
        })
      }, 2000)
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      alert('Error al guardar el cliente: ' + (error.response?.data?.message || error.message))
    } finally {
      setGuardandoCliente(false)
    }
  }

  const cancelarNuevoCliente = () => {
    setMostrarFormularioNuevoCliente(false)
    setFormularioNuevoCliente({
      nombre: '',
      ruc: '',
      direccion: '',
      telefono: '',
      email: '',
      fechaNacimiento: '',
      esExtranjero: false
    })
  }

  const handleFacturaDataChange = (field, value) => {
    setFacturaData(prev => ({ ...prev, [field]: value }))

    if (field === 'clienteRucCedula') {
      // Ocultar mensaje de cliente encontrado cuando se cambia el RUC
      setMostrarClienteEncontrado(false)
      setMostrarRegistrarCliente(false)

      // Limpiar timeout anterior si existe
      if (timeoutBusquedaRef.current) {
        clearTimeout(timeoutBusquedaRef.current)
      }

      // NO buscar automáticamente al escribir, solo al presionar Enter
      // Esto evita búsquedas innecesarias mientras el usuario escribe
    }
  }

  // Función para manejar la búsqueda de cliente (al Enter o blur)
  const handleBuscarCliente = () => {
    const rucCedula = facturaData.clienteRucCedula
    if (rucCedula && rucCedula.trim().length >= 3) {
      buscarClientePorRuc(rucCedula)
    }
  }

  // Función para verificar si hay datos completos del cliente para editar
  const hayDatosCompletosCliente = () => {
    const tieneRuc = facturaData.clienteRucCedula && facturaData.clienteRucCedula.trim() !== ''
    const tieneNombre = facturaData.clienteNombre && facturaData.clienteNombre.trim() !== ''
    // Consideramos que hay datos completos si tiene al menos RUC/Cédula y Nombre
    return tieneRuc && tieneNombre
  }

  // Función para generar y compartir enlace de edición por WhatsApp
  const generarEnlaceEdicionWhatsApp = () => {
    if (!clienteId && !facturaData.clienteRucCedula) {
      alert('Debe seleccionar o buscar un cliente primero')
      return
    }

    // Generar enlace de edición (usando ID del cliente o RUC como fallback)
    const identificador = clienteId || facturaData.clienteRucCedula
    const baseUrl = window.location.origin
    const enlaceEdicion = `${baseUrl}/cliente/editar?id=${identificador}&nombre=${encodeURIComponent(facturaData.clienteNombre || 'Cliente')}`

    // Mensaje para WhatsApp
    const mensaje = `Hola ${facturaData.clienteNombre || 'Cliente'}, 

Puedes editar y actualizar tus datos de cliente usando el siguiente enlace:

${enlaceEdicion}

Este enlace te permitirá actualizar tu información de contacto.`

    // Abrir WhatsApp con el mensaje
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')
  }

  // Funciones para manejar tipos de pago
  const seleccionarTipoPago = (tipo) => {
    // Calcular saldo pendiente
    const totalPagado = listaPagos.reduce((acc, p) => acc + p.monto, 0)
    const saldoPendiente = Math.max(0, parseFloat((totales.total - totalPagado - totales.retenciones).toFixed(2)))

    if (saldoPendiente <= 0 && tipo !== 'RETENCIONES') {
      alert('El saldo ya está cubierto. Elimine un pago si desea modificar.')
      // return // Permitir si quieren agregar más por alguna razón (propina? cambio?) - mejor no bloquear estricto pero avisar
    }

    switch (tipo) {
      case 'TARJETAS':
        setTipoPagoActual('TARJETA')
        setMontoPago(saldoPendiente > 0 ? saldoPendiente.toString() : '')
        setMostrarModalPago(true)
        break
      case 'EFECTIVO':
        setTipoPagoActual('EFECTIVO')
        setMontoPago(saldoPendiente > 0 ? saldoPendiente.toString() : '')
        setMostrarModalPago(true)
        break
      case 'TRANSFERENCIA':
        setTipoPagoActual('TRANSFERENCIA')
        setMontoPago(saldoPendiente > 0 ? saldoPendiente.toString() : '')
        setMostrarModalPago(true)
        break
      case 'RETENCIONES':
        // Mantener lógica anterior para retenciones ya que es un descuento al total, no un "pago"
        setMostrarModalRetencion(true)
        break
      default:
        return
    }
  }

  // Función para generar link de pago
  const generarLinkPago = async () => {
    if (!facturaData.clienteRucCedula || !facturaData.clienteNombre) {
      alert('Debe completar los datos del cliente (RUC/Cédula y Nombre)')
      return
    }

    if (items.length === 0 || totales.total <= 0) {
      alert('Debe agregar productos a la factura')
      return
    }

    setGenerandoLinkPago(true)
    try {
      // Generar un ID único para el link de pago
      const linkId = `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const baseUrl = window.location.origin

      // Crear el link de pago con los datos de la factura
      const datosPago = {
        facturaId: linkId,
        cliente: {
          ruc: facturaData.clienteRucCedula,
          nombre: facturaData.clienteNombre,
          email: facturaData.clienteEmail,
          telefono: facturaData.clienteTelefono
        },
        total: totales.total,
        items: items.map(item => ({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.subtotal
        })),
        fecha: facturaData.fecha,
        numero: facturaData.numero
      }

      // Guardar datos en localStorage para recuperarlos cuando se acceda al link
      localStorage.setItem(`linkPago_${linkId}`, JSON.stringify(datosPago))

      // Generar el link completo
      const linkCompleto = `${baseUrl}/pago/${linkId}`
      setLinkPago(linkCompleto)
      setMostrarLinkPago(true)

      // Copiar al portapapeles
      navigator.clipboard.writeText(linkCompleto).then(() => {
        alert('Link de pago generado y copiado al portapapeles')
      }).catch(() => {
        alert('Link de pago generado. Cópialo manualmente: ' + linkCompleto)
      })
    } catch (error) {
      console.error('Error al generar link de pago:', error)
      alert('Error al generar el link de pago')
    } finally {
      setGenerandoLinkPago(false)
    }
  }

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleItemTextChange = (id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const agregarFila = () => {
    let nuevoId = 1
    if (items && items.length > 0) {
      const idsExistentes = items.map(i => i.id).filter(id => id !== undefined && id !== null)
      if (idsExistentes.length > 0) {
        nuevoId = Math.max(...idsExistentes) + 1
      }
    }
    const nuevoItem = {
      id: nuevoId,
      codigo: '',
      descripcion: '',
      talla: '',
      color: '',
      cantidad: 0,
      precio: 0,
      descuento: 0,
      subtotal: 0
    }
    setItems(prevItems => {
      if (!prevItems || prevItems.length === 0) {
        return [nuevoItem]
      }
      return [...prevItems, nuevoItem]
    })
  }

  const eliminarFila = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const buscarProductoPorCodigo = async (codigo, itemId) => {
    try {
      const res = await axios.get(`${API_URL}/productos?codigo=${codigo}`)
      if (res.data && res.data.length > 0) {
        const producto = res.data[0]
        handleItemChange(itemId, 'precio', producto.precio || 0)
        handleItemTextChange(itemId, 'descripcion', producto.nombre || producto.descripcion || '')
        handleItemTextChange(itemId, 'talla', producto.talla || '')
        handleItemTextChange(itemId, 'color', producto.color || '')
        handleItemChange(itemId, 'productoId', producto.id)
      }
    } catch (error) {
      console.error('Error al buscar producto:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCambiarPuntoVenta = () => {
    navigate('/facturacion')
  }

  // Verificar si hay datos en la factura actual
  const hayDatosEnFactura = () => {
    // Verificar si hay productos con descripción
    const hayProductos = items && items.some(item => item.descripcion && item.descripcion.trim() !== '')

    // Verificar si hay datos del cliente
    const hayCliente = facturaData.clienteNombre && facturaData.clienteNombre.trim() !== '' ||
      facturaData.clienteRucCedula && facturaData.clienteRucCedula.trim() !== ''

    // Verificar si hay totales distintos de cero
    const hayTotales = totales && (totales.subtotal > 0 || totales.total > 0)

    return hayProductos || hayCliente || hayTotales
  }

  const confirmarNuevaFactura = () => {
    // Limpiar datos de factura pero mantener valores por defecto
    setFacturaData({
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      fecha: new Date().toISOString().split('T')[0],
      vendedor: '',
      tipoPago: 'Transferencia',
      numero: '00001',
      clienteRucCedula: '',
      clienteNombre: '',
      clienteDireccion: '',
      clienteTelefono: '',
      clienteEmail: '',
      emisorRuc: facturaData.emisorRuc || '',
      emisorRazonSocial: facturaData.emisorRazonSocial || '',
      emisorNombreComercial: facturaData.emisorNombreComercial || '',
      emisorDireccionMatriz: facturaData.emisorDireccionMatriz || '',
      emisorDireccionEstablecimiento: facturaData.emisorDireccionEstablecimiento || '',
      emisorTelefono: facturaData.emisorTelefono || '',
      emisorEmail: facturaData.emisorEmail || '',
      establecimiento: facturaData.establecimiento || '001',
      puntoEmision: facturaData.puntoEmision || '001',
      secuencial: '',
      tipoComprobante: '01',
      ambiente: '2',
      claveAcceso: '',
      autorizacion: '',
      fechaAutorizacion: '',
      formaPago: 'SIN UTILIZACION DEL SISTEMA FINANCIERO',
      condicionPago: 'CONTADO',
      metodoPago: 'EFECTIVO',
      fechaContable: new Date().toISOString().split('T')[0],
      cuenta: '',
      observaciones: ''
    })

    // Limpiar items
    setItems([])

    // Reiniciar totales
    setTotales({
      subtotal: 0,
      iva: 0,
      retenciones: 0,
      total: 0,
      totalLetras: 'CERO'
    })

    // Limpiar retenciones
    setRetencionData({
      numero: '',
      valorIR: '',
      valorIVA: '',
      fecha: new Date().toISOString().split('T')[0]
    })

    // Limpiar cliente seleccionado
    setClienteId(null)
    setMostrarFormularioNuevoCliente(false)

    // Cerrar el modal
    setMostrarConfirmarNuevaFactura(false)
  }

  const handleNuevaFactura = () => {
    // Verificar si hay datos antes de mostrar el modal
    if (hayDatosEnFactura()) {
      setMostrarConfirmarNuevaFactura(true)
    } else {
      // Si no hay datos, crear nueva factura directamente
      confirmarNuevaFactura()
    }
  }

  // Función para manejar el cierre de caja
  const handleCierreCaja = async () => {
    setMostrarCierreCaja(true)
    // Inicializar fechas con el día actual si no están configuradas
    const hoy = new Date().toISOString().split('T')[0]
    if (!fechaDesdeCierre) setFechaDesdeCierre(hoy)
    if (!fechaHastaCierre) setFechaHastaCierre(hoy)
  }

  // Función para buscar facturas del cliente para nota de crédito
  const buscarFacturasCliente = async () => {
    // Obtener el RUC/Cédula del campo de cliente
    const rucCedulaBuscado = facturaData.clienteRucCedula ? facturaData.clienteRucCedula.trim() : ''

    if (!rucCedulaBuscado) {
      alert('Por favor, ingrese el RUC/Cédula del cliente primero')
      return
    }

    setCargandoFacturas(true)
    setMostrarBuscarFactura(true)

    try {
      // Buscar facturas del cliente por RUC/Cédula (últimos 30 días)
      const fechaHasta = new Date().toISOString().split('T')[0]
      const fechaDesde = new Date()
      fechaDesde.setDate(fechaDesde.getDate() - 30)
      const fechaDesdeStr = fechaDesde.toISOString().split('T')[0]

      // Buscar todas las facturas del período
      const params = {
        fechaInicio: fechaDesdeStr,
        fechaFin: fechaHasta
      }

      const response = await axios.get(`${API_URL}/facturas/buscar`, { params })
      const facturas = Array.isArray(response.data) ? response.data : []

      // Filtrar solo facturas (no notas de crédito) y del cliente por RUC/Cédula
      const facturasFiltradas = facturas.filter(factura => {
        // Solo facturas (tipo 01), no notas de crédito
        const esFactura = factura.tipo_comprobante === '01' || factura.tipo_comprobante === 1

        if (!esFactura) return false

        // Comparar RUC/Cédula en diferentes ubicaciones de la factura
        const rucFactura = (
          factura.cliente_ruc_cedula ||
          factura.cliente?.ruc_cedula ||
          factura.cliente?.ruc ||
          factura.clienteRucCedula ||
          ''
        ).toString().trim()

        // Comparación exacta (case-insensitive)
        return rucFactura === rucCedulaBuscado || rucFactura.toLowerCase() === rucCedulaBuscado.toLowerCase()
      })

      setFacturasCliente(facturasFiltradas)

      if (facturasFiltradas.length === 0) {
        console.log(`No se encontraron facturas para el RUC/Cédula: ${rucCedulaBuscado}`)
      }
    } catch (error) {
      console.error('Error al buscar facturas:', error)
      setFacturasCliente([])
      alert(`Error al buscar facturas para el RUC/Cédula ${rucCedulaBuscado}: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
    } finally {
      setCargandoFacturas(false)
    }
  }

  // Función para guardar Factura
  const handleGuardarFactura = async (esFirma = false) => {
    if (!facturaData.clienteRucCedula || !facturaData.clienteNombre) {
      alert('Debe completar los datos del cliente (RUC/Cédula y Nombre)')
      return
    }

    if (!facturaData.vendedor || facturaData.vendedor.trim() === '') {
      alert('⚠️ Debe ingresar el nombre del VENDEDOR. Es un campo obligatorio.')
      return
    }

    if (!items || items.length === 0) {
      alert('Debe agregar productos a la factura')
      return
    }

    if (totales.total <= 0) {
      alert('El total de la factura no puede ser cero')
      return
    }

    // Validación de pagos múltiples
    let pagosPayload = []
    let formaPagoPrincipal = facturaData.formaPago || 'SIN UTILIZACION DEL SISTEMA FINANCIERO'
    let metodoPagoPrincipal = facturaData.metodoPago || 'EFECTIVO'

    if (listaPagos.length > 0) {
      const totalPagado = listaPagos.reduce((acc, p) => acc + p.monto, 0)
      const totalAbonar = totales.total - (totales.retenciones || 0)

      // Permitir margen de error de 1 centavo
      if (Math.abs(totalPagado - totalAbonar) > 0.05) {
        alert(`Los pagos registrados ($${totalPagado.toFixed(2)}) no coinciden con el total a pagar ($${totalAbonar.toFixed(2)})`)
        return
      }

      // Construir payload de pagos
      pagosPayload = listaPagos.map(p => {
        let codigoSri = '01' // Efectivo
        let formaPagoDesc = 'SIN UTILIZACION DEL SISTEMA FINANCIERO'

        if (p.tipo === 'TARJETA') {
          codigoSri = '19' // Tarjeta de Crédito
          formaPagoDesc = 'TARJETA DE CRÉDITO'
        } else if (p.tipo === 'TRANSFERENCIA') {
          codigoSri = '20' // Transferencia
          formaPagoDesc = 'OTROS CON UTILIZACION DEL SISTEMA FINANCIERO'
        }

        return {
          codigo: codigoSri,
          formaPago: formaPagoDesc,
          metodoPago: p.tipo,
          tipoPago: p.tipo,
          monto: parseFloat(p.monto),
          detalles: p.detalles
        } // Cierre del obj
      }) // Cierre del map

      // Determinar pago principal (el de mayor monto)
      const pagoMayor = listaPagos.reduce((prev, current) => (prev.monto > current.monto) ? prev : current)
      if (pagoMayor.tipo === 'TARJETA') {
        formaPagoPrincipal = 'TARJETA DE CRÉDITO'
        metodoPagoPrincipal = 'TARJETA'
      } else if (pagoMayor.tipo === 'TRANSFERENCIA') {
        formaPagoPrincipal = 'OTROS CON UTILIZACION DEL SISTEMA FINANCIERO'
        metodoPagoPrincipal = 'TRANSFERENCIA'
      } else {
        formaPagoPrincipal = 'SIN UTILIZACION DEL SISTEMA FINANCIERO'
        metodoPagoPrincipal = 'EFECTIVO'
      }
    }

    if (!window.confirm(esFirma ? '¿Está seguro de guardar y firmar esta factura?' : '¿Está seguro de guardar esta factura?')) {
      return
    }

    try {
      const payload = {
        fecha: facturaData.fecha,
        cliente_id: clienteId,
        subtotal: parseFloat(totales.subtotal),
        impuesto: parseFloat(totales.iva),
        total: parseFloat(totales.total),
        observaciones: facturaData.observaciones || '',

        // Datos instantáneos del cliente
        cliente_nombre: facturaData.clienteNombre,
        cliente_ruc: facturaData.clienteRucCedula,
        cliente_direccion: facturaData.clienteDireccion,
        cliente_telefono: facturaData.clienteTelefono,
        cliente_email: facturaData.clienteEmail,

        // Forma y Metodo de pago
        forma_pago: formaPagoPrincipal,
        condicion_pago: facturaData.condicionPago || 'CONTADO',
        metodoPago: metodoPagoPrincipal,

        // Agregar lista de pagos
        pagos: pagosPayload,

        // Items
        detalles: items.map(item => ({
          producto_id: item.productoId || null,
          codigo: item.codigo,
          descripcion: item.descripcion,
          talla: item.talla || '',
          color: item.color || '',
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio),
          descuento: parseFloat(item.descuento || 0),
          subtotal: parseFloat(item.subtotal),
          impuesto: 0,
          total: parseFloat(item.subtotal)
        })),

        // RETENCIONES RECIBIDAS
        retencion_numero: retencionData.numero || null,
        retencion_valor_ir: parseFloat(retencionData.valorIR) || 0,
        retencion_valor_iva: parseFloat(retencionData.valorIVA) || 0,
        retencion_fecha: retencionData.fecha || null
      }

      await axios.post(`${API_URL}/facturas`, payload)

      alert('✅ Factura guardada exitosamente')

      // Opción para imprimir
      if (window.confirm('¿Desea imprimir el comprobante?')) {
        window.print()
      }

      // Reiniciar formulario
      confirmarNuevaFactura()

    } catch (error) {
      console.error('Error al guardar factura:', error)
      alert(`Error al guardar factura: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
    }
  }

  // Función para guardar Proforma
  const handleGuardarProforma = async () => {
    if (!facturaData.clienteRucCedula || !facturaData.clienteNombre) {
      alert('Debe completar los datos del cliente (RUC/Cédula y Nombre)')
      return
    }

    if (!items || items.length === 0) {
      alert('Debe agregar productos a la cotización')
      return
    }

    // Validar totales
    if (totales.total <= 0) {
      alert('El total de la cotización no puede ser cero')
      return
    }

    if (!window.confirm('¿Está seguro de guardar esta proforma/cotización?')) {
      return
    }

    try {
      const payload = {
        fecha: facturaData.fecha, // Fecha de emisión
        cliente_id: clienteId, // ID del cliente si existe (o null)
        subtotal: parseFloat(totales.subtotal),
        impuesto: parseFloat(totales.iva),
        total: parseFloat(totales.total),
        observaciones: facturaData.observaciones || '',

        // Datos instantáneos del cliente
        cliente_nombre: facturaData.clienteNombre,
        cliente_ruc: facturaData.clienteRucCedula,
        cliente_direccion: facturaData.clienteDireccion,
        cliente_telefono: facturaData.clienteTelefono,
        cliente_email: facturaData.clienteEmail,

        detalles: items.map(item => ({
          producto_id: item.productoId || null,
          codigo: item.codigo,
          descripcion: item.descripcion,
          cantidad: parseFloat(item.cantidad),
          precio_unitario: parseFloat(item.precio),
          descuento: parseFloat(item.descuento || 0),
          subtotal: parseFloat(item.subtotal),
          impuesto: 0, // Simplificación por ahora
          total: parseFloat(item.subtotal) // Simplificación
        }))
      }

      await axios.post(`${API_URL}/proformas`, payload)

      alert('✅ Proforma guardada exitosamente')

      // Reiniciar formulario
      confirmarNuevaFactura()
      setEsProforma(false)

    } catch (error) {
      console.error('Error al guardar proforma:', error)
      alert(`Error al guardar proforma: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
    }
  }

  // Función para buscar facturas de forma general
  const buscarFacturasGeneral = async () => {
    setCargandoFacturasGeneral(true)
    try {
      const params = {
        fechaInicio: filtroBusqueda.fechaDesde,
        fechaFin: filtroBusqueda.fechaHasta
      }

      if (filtroBusqueda.numero) {
        params.numero = filtroBusqueda.numero
      }

      if (filtroBusqueda.cliente) {
        params.cliente = filtroBusqueda.cliente
      }

      const response = await axios.get(`${API_URL}/facturas/buscar`, { params })
      const facturas = Array.isArray(response.data) ? response.data : []
      setFacturasBuscadas(facturas)

      if (facturas.length === 0) {
        alert('No se encontraron facturas con los criterios de búsqueda especificados.')
      }
    } catch (error) {
      console.error('Error al buscar facturas:', error)
      setFacturasBuscadas([])
      alert(`Error al buscar facturas: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
    } finally {
      setCargandoFacturasGeneral(false)
    }
  }

  // Función para anular una factura
  const handleAnularFactura = async (id, numero) => {
    if (!window.confirm(`¿Está seguro que desea anular la factura ${numero}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await axios.post(`${API_URL}/facturas/${id}/anular`)
      alert(`Factura ${numero} anulada exitosamente`)
      // Refrescar la búsqueda si el modal está abierto
      if (mostrarBuscarFacturaGeneral) {
        buscarFacturasGeneral()
      }
    } catch (error) {
      console.error('Error al anular factura:', error)
      alert(`Error al anular la factura: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
    }
  }

  // Función para seleccionar una factura y cargar sus productos
  const seleccionarFacturaParaNotaCredito = (factura) => {
    setFacturaSeleccionada(factura)
    setMostrarBuscarFactura(false)

    // Cargar los productos de la factura (usar 'detalles' que viene del backend)
    if (factura.detalles && Array.isArray(factura.detalles)) {
      const itemsNotaCredito = factura.detalles.map((detalle, index) => ({
        id: index + 1,
        codigo: detalle.producto?.codigo || detalle.codigo || '',
        descripcion: detalle.producto?.nombre || detalle.descripcion || detalle.nombre || '',
        cantidad: parseFloat(detalle.cantidad) || 0,
        precio: parseFloat(detalle.precio_unitario) || parseFloat(detalle.precio) || 0,
        descuento: parseFloat(detalle.descuento) || 0,
        subtotal: parseFloat(detalle.subtotal) || 0
      }))
      setItems(itemsNotaCredito)
    } else if (factura.items && Array.isArray(factura.items)) {
      // Fallback: si viene como 'items' en lugar de 'detalles'
      const itemsNotaCredito = factura.items.map((item, index) => ({
        id: index + 1,
        codigo: item.codigo || item.codigo_barras || '',
        descripcion: item.descripcion || item.nombre || '',
        cantidad: parseFloat(item.cantidad) || 0,
        precio: parseFloat(item.precio) || 0,
        descuento: parseFloat(item.descuento) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      }))
      setItems(itemsNotaCredito)
    } else {
      // Si no hay detalles en la factura, inicializar vacío
      setItems([])
    }

    // Actualizar datos de la factura con los de la factura original
    setFacturaData(prev => ({
      ...prev,
      numero: factura.numero || prev.numero,
      fecha: factura.fecha ? (typeof factura.fecha === 'string' ? factura.fecha.split('T')[0] : factura.fecha) : prev.fecha,
      clienteNombre: factura.cliente_nombre || factura.cliente?.nombre || prev.clienteNombre,
      clienteDireccion: factura.cliente_direccion || factura.cliente?.direccion || prev.clienteDireccion,
      clienteTelefono: factura.cliente_telefono || factura.cliente?.telefono || prev.clienteTelefono,
      clienteEmail: factura.cliente_email || factura.cliente?.email || prev.clienteEmail
    }))
  }

  // Función para calcular el cierre con las fechas seleccionadas
  const calcularCierreConFechas = async () => {
    // Validar que el vendedor esté lleno solo si no hay resumen (primera vez)
    if (!resumenCierreCaja && (!vendedorCierreCaja || vendedorCierreCaja.trim() === '')) {
      setMostrarAlertaVendedor(true)
      return
    }

    setCargandoCierreCaja(true)
    setResumenCierreCaja(null)

    try {
      await calcularResumenCierreCaja(fechaDesdeCierre, fechaHastaCierre)
      // Si llega aquí, todo está bien (incluso si no hay facturas)
    } catch (error) {
      console.error('Error al calcular cierre de caja:', error)
      // Solo mostrar alert si es un error real del servidor (500+)
      if (error.response && error.response.status >= 500) {
        alert('Error al obtener los datos del cierre de caja. Por favor, intente nuevamente.')
      }
      // Para otros errores (404, sin conexión, etc.), ya se configuró el resumen con ceros
    } finally {
      setCargandoCierreCaja(false)
    }
  }

  // Obtener información del usuario actual
  const obtenerUsuarioActual = () => {
    try {
      // Intentar obtener desde Firebase Auth
      if (currentUser) {
        return currentUser.displayName || currentUser.email || 'Usuario'
      }
      // Intentar obtener desde localStorage
      const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('user') || localStorage.getItem('currentUser')
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado)
        return usuario.nombre || usuario.name || usuario.email || 'Usuario'
      }
      // Intentar obtener desde sessionStorage
      const usuarioSession = sessionStorage.getItem('usuario') || sessionStorage.getItem('user')
      if (usuarioSession) {
        const usuario = JSON.parse(usuarioSession)
        return usuario.nombre || usuario.name || usuario.email || 'Usuario'
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error)
    }
    return 'Usuario'
  }

  // Calcular resumen del cierre de caja desde el backend
  const calcularResumenCierreCaja = async (fechaDesde, fechaHasta) => {
    // Usar las fechas proporcionadas o el día actual por defecto
    const fechaInicio = fechaDesde || new Date().toISOString().split('T')[0]
    const fechaFin = fechaHasta || new Date().toISOString().split('T')[0]

    try {
      // Obtener todas las facturas del rango seleccionado desde el backend
      const responseRango = await axios.get(`${API_URL}/facturas/buscar`, {
        params: {
          fechaInicio: fechaInicio,
          fechaFin: fechaFin
        }
      })

      // Asegurarse de que la respuesta sea un array
      const facturasDelRango = Array.isArray(responseRango.data) ? responseRango.data : []



      // Función helper para calcular totales
      const calcularTotales = (facturas) => {
        let totalVentas = 0
        let totalEfectivo = 0
        let totalOtros = 0
        let totalNotasCredito = 0
        let totalEfectivoNotasCredito = 0
        let totalOtrosNotasCredito = 0
        const facturasPorCliente = {}
        const notasCreditoPorCliente = {}
        let cantidadFacturas = 0
        let cantidadNotasCredito = 0

        facturas.forEach((factura) => {
          // Manejar diferentes formatos de total (string o número)
          const total = typeof factura.total === 'string'
            ? parseFloat(factura.total) || 0
            : (factura.total || 0)

          // Determinar si es nota de crédito (tipo_comprobante = '04')
          const esNotaCredito = factura.tipo_comprobante === '04' || factura.tipo_comprobante === 4

          // Clasificar por forma de pago
          const formaPago = (factura.forma_pago || '').toUpperCase()
          const esEfectivo = formaPago.includes('EFECTIVO') || formaPago.includes('SIN UTILIZACION DEL SISTEMA FINANCIERO')

          // Agrupar por cliente
          const clienteId = factura.cliente_id || factura.cliente?.id || 'sin-cliente'
          const clienteNombre = factura.cliente?.nombre || factura.cliente_nombre || 'Sin nombre'
          const clienteRuc = factura.cliente?.ruc_cedula || factura.cliente_ruc_cedula || ''
          const clienteDireccion = factura.cliente?.direccion || factura.cliente_direccion || ''
          const clienteTelefono = factura.cliente?.telefono || factura.cliente_telefono || ''
          const clienteEmail = factura.cliente?.email || factura.cliente_email || ''

          if (esNotaCredito) {
            // Es una nota de crédito (restar)
            totalNotasCredito += total
            cantidadNotasCredito++

            if (esEfectivo) {
              totalEfectivoNotasCredito += total
            } else {
              totalOtrosNotasCredito += total
            }

            // Agrupar notas de crédito por cliente
            if (!notasCreditoPorCliente[clienteId]) {
              notasCreditoPorCliente[clienteId] = {
                clienteId: clienteId,
                nombre: clienteNombre,
                ruc: clienteRuc,
                direccion: clienteDireccion,
                telefono: clienteTelefono,
                email: clienteEmail,
                cantidadNotasCredito: 0,
                totalNotasCredito: 0,
                totalEfectivo: 0,
                totalOtros: 0,
                notasCredito: []
              }
            }

            notasCreditoPorCliente[clienteId].cantidadNotasCredito++
            notasCreditoPorCliente[clienteId].totalNotasCredito += total
            if (esEfectivo) {
              notasCreditoPorCliente[clienteId].totalEfectivo += total
            } else {
              notasCreditoPorCliente[clienteId].totalOtros += total
            }
            notasCreditoPorCliente[clienteId].notasCredito.push({
              id: factura.id,
              numero: factura.numero,
              fecha: factura.fecha,
              total: total,
              formaPago: factura.forma_pago
            })
          } else {
            // Es una factura (sumar)
            totalVentas += total
            cantidadFacturas++

            if (esEfectivo) {
              totalEfectivo += total
            } else {
              totalOtros += total
            }

            // Agrupar facturas por cliente
            if (!facturasPorCliente[clienteId]) {
              facturasPorCliente[clienteId] = {
                clienteId: clienteId,
                nombre: clienteNombre,
                ruc: clienteRuc,
                direccion: clienteDireccion,
                telefono: clienteTelefono,
                email: clienteEmail,
                cantidadFacturas: 0,
                totalVentas: 0,
                totalEfectivo: 0,
                totalOtros: 0,
                facturas: []
              }
            }

            facturasPorCliente[clienteId].cantidadFacturas++
            facturasPorCliente[clienteId].totalVentas += total
            if (esEfectivo) {
              facturasPorCliente[clienteId].totalEfectivo += total
            } else {
              facturasPorCliente[clienteId].totalOtros += total
            }
            facturasPorCliente[clienteId].facturas.push({
              id: factura.id,
              numero: factura.numero,
              fecha: factura.fecha,
              total: total,
              formaPago: factura.forma_pago
            })
          }
        })

        // Calcular totales netos (facturas - notas de crédito)
        const totalNeto = totalVentas - totalNotasCredito
        const totalEfectivoNeto = totalEfectivo - totalEfectivoNotasCredito
        const totalOtrosNeto = totalOtros - totalOtrosNotasCredito

        return {
          totalVentas,
          totalEfectivo,
          totalOtros,
          cantidadFacturas,
          facturasPorCliente: Object.values(facturasPorCliente),
          totalNotasCredito,
          totalEfectivoNotasCredito,
          totalOtrosNotasCredito,
          cantidadNotasCredito,
          notasCreditoPorCliente: Object.values(notasCreditoPorCliente),
          totalNeto,
          totalEfectivoNeto,
          totalOtrosNeto
        }
      }

      // Calcular totales de ventas
      const totalesVentas = calcularTotales(facturasDelRango)

      // ==========================================
      // NUEVA LÓGICA: Incorporar Caja Chica
      // ==========================================
      let totalIngresosCajaChica = 0
      let totalGastosCajaChica = 0
      let movimientosCajaChica = []

      try {
        // Obtener historial del período si tenemos el ID del punto de venta
        if (puntoVenta?.id) {
          const resCaja = await axios.get(`${API_URL}/caja-chica/historial/${puntoVenta.id}`, {
            params: {
              fechaInicio: fechaInicio,
              fechaFin: fechaFin
            }
          })

          if (Array.isArray(resCaja.data)) {
            movimientosCajaChica = resCaja.data

            totalIngresosCajaChica = movimientosCajaChica
              .filter(m => m.tipo === 'INGRESO')
              .reduce((sum, m) => sum + Number(m.monto), 0)

            totalGastosCajaChica = movimientosCajaChica
              .filter(m => m.tipo === 'GASTO')
              .reduce((sum, m) => sum + Number(m.monto), 0)
          }
        }
      } catch (error) {
        console.error('Error al obtener datos de caja chica para cierre:', error)
        // No fallar todo el proceso si falla la caja chica
      }

      // Calcular Total Efectivo Neto (Efectivo Ventas - Gastos + Ingresos Caja Chica)
      // NOTA: Dependiendo de la lógica contable, a veces solo se quieren restar gastos del efectivo.
      // Aquí sumaremos: Efectivo de Ventas + Reposiciones - Gastos
      const totalEfectivoNeto = totalesVentas.totalEfectivo + totalIngresosCajaChica - totalGastosCajaChica

      setResumenCierreCaja({
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        usuario: obtenerUsuarioActual(),
        fechaDesde: fechaInicio,
        fechaHasta: fechaFin,

        // Ventas
        cantidadFacturas: totalesVentas.cantidadFacturas,
        totalVentas: totalesVentas.totalVentas,
        totalEfectivo: totalesVentas.totalEfectivo, // Solo de ventas
        totalOtros: totalesVentas.totalOtros,

        cantidadNotasCredito: totalesVentas.cantidadNotasCredito,
        totalNotasCredito: totalesVentas.totalNotasCredito,

        // Caja Chica
        totalIngresosCajaChica,
        totalGastosCajaChica,

        // Total Final
        totalEfectivoNeto: Math.max(0, totalEfectivoNeto) // No mostrar negativos en resumen general si no se desea
      })

    } catch (error) {
      console.error('Error al calcular resumen:', error)
      alert('Hubo un error al calcular el cierre de caja. Por favor revise la consola.')
    } finally {
      setCargandoCierreCaja(false)
    }
  }





  // Función para ver el detalle de una factura
  const verDetalleFactura = async (id) => {
    setCargandoDetalleFactura(true)
    setMostrarDetalleFactura(true)
    try {
      const response = await axios.get(`${API_URL}/facturas/${id}`)
      setFacturaDetalleSeleccionada(response.data)
    } catch (error) {
      console.error('Error al obtener detalle de factura:', error)
      alert('Error al obtener los detalles de la factura')
      setMostrarDetalleFactura(false)
    } finally {
      setCargandoDetalleFactura(false)
    }
  }

  return (
    <>
      <div className="factura-container" style={{
        transition: 'all 0.3s',
        border: esProforma ? '4px solid #9333ea' : esNotaCredito ? '4px solid #dc2626' : '1px solid #e5e7eb',
        borderRadius: '8px',
        margin: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Banner Visual de Modo */}
        <div style={{
          backgroundColor: esProforma ? '#9333ea' : esNotaCredito ? '#dc2626' : '#2563eb', // Morado, Rojo, Azul
          color: 'white',
          padding: '12px 20px',
          textAlign: 'right',
          fontWeight: '900',
          fontSize: '16px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          position: 'relative',
          height: '45px', // Altura fija para mayor orden
          boxSizing: 'border-box'
        }}>
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 10 }}>
            {/* Botón Inicio */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="no-print"
              title="Ir al Inicio"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              🏠 INICIO
            </button>

            {/* Botones de Acción */}
            <div className="no-print" style={{ display: 'flex', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '8px' }}>
              <button onClick={handleNuevaFactura} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}>➕ NUEVA</button>
              <button
                onClick={() => setEsProforma(!esProforma)}
                style={{ padding: '4px 8px', background: esProforma ? '#dc2626' : 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}
              >
                {esProforma ? "✖ CANCELAR" : "📝 COTIZAR"}
              </button>
              <button
                onClick={() => {
                  const nuevoTipo = facturaData.tipoComprobante === '04' ? '01' : '04';
                  handleFacturaDataChange('tipoComprobante', nuevoTipo);
                  if (nuevoTipo === '04' && facturaData.clienteRucCedula) {
                    buscarFacturasCliente();
                  }
                }}
                style={{ padding: '4px 8px', background: facturaData.tipoComprobante === '04' ? '#dc2626' : 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}
              >
                {facturaData.tipoComprobante === '04' ? "✖ CANCELAR NC" : "📑 NOTA CRÉDITO"}
              </button>
              <button onClick={handleCierreCaja} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}>💰 CIERRE</button>
              <button onClick={() => setMostrarBuscarFacturasModal(true)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}>🔍 BUSCAR</button>
              <button onClick={() => setMostrarCajaChicaModal(true)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}>💸 GASTOS</button>
              <button onClick={handleCambiarPuntoVenta} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', fontWeight: 'bold', fontSize: '9px', cursor: 'pointer' }}>🔄 PV</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {esProforma ? (
              <>📝 COTIZACIÓN</>
            ) : esNotaCredito ? (
              <>📑 NOTA DE CRÉDITO</>
            ) : (
              <>📄 FACTURACIÓN ELECTRÓNICA</>
            )}
          </div>
        </div>
        {/* Modal de confirmación para nueva factura */}
        {mostrarConfirmarNuevaFactura && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => setMostrarConfirmarNuevaFactura(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                marginTop: 0,
                marginBottom: '20px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                Hay datos en la factura actual
              </h3>
              <p style={{
                marginBottom: '30px',
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                ¿Se borrarán los datos de la factura actual?
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={confirmarNuevaFactura}
                  style={{
                    padding: '10px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  Sí
                </button>
                <button
                  onClick={() => setMostrarConfirmarNuevaFactura(false)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para buscar y seleccionar factura original */}
        {mostrarBuscarFactura && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10002,
            }}
            onClick={() => setMostrarBuscarFactura(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '90%',
                width: '800px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#007bff'
                }}>
                  🔍 Seleccionar Factura Original para Nota de Crédito
                </h3>
                <button
                  onClick={() => setMostrarBuscarFactura(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {cargandoFacturas ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Cargando facturas...</p>
                </div>
              ) : facturasCliente.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#6b7280' }}>
                    No se encontraron facturas para este cliente en los últimos 30 días.
                  </p>
                  <button
                    onClick={() => setMostrarBuscarFactura(false)}
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: '15px', color: '#6b7280' }}>
                    Cliente: <strong>{facturaData.clienteNombre || facturaData.clienteRucCedula}</strong>
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Número</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Fecha</th>
                          <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Total</th>
                          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturasCliente.map((factura, idx) => (
                          <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{factura.numero || '-'}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{factura.fecha || '-'}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                              ${(factura.total || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <button
                                onClick={() => seleccionarFacturaParaNotaCredito(factura)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                Seleccionar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal para buscar facturas de forma general */}
        {mostrarBuscarFacturaGeneral && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10003,
            }}
            onClick={() => setMostrarBuscarFacturaGeneral(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '90%',
                width: '1000px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#17a2b8'
                }}>
                  🔍 Buscar Facturas
                </h3>
                <button
                  onClick={() => setMostrarBuscarFacturaGeneral(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Formulario de búsqueda */}
              <div style={{
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                      Número de Factura:
                    </label>
                    <input
                      type="text"
                      value={filtroBusqueda.numero}
                      onChange={(e) => setFiltroBusqueda({ ...filtroBusqueda, numero: e.target.value })}
                      placeholder="Ej: 001-001-000001"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                      Cliente (RUC/Nombre):
                    </label>
                    <input
                      type="text"
                      value={filtroBusqueda.cliente}
                      onChange={(e) => setFiltroBusqueda({ ...filtroBusqueda, cliente: e.target.value })}
                      placeholder="RUC o nombre del cliente"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                      Fecha Desde:
                    </label>
                    <input
                      type="date"
                      value={filtroBusqueda.fechaDesde}
                      onChange={(e) => setFiltroBusqueda({ ...filtroBusqueda, fechaDesde: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                      Fecha Hasta:
                    </label>
                    <input
                      type="date"
                      value={filtroBusqueda.fechaHasta}
                      onChange={(e) => setFiltroBusqueda({ ...filtroBusqueda, fechaHasta: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={buscarFacturasGeneral}
                  disabled={cargandoFacturasGeneral}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: cargandoFacturasGeneral ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    opacity: cargandoFacturasGeneral ? 0.6 : 1
                  }}
                >
                  {cargandoFacturasGeneral ? 'Buscando...' : '🔍 Buscar Facturas'}
                </button>
              </div>

              {/* Resultados */}
              {cargandoFacturasGeneral ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Cargando facturas...</p>
                </div>
              ) : facturasBuscadas.length === 0 && filtroBusqueda.numero ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#6b7280' }}>
                    No se encontraron facturas con los criterios de búsqueda especificados.
                  </p>
                </div>
              ) : facturasBuscadas.length > 0 ? (
                <div>
                  <p style={{ marginBottom: '15px', color: '#6b7280', fontWeight: 'bold' }}>
                    Resultados: {facturasBuscadas.length} factura(s) encontrada(s)
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Número</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Fecha</th>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Cliente</th>
                          <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Total</th>
                          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Tipo</th>
                          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturasBuscadas.map((factura, idx) => (
                          <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{factura.numero || '-'}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                              {factura.fecha ? (typeof factura.fecha === 'string' ? factura.fecha.split('T')[0] : factura.fecha) : '-'}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                              {factura.cliente_nombre || factura.cliente?.nombre || factura.cliente_ruc_cedula || '-'}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                              ${(factura.total || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                              {factura.tipo_comprobante === '01' || factura.tipo_comprobante === 1 ? 'Factura' : 'Nota Crédito'}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                              <button
                                onClick={() => verDetalleFactura(factura.id)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#17a2b8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  marginRight: '5px'
                                }}
                                title="Ver detalle completo"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => navigate('/notas-credito', { state: { facturaSeleccionada: factura } })}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#6610f2',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  marginRight: '5px'
                                }}
                                title="Generar Nota de Crédito"
                              >
                                Nota Crédito
                              </button>
                              <button
                                onClick={() => handleAnularFactura(factura.id, factura.numero)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                                title="Anular factura"
                              >
                                Anular
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Modal de Detalle de Factura */}
        {mostrarDetalleFactura && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10005,
            }}
            onClick={() => setMostrarDetalleFactura(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                maxWidth: '95%',
                width: '1100px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  📄 Detalle de Comprobante: <span style={{ color: '#2563eb' }}>{facturaDetalleSeleccionada?.numero || 'Cargando...'}</span>
                </h2>
                <button
                  onClick={() => setMostrarDetalleFactura(false)}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>

              {cargandoDetalleFactura ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '18px' }}>Cargando información detallada...</p>
                </div>
              ) : facturaDetalleSeleccionada ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ marginTop: 0, fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Información del Cliente</h3>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}><strong>Nombre:</strong> {facturaDetalleSeleccionada.cliente_nombre || facturaDetalleSeleccionada.cliente?.nombre}</p>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}><strong>RUC/Cédula:</strong> {facturaDetalleSeleccionada.cliente_ruc_cedula || facturaDetalleSeleccionada.cliente?.ruc_cedula}</p>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}><strong>Email:</strong> {facturaDetalleSeleccionada.cliente_email || facturaDetalleSeleccionada.cliente?.email || 'N/A'}</p>
                    </div>
                    <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ marginTop: 0, fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Detalles del Comprobante</h3>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}><strong>Fecha:</strong> {new Date(facturaDetalleSeleccionada.fecha).toLocaleDateString()}</p>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}><strong>Estado SRI:</strong>
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: facturaDetalleSeleccionada.estado_sri === 'AUTORIZADO' ? '#dcfce7' : '#fee2e2',
                          color: facturaDetalleSeleccionada.estado_sri === 'AUTORIZADO' ? '#166534' : '#991b1b'
                        }}>
                          {facturaDetalleSeleccionada.estado_sri || 'PENDIENTE'}
                        </span>
                      </p>
                      <p style={{ margin: '8px 0', fontSize: '16px' }}><strong>Pago:</strong> {facturaDetalleSeleccionada.metodo_pago || facturaDetalleSeleccionada.forma_pago}</p>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <tr>
                          <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '13px', color: '#4b5563' }}>Código</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '13px', color: '#4b5563' }}>Descripción</th>
                          <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '13px', color: '#4b5563' }}>Cant.</th>
                          <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', color: '#4b5563' }}>Precio</th>
                          <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', color: '#4b5563' }}>Desc.</th>
                          <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '13px', color: '#4b5563' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(facturaDetalleSeleccionada.detalles || facturaDetalleSeleccionada.items || []).map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px 15px', fontSize: '14px' }}>{item.codigo || item.producto?.codigo || '-'}</td>
                            <td style={{ padding: '12px 15px', fontSize: '14px' }}>{item.descripcion || item.producto?.nombre || '-'}</td>
                            <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'center' }}>{item.cantidad}</td>
                            <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right' }}>${(parseFloat(item.precio_unitario) || parseFloat(item.precio) || 0).toFixed(2)}</td>
                            <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right' }}>${(parseFloat(item.descuento) || 0).toFixed(2)}</td>
                            <td style={{ padding: '12px 15px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold' }}>${(parseFloat(item.subtotal) || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ backgroundColor: '#f9fafb', fontWeight: 'bold' }}>
                        <tr>
                          <td colSpan="5" style={{ padding: '15px', textAlign: 'right' }}>TOTAL:</td>
                          <td style={{ padding: '15px', textAlign: 'right', fontSize: '18px', color: '#2563eb' }}>${(parseFloat(facturaDetalleSeleccionada.total) || 0).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '2px solid #f3f4f6', paddingTop: '20px' }}>
                    <button
                      onClick={() => {
                        setMostrarDetalleFactura(false)
                        handleAnularFactura(facturaDetalleSeleccionada.id, facturaDetalleSeleccionada.numero)
                      }}
                      style={{
                        padding: '12px 25px',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🚫 ANULAR FACTURA
                    </button>
                    <button
                      onClick={() => {
                        setMostrarDetalleFactura(false)
                        navigate('/notas-credito', { state: { facturaSeleccionada: facturaDetalleSeleccionada } })
                      }}
                      style={{
                        padding: '12px 25px',
                        backgroundColor: '#ede9fe',
                        color: '#5b21b6',
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      📑 NOTA DE CRÉDITO
                    </button>
                    <button
                      onClick={() => setMostrarDetalleFactura(false)}
                      style={{
                        padding: '12px 25px',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ textAlign: 'center', padding: '30px' }}>No se pudo cargar la información.</p>
              )}
            </div>
          </div>
        )}

        {/* Modal de Retenciones */}
        {mostrarModalRetencion && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10006,
            }}
            onClick={() => setMostrarModalRetencion(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '450px',
                width: '90%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                marginTop: 0,
                marginBottom: '20px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1e40af',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '10px'
              }}>
                📄 Registrar Retención Recibida
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Número de Comprobante:
                </label>
                <input
                  type="text"
                  value={retencionData.numero}
                  onChange={(e) => setRetencionData({ ...retencionData, numero: e.target.value })}
                  placeholder="001-001-000000001"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Retención IR ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={retencionData.valorIR}
                    onChange={(e) => setRetencionData({ ...retencionData, valorIR: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Retención IVA ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={retencionData.valorIVA}
                    onChange={(e) => setRetencionData({ ...retencionData, valorIVA: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  Fecha de Emisión:
                </label>
                <input
                  type="date"
                  value={retencionData.fecha}
                  onChange={(e) => setRetencionData({ ...retencionData, fecha: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold'
              }}>
                <span>Total Retenido:</span>
                <span style={{ color: '#1e40af' }}>
                  ${((parseFloat(retencionData.valorIR) || 0) + (parseFloat(retencionData.valorIVA) || 0)).toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setMostrarModalRetencion(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!retencionData.numero) {
                      alert('Ingrese el número de comprobante');
                      return;
                    }
                    seleccionarTipoPago('RETENCIONES');
                    setMostrarModalRetencion(false);
                    // Actualizar el total de retenciones si es necesario en el estado global 'totales'
                    // Aunque 'totales' parece derivar de items, podemos dejarlo visual o manejarlo
                    // Para este caso, el dato importante queda en 'retencionData' para el guardado.
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Alerta Vendedor Requerido */}
        {mostrarAlertaVendedor && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
            }}
            onClick={() => setMostrarAlertaVendedor(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '15px'
              }}>
                ⚠️
              </div>
              <h3 style={{
                marginTop: 0,
                marginBottom: '15px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                Vendedor Requerido
              </h3>
              <p style={{
                marginBottom: '25px',
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Por favor, seleccione o escriba un vendedor antes de calcular el cierre de caja.
              </p>
              <button
                onClick={() => setMostrarAlertaVendedor(false)}
                style={{
                  padding: '10px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Modal de Cierre de Caja */}
        {mostrarCierreCaja && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => setMostrarCierreCaja(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '90%',
                width: '1200px',
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'left'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#28a745',
                  flex: 1,
                  textAlign: 'center'
                }}>
                  💰 CIERRE DE CAJA
                </h3>
                <button
                  onClick={() => {
                    setMostrarCierreCaja(false)
                    setResumenCierreCaja(null)
                    setFechaDesdeCierre(new Date().toISOString().split('T')[0])
                    setFechaHastaCierre(new Date().toISOString().split('T')[0])
                    setVendedorCierreCaja('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6'
                    e.target.style.color = '#dc2626'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = '#6b7280'
                  }}
                  title="Cerrar"
                >
                  ×
                </button>
              </div>

              {/* Campos de fecha y botón calcular - Siempre visibles */}
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: resumenCierreCaja ? '1fr 1fr auto' : '1fr 1fr 1fr auto',
                  gap: '10px',
                  alignItems: 'end',
                  marginBottom: '15px'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Fecha Desde:
                    </label>
                    <input
                      type="date"
                      value={fechaDesdeCierre}
                      onChange={(e) => setFechaDesdeCierre(e.target.value)}
                      disabled={cargandoCierreCaja}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: cargandoCierreCaja ? '#e5e7eb' : 'white',
                        cursor: cargandoCierreCaja ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Fecha Hasta:
                    </label>
                    <input
                      type="date"
                      value={fechaHastaCierre}
                      onChange={(e) => setFechaHastaCierre(e.target.value)}
                      disabled={cargandoCierreCaja}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: cargandoCierreCaja ? '#e5e7eb' : 'white',
                        cursor: cargandoCierreCaja ? 'not-allowed' : 'pointer'
                      }}
                    />
                  </div>
                  {!resumenCierreCaja && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                        Vendedor *:
                      </label>
                      <input
                        type="text"
                        list="vendedores-cierre-list"
                        value={vendedorCierreCaja}
                        onChange={(e) => setVendedorCierreCaja(e.target.value)}
                        placeholder={!vendedorCierreCaja ? "Escriba o seleccione un vendedor" : ""}
                        required
                        disabled={cargandoCierreCaja}
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '14px',
                          border: `1px solid ${!vendedorCierreCaja ? '#dc2626' : '#d1d5db'}`,
                          borderRadius: '4px',
                          color: vendedorCierreCaja ? '#000000' : '#dc2626',
                          backgroundColor: cargandoCierreCaja ? '#e5e7eb' : 'white',
                          cursor: cargandoCierreCaja ? 'not-allowed' : 'pointer'
                        }}
                      />
                      <datalist id="vendedores-cierre-list">
                        <option value="Vendedor 1">Vendedor 1</option>
                        <option value="Vendedor 2">Vendedor 2</option>
                        <option value="Vendedor 3">Vendedor 3</option>
                        <option value="Vendedor 4">Vendedor 4</option>
                        <option value="Vendedor 5">Vendedor 5</option>
                      </datalist>
                    </div>
                  )}
                  <button
                    onClick={calcularCierreConFechas}
                    disabled={cargandoCierreCaja}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: cargandoCierreCaja ? '#6c757d' : '#28a745',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: cargandoCierreCaja ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                      height: 'fit-content',
                      opacity: cargandoCierreCaja ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!cargandoCierreCaja) {
                        e.target.style.backgroundColor = '#218838'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!cargandoCierreCaja) {
                        e.target.style.backgroundColor = '#28a745'
                      }
                    }}
                  >
                    {cargandoCierreCaja ? 'Calculando...' : resumenCierreCaja ? 'Actualizar' : 'Calcular'}
                  </button>
                </div>
              </div>

              {cargandoCierreCaja ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '16px'
                }}>
                  Cargando datos del cierre de caja...
                </div>
              ) : resumenCierreCaja ? (
                <>
                  {/* Información general */}
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px'
                  }}>
                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                      <strong>Fecha del Cierre:</strong> {resumenCierreCaja.fecha}
                    </div>
                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                      <strong>Hora:</strong> {resumenCierreCaja.hora}
                    </div>
                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                      <strong>Realizado por:</strong> {resumenCierreCaja.usuario || 'Usuario'}
                    </div>
                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
                      <strong>Período:</strong> {resumenCierreCaja.fechaDesde} hasta {resumenCierreCaja.fechaHasta}
                    </div>
                  </div>

                  {/* Resumen del Período Seleccionado */}
                  <div style={{
                    marginBottom: '30px',
                    padding: '15px',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '6px',
                    border: '2px solid #0284c7'
                  }}>
                    <h4 style={{
                      marginTop: 0,
                      marginBottom: '15px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#0284c7'
                    }}>
                      📅 RESUMEN DEL PERÍODO ({resumenCierreCaja.fechaDesde} - {resumenCierreCaja.fechaHasta})
                    </h4>
                    {/* Facturas */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '10px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '4px'
                    }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#0284c7' }}>
                        Facturas
                      </h5>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px',
                        marginBottom: '10px'
                      }}>
                        <div><strong>Cantidad:</strong> {resumenCierreCaja.cantidadFacturas || 0}</div>
                        <div style={{ textAlign: 'right' }}>
                          <strong>Total:</strong>
                          <span style={{ color: '#059669', fontWeight: 'bold', marginLeft: '10px' }}>
                            ${(resumenCierreCaja.totalVentas || 0).toFixed(2)}
                          </span>
                        </div>
                        <div><strong>Efectivo:</strong> ${(resumenCierreCaja.totalEfectivo || 0).toFixed(2)}</div>
                        <div style={{ textAlign: 'right' }}>
                          <strong>Otros Medios:</strong> ${(resumenCierreCaja.totalOtros || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>


                    {/* Sección Caja Chica */}
                    <div style={{
                      marginBottom: '20px',
                      padding: '10px',
                      backgroundColor: '#fff7ed', // Naranja muy claro
                      borderRadius: '4px',
                      border: '1px solid #fd7e14'
                    }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#c2410c' }}>
                        Caja Chica / Movimientos
                      </h5>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px',
                        marginBottom: '10px'
                      }}>
                        <div><strong>Reposiciones (Ingresos):</strong></div>
                        <div style={{ textAlign: 'right', color: '#166534' }}>
                          + ${(resumenCierreCaja.totalIngresosCajaChica || 0).toFixed(2)}
                        </div>

                        <div><strong>Gastos Operativos:</strong></div>
                        <div style={{ textAlign: 'right', color: '#dc2626' }}>
                          - ${(resumenCierreCaja.totalGastosCajaChica || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Resumen Final de Efectivo */}
                    <div style={{
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#d1fae5',
                      borderRadius: '8px',
                      border: '2px solid #059669',
                      textAlign: 'center'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#065f46' }}>TOTAL EFECTIVO EN CAJA</h4>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                        ${(resumenCierreCaja.totalEfectivoNeto || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857', marginTop: '5px' }}>
                        (Efectivo Ventas + Reposiciones - Gastos)
                      </div>
                    </div>

                    {/* Notas de Crédito */}
                    {(resumenCierreCaja.cantidadNotasCredito || 0) > 0 && (
                      <div style={{
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '4px',
                        border: '1px solid #fca5a5'
                      }}>
                        <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#dc2626' }}>
                          📄 Notas de Crédito
                        </h5>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '10px',
                          marginBottom: '10px'
                        }}>
                          <div><strong>Cantidad:</strong> {resumenCierreCaja.cantidadNotasCredito || 0}</div>
                          <div style={{ textAlign: 'right' }}>
                            <strong>Total:</strong>
                            <span style={{ color: '#dc2626', fontWeight: 'bold', marginLeft: '10px' }}>
                              -${(resumenCierreCaja.totalNotasCredito || 0).toFixed(2)}
                            </span>
                          </div>
                          <div><strong>Efectivo:</strong> -${(resumenCierreCaja.totalEfectivoNotasCredito || 0).toFixed(2)}</div>
                          <div style={{ textAlign: 'right' }}>
                            <strong>Otros Medios:</strong> -${(resumenCierreCaja.totalOtrosNotasCredito || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Totales Netos */}
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '4px',
                      border: '2px solid #16a34a'
                    }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#16a34a' }}>
                        💰 Totales Netos (Facturas - Notas de Crédito)
                      </h5>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px'
                      }}>
                        <div><strong>Total Neto:</strong></div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '18px' }}>
                            ${(resumenCierreCaja.totalNeto || 0).toFixed(2)}
                          </span>
                        </div>
                        <div><strong>Efectivo Neto:</strong> ${(resumenCierreCaja.totalEfectivoNeto || 0).toFixed(2)}</div>
                        <div style={{ textAlign: 'right' }}>
                          <strong>Otros Medios Neto:</strong> ${(resumenCierreCaja.totalOtrosNeto || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Detalle por Cliente - Facturas */}
                    {resumenCierreCaja.facturasPorCliente && resumenCierreCaja.facturasPorCliente.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Detalle Facturas por Cliente:</h5>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#0284c7', color: 'white' }}>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>RUC/Cédula</th>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Nombre</th>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Dirección</th>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Teléfono</th>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                                <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>Facturas</th>
                                <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resumenCierreCaja.facturasPorCliente.map((cliente, idx) => (
                                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{cliente.ruc || '-'}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{cliente.nombre}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{cliente.direccion || '-'}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{cliente.telefono || '-'}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{cliente.email || '-'}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{cliente.cantidadFacturas}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                                    ${cliente.totalVentas.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    marginTop: '20px'
                  }}>
                    <button
                      onClick={() => {
                        // Limpiar y permitir nuevo cálculo
                        setResumenCierreCaja(null)
                        setFechaDesdeCierre(new Date().toISOString().split('T')[0])
                        setFechaHastaCierre(new Date().toISOString().split('T')[0])
                        setVendedorCierreCaja('')
                      }}
                      style={{
                        padding: '10px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#6c757d',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        minWidth: '150px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                      🔄 Nuevo Cálculo
                    </button>
                    <button
                      onClick={() => {
                        alert('Cierre de caja registrado exitosamente')
                        setMostrarCierreCaja(false)
                        setResumenCierreCaja(null)
                        setFechaDesdeCierre(new Date().toISOString().split('T')[0])
                        setFechaHastaCierre(new Date().toISOString().split('T')[0])
                        setVendedorCierreCaja('')
                      }}
                      style={{
                        padding: '10px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#28a745',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        minWidth: '150px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                      ✓ Confirmar Cierre
                    </button>
                    <button
                      onClick={() => {
                        setMostrarCierreCaja(false)
                        setResumenCierreCaja(null)
                        setFechaDesdeCierre(new Date().toISOString().split('T')[0])
                        setFechaHastaCierre(new Date().toISOString().split('T')[0])
                        setVendedorCierreCaja('')
                      }}
                      style={{
                        padding: '10px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        minWidth: '150px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  No se pudieron cargar los datos del cierre de caja
                </div>
              )}
            </div>
          </div>
        )}

        <div className="factura-content">

          {/* Header con Datos del Cliente, Datos de la Factura y Datos del Emisor */}
          <div className="header-datos">
            {/* Datos del Cliente */}
            <div
              className={`datos-cliente ${mostrarRegistrarCliente ? 'modo-registro' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 className="titulo-datos" style={{ margin: 0, flex: 1 }}>Datos del Cliente</h3>
                <button
                  type="button"
                  onClick={() => {
                    const nuevoModoEdicion = !modoEdicionDatosCliente

                    if (nuevoModoEdicion) {
                      // Al activar edición, guardar los valores originales
                      setDatosClienteOriginales({
                        clienteRucCedula: facturaData.clienteRucCedula || '',
                        clienteNombre: facturaData.clienteNombre || '',
                        clienteDireccion: facturaData.clienteDireccion || '',
                        clienteTelefono: facturaData.clienteTelefono || '',
                        clienteEmail: facturaData.clienteEmail || ''
                      })
                    } else {
                      // Al desactivar edición desde el icono, también revertir cambios
                      if (datosClienteOriginales) {
                        setFacturaData(prev => ({
                          ...prev,
                          clienteRucCedula: datosClienteOriginales.clienteRucCedula,
                          clienteNombre: datosClienteOriginales.clienteNombre,
                          clienteDireccion: datosClienteOriginales.clienteDireccion,
                          clienteTelefono: datosClienteOriginales.clienteTelefono,
                          clienteEmail: datosClienteOriginales.clienteEmail
                        }))
                        setDatosClienteOriginales(null)
                      }
                    }

                    setModoEdicionDatosCliente(nuevoModoEdicion)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--azul-electrico)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = modoEdicionDatosCliente ? 'var(--azul-electrico)' : '#666'
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: modoEdicionDatosCliente ? 'var(--azul-electrico)' : '#666',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                    marginLeft: '8px'
                  }}
                  title={modoEdicionDatosCliente ? "Desactivar edición" : "Activar edición"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
              {mostrarClienteEncontrado && (
                <div style={{
                  marginBottom: '8px',
                  padding: '6px',
                  background: '#d4edda',
                  border: '1px solid #28a745',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#155724',
                  fontWeight: '600'
                }}>
                  ✅ Cliente encontrado
                </div>
              )}
              {mostrarRegistrarCliente && (
                <div style={{
                  marginBottom: '8px',
                  padding: '6px',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#856404',
                  fontWeight: '600'
                }}>
                  ⚠️ Registre al cliente
                </div>
              )}
              <div className="datos-grid">
                <div className="dato-item">
                  <label>RUC/Cédula:</label>
                  <input
                    type="text"
                    value={facturaData.clienteRucCedula || ''}
                    onChange={(e) => handleFacturaDataChange('clienteRucCedula', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const valor = facturaData.clienteRucCedula?.trim() || ''
                        const soloNumeros = valor.replace(/\D/g, '')
                        if (soloNumeros.length === 10 || soloNumeros.length === 13) {
                          buscarClientePorRuc(valor)
                        }
                      }
                    }}
                    placeholder="Ingrese RUC/Cédula"
                    className="dato-input"
                    style={{ cursor: 'text' }}
                  />
                </div>
                <div className="dato-item">
                  <label>Razón Social:</label>
                  <input
                    type="text"
                    value={facturaData.clienteNombre || ''}
                    onChange={(e) => {
                      const valorMayusculas = e.target.value.toUpperCase()
                      handleFacturaDataChange('clienteNombre', valorMayusculas)
                    }}
                    placeholder="Ingrese Razón Social"
                    className="dato-input"
                    style={{ cursor: modoEdicionDatosCliente ? 'text' : 'not-allowed' }}
                    readOnly={!modoEdicionDatosCliente}
                  />
                </div>
                <div className="dato-item">
                  <label>Dirección:</label>
                  <input
                    type="text"
                    value={facturaData.clienteDireccion || ''}
                    onChange={(e) => {
                      const valorMayusculas = e.target.value.toUpperCase()
                      handleFacturaDataChange('clienteDireccion', valorMayusculas)
                    }}
                    placeholder="Ingrese Dirección"
                    className="dato-input"
                    style={{ cursor: modoEdicionDatosCliente ? 'text' : 'not-allowed' }}
                    readOnly={!modoEdicionDatosCliente}
                  />
                </div>
                <div className="dato-item">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={facturaData.clienteTelefono || ''}
                    onChange={(e) => {
                      const soloNumeros = e.target.value.replace(/\D/g, '')
                      handleFacturaDataChange('clienteTelefono', soloNumeros)
                    }}
                    placeholder="Ingrese Teléfono"
                    className="dato-input"
                    style={{ cursor: modoEdicionDatosCliente ? 'text' : 'not-allowed' }}
                    readOnly={!modoEdicionDatosCliente}
                  />
                </div>
                <div className="dato-item">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={facturaData.clienteEmail || ''}
                    onChange={(e) => {
                      const valorMinusculas = e.target.value.toLowerCase()
                      handleFacturaDataChange('clienteEmail', valorMinusculas)
                    }}
                    placeholder="Ingrese Email"
                    className="dato-input"
                    style={{ cursor: modoEdicionDatosCliente ? 'text' : 'not-allowed' }}
                    readOnly={!modoEdicionDatosCliente}
                  />
                </div>
              </div>
              {modoEdicionDatosCliente && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  width: '100%'
                }}>
                  <button
                    onClick={async () => {
                      if (!facturaData.clienteNombre || !facturaData.clienteRucCedula) {
                        alert('Nombre y RUC/Cédula son requeridos')
                        return
                      }

                      setGuardandoCambiosCliente(true)
                      try {
                        const soloNumeros = facturaData.clienteRucCedula.replace(/\D/g, '')

                        const datosCliente = {
                          nombre: facturaData.clienteNombre,
                          ruc: soloNumeros || facturaData.clienteRucCedula,
                          direccion: facturaData.clienteDireccion || '',
                          telefono: facturaData.clienteTelefono || '',
                          email: facturaData.clienteEmail || '',
                          esExtranjero: false
                        }

                        // Si hay clienteId, actualizar. Si no, buscar el cliente por RUC
                        let idClienteParaActualizar = clienteId

                        if (!idClienteParaActualizar) {
                          // Buscar el cliente por RUC en la lista local
                          const clienteExistente = clientes.find(cliente => {
                            const clienteRuc = cliente.ruc ? cliente.ruc.toString().trim().replace(/\D/g, '') : ''
                            return clienteRuc === soloNumeros
                          })

                          if (clienteExistente) {
                            idClienteParaActualizar = clienteExistente.id
                            setClienteId(clienteExistente.id)
                          } else {
                            alert('No se encontró el cliente. Por favor, primero busque el cliente por RUC/Cédula.')
                            setGuardandoCambiosCliente(false)
                            return
                          }
                        }

                        await axios.put(`${API_URL}/clientes/${idClienteParaActualizar}`, datosCliente)
                        await cargarClientes()

                        setModoEdicionDatosCliente(false)
                        setDatosClienteOriginales(null)
                        setMostrarMensajeCambiosGuardados(true)

                        setTimeout(() => {
                          setMostrarMensajeCambiosGuardados(false)
                        }, 3000)
                      } catch (error) {
                        console.error('Error al guardar cambios:', error)
                        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
                        alert(`Error al guardar los cambios: ${errorMessage}`)
                      } finally {
                        setGuardandoCambiosCliente(false)
                      }
                    }}
                    disabled={guardandoCambiosCliente}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: guardandoCambiosCliente ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: guardandoCambiosCliente ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {guardandoCambiosCliente ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  <button
                    onClick={() => {
                      // Revertir los cambios restaurando los valores originales
                      if (datosClienteOriginales) {
                        setFacturaData(prev => ({
                          ...prev,
                          clienteRucCedula: datosClienteOriginales.clienteRucCedula,
                          clienteNombre: datosClienteOriginales.clienteNombre,
                          clienteDireccion: datosClienteOriginales.clienteDireccion,
                          clienteTelefono: datosClienteOriginales.clienteTelefono,
                          clienteEmail: datosClienteOriginales.clienteEmail
                        }))
                      }
                      setModoEdicionDatosCliente(false)
                      setDatosClienteOriginales(null)
                    }}
                    disabled={guardandoCambiosCliente}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: guardandoCambiosCliente ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
              {mostrarMensajeCambiosGuardados && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px',
                  background: '#d4edda',
                  border: '1px solid #28a745',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#155724',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  ✅ Cambios guardados
                </div>
              )}
              {mostrarRegistrarCliente && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  width: '100%'
                }}>
                  <button
                    onClick={async () => {
                      if (!facturaData.clienteNombre || !facturaData.clienteRucCedula) {
                        alert('Nombre y RUC/Cédula son requeridos')
                        return
                      }

                      setGuardandoCliente(true)
                      try {
                        const soloNumeros = facturaData.clienteRucCedula.replace(/\D/g, '')
                        const tipoDocumento = detectarTipoDocumento(facturaData.clienteRucCedula)

                        const datosCliente = {
                          nombre: facturaData.clienteNombre,
                          ruc: soloNumeros || facturaData.clienteRucCedula,
                          direccion: facturaData.clienteDireccion || '',
                          telefono: facturaData.clienteTelefono || '',
                          email: facturaData.clienteEmail || '',
                          esExtranjero: false
                        }

                        const clienteExistente = clientes.find(cliente =>
                          cliente.ruc && cliente.ruc.toString().trim() === datosCliente.ruc.trim()
                        )

                        let res
                        if (clienteExistente) {
                          res = await axios.put(`${API_URL}/clientes/${clienteExistente.id}`, datosCliente)
                        } else {
                          res = await axios.post(`${API_URL}/clientes`, datosCliente)
                        }

                        await cargarClientes()

                        setClienteId(res.data.id || clienteExistente?.id)
                        setMostrarRegistrarCliente(false)
                        setMensajeExito(clienteExistente ? 'Cliente actualizado exitosamente' : 'Cliente guardado exitosamente')
                        setMostrarMensajeExito(true)

                        setTimeout(() => {
                          setMostrarMensajeExito(false)
                        }, 2000)
                      } catch (error) {
                        console.error('Error al guardar cliente:', error)
                        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
                        alert(`Error al guardar el cliente: ${errorMessage}`)
                      } finally {
                        setGuardandoCliente(false)
                      }
                    }}
                    disabled={guardandoCliente}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: guardandoCliente ? '#6c757d' : 'var(--azul-electrico)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: guardandoCliente ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {guardandoCliente ? 'Guardando...' : '💾 Guardar Cliente'}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarRegistrarCliente(false)
                      setFacturaData(prev => ({
                        ...prev,
                        clienteRucCedula: '',
                        clienteNombre: '',
                        clienteDireccion: '',
                        clienteTelefono: '',
                        clienteEmail: ''
                      }))
                    }}
                    disabled={guardandoCliente}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: guardandoCliente ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Datos de la Factura */}
            <div className="datos-factura">
              <h3 className="titulo-datos">{esProforma ? "Datos de la Proforma" : "Datos de la Factura"}</h3>
              <div className="datos-grid">
                <div className="dato-item">
                  <label>Número:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{facturaData.numero || '-'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarBuscarFacturaGeneral(true)
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0056b3'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--azul-electrico)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                      style={{
                        background: 'var(--azul-electrico)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0, 210, 255, 0.3)'
                      }}
                      title="Buscar factura"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      BUSCAR FACTURA
                    </button>
                  </div>
                </div>
                <div className="dato-item">
                  <label>Fecha:</label>
                  <span>{facturaData.fecha || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Establecimiento:</label>
                  <span>{facturaData.establecimiento || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Punto de Emisión:</label>
                  <span>{facturaData.puntoEmision || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Secuencial:</label>
                  <span>{facturaData.secuencial || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Tipo Comprobante:</label>
                  <span>{facturaData.tipoComprobante === '01' ? 'Factura' : facturaData.tipoComprobante === '04' ? 'Nota de Crédito' : facturaData.tipoComprobante || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Ambiente:</label>
                  <span>{facturaData.ambiente === '1' ? 'Producción' : facturaData.ambiente === '2' ? 'Pruebas' : facturaData.ambiente || '-'}</span>
                </div>
              </div>
            </div>

            {/* Datos del Emisor */}
            <div className="datos-emisor">
              <h3 className="titulo-datos">Datos del Emisor</h3>
              <div className="datos-grid">
                <div className="dato-item">
                  <label>RUC:</label>
                  <span>{cleanText(facturaData.emisorRuc) || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Razón Social:</label>
                  <span>{cleanText(facturaData.emisorRazonSocial) || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Nombre Comercial:</label>
                  <span>{cleanText(facturaData.emisorNombreComercial) || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Dirección Matriz:</label>
                  <span>{cleanText(facturaData.emisorDireccionMatriz) || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Dirección Establecimiento:</label>
                  <span>{cleanText(facturaData.emisorDireccionEstablecimiento) || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Teléfono:</label>
                  <span>{cleanText(facturaData.emisorTelefono) || '-'}</span>
                </div>
                <div className="dato-item">
                  <label>Email:</label>
                  <span>{cleanText(facturaData.emisorEmail) || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Lineal - Sin paneles laterales */}
          <div className="factura-body-linear" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Panel Central - Productos */}
            <div className="panel" style={{ flex: '1', overflow: 'visible', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
              <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--azul-oscuro)', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  Productos
                  <span style={{
                    backgroundColor: 'var(--azul-electrico)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {items ? items.filter(item => item && (item.descripcion || item.codigoBarras || item.cantidad)).length : 0}
                  </span>
                </div>

                <div className="no-print" style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', whiteSpace: 'nowrap' }}>🔍 STOCK:</label>
                    <input
                      type="text"
                      value={facturaData.claveAcceso || ''}
                      onChange={(e) => handleFacturaDataChange('claveAcceso', e.target.value)}
                      style={{ width: '120px', padding: '1px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', height: '20px' }}
                      placeholder="Buscar..."
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', whiteSpace: 'nowrap' }}>👤 VENDEDOR:</label>
                    <input
                      type="text"
                      value={facturaData.vendedor || ''}
                      onChange={(e) => handleFacturaDataChange('vendedor', e.target.value)}
                      style={{
                        width: '120px',
                        padding: '1px 5px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        height: '20px',
                        border: !facturaData.vendedor ? '2px solid #ef4444' : '1px solid #cbd5e1',
                        backgroundColor: !facturaData.vendedor ? '#fef2f2' : 'white'
                      }}
                      placeholder="Vendedor..."
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', whiteSpace: 'nowrap' }}>📦 PRODUCTO:</label>
                    <select style={{ width: '120px', padding: '0 2px', fontSize: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', height: '20px' }}>
                      <option>Añadir...</option>
                    </select>
                  </div>
                </div>
              </h3>
              <div className="grid-container">
                {/* Grid Header */}
                <div
                  className="grid-header"
                  style={{
                    gridTemplateColumns: `${columnWidths.codigo}px minmax(${columnWidths.descripcion}px, 1fr) ${columnWidths.talla}px ${columnWidths.color}px ${columnWidths.cantidad}px ${columnWidths.precio}px ${columnWidths.descuento}px ${columnWidths.subtotal}px 50px`
                  }}
                >
                  <div className="grid-header-cell">
                    CÓDIGO
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'codigo')}></div>
                  </div>
                  <div className="grid-header-cell">
                    DESCRIPCIÓN
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'descripcion')}></div>
                  </div>
                  <div className="grid-header-cell">
                    TALLA
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'talla')}></div>
                  </div>
                  <div className="grid-header-cell">
                    COLOR
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'color')}></div>
                  </div>
                  <div className="grid-header-cell">
                    CANT.
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'cantidad')}></div>
                  </div>
                  <div className="grid-header-cell">
                    PRECIO
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'precio')}></div>
                  </div>
                  <div className="grid-header-cell">
                    DESC %
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'descuento')}></div>
                  </div>
                  <div className="grid-header-cell">
                    SUBTOTAL
                    <div className="resizer" onMouseDown={(e) => handleResizeStart(e, 'subtotal')}></div>
                  </div>
                  <div className="grid-header-cell"></div>
                </div>

                {/* Grid Body */}
                <div className="grid-body">
                  {items && items.length > 0 ? (
                    items.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid-row"
                        style={{
                          gridTemplateColumns: `${columnWidths.codigo}px minmax(${columnWidths.descripcion}px, 1fr) ${columnWidths.talla}px ${columnWidths.color}px ${columnWidths.cantidad}px ${columnWidths.precio}px ${columnWidths.descuento}px ${columnWidths.subtotal}px 50px`
                        }}
                      >
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'codigo', e.target.textContent)}
                        >
                          {item.codigo || ''}
                        </div>
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'descripcion', e.target.textContent)}
                        >
                          {item.descripcion || ''}
                        </div>
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'talla', e.target.textContent)}
                          style={{ fontWeight: 'bold', color: '#1e40af' }}
                        >
                          {item.talla || ''}
                        </div>
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'color', e.target.textContent)}
                          style={{ fontWeight: 'bold', color: '#1e40af' }}
                        >
                          {item.color || ''}
                        </div>
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'cantidad', parseFloat(e.target.textContent) || 0)}
                        >
                          {item.cantidad || 0}
                        </div>
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'precio', parseFloat(e.target.textContent) || 0)}
                        >
                          {item.precio ? item.precio.toFixed(2) : '0.00'}
                        </div>
                        <div
                          className="grid-cell"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => handleItemChange(item.id, 'descuento', parseFloat(e.target.textContent) || 0)}
                        >
                          {item.descuento || 0}
                        </div>
                        <div className="grid-cell grid-cell-readonly">
                          {item.subtotal ? item.subtotal.toFixed(2) : '0.00'}
                        </div>
                        <div className="grid-cell grid-cell-button">
                          <button
                            onClick={() => eliminarFila(item.id)}
                            className="grid-delete-btn"
                            title="Eliminar"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.5 5.5C5.77614 5.5 6 5.72386 6 6V12C6 12.2761 5.77614 12.5 5.5 12.5C5.22386 12.5 5 12.2761 5 12V6C5 5.72386 5.22386 5.5 5.5 5.5Z" fill="currentColor" />
                              <path d="M8 5.5C8.27614 5.5 8.5 5.72386 8.5 6V12C8.5 12.2761 8.27614 12.5 8 12.5C7.72386 12.5 7.5 12.2761 7.5 12V6C7.5 5.72386 7.72386 5.5 8 5.5Z" fill="currentColor" />
                              <path d="M10.5 6C10.5 5.72386 10.7239 5.5 11 5.5C11.2761 5.5 11.5 5.72386 11.5 6V12C11.5 12.2761 11.2761 12.5 11 12.5C10.7239 12.5 10.5 12.2761 10.5 12V6Z" fill="currentColor" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M10.5 1.5C10.5 1.22386 10.7239 1 11 1H12C12.2761 1 12.5 1.22386 12.5 1.5V2H14C14.2761 2 14.5 2.22386 14.5 2.5C14.5 2.77614 14.2761 3 14 3H13.5V13.5C13.5 14.3284 12.8284 15 12 15H4C3.17157 15 2.5 14.3284 2.5 13.5V3H2C1.72386 3 1.5 2.77614 1.5 2.5C1.5 2.22386 1.72386 2 2 2H3.5V1.5C3.5 1.22386 3.72386 1 4 1H5C5.27614 1 5.5 1.22386 5.5 1.5V2H10.5V1.5ZM4 3V13.5H12V3H4Z" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid-row">
                      <div className="grid-cell" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#999' }}>
                        No hay productos
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={agregarFila}
                style={{
                  marginTop: '4px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  background: 'var(--azul-electrico)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  alignSelf: 'flex-start',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                + Agregar Fila
              </button>
            </div>

            {/* Sección Inferior: Totales y Pagos */}
            {/* Sección Inferior: Totales y Pagos */}
            <div style={{
              borderTop: '2px solid #e2e8f0',
              padding: '8px 0',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {/* Parte Izquierda: Info y Toggle de Pagos */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <button
                      onClick={() => setMostrarSeccionPago(!mostrarSeccionPago)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: mostrarSeccionPago ? '#64748b' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {mostrarSeccionPago ? '✕ CERRAR MÉTODOS PAGO' : '💰 AÑADIR MÉTODOS DE PAGO'}
                    </button>
                    <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#856404', flex: 1 }}>
                      SON: {totales.totalLetras}
                    </div>
                  </div>

                  {listaPagos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {listaPagos.map(pago => (
                        <div key={pago.id} style={{
                          backgroundColor: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid #cbd5e1'
                        }}>
                          <span style={{ fontWeight: 'bold', color: '#1e40af' }}>{pago.tipo === 'TARJETA' ? '💳' : pago.tipo === 'EFECTIVO' ? '💵' : '🏦'} {pago.tipo}:</span>
                          <span style={{ fontWeight: 'bold' }}>${pago.monto.toFixed(2)}</span>
                          <button
                            onClick={() => setListaPagos(listaPagos.filter(p => p.id !== pago.id))}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: (totales.total - listaPagos.reduce((a, b) => a + b.monto, 0) - totales.retenciones) > 0.01 ? '#ef4444' : '#10b981' }}>
                    Saldo Restante: ${(totales.total - listaPagos.reduce((a, b) => a + b.monto, 0) - totales.retenciones).toFixed(2)}
                  </div>
                </div>

                {/* Parte Derecha: Resumen de Totales y Botón Principal (SIEMPRE VISIBLE) */}
                <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Subtotal:</span>
                      <span style={{ fontWeight: 'bold' }}>${totales.subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>IVA ({configuracion.ivaPorcentaje}%):</span>
                      <span style={{ fontWeight: 'bold' }}>${totales.iva.toFixed(2)}</span>
                    </div>
                    {totales.retenciones > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px', fontSize: '12px', color: '#ef4444' }}>
                        <span>Retenciones:</span>
                        <span style={{ fontWeight: 'bold' }}>-${totales.retenciones.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', paddingTop: '2px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>TOTAL:</span>
                      <span style={{ fontWeight: '900', fontSize: '18px', color: '#2563eb' }}>${totales.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botones de Pago (Solo si está expandido) */}
                  {mostrarSeccionPago && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px', background: '#f8fafc', padding: '4px', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
                      <button type="button" onClick={() => seleccionarTipoPago('EFECTIVO')} style={{ flex: 1, padding: '4px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', border: 'none', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>💵 Efectivo</button>
                      <button type="button" onClick={() => seleccionarTipoPago('TARJETAS')} style={{ flex: 1, padding: '4px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', border: 'none', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>💳 Tarjeta</button>
                      <button type="button" onClick={() => seleccionarTipoPago('TRANSFERENCIA')} style={{ flex: 1, padding: '4px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', border: 'none', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>🏦 Transf.</button>
                      <button type="button" onClick={() => { seleccionarTipoPago('RETENCIONES'); setMostrarModalRetencion(true); }} style={{ flex: 1, padding: '4px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', border: 'none', backgroundColor: '#6366f1', color: 'white', cursor: 'pointer' }}>📋 Reten.</button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleGuardarFactura(true)}
                    style={{
                      padding: '12px',
                      fontSize: '16px',
                      fontWeight: '900',
                      color: '#ffffff',
                      backgroundColor: '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.2s'
                    }}
                  >
                    💾 GUARDAR E IMPRIMIR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Legal - ELIMINADO */}
          {/* El footer-banner ha sido eliminado completamente */}

          {/* Sección de Datos Generales (Oculta pero funcional) */}
          <div className="seccion-sri" style={{ marginBottom: '2px', overflow: 'visible', padding: '2px', display: 'none' }}>
            <div style={{ backgroundColor: '#e5e7eb', padding: '1px 2px', margin: '-2px -2px 1px -2px', borderRadius: '3px 3px 0 0', borderBottom: '1px solid #667eea' }}>
              <h3 className="titulo-seccion-sri" style={{ fontSize: '10px', margin: 0, color: '#374151', fontWeight: '500', textDecoration: 'underline', textDecorationColor: '#667eea', lineHeight: '1', padding: '1px 0' }}>DATOS GENERALES</h3>
            </div>
            <div className="grid-datos grid-4-col" style={{ gap: '2px', marginBottom: '2px', marginTop: '2px' }}>
              {/* === DATOS DEL EMISOR === */}
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '1', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>RUC Emisor:</span>
                <input
                  className="input-text"
                  type="text"
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                  value={cleanText(facturaData.emisorRuc)}
                />
              </div>
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '2', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Razón Social:</span>
                <input
                  className="input-text"
                  type="text"
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                  value={cleanText(facturaData.emisorRazonSocial)}
                />
              </div>
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Nombre Comercial:</span>
                <input
                  className="input-text"
                  type="text"
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                  value={cleanText(facturaData.emisorNombreComercial)}
                />
              </div>
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '4', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Dir. Matriz:</span>
                <input
                  className="input-text"
                  type="text"
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                  value={cleanText(facturaData.emisorDireccionMatriz)}
                  onChange={(e) => handleFacturaDataChange('emisorDireccionMatriz', e.target.value)}
                />
              </div>
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '1', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Dir. Establecimiento:</span>
                <input
                  className="input-text"
                  type="text"
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                  value={cleanText(facturaData.emisorDireccionEstablecimiento)}
                  onChange={(e) => handleFacturaDataChange('emisorDireccionEstablecimiento', e.target.value)}
                />
              </div>
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '2', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Teléfono Emisor:</span>
                <input
                  className="input-text"
                  type="text"
                  value={cleanText(facturaData.emisorTelefono)}
                  onChange={(e) => handleFacturaDataChange('emisorTelefono', e.target.value)}
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Email Emisor:</span>
                <input
                  className="input-text"
                  type="email"
                  value={cleanText(facturaData.emisorEmail)}
                  onChange={(e) => handleFacturaDataChange('emisorEmail', e.target.value)}
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                />
              </div>

              {/* === DATOS DE LA FACTURA === */}
              <div className="campo" style={{ marginBottom: '1px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '4', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1', backgroundColor: 'transparent' }}>Tipo Comprobante:</span>
                <select
                  className="input-text"
                  value={facturaData.tipoComprobante}
                  style={{ padding: '1px 3px', fontSize: '11px', width: '100%', boxSizing: 'border-box', height: '20px' }}
                  onChange={(e) => {
                    handleFacturaDataChange('tipoComprobante', e.target.value)
                    // Si cambia a Nota de Crédito y hay cliente, buscar facturas
                    if (e.target.value === '04' && facturaData.clienteRucCedula) {
                      buscarFacturasCliente()
                    } else if (e.target.value !== '04') {
                      // Si cambia a otro tipo, limpiar factura seleccionada
                      setFacturaSeleccionada(null)
                      setItems([])
                    }
                  }}
                >
                  <option value="01">Factura</option>
                  <option value="04">Nota de Crédito</option>
                  <option value="05">Nota de Débito</option>
                  <option value="06">Guía de Remisión</option>
                  <option value="07">Retención</option>
                </select>
              </div>
              {facturaData.tipoComprobante === '04' && (
                <div className="campo" style={{ gridColumn: '1 / span 4', marginBottom: '1px' }}>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={buscarFacturasCliente}
                      disabled={!facturaData.clienteRucCedula || cargandoFacturas}
                      style={{
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: facturaData.clienteRucCedula && !cargandoFacturas ? '#007bff' : '#6c757d',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: facturaData.clienteRucCedula && !cargandoFacturas ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cargandoFacturas ? 'Buscando...' : '🔍 Buscar Factura Original'}
                    </button>
                    {facturaSeleccionada && (
                      <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                        ✓ Factura #{facturaSeleccionada.numero} seleccionada
                      </span>
                    )}
                    {!facturaData.clienteRucCedula && (
                      <span style={{ fontSize: '12px', color: '#dc2626' }}>
                        Primero ingrese el RUC/Cédula del cliente
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '1', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Establecimiento:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.establecimiento}
                  onChange={(e) => handleFacturaDataChange('establecimiento', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Punto de Emisión:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.puntoEmision}
                  onChange={(e) => handleFacturaDataChange('puntoEmision', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '100%', overflow: 'hidden', gridColumn: '4', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Secuencial:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.secuencial}
                  onChange={(e) => handleFacturaDataChange('secuencial', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '1', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Fecha:</span>
                <input
                  className="input-text"
                  type="date"
                  value={facturaData.fecha}
                  onChange={(e) => handleFacturaDataChange('fecha', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '2', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Número:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.numero}
                  onChange={(e) => handleFacturaDataChange('numero', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Ambiente:</span>
                <select
                  className="input-text"
                  value={facturaData.ambiente}
                  onChange={(e) => handleFacturaDataChange('ambiente', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                >
                  <option value="1">Producción</option>
                  <option value="2">Pruebas</option>
                </select>
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '100%', overflow: 'hidden', gridColumn: '4', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>BUSCAR STOCK:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.claveAcceso}
                  onChange={(e) => handleFacturaDataChange('claveAcceso', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '1', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Autorización:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.autorizacion}
                  onChange={(e) => handleFacturaDataChange('autorizacion', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '2', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Fecha Autorización:</span>
                <input
                  className="input-text"
                  type="datetime-local"
                  value={facturaData.fechaAutorizacion}
                  onChange={(e) => handleFacturaDataChange('fechaAutorizacion', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                />
              </div>
              <div className="campo" style={{ marginBottom: '3px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '10px', marginBottom: '2px', textAlign: 'left', whiteSpace: 'nowrap', lineHeight: '1.1' }}>Condición Pago:</span>
                <select
                  className="input-text"
                  value={facturaData.condicionPago}
                  onChange={(e) => handleFacturaDataChange('condicionPago', e.target.value)}
                  style={{ padding: '2px 4px', fontSize: '12px', width: '100%', boxSizing: 'border-box', height: '24px' }}
                >
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>

              {/* === DATOS DEL CLIENTE === */}
              <div className="campo" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1px', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>RUC/Cédula Cliente:</span>
                <div className="input-text" style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1, width: '100%' }}>
                  <input
                    type="text"
                    value={facturaData.clienteRucCedula}
                    onChange={(e) => handleFacturaDataChange('clienteRucCedula', e.target.value)}
                    onBlur={(e) => {
                      if (!editandoDatosCliente) {
                        handleBuscarCliente()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !editandoDatosCliente) {
                        e.preventDefault()
                        handleBuscarCliente()
                      }
                    }}
                    style={{
                      flex: 1,
                      width: 'auto',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      cursor: 'text',
                      padding: '1px 3px',
                      height: '20px'
                    }}
                    placeholder="Escriba el RUC/Cédula y presione Enter"
                  />
                  <button
                    onClick={() => {
                      setBusquedaCliente('')
                      setMostrarBuscarCliente(true)
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      backgroundColor: '#667eea',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                    title="Buscar cliente registrado"
                  >
                    🔍
                  </button>
                  <button
                    onClick={() => {
                      if (facturaData.clienteRucCedula && facturaData.clienteRucCedula.trim()) {
                        // Si hay RUC/Cédula, buscar facturas de ese cliente
                        setFiltroBusqueda({
                          ...filtroBusqueda,
                          cliente: facturaData.clienteRucCedula.trim()
                        })
                        setMostrarBuscarFacturaGeneral(true)
                        // Buscar automáticamente
                        setTimeout(() => {
                          buscarFacturasGeneral()
                        }, 100)
                      } else {
                        // Si no hay RUC/Cédula, abrir modal de búsqueda general
                        setMostrarBuscarFacturaGeneral(true)
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      backgroundColor: '#17a2b8',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#138496'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#17a2b8'}
                    title="Buscar facturas"
                    className="no-print"
                  >
                    📄
                  </button>
                </div>
                {mostrarClienteEncontrado && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '90px',
                      marginTop: '2px',
                      padding: '4px 8px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 10,
                      whiteSpace: 'nowrap',
                      animation: 'fadeIn 0.3s ease-in'
                    }}
                  >
                    ✓ Cliente encontrado
                  </div>
                )}
              </div>
              <div className="campo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1px', gridColumn: '4', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Nombre Cliente:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.clienteNombre}
                  onChange={(e) => handleFacturaDataChange('clienteNombre', e.target.value)}
                  readOnly={!editandoDatosCliente}
                  style={{
                    fontWeight: 'bold',
                    backgroundColor: editandoDatosCliente ? '#ffffff' : '#f3f4f6',
                    border: editandoDatosCliente ? '2px solid #667eea' : '1px solid #d1d5db',
                    cursor: editandoDatosCliente ? 'text' : 'not-allowed',
                    width: '100%',
                    padding: '1px 3px',
                    fontSize: '11px',
                    height: '20px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div className="campo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1px', gridColumn: '1', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Dirección Cliente:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.clienteDireccion}
                  onChange={(e) => handleFacturaDataChange('clienteDireccion', e.target.value)}
                  readOnly={!editandoDatosCliente}
                  style={{
                    fontWeight: 'bold',
                    backgroundColor: editandoDatosCliente ? '#ffffff' : '#f3f4f6',
                    border: editandoDatosCliente ? '2px solid #667eea' : '1px solid #d1d5db',
                    cursor: editandoDatosCliente ? 'text' : 'not-allowed',
                    width: '100%',
                    padding: '1px 3px',
                    fontSize: '11px',
                    height: '20px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div className="campo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1px', gridColumn: '2', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Teléfono Cliente:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.clienteTelefono}
                  onChange={(e) => handleFacturaDataChange('clienteTelefono', e.target.value)}
                  readOnly={!editandoDatosCliente}
                  style={{
                    fontWeight: 'bold',
                    backgroundColor: editandoDatosCliente ? '#ffffff' : '#f3f4f6',
                    border: editandoDatosCliente ? '2px solid #667eea' : '1px solid #d1d5db',
                    cursor: editandoDatosCliente ? 'text' : 'not-allowed',
                    width: '100%',
                    padding: '1px 3px',
                    fontSize: '11px',
                    height: '20px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div className="campo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1px', gridColumn: '4', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Email Cliente:</span>
                <input
                  className="input-text"
                  type="email"
                  value={facturaData.clienteEmail || ''}
                  onChange={(e) => handleFacturaDataChange('clienteEmail', e.target.value)}
                  readOnly={!editandoDatosCliente}
                  style={{
                    fontWeight: 'bold',
                    backgroundColor: editandoDatosCliente ? '#ffffff' : '#f3f4f6',
                    border: editandoDatosCliente ? '2px solid #667eea' : '1px solid #d1d5db',
                    cursor: editandoDatosCliente ? 'text' : 'not-allowed',
                    fontSize: '11px',
                    width: '100%',
                    padding: '1px 3px',
                    height: '20px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div className="campo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1px', gridColumn: '3', width: '100%' }}>
                <span className="label" style={{ fontSize: '9px', marginBottom: '1px', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: '1' }}>Vendedor *:</span>
                <input
                  className="input-text"
                  type="text"
                  list="vendedores-list"
                  value={facturaData.vendedor}
                  onChange={(e) => handleFacturaDataChange('vendedor', e.target.value)}
                  placeholder={!facturaData.vendedor ? "Escriba o seleccione un vendedor" : ""}
                  required
                  style={{
                    borderColor: !facturaData.vendedor ? '#dc2626' : undefined,
                    color: facturaData.vendedor ? '#000000' : '#dc2626',
                    width: '100%',
                    padding: '1px 3px',
                    fontSize: '11px',
                    height: '20px',
                    boxSizing: 'border-box'
                  }}
                />
                <datalist id="vendedores-list">
                  <option value="Vendedor 1">Vendedor 1</option>
                  <option value="Vendedor 2">Vendedor 2</option>
                  <option value="Vendedor 3">Vendedor 3</option>
                  <option value="Vendedor 4">Vendedor 4</option>
                  <option value="Vendedor 5">Vendedor 5</option>
                </datalist>
              </div>
            </div>
          </div>
          {/* Fin de Sección de Datos Generales Oculta */}

          {/* Modal Buscar Cliente */}
          {mostrarBuscarCliente && (
            <>
              {/* Overlay de fondo */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 9999,
                  backdropFilter: 'blur(2px)'
                }}
                onClick={() => setMostrarBuscarCliente(false)}
              />
              {/* Modal */}
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  zIndex: 10000,
                  minWidth: '500px',
                  maxWidth: '90%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  border: '2px solid #667eea'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #667eea' }}>
                  <h4 style={{ margin: 0, color: '#667eea', fontSize: '20px', fontWeight: 'bold' }}>Buscar Cliente</h4>
                  <button
                    onClick={() => setMostrarBuscarCliente(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '0',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s, color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e5e5'
                      e.target.style.color = '#333'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = '#666'
                    }}
                    title="Cerrar"
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="Buscar por RUC, nombre, teléfono o email..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {clientes
                    .filter(cliente => {
                      if (!busquedaCliente.trim()) return true
                      const busqueda = busquedaCliente.toLowerCase()
                      const ruc = (cliente.ruc || '').toString().toLowerCase()
                      const nombre = (cliente.nombre || '').toLowerCase()
                      const telefono = (cliente.telefono || '').toLowerCase()
                      const email = (cliente.email || '').toLowerCase()
                      return ruc.includes(busqueda) || nombre.includes(busqueda) || telefono.includes(busqueda) || email.includes(busqueda)
                    })
                    .map(cliente => (
                      <div
                        key={cliente.id}
                        onClick={() => {
                          setFacturaData(prev => ({
                            ...prev,
                            clienteRucCedula: cliente.ruc || '',
                            clienteNombre: cliente.nombre || '',
                            clienteDireccion: cliente.direccion || '',
                            clienteTelefono: cliente.telefono || '',
                            clienteEmail: cliente.email || ''
                          }))
                          setClienteId(cliente.id)
                          setMostrarBuscarCliente(false)
                          setBusquedaCliente('')
                        }}
                        style={{
                          padding: '12px',
                          marginBottom: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6'
                          e.currentTarget.style.borderColor = '#667eea'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                          e.currentTarget.style.borderColor = '#d1d5db'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#374151' }}>
                          {cliente.nombre || 'Sin nombre'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          <div>RUC: {cliente.ruc || 'N/A'}</div>
                          {cliente.telefono && <div>Tel: {cliente.telefono}</div>}
                          {cliente.email && <div>Email: {cliente.email}</div>}
                          {cliente.direccion && <div>Dirección: {cliente.direccion}</div>}
                        </div>
                      </div>
                    ))}
                  {clientes.filter(cliente => {
                    if (!busquedaCliente.trim()) return true
                    const busqueda = busquedaCliente.toLowerCase()
                    const ruc = (cliente.ruc || '').toString().toLowerCase()
                    const nombre = (cliente.nombre || '').toLowerCase()
                    const telefono = (cliente.telefono || '').toLowerCase()
                    const email = (cliente.email || '').toLowerCase()
                    return ruc.includes(busqueda) || nombre.includes(busqueda) || telefono.includes(busqueda) || email.includes(busqueda)
                  }).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '14px' }}>
                        {busquedaCliente.trim() ? 'No se encontraron clientes con esa búsqueda' : 'No hay clientes registrados'}
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {mostrarFormularioNuevoCliente && (
            <>
              {/* Overlay de fondo */}
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 9999,
                  backdropFilter: 'blur(2px)'
                }}
                onClick={() => setMostrarFormularioNuevoCliente(false)}
              />
              {/* Formulario modal */}
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  zIndex: 10000,
                  minWidth: '500px',
                  maxWidth: '90%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  border: '2px solid #667eea'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #667eea' }}>
                  <h4 style={{ margin: 0, color: '#667eea', fontSize: '20px', fontWeight: 'bold' }}>Nuevo Cliente</h4>
                  <button
                    onClick={() => setMostrarFormularioNuevoCliente(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '0',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s, color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e5e5'
                      e.target.style.color = '#333'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = '#666'
                    }}
                    title="Cerrar formulario"
                  >
                    ×
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="campo">
                    <span className="label" style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>
                      {formularioNuevoCliente.tipoDocumento || 'RUC/Cédula'} *:
                    </span>
                    <input
                      ref={inputRucRef}
                      type="text"
                      style={{ padding: '4px 8px', flex: 1 }}
                      value={formularioNuevoCliente.ruc}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '') // Solo números
                        setFormularioNuevoCliente({ ...formularioNuevoCliente, ruc: valor, tipoDocumento: '' })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const rucLimpio = formularioNuevoCliente.ruc.replace(/\D/g, '') // Solo números

                          // Detectar tipo de documento según la longitud
                          if (rucLimpio.length === 10) {
                            setFormularioNuevoCliente(prev => ({ ...prev, tipoDocumento: 'Cédula', ruc: rucLimpio }))
                          } else if (rucLimpio.length === 13) {
                            setFormularioNuevoCliente(prev => ({ ...prev, tipoDocumento: 'RUC', ruc: rucLimpio }))
                          } else {
                            // Si no tiene 10 o 13 dígitos, mantener como está
                            setFormularioNuevoCliente(prev => ({ ...prev, ruc: rucLimpio }))
                          }

                          // Mover el foco al siguiente campo (Nombre) si tiene la longitud correcta
                          if (rucLimpio.length === 10 || rucLimpio.length === 13) {
                            setTimeout(() => {
                              if (inputNombreRef.current) {
                                inputNombreRef.current.focus()
                              }
                            }, 100)
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const rucLimpio = formularioNuevoCliente.ruc.replace(/\D/g, '') // Solo números

                        // Detectar tipo de documento según la longitud al salir del campo
                        if (rucLimpio.length === 10) {
                          setFormularioNuevoCliente(prev => ({ ...prev, tipoDocumento: 'Cédula', ruc: rucLimpio }))
                        } else if (rucLimpio.length === 13) {
                          setFormularioNuevoCliente(prev => ({ ...prev, tipoDocumento: 'RUC', ruc: rucLimpio }))
                        } else {
                          setFormularioNuevoCliente(prev => ({ ...prev, ruc: rucLimpio }))
                        }
                      }}
                    />
                  </div>
                  <div className="campo">
                    <span className="label" style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>Nombre *:</span>
                    <input
                      ref={inputNombreRef}
                      type="text"
                      style={{ padding: '4px 8px', flex: 1 }}
                      value={formularioNuevoCliente.nombre}
                      onChange={(e) => setFormularioNuevoCliente({ ...formularioNuevoCliente, nombre: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="campo">
                    <span className="label" style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>Dirección:</span>
                    <input
                      type="text"
                      style={{ padding: '4px 8px', flex: 1 }}
                      value={formularioNuevoCliente.direccion}
                      onChange={(e) => setFormularioNuevoCliente({ ...formularioNuevoCliente, direccion: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="campo">
                    <span className="label" style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>Teléfono:</span>
                    <input
                      type="text"
                      style={{ padding: '4px 8px', flex: 1 }}
                      value={formularioNuevoCliente.telefono}
                      onChange={(e) => setFormularioNuevoCliente({ ...formularioNuevoCliente, telefono: e.target.value })}
                    />
                  </div>
                  <div className="campo">
                    <span className="label" style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px' }}>Email:</span>
                    <input
                      type="email"
                      style={{ padding: '4px 8px', flex: 1 }}
                      value={formularioNuevoCliente.email}
                      onChange={(e) => setFormularioNuevoCliente({ ...formularioNuevoCliente, email: e.target.value.toLowerCase() })}
                    />
                  </div>
                  <div className="campo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="esExtranjero"
                      checked={formularioNuevoCliente.esExtranjero}
                      onChange={(e) => setFormularioNuevoCliente({ ...formularioNuevoCliente, esExtranjero: e.target.checked })}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <label
                      htmlFor="esExtranjero"
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        margin: 0
                      }}
                    >
                      Es extranjero
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={cancelarNuevoCliente}
                    disabled={guardandoCliente}
                    style={{
                      padding: '10px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      backgroundColor: guardandoCliente ? '#9ca3af' : '#dc2626',
                      border: '3px solid #000000',
                      borderRadius: '6px',
                      cursor: guardandoCliente ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: guardandoCliente ? 0.6 : 1,
                      boxShadow: guardandoCliente ? 'none' : '0 4px 0 #991b1b, 0 6px 8px rgba(0, 0, 0, 0.3)',
                      transform: guardandoCliente ? 'none' : 'translateY(0)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!guardandoCliente) {
                        e.target.style.backgroundColor = '#b91c1c'
                        e.target.style.boxShadow = '0 2px 0 #7f1d1d, 0 4px 6px rgba(0, 0, 0, 0.3)'
                        e.target.style.transform = 'translateY(2px)'
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!guardandoCliente) {
                        e.target.style.boxShadow = '0 1px 0 #7f1d1d, 0 2px 4px rgba(0, 0, 0, 0.3)'
                        e.target.style.transform = 'translateY(3px)'
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!guardandoCliente) {
                        e.target.style.backgroundColor = '#b91c1c'
                        e.target.style.boxShadow = '0 2px 0 #7f1d1d, 0 4px 6px rgba(0, 0, 0, 0.3)'
                        e.target.style.transform = 'translateY(2px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!guardandoCliente) {
                        e.target.style.backgroundColor = '#dc2626'
                        e.target.style.boxShadow = '0 4px 0 #991b1b, 0 6px 8px rgba(0, 0, 0, 0.3)'
                        e.target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarNuevoCliente}
                    disabled={guardandoCliente}
                    style={{
                      padding: '10px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      backgroundColor: guardandoCliente ? '#9ca3af' : '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: guardandoCliente ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: guardandoCliente ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!guardandoCliente) {
                        e.target.style.backgroundColor = '#059669'
                        e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!guardandoCliente) {
                        e.target.style.backgroundColor = '#10b981'
                        e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)'
                      }
                    }}
                  >
                    {guardandoCliente ? 'Guardando...' : 'Guardar Cliente'}
                  </button>
                </div>
              </div>
            </>
          )}

          {mostrarMensajeExito && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
              {mensajeExito}
            </div>
          )}
        </div>

        {/* Sección Productos - OCULTA (reemplazada por nuevo diseño) */}
        <div className="productos-section" style={{ display: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 className="titulo-seccion-productos" style={{ margin: 0 }}>Detalle de Productos</h3>
            {esNotaCredito && (
              <span
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                }}
              >
                📄 NOTA DE CRÉDITO
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <button
              className="no-print agregar-fila-btn"
              onClick={agregarFila}
              style={{ padding: '3px 8px', cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '3px', fontSize: '10px' }}
            >
              + Agregar Fila
            </button>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
              Productos: {items.filter(item => item.descripcion && item.descripcion.trim() !== '').length}
            </span>
          </div>

          <div
            className="tabla-productos-container"
            style={{
              ...(facturaData.tipoComprobante === '04' ? {
                overflowY: 'auto',
                overflowX: 'hidden',
                maxHeight: 'calc(100vh - 600px)',
                minHeight: 'calc(9 * 20px + 30px)'
              } : {})
            }}
          >
            {!items || items.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6b7280',
                minHeight: '200px'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#374151'
                }}>
                  No hay productos agregados
                </div>
                <div style={{
                  fontSize: '14px',
                  marginBottom: '20px',
                  color: '#6b7280'
                }}>
                  Haz clic en el botón "Agregar Fila" para comenzar a agregar productos
                </div>
                <button
                  className="no-print agregar-fila-btn"
                  onClick={agregarFila}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                  onMouseLeave={(e) => e.target.style.background = '#667eea'}
                >
                  + Agregar Primera Fila
                </button>
              </div>
            ) : (
              <table className="tabla-factura" id="itemsTable">
                <thead>
                  <tr>
                    <th
                      style={{
                        width: `${columnWidths.codigo}px`,
                        minWidth: `${columnWidths.codigo}px`,
                        maxWidth: `${columnWidths.codigo}px`,
                        position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      CÓDIGO DE BARRAS
                      <div
                        className="column-resizer"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const headerCell = e.target.closest('th')
                          if (headerCell) {
                            const headerRect = headerCell.getBoundingClientRect()
                            resizeStartX.current = e.clientX
                            resizeStartWidth.current = headerRect.width
                            setResizingColumn('codigo')
                            setIsResizing(true)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '0px',
                          top: 0,
                          bottom: 0,
                          width: '6px',
                          cursor: 'col-resize',
                          backgroundColor: '#2563eb',
                          opacity: 0.2,
                          zIndex: 30,
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths.descripcion}px`,
                        minWidth: `${columnWidths.descripcion}px`,
                        maxWidth: `${columnWidths.descripcion}px`,
                        position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      DESCRIPCIÓN ARTÍCULO / SERVICIO
                      <div
                        className="column-resizer"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const headerCell = e.target.closest('th')
                          if (headerCell) {
                            const headerRect = headerCell.getBoundingClientRect()
                            resizeStartX.current = e.clientX
                            resizeStartWidth.current = headerRect.width
                            setResizingColumn('descripcion')
                            setIsResizing(true)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '0px',
                          top: 0,
                          bottom: 0,
                          width: '6px',
                          cursor: 'col-resize',
                          backgroundColor: '#2563eb',
                          opacity: 0.2,
                          zIndex: 30,
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths.cantidad}px`,
                        minWidth: `${columnWidths.cantidad}px`,
                        maxWidth: `${columnWidths.cantidad}px`,
                        position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      CANTIDAD
                      <div
                        className="column-resizer"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const headerCell = e.target.closest('th')
                          if (headerCell) {
                            const headerRect = headerCell.getBoundingClientRect()
                            resizeStartX.current = e.clientX
                            resizeStartWidth.current = headerRect.width
                            setResizingColumn('cantidad')
                            setIsResizing(true)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '0px',
                          top: 0,
                          bottom: 0,
                          width: '6px',
                          cursor: 'col-resize',
                          backgroundColor: '#2563eb',
                          opacity: 0.2,
                          zIndex: 30,
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths.descuento}px`,
                        minWidth: `${columnWidths.descuento}px`,
                        maxWidth: `${columnWidths.descuento}px`,
                        position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      % DESCT
                      <div
                        className="column-resizer"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const headerCell = e.target.closest('th')
                          if (headerCell) {
                            const headerRect = headerCell.getBoundingClientRect()
                            resizeStartX.current = e.clientX
                            resizeStartWidth.current = headerRect.width
                            setResizingColumn('descuento')
                            setIsResizing(true)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '0px',
                          top: 0,
                          bottom: 0,
                          width: '6px',
                          cursor: 'col-resize',
                          backgroundColor: '#2563eb',
                          opacity: 0.2,
                          zIndex: 30,
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths.precio}px`,
                        minWidth: `${columnWidths.precio}px`,
                        maxWidth: `${columnWidths.precio}px`,
                        position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      PRECIO
                      <div
                        className="column-resizer"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const headerCell = e.target.closest('th')
                          if (headerCell) {
                            const headerRect = headerCell.getBoundingClientRect()
                            resizeStartX.current = e.clientX
                            resizeStartWidth.current = headerRect.width
                            setResizingColumn('precio')
                            setIsResizing(true)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '0px',
                          top: 0,
                          bottom: 0,
                          width: '6px',
                          cursor: 'col-resize',
                          backgroundColor: '#2563eb',
                          opacity: 0.2,
                          zIndex: 30,
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths.subtotal}px`,
                        minWidth: `${columnWidths.subtotal}px`,
                        maxWidth: `${columnWidths.subtotal}px`,
                        position: 'relative',
                        userSelect: 'none'
                      }}
                    >
                      SUB TOTAL
                      <div
                        className="column-resizer"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const headerCell = e.target.closest('th')
                          if (headerCell) {
                            const headerRect = headerCell.getBoundingClientRect()
                            resizeStartX.current = e.clientX
                            resizeStartWidth.current = headerRect.width
                            setResizingColumn('subtotal')
                            setIsResizing(true)
                          }
                        }}
                        style={{
                          position: 'absolute',
                          right: '0px',
                          top: 0,
                          bottom: 0,
                          width: '6px',
                          cursor: 'col-resize',
                          backgroundColor: '#2563eb',
                          opacity: 0.2,
                          zIndex: 30,
                          userSelect: 'none',
                          touchAction: 'none'
                        }}
                      />
                    </th>
                    <th className="no-print">ELIMINAR</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={esNotaCredito ? 'nota-credito-row' : ''}
                      style={esNotaCredito ? {
                        backgroundColor: '#fee2e2',
                        borderLeft: '3px solid #dc2626'
                      } : {}}
                    >
                      <td
                        contentEditable={!esNotaCredito}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const texto = e.target.textContent.trim().substring(0, 20)
                          e.target.textContent = texto
                          handleItemTextChange(item.id, 'codigo', texto)
                          if (texto.length >= 8) {
                            buscarProductoPorCodigo(texto, item.id)
                          }
                        }}
                        onKeyDown={(e) => {
                          const texto = e.target.textContent.trim()
                          // Limitar a 20 caracteres
                          if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter' && !e.ctrlKey && !e.metaKey) {
                            if (texto.length >= 20) {
                              e.preventDefault()
                              return false
                            }
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const textoFinal = texto.substring(0, 20).trim()
                            e.target.textContent = textoFinal
                            if (textoFinal.length >= 3) {
                              buscarProductoPorCodigo(textoFinal, item.id)
                            }
                            e.target.blur()
                          }
                        }}
                        onInput={(e) => {
                          const texto = e.target.textContent
                          if (texto.length > 20) {
                            e.target.textContent = texto.substring(0, 20)
                          }
                        }}
                        className="celda-editable input-codigo-barras"
                        style={{
                          textAlign: 'left',
                          width: `${columnWidths.codigo}px`,
                          minWidth: `${columnWidths.codigo}px`,
                          maxWidth: `${columnWidths.codigo}px`,
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            cursor: 'not-allowed',
                            opacity: 0.9
                          } : {})
                        }}
                        data-maxlength="20"
                      >
                        {item.codigo}
                      </td>
                      <td
                        contentEditable={!esNotaCredito}
                        suppressContentEditableWarning
                        onBlur={!esNotaCredito ? (e) => handleItemTextChange(item.id, 'descripcion', e.target.textContent.trim()) : undefined}
                        className="celda-editable input-codigo-barras"
                        style={{
                          textAlign: 'left',
                          width: `${columnWidths.descripcion}px`,
                          minWidth: `${columnWidths.descripcion}px`,
                          maxWidth: `${columnWidths.descripcion}px`,
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            cursor: 'not-allowed',
                            opacity: 0.9
                          } : {})
                        }}
                        data-placeholder="Descripción"
                      >
                        {item.descripcion}
                      </td>
                      <td
                        contentEditable={!esNotaCredito}
                        suppressContentEditableWarning
                        onBlur={!esNotaCredito ? (e) => {
                          const valor = parseFloat(e.target.textContent.trim()) || 0
                          handleItemChange(item.id, 'cantidad', valor)
                        } : undefined}
                        className="celda-editable input-codigo-barras"
                        style={{
                          textAlign: 'center',
                          width: `${columnWidths.cantidad}px`,
                          minWidth: `${columnWidths.cantidad}px`,
                          maxWidth: `${columnWidths.cantidad}px`,
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            cursor: 'not-allowed',
                            opacity: 0.9,
                            color: '#dc2626',
                            fontWeight: 'bold'
                          } : {})
                        }}
                        data-placeholder="0"
                      >
                        {item.cantidad && item.cantidad !== 0 ? (esNotaCredito ? -Math.abs(item.cantidad) : item.cantidad) : ''}
                      </td>
                      <td
                        contentEditable={!esNotaCredito}
                        suppressContentEditableWarning
                        onBlur={!esNotaCredito ? (e) => {
                          const valor = parseFloat(e.target.textContent.trim()) || 0
                          handleItemChange(item.id, 'descuento', valor)
                        } : undefined}
                        className="celda-editable input-codigo-barras"
                        style={{
                          textAlign: 'center',
                          width: `${columnWidths.descuento}px`,
                          minWidth: `${columnWidths.descuento}px`,
                          maxWidth: `${columnWidths.descuento}px`,
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            cursor: 'not-allowed',
                            opacity: 0.9
                          } : {})
                        }}
                        data-placeholder="0"
                      >
                        {item.descuento && item.descuento !== 0 ? item.descuento : ''}
                      </td>
                      <td
                        contentEditable={!esNotaCredito}
                        suppressContentEditableWarning
                        onBlur={!esNotaCredito ? (e) => {
                          const valor = parseFloat(e.target.textContent.trim()) || 0
                          handleItemChange(item.id, 'precio', valor)
                        } : undefined}
                        className="celda-editable input-codigo-barras"
                        style={{
                          textAlign: 'center',
                          width: `${columnWidths.precio}px`,
                          minWidth: `${columnWidths.precio}px`,
                          maxWidth: `${columnWidths.precio}px`,
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            cursor: 'not-allowed',
                            opacity: 0.9,
                            color: '#dc2626',
                            fontWeight: 'bold'
                          } : {})
                        }}
                        data-placeholder="0.00"
                      >
                        {item.precio && item.precio !== 0 ? (esNotaCredito ? -Math.abs(item.precio) : item.precio) : ''}
                      </td>
                      <td
                        className="row-total celda-editable input-codigo-barras"
                        style={{
                          textAlign: 'right',
                          width: `${columnWidths.subtotal}px`,
                          minWidth: `${columnWidths.subtotal}px`,
                          maxWidth: `${columnWidths.subtotal}px`,
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            cursor: 'not-allowed',
                            color: '#dc2626',
                            fontWeight: 'bold',
                            border: '2px solid #dc2626'
                          } : {})
                        }}
                      >
                        ${esNotaCredito && item.subtotal < 0 ? item.subtotal.toFixed(2) : item.subtotal.toFixed(2)}
                      </td>
                      <td
                        className="no-print celda-editable"
                        style={{
                          width: '30px',
                          minWidth: '30px',
                          maxWidth: '30px',
                          ...(esNotaCredito ? {
                            backgroundColor: '#fee2e2',
                            opacity: 0.9
                          } : {})
                        }}
                      >
                        <button
                          type="button"
                          className="btn-eliminar-fila"
                          onClick={() => eliminarFila(item.id)}
                          title="Eliminar esta fila"
                          style={esNotaCredito ? {
                            color: '#dc2626',
                            fontWeight: 'bold'
                          } : {}}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Filas vacías para mantener estructura de 9 renglones */}
                  {Array.from({ length: Math.max(0, 9 - (items ? items.length : 0)) }).map((_, index) => (
                    <tr key={`empty-${index}`} className="empty-row" style={{ height: '32px' }}>
                      <td style={{
                        width: `${columnWidths.codigo}px`,
                        minWidth: `${columnWidths.codigo}px`,
                        maxWidth: `${columnWidths.codigo}px`,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                      <td style={{
                        width: `${columnWidths.descripcion}px`,
                        minWidth: `${columnWidths.descripcion}px`,
                        maxWidth: `${columnWidths.descripcion}px`,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                      <td style={{
                        width: `${columnWidths.cantidad}px`,
                        minWidth: `${columnWidths.cantidad}px`,
                        maxWidth: `${columnWidths.cantidad}px`,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                      <td style={{
                        width: `${columnWidths.descuento}px`,
                        minWidth: `${columnWidths.descuento}px`,
                        maxWidth: `${columnWidths.descuento}px`,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                      <td style={{
                        width: `${columnWidths.precio}px`,
                        minWidth: `${columnWidths.precio}px`,
                        maxWidth: `${columnWidths.precio}px`,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                      <td style={{
                        width: `${columnWidths.subtotal}px`,
                        minWidth: `${columnWidths.subtotal}px`,
                        maxWidth: `${columnWidths.subtotal}px`,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                      <td style={{
                        width: '30px',
                        minWidth: '30px',
                        maxWidth: '30px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>



        {/* Sección Contabilidad */}
        <div className="seccion-sri">
          <h3
            className="titulo-seccion-sri"
            onClick={() => setContabilidadExpandida(!contabilidadExpandida)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {contabilidadExpandida ? '▼' : '▶'} DATOS DE CONTABILIDAD
          </h3>
          {contabilidadExpandida && (
            <div className="grid-datos grid-4-col">
              <div className="campo">
                <span className="label">Fecha Contable:</span>
                <input
                  className="input-text"
                  type="date"
                  value={facturaData.fechaContable || facturaData.fecha}
                  onChange={(e) => handleFacturaDataChange('fechaContable', e.target.value)}
                />
              </div>
              <div className="campo">
                <span className="label">Cuenta:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.cuenta || ''}
                  onChange={(e) => handleFacturaDataChange('cuenta', e.target.value)}
                  placeholder="Ej: 1.01.01.001"
                />
              </div>
              <div className="campo" style={{ gridColumn: 'span 2' }}>
                <span className="label">Observaciones:</span>
                <input
                  className="input-text"
                  type="text"
                  value={facturaData.observaciones || ''}
                  onChange={(e) => handleFacturaDataChange('observaciones', e.target.value)}
                  placeholder="Observaciones contables"
                />
              </div>
            </div>
          )}
        </div>

      </div >
      {mostrarBuscarFacturasModal && (
        <BuscarFacturasModal onClose={() => setMostrarBuscarFacturasModal(false)} />
      )
      }
      {
        mostrarCajaChicaModal && (
          <CajaChicaModal
            onClose={() => setMostrarCajaChicaModal(false)}
            puntoVentaId={puntoVenta?.id || 0} // Asegurar que pasamos un ID
            usuarioId={currentUser?.id || 1}
          />
        )
      }

      {/* Modal de Retenciones */}
      {mostrarModalRetencion && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '350px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>Registrar Retención</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>N° Comprobante Retención:</label>
              <input
                type="text"
                className="input-text"
                value={retencionData.numero}
                onChange={(e) => setRetencionData({ ...retencionData, numero: e.target.value })}
                placeholder="001-001-000000001"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Valor Ret. Renta ($):</label>
                <input
                  type="number"
                  className="input-text"
                  step="0.01"
                  value={retencionData.valorIR}
                  onChange={(e) => setRetencionData({ ...retencionData, valorIR: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Valor Ret. IVA ($):</label>
                <input
                  type="number"
                  className="input-text"
                  step="0.01"
                  value={retencionData.valorIVA}
                  onChange={(e) => setRetencionData({ ...retencionData, valorIVA: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setMostrarModalRetencion(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setMostrarModalRetencion(false)
                  // El cálculo se dispara automáticamente por el useEffect al cambiar retencionData
                }}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Guardar Retención
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Unificado de Pagos Multiples */}
      {mostrarModalPago && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e40af', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {tipoPagoActual === 'TARJETA' && '💳 Pago con Tarjeta'}
              {tipoPagoActual === 'EFECTIVO' && '💵 Pago en Efectivo'}
              {tipoPagoActual === 'TRANSFERENCIA' && '🏦 Pago con Transferencia'}
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Monto a Pagar ($):</label>
              <input
                type="number"
                step="0.01"
                className="input-text"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                autoFocus
                style={{ width: '100%', fontSize: '18px', padding: '8px' }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Saldo pendiente: <strong>${Math.max(0, totales.total - listaPagos.reduce((acc, p) => acc + p.monto, 0) - totales.retenciones).toFixed(2)}</strong>
              </div>
            </div>

            {/* Campos condicionales según tipo */}
            {tipoPagoActual === 'TARJETA' && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>Referencia:</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Voucher"
                    value={detallesPago.referencia || ''}
                    onChange={(e) => setDetallesPago({ ...detallesPago, referencia: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>Lote:</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Opcional"
                    value={detallesPago.lote || ''}
                    onChange={(e) => setDetallesPago({ ...detallesPago, lote: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {tipoPagoActual === 'TRANSFERENCIA' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>Documento / Banco:</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Ej: Banco Pichincha - 123456"
                  value={detallesPago.banco || ''}
                  onChange={(e) => setDetallesPago({ ...detallesPago, banco: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {tipoPagoActual === 'EFECTIVO' && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Recibido:</span>
                  <strong>${parseFloat(montoPago || 0).toFixed(2)}</strong>
                </div>
                {parseFloat(montoPago) > (totales.total - listaPagos.reduce((acc, p) => acc + p.monto, 0) - totales.retenciones) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '5px', color: 'green', fontWeight: 'bold' }}>
                    <span>Cambio:</span>
                    <span>${(parseFloat(montoPago) - (totales.total - listaPagos.reduce((acc, p) => acc + p.monto, 0) - totales.retenciones)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setMostrarModalPago(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={agregarPagoALista}
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Agregar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Facturacion
