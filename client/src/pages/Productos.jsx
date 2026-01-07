import React, { useState, useEffect } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import { redondear4Decimales, redondear2Decimales, formatearNumero, formatearMoneda, parsearNumero } from '../utils/formateo'

// Plantillas de productos predefinidas
const PLANTILLAS_PRODUCTOS = {
  prenda_ropa: {
    nombre: 'Prenda de Ropa (con Variantes)',
    icono: '👕',
    descripcion: 'Plantilla para prendas con variantes: talla, color, código de barras',
    valores: {
      codigo: 'PRENDA-',
      sku: 'PRENDA-',
      nombre: 'PANTALÓN (9D) - Talla ',
      descripcion: 'Pantalón de alta calidad. Disponible en múltiples tallas y colores.',
      precio: '25.90',
      stock: '2',
      punto_reorden: '30',
      stock_seguridad: '15',
      tiempo_entrega_dias: '7',
      // Campos adicionales para variantes
      talla: '',
      color: '',
      codigo_barras: ''
    },
    incluyeVariantes: true
  },
  electronico: {
    nombre: 'Electrónico',
    icono: '📱',
    descripcion: 'Plantilla para productos electrónicos (smartphones, tablets, etc.)',
    valores: {
      codigo: 'ELEC-',
      sku: 'ELEC-',
      nombre: 'Dispositivo Electrónico - Modelo ',
      descripcion: 'Producto electrónico de alta calidad. Incluye garantía del fabricante.',
      precio: '299.99',
      stock: '20',
      punto_reorden: '10',
      stock_seguridad: '5',
      tiempo_entrega_dias: '14'
    }
  },
  alimento: {
    nombre: 'Alimento',
    icono: '🍎',
    descripcion: 'Plantilla para productos alimenticios (comestibles, bebidas, etc.)',
    valores: {
      codigo: 'ALIM-',
      sku: 'ALIM-',
      nombre: 'Producto Alimenticio - ',
      descripcion: 'Producto alimenticio fresco. Verificar fecha de vencimiento.',
      precio: '12.50',
      stock: '100',
      punto_reorden: '50',
      stock_seguridad: '25',
      tiempo_entrega_dias: '3'
    }
  },
  accesorio: {
    nombre: 'Accesorio',
    icono: '💍',
    descripcion: 'Plantilla para accesorios (joyería, relojes, etc.)',
    valores: {
      codigo: 'ACC-',
      sku: 'ACC-',
      nombre: 'Accesorio - ',
      descripcion: 'Accesorio de calidad premium. Diseño elegante y duradero.',
      precio: '49.99',
      stock: '30',
      punto_reorden: '15',
      stock_seguridad: '8',
      tiempo_entrega_dias: '10'
    }
  },
  herramienta: {
    nombre: 'Herramienta',
    icono: '🔧',
    descripcion: 'Plantilla para herramientas y equipos',
    valores: {
      codigo: 'HERR-',
      sku: 'HERR-',
      nombre: 'Herramienta - ',
      descripcion: 'Herramienta profesional de alta resistencia. Ideal para uso intensivo.',
      precio: '89.99',
      stock: '25',
      punto_reorden: '12',
      stock_seguridad: '6',
      tiempo_entrega_dias: '5'
    }
  }
}

function Productos({ socket }) {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarIngresoMasivo, setMostrarIngresoMasivo] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('')
  const [datosMasivos, setDatosMasivos] = useState('')
  const [productosMasivos, setProductosMasivos] = useState([])
  const [procesandoMasivo, setProcesandoMasivo] = useState(false)
  const [productosInfo, setProductosInfo] = useState({}) // Información de inventario, facturas y contabilidad por producto
  const [cargandoInfo, setCargandoInfo] = useState(false)
  const [formData, setFormData] = useState({
    num_movimiento: '',
    fecha_movimiento: new Date().toISOString().split('T')[0],
    codigo: '',
    grupo_comercial: '',
    referencia: '',
    sku: '',
    nombre: '',
    descripcion: '',
    coleccion: '',
    categoria: '',
    talla: '',
    color: '',
    desc_color: '',
    cod_barras: '',
    precio_costo: '',
    precio: '',
    unidad: 'PZA',
    stock: '',
    punto_reorden: '',
    stock_seguridad: '',
    tiempo_entrega_dias: ''
  })

  useEffect(() => {
    cargarProductos()

    socket.on('producto-creado', () => {
      cargarProductos()
    })

    socket.on('producto-actualizado', () => {
      cargarProductos()
    })

    socket.on('producto-eliminado', () => {
      cargarProductos()
    })

    return () => {
      socket.off('producto-creado')
      socket.off('producto-actualizado')
      socket.off('producto-eliminado')
    }
  }, [socket])

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/productos`)
      setProductos(res.data)
      cargarInfoIntegracion(res.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const cargarInfoIntegracion = async (productosData) => {
    if (!productosData || productosData.length === 0) return

    setCargandoInfo(true)
    try {
      // Cargar información de inventario, facturas y contabilidad para cada producto
      const infoPromises = productosData.map(async (producto) => {
        try {
          // Obtener kardex del producto
          const kardexRes = await axios.get(`${API_URL}/inventario/kardex/${producto.id}`).catch(() => null)

          // Obtener movimientos recientes del producto
          const movimientosRes = await axios.get(`${API_URL}/inventario/movimientos`).catch(() => ({ data: [] }))
          const movimientosProducto = movimientosRes.data?.filter(m => m.producto_id === producto.id) || []

          // Buscar facturas que contengan este producto
          const facturasRes = await axios.get(`${API_URL}/facturas/buscar`, {
            params: { productoId: producto.id }
          }).catch(() => ({ data: [] }))

          return {
            productoId: producto.id,
            kardex: kardexRes?.data || null,
            movimientos: movimientosProducto.slice(0, 5), // Últimos 5 movimientos
            facturas: facturasRes.data || [],
            totalVentas: facturasRes.data?.reduce((sum, f) => {
              const detalle = f.detalles?.find(d => d.producto_id === producto.id)
              return sum + (detalle?.subtotal || 0)
            }, 0) || 0,
            cantidadVendida: facturasRes.data?.reduce((sum, f) => {
              const detalle = f.detalles?.find(d => d.producto_id === producto.id)
              return sum + (detalle?.cantidad || 0)
            }, 0) || 0
          }
        } catch (error) {
          console.error(`Error al cargar info para producto ${producto.id}:`, error)
          return {
            productoId: producto.id,
            kardex: null,
            movimientos: [],
            facturas: [],
            totalVentas: 0,
            cantidadVendida: 0
          }
        }
      })

      const infoResults = await Promise.all(infoPromises)
      const infoMap = {}
      infoResults.forEach(info => {
        infoMap[info.productoId] = info
      })
      setProductosInfo(infoMap)
    } catch (error) {
      console.error('Error al cargar información de integración:', error)
    } finally {
      setCargandoInfo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Construir nombre completo si hay variantes
      let nombreFinal = formData.nombre
      if (plantillaSeleccionada === 'prenda_ropa') {
        if (formData.talla || formData.color) {
          const partes = []
          if (formData.talla) partes.push(`Talla ${formData.talla}`)
          if (formData.color) partes.push(`Color ${formData.color}`)
          if (partes.length > 0) {
            nombreFinal = `${formData.nombre.replace(/ - Talla.*| - Color.*/g, '')} - ${partes.join(' - ')}`
          }
        }
      }

      // Usar código de barras como SKU si está disponible
      const skuFinal = formData.codigo_barras || formData.sku

      // Construir descripción completa
      let descripcionFinal = formData.descripcion
      if (plantillaSeleccionada === 'prenda_ropa' && (formData.talla || formData.color)) {
        const detalles = []
        if (formData.talla) detalles.push(`Talla: ${formData.talla}`)
        if (formData.color) detalles.push(`Color: ${formData.color}`)
        if (detalles.length > 0) {
          descripcionFinal = `${formData.descripcion}${descripcionFinal ? '. ' : ''}${detalles.join(', ')}.`
        }
      }

      const data = {
        num_movimiento: formData.num_movimiento || null,
        fecha_movimiento: formData.fecha_movimiento || new Date().toISOString().split('T')[0],
        codigo: formData.codigo,
        grupo_comercial: formData.grupo_comercial || null,
        referencia: formData.referencia || null,
        sku: skuFinal,
        nombre: nombreFinal,
        descripcion: descripcionFinal,
        coleccion: formData.coleccion || null,
        categoria: formData.categoria || null,
        talla: formData.talla || null,
        color: formData.color || null,
        desc_color: formData.desc_color || null,
        cod_barras: formData.cod_barras || null,
        precio_costo: formData.precio_costo ? redondear4Decimales(parseFloat(formData.precio_costo)) : null,
        precio: redondear4Decimales(parseFloat(formData.precio)),
        unidad: formData.unidad || 'PZA',
        stock: parseInt(formData.stock) || 0,
        punto_reorden: formData.punto_reorden ? parseInt(formData.punto_reorden) : null,
        stock_seguridad: formData.stock_seguridad ? parseInt(formData.stock_seguridad) : null,
        tiempo_entrega_dias: formData.tiempo_entrega_dias ? parseInt(formData.tiempo_entrega_dias) : null
      }

      if (editingId) {
        await axios.put(`${API_URL}/productos/${editingId}`, data)
      } else {
        await axios.post(`${API_URL}/productos`, data)
      }

      setFormData({
        codigo: '',
        sku: '',
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        punto_reorden: '',
        stock_seguridad: '',
        tiempo_entrega_dias: ''
      })
      setPlantillaSeleccionada('')
      setMostrarFormulario(false)
      setEditingId(null)
      alert(editingId ? 'Producto actualizado' : 'Producto creado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el producto')
    }
  }

  const editarProducto = (producto) => {
    setFormData({
      num_movimiento: producto.num_movimiento || '',
      fecha_movimiento: producto.fecha_movimiento ? new Date(producto.fecha_movimiento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      codigo: producto.codigo,
      grupo_comercial: producto.grupo_comercial || '',
      referencia: producto.referencia || '',
      sku: producto.sku || '',
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      coleccion: producto.coleccion || '',
      categoria: producto.categoria || '',
      talla: producto.talla || '',
      color: producto.color || '',
      desc_color: producto.desc_color || '',
      cod_barras: producto.cod_barras || '',
      precio_costo: producto.precio_costo ? formatearNumero(producto.precio_costo) : '',
      precio: formatearNumero(producto.precio),
      unidad: producto.unidad || 'PZA',
      stock: producto.stock.toString(),
      punto_reorden: producto.punto_reorden ? producto.punto_reorden.toString() : '',
      stock_seguridad: producto.stock_seguridad ? producto.stock_seguridad.toString() : '',
      tiempo_entrega_dias: producto.tiempo_entrega_dias ? producto.tiempo_entrega_dias.toString() : ''
    })
    setPlantillaSeleccionada('')
    setEditingId(producto.id)
    setMostrarFormulario(true)
  }

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return

    try {
      await axios.delete(`${API_URL}/productos/${id}`)
      alert('Producto eliminado')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el producto')
    }
  }

  const aplicarPlantilla = (plantillaKey) => {
    const plantilla = PLANTILLAS_PRODUCTOS[plantillaKey]
    if (!plantilla) return

    setPlantillaSeleccionada(plantillaKey)
    setFormData({
      codigo: plantilla.valores.codigo,
      sku: plantilla.valores.sku,
      nombre: plantilla.valores.nombre,
      descripcion: plantilla.valores.descripcion,
      precio: plantilla.valores.precio,
      stock: plantilla.valores.stock,
      punto_reorden: plantilla.valores.punto_reorden,
      stock_seguridad: plantilla.valores.stock_seguridad,
      tiempo_entrega_dias: plantilla.valores.tiempo_entrega_dias,
      talla: plantilla.valores.talla || '',
      color: plantilla.valores.color || '',
      codigo_barras: plantilla.valores.codigo_barras || ''
    })

    // Abrir formulario si no está abierto
    if (!mostrarFormulario) {
      setMostrarFormulario(true)
    }
  }

  const procesarIngresoMasivo = () => {
    if (!datosMasivos.trim()) {
      alert('Por favor, ingresa los datos a importar')
      return
    }

    try {
      const lineas = datosMasivos.split('\n').filter(linea => linea.trim())
      const productos = []
      const errores = []

      // Procesar cada línea (formato: descripcion|talla|color|codigo_barras|precio|stock|punto_reorden|stock_seguridad)
      lineas.forEach((linea, index) => {
        try {
          // Detectar separador si no es pipe
          let separador = '|'
          if (linea.includes(',') && !linea.includes('|')) separador = ','
          else if (linea.includes(';') && !linea.includes('|')) separador = ';'
          else if (linea.includes('\t') && !linea.includes('|')) separador = '\t'

          const partes = linea.split(separador).map(p => p.trim().replace(/^"|"$/g, ''))

          if (partes.length >= 3) {
            const descripcion = partes[0] || `Producto ${index + 1}`
            const talla = partes[1] || ''
            const color = partes[2] || ''
            const codigoBarras = partes[3] || `SKU-${Date.now()}-${index}`
            const precio = partes[4] ? parseFloat(partes[4].replace(',', '.').replace(/[^0-9.]/g, '')) : 0
            const stock = partes[5] ? parseInt(partes[5].replace(/[^0-9]/g, '')) : 0
            const puntoReorden = partes[6] ? parseInt(partes[6].replace(/[^0-9]/g, '')) : null
            const stockSeguridad = partes[7] ? parseInt(partes[7].replace(/[^0-9]/g, '')) : null

            // Validar datos mínimos
            if (!descripcion || descripcion.length < 2) {
              errores.push(`Línea ${index + 1}: Descripción inválida`)
              return
            }

            if (!codigoBarras || codigoBarras.length < 3) {
              errores.push(`Línea ${index + 1}: Código de barras inválido`)
              return
            }

            if (precio <= 0) {
              errores.push(`Línea ${index + 1}: Precio inválido (${partes[4] || 'vacío'})`)
              return
            }

            const nombre = talla && color
              ? `${descripcion} - Talla ${talla} - Color ${color}`
              : talla
                ? `${descripcion} - Talla ${talla}`
                : color
                  ? `${descripcion} - Color ${color}`
                  : descripcion

            // Generar código único si no se proporciona
            const codigo = `PRENDA-${codigoBarras.substring(0, Math.min(8, codigoBarras.length))}`

            // Procesar campos adicionales si están disponibles
            const numMovimiento = partes[8] || ''
            const fechaMovimiento = partes[9] || new Date().toISOString().split('T')[0]
            const grupoComercial = partes[10] || ''
            const referencia = partes[11] || ''
            const coleccion = partes[12] || ''
            const categoria = partes[13] || ''
            const descColor = partes[14] || color
            const precioCosto = partes[15] ? parseFloat(partes[15].replace(',', '.').replace(/[^0-9.]/g, '')) : null
            const unidad = partes[16] || 'PZA'

            productos.push({
              num_movimiento: numMovimiento,
              fecha_movimiento: fechaMovimiento,
              codigo: codigo,
              grupo_comercial: grupoComercial,
              referencia: referencia,
              sku: codigoBarras,
              nombre: nombre,
              descripcion: `${descripcion}${talla ? `, Talla: ${talla}` : ''}${color ? `, Color: ${color}` : ''}`,
              coleccion: coleccion,
              categoria: categoria,
              talla: talla,
              color: color,
              desc_color: descColor,
              cod_barras: codigoBarras,
              precio_costo: precioCosto,
              precio: precio,
              unidad: unidad,
              stock: stock || 0,
              punto_reorden: puntoReorden || 30,
              stock_seguridad: stockSeguridad || 15,
              tiempo_entrega_dias: 7
            })
          } else {
            errores.push(`Línea ${index + 1}: Formato inválido (mínimo 3 campos requeridos)`)
          }
        } catch (error) {
          errores.push(`Línea ${index + 1}: ${error.message || 'Error al procesar'}`)
        }
      })

      if (productos.length === 0) {
        let mensaje = 'No se encontraron productos válidos.\n\n'
        mensaje += 'Formato esperado (mínimo 3 campos):\n'
        mensaje += 'descripcion|talla|color|codigo_barras|precio|stock|punto_reorden|stock_seguridad|num_movimiento|fecha_movimiento|grupo_comercial|referencia|coleccion|categoria|desc_color|precio_costo|unidad\n\n'
        mensaje += 'Campos básicos requeridos: descripcion, talla (o vacío), color (o vacío), codigo_barras, precio\n'
        if (errores.length > 0) {
          mensaje += 'Errores encontrados:\n'
          mensaje += errores.slice(0, 5).join('\n')
          if (errores.length > 5) {
            mensaje += `\n... y ${errores.length - 5} más`
          }
        }
        alert(mensaje)
        return
      }

      if (errores.length > 0) {
        let mensaje = `⚠️ Se procesaron ${productos.length} productos válidos, pero hubo ${errores.length} errores:\n\n`
        mensaje += errores.slice(0, 5).join('\n')
        if (errores.length > 5) {
          mensaje += `\n... y ${errores.length - 5} más`
        }
        alert(mensaje)
      }

      setProductosMasivos(productos)
    } catch (error) {
      console.error('Error al procesar datos:', error)
      alert('Error al procesar los datos. Verifica el formato.')
    }
  }

  const crearProductosMasivos = async () => {
    if (productosMasivos.length === 0) {
      alert('No hay productos para crear')
      return
    }

    if (!window.confirm(`¿Desea crear ${productosMasivos.length} productos?`)) return

    setProcesandoMasivo(true)

    try {
      // Preparar datos para el backend con todos los campos
      const productosParaEnviar = productosMasivos.map(p => ({
        num_movimiento: p.num_movimiento || null,
        fecha_movimiento: p.fecha_movimiento || new Date().toISOString().split('T')[0],
        codigo: p.codigo,
        grupo_comercial: p.grupo_comercial || null,
        referencia: p.referencia || null,
        sku: p.sku,
        nombre: p.nombre,
        descripcion: p.descripcion || null,
        coleccion: p.coleccion || null,
        categoria: p.categoria || null,
        talla: p.talla || null,
        color: p.color || null,
        desc_color: p.desc_color || null,
        cod_barras: p.cod_barras || p.sku || null,
        precio_costo: p.precio_costo || null,
        precio: p.precio,
        unidad: p.unidad || 'PZA',
        stock: p.stock || 0,
        punto_reorden: p.punto_reorden || null,
        stock_seguridad: p.stock_seguridad || null,
        tiempo_entrega_dias: p.tiempo_entrega_dias || null
      }))

      // Llamar al endpoint masivo
      const res = await axios.post(`${API_URL}/productos/masivo`, productosParaEnviar)

      const { exitosos, fallidos, total } = res.data

      let mensaje = `✅ Proceso completado:\n\n`
      mensaje += `Total procesados: ${total}\n`
      mensaje += `✓ Creados exitosamente: ${exitosos.length}\n`

      if (fallidos.length > 0) {
        mensaje += `✗ Fallidos: ${fallidos.length}\n\n`
        mensaje += `Errores:\n${fallidos.slice(0, 5).map(f => `• ${f.producto?.nombre || 'Producto'}: ${f.error}`).join('\n')}`
        if (fallidos.length > 5) {
          mensaje += `\n... y ${fallidos.length - 5} más`
        }
      }

      alert(mensaje)

      if (exitosos.length > 0) {
        cargarProductos()
        setDatosMasivos('')
        setProductosMasivos([])
        setMostrarIngresoMasivo(false)
      }
    } catch (error) {
      console.error('Error:', error)
      let mensajeError = 'Error al crear productos masivamente'
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message
      }
      alert(`❌ ${mensajeError}`)
    } finally {
      setProcesandoMasivo(false)
    }
  }

  const manejarArchivoExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false
        })

        if (jsonData.length === 0) {
          alert('El archivo Excel está vacío')
          return
        }

        // Mapear columnas según el formato esperado
        // Formato: descripcion|talla|color|codigo_barras|precio|stock|punto_reorden|stock_seguridad|num_movimiento|fecha_movimiento|grupo_comercial|referencia|coleccion|categoria|desc_color|precio_costo|unidad

        // Detectar si la primera fila es encabezado
        const primeraFila = jsonData[0]
        const tieneEncabezado = primeraFila.some(cell =>
          typeof cell === 'string' &&
          (cell.toLowerCase().includes('descrip') ||
            cell.toLowerCase().includes('talla') ||
            cell.toLowerCase().includes('color') ||
            cell.toLowerCase().includes('codigo') ||
            cell.toLowerCase().includes('precio'))
        )

        let inicioDatos = tieneEncabezado ? 1 : 0
        let lineasConvertidas = []

        // Mapear columnas comunes de Excel (incluye variantes en español del ejemplo)
        const mapeoColumnas = {
          descripcion: ['descripcion', 'descripción', 'descrip', 'desc', 'producto', 'nombre'],
          talla: ['talla', 'size', 'tamaño', 'tamano'],
          color: ['color', 'cod_color', 'codigo_color'],
          codigo_barras: ['codigo_barras', 'cod_barras', 'cod_barra', 'cod_barra', 'barcode', 'codigo de barras'],
          precio: ['precio', 'precio_publico', 'precio público', 'precio_venta', 'precio venta', 'publico_ecu', 'publico ecu'],
          precio_costo: ['precio_costo', 'precio costo', 'costo', 'costo_unitario', 'costo unitario', 'lista_ecuado', 'lista ecuado'],
          stock: ['stock', 'unidades', 'cantidad', 'cant', 'unid'],
          punto_reorden: ['punto_reorden', 'punto de reorden', 'reorden', 'p_reorden'],
          stock_seguridad: ['stock_seguridad', 'stock de seguridad', 'seguridad', 'stock_seg'],
          num_movimiento: ['num_movimiento', 'num_movim', 'numero_movimiento', 'movimiento', 'num_movimie'],
          fecha_movimiento: ['fecha_movimiento', 'fec_movimie', 'fecha_movim', 'fecha', 'fecha_mov'],
          grupo_comercial: ['grupo_comercial', 'grupo_comer', 'grupo come', 'grupo', 'grupo_comerc'],
          referencia: ['referencia', 'ref', 'nombre con ref', 'nombre_con_ref', 'nombre con ref'],
          coleccion: ['coleccion', 'colección', 'col'],
          categoria: ['categoria', 'categoría', 'cat'],
          desc_color: ['desc_color', 'descripcion_color', 'descripción color', 'desc color', 'descripcion del color', 'desc_color'],
          unidad: ['unidad', 'unid', 'um', 'unidad_medida']
        }

        // Si tiene encabezado, mapear columnas
        let indicesColumnas = {}
        if (tieneEncabezado) {
          primeraFila.forEach((header, index) => {
            if (header) {
              const headerLower = String(header).toLowerCase().trim().replace(/\s+/g, '_')
              // Buscar coincidencia exacta primero
              for (const [campo, variantes] of Object.entries(mapeoColumnas)) {
                const matchExacto = variantes.some(v => {
                  const vLower = v.toLowerCase().replace(/\s+/g, '_')
                  return headerLower === vLower || headerLower === vLower.replace('_', '')
                })
                if (matchExacto) {
                  indicesColumnas[campo] = index
                  return
                }
              }
              // Si no hay coincidencia exacta, buscar parcial
              for (const [campo, variantes] of Object.entries(mapeoColumnas)) {
                if (!indicesColumnas[campo] && variantes.some(v => {
                  const vLower = v.toLowerCase().replace(/\s+/g, '_')
                  return headerLower.includes(vLower) || vLower.includes(headerLower)
                })) {
                  indicesColumnas[campo] = index
                  break
                }
              }
            }
          })
        } else {
          // Sin encabezado, usar orden por defecto
          indicesColumnas = {
            descripcion: 0,
            talla: 1,
            color: 2,
            codigo_barras: 3,
            precio: 4,
            stock: 5,
            punto_reorden: 6,
            stock_seguridad: 7,
            num_movimiento: 8,
            fecha_movimiento: 9,
            grupo_comercial: 10,
            referencia: 11,
            coleccion: 12,
            categoria: 13,
            desc_color: 14,
            precio_costo: 15,
            unidad: 16
          }
        }

        // Convertir filas a formato pipe
        for (let i = inicioDatos; i < jsonData.length; i++) {
          const fila = jsonData[i]
          if (!fila || fila.length === 0) continue

          const valores = []
          const campos = ['descripcion', 'talla', 'color', 'codigo_barras', 'precio', 'stock',
            'punto_reorden', 'stock_seguridad', 'num_movimiento', 'fecha_movimiento',
            'grupo_comercial', 'referencia', 'coleccion', 'categoria', 'desc_color',
            'precio_costo', 'unidad']

          campos.forEach(campo => {
            const indice = indicesColumnas[campo]
            if (indice !== undefined && fila[indice] !== undefined) {
              let valor = fila[indice]
              // Formatear fechas
              if (campo === 'fecha_movimiento' && valor) {
                if (valor instanceof Date) {
                  valor = valor.toISOString().split('T')[0]
                } else if (typeof valor === 'number') {
                  // Excel almacena fechas como números (días desde 1900-01-01)
                  try {
                    const fechaExcel = new Date((valor - 25569) * 86400 * 1000)
                    if (!isNaN(fechaExcel.getTime())) {
                      valor = fechaExcel.toISOString().split('T')[0]
                    }
                  } catch (e) {
                    // Si falla, dejar el valor original
                  }
                } else if (typeof valor === 'string') {
                  // Intentar parsear como fecha
                  const fecha = new Date(valor)
                  if (!isNaN(fecha.getTime())) {
                    valor = fecha.toISOString().split('T')[0]
                  }
                }
              }
              valores.push(String(valor || '').trim())
            } else {
              valores.push('')
            }
          })

          lineasConvertidas.push(valores.join('|'))
        }

        if (lineasConvertidas.length === 0) {
          alert('No se encontraron datos válidos en el archivo Excel')
          return
        }

        setDatosMasivos(lineasConvertidas.join('\n'))
        alert(`✅ Archivo Excel cargado exitosamente!\n\n` +
          `Hoja: ${firstSheetName}\n` +
          `Filas procesadas: ${lineasConvertidas.length}\n` +
          `${tieneEncabezado ? 'Encabezados detectados y mapeados' : 'Usando orden por defecto'}`)
      } catch (error) {
        console.error('Error al leer Excel:', error)
        alert('Error al leer el archivo Excel. Verifica que sea un archivo válido (.xlsx o .xls)')
      }
    }
    reader.onerror = () => {
      alert('Error al leer el archivo')
    }
    reader.readAsArrayBuffer(file)
  }

  const manejarArchivoCSV = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const contenido = e.target.result
      // Detectar separador (coma, punto y coma, o pipe)
      const lineas = contenido.split('\n').filter(l => l.trim())
      if (lineas.length === 0) {
        alert('El archivo está vacío')
        return
      }

      // Intentar detectar el separador
      const primeraLinea = lineas[0]
      let separador = '|'
      if (primeraLinea.includes(',')) separador = ','
      else if (primeraLinea.includes(';')) separador = ';'
      else if (primeraLinea.includes('\t')) separador = '\t'
      else if (primeraLinea.includes('|')) separador = '|'

      // Convertir a formato pipe si es necesario
      const lineasConvertidas = lineas.map(linea => {
        if (separador !== '|') {
          return linea.split(separador).join('|')
        }
        return linea
      })

      setDatosMasivos(lineasConvertidas.join('\n'))
      alert(`✅ Archivo CSV cargado: ${lineas.length} líneas detectadas\nSeparador: ${separador === ',' ? 'Coma' : separador === ';' ? 'Punto y coma' : separador === '\t' ? 'Tabulador' : 'Pipe'}`)
    }
    reader.onerror = () => {
      alert('Error al leer el archivo')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const copiarTablaProductos = async () => {
    try {
      // Crear encabezados
      const encabezados = ['Código', 'Referencia', 'SKU', 'Nombre', 'Descripción', 'Precio', 'Stock', 'P. Reorden', 'Stock Seg.', 'Precio Costo', 'Categoría', 'Talla', 'Color']

      // Crear filas de datos
      const filas = productos.map(producto => [
        producto.codigo || '',
        producto.referencia || '',
        producto.sku || '',
        producto.nombre || '',
        producto.descripcion || '',
        formatearNumero(producto.precio || 0),
        producto.stock || 0,
        producto.punto_reorden || '',
        producto.stock_seguridad || '',
        producto.precio_costo ? formatearNumero(producto.precio_costo) : '',
        producto.categoria || '',
        producto.talla || '',
        producto.color || ''
      ])

      // Combinar encabezados y filas
      const datos = [encabezados, ...filas]

      // Convertir a texto separado por tabuladores (compatible con Excel)
      const texto = datos.map(fila => fila.join('\t')).join('\n')

      // Copiar al portapapeles
      await navigator.clipboard.writeText(texto)
      alert(`✅ Tabla copiada al portapapeles!\n\n${productos.length} productos copiados.\n\nPuedes pegarlo directamente en Excel o cualquier editor de texto.`)
    } catch (error) {
      console.error('Error al copiar:', error)
      // Fallback: usar método alternativo
      try {
        const textArea = document.createElement('textarea')
        textArea.value = productos.map(p =>
          `${p.codigo || ''}\t${p.referencia || ''}\t${p.sku || ''}\t${p.nombre || ''}\t${p.descripcion || ''}\t${formatearNumero(p.precio || 0)}\t${p.stock || 0}\t${p.punto_reorden || ''}\t${p.stock_seguridad || ''}\t${p.precio_costo ? formatearNumero(p.precio_costo) : ''}\t${p.categoria || ''}\t${p.talla || ''}\t${p.color || ''}`
        ).join('\n')
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert(`✅ Tabla copiada al portapapeles!\n\n${productos.length} productos copiados.`)
      } catch (err) {
        alert('❌ Error al copiar. Por favor, selecciona y copia manualmente.')
      }
    }
  }

  const exportarProductosCSV = () => {
    try {
      // Crear encabezados
      const encabezados = ['Código', 'Referencia', 'SKU', 'Nombre', 'Descripción', 'Precio', 'Stock', 'P. Reorden', 'Stock Seg.', 'Precio Costo', 'Categoría', 'Talla', 'Color', 'Código Barras']

      // Crear filas de datos
      const filas = productos.map(producto => [
        producto.codigo || '',
        producto.referencia || '',
        producto.sku || '',
        `"${(producto.nombre || '').replace(/"/g, '""')}"`,
        `"${(producto.descripcion || '').replace(/"/g, '""')}"`,
        formatearNumero(producto.precio || 0),
        producto.stock || 0,
        producto.punto_reorden || '',
        producto.stock_seguridad || '',
        producto.precio_costo ? formatearNumero(producto.precio_costo) : '',
        producto.categoria || '',
        producto.talla || '',
        producto.color || '',
        producto.cod_barras || ''
      ])

      // Combinar encabezados y filas
      const datos = [encabezados, ...filas]

      // Convertir a CSV
      const csv = datos.map(fila => fila.join(',')).join('\n')

      // Crear blob y descargar
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM para Excel
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `productos_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert(`✅ Archivo CSV descargado!\n\n${productos.length} productos exportados.`)
    } catch (error) {
      console.error('Error al exportar CSV:', error)
      alert('❌ Error al exportar CSV: ' + error.message)
    }
  }

  const exportarProductosExcel = () => {
    try {
      // Crear hoja de trabajo
      const ws = XLSX.utils.aoa_to_sheet([
        ['Código', 'Referencia', 'SKU', 'Nombre', 'Descripción', 'Precio', 'Stock', 'P. Reorden', 'Stock Seg.', 'Precio Costo', 'Categoría', 'Talla', 'Color', 'Código Barras', 'Grupo Comercial', 'Colección', 'Unidad'],
        ...productos.map(producto => [
          producto.codigo || '',
          producto.referencia || '',
          producto.sku || '',
          producto.nombre || '',
          producto.descripcion || '',
          parseFloat(producto.precio || 0),
          producto.stock || 0,
          producto.punto_reorden || '',
          producto.stock_seguridad || '',
          producto.precio_costo ? parseFloat(producto.precio_costo) : '',
          producto.categoria || '',
          producto.talla || '',
          producto.color || '',
          producto.cod_barras || '',
          producto.grupo_comercial || '',
          producto.coleccion || '',
          producto.unidad || ''
        ])
      ])

      // Ajustar anchos de columna
      ws['!cols'] = [
        { wch: 15 }, // Código
        { wch: 15 }, // Referencia
        { wch: 15 }, // SKU
        { wch: 30 }, // Nombre
        { wch: 40 }, // Descripción
        { wch: 12 }, // Precio
        { wch: 10 }, // Stock
        { wch: 12 }, // P. Reorden
        { wch: 12 }, // Stock Seg.
        { wch: 12 }, // Precio Costo
        { wch: 15 }, // Categoría
        { wch: 10 }, // Talla
        { wch: 15 }, // Color
        { wch: 20 }, // Código Barras
        { wch: 20 }, // Grupo Comercial
        { wch: 15 }, // Colección
        { wch: 10 }  // Unidad
      ]

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Productos')

      // Descargar archivo
      XLSX.writeFile(wb, `productos_${new Date().toISOString().split('T')[0]}.xlsx`)

      alert(`✅ Archivo Excel descargado!\n\n${productos.length} productos exportados.`)
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      alert('❌ Error al exportar Excel: ' + error.message)
    }
  }

  const crearProductoEjemplo = async () => {
    if (!window.confirm('¿Desea crear un producto de ejemplo (Camiseta Básica - Talla XS) con todos los campos configurados?')) return

    try {
      const res = await axios.post(`${API_URL}/productos/ejemplo/prenda`)
      if (res.data.success) {
        alert('✅ Producto de ejemplo creado exitosamente!\n\n' +
          'Producto: Camiseta Básica - Talla XS\n' +
          'Código: PRENDA-001\n' +
          'SKU: PRENDA-XS-001\n' +
          'Stock: 45 unidades\n' +
          'Punto de Reorden: 30 unidades\n' +
          'Stock de Seguridad: 15 unidades')
        cargarProductos()
      } else {
        alert('⚠️ ' + (res.data.message || 'El producto de ejemplo ya existe'))
        cargarProductos()
      }
    } catch (error) {
      console.error('Error al crear producto de ejemplo:', error)
      let mensajeError = 'Error al crear el producto de ejemplo'

      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.data?.message) {
          mensajeError = error.response.data.message
        } else if (error.response.status === 404) {
          mensajeError = 'Endpoint no encontrado. Verifica que el backend esté corriendo.'
        } else if (error.response.status === 500) {
          mensajeError = 'Error en el servidor. Revisa la consola del backend.'
        } else if (error.response.status === 0) {
          mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + API_URL
        }
      } else if (error.request) {
        // Error de red
        mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + API_URL
      }

      alert('❌ ' + mensajeError + '\n\nDetalles: ' + (error.message || 'Error desconocido'))
    }
  }

  return (
    <div className="productos">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              className="btn-home"
              title="Volver a la pantalla principal"
            >
              Inicio
            </button>
            <h2 style={{ margin: 0 }}>📦 Productos</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn"
              style={{ backgroundColor: '#28a745', color: 'white' }}
              onClick={crearProductoEjemplo}
              title="Crear producto de ejemplo: Camiseta Básica - Talla XS con todos los campos configurados"
            >
              🎯 Crear Producto Ejemplo
            </button>
            <button
              className="btn"
              style={{ backgroundColor: '#ff6b35', color: 'white' }}
              onClick={() => {
                setMostrarIngresoMasivo(!mostrarIngresoMasivo)
                setDatosMasivos('')
                setProductosMasivos([])
              }}
              title="Importar múltiples productos desde texto/CSV"
            >
              📥 Ingreso Masivo
            </button>
            <button className="btn btn-primary" onClick={() => {
              setMostrarFormulario(!mostrarFormulario)
              setEditingId(null)
              setPlantillaSeleccionada('')
              setFormData({
                num_movimiento: '',
                fecha_movimiento: new Date().toISOString().split('T')[0],
                codigo: '',
                grupo_comercial: '',
                referencia: '',
                sku: '',
                nombre: '',
                descripcion: '',
                coleccion: '',
                categoria: '',
                talla: '',
                color: '',
                desc_color: '',
                cod_barras: '',
                precio_costo: '',
                precio: '',
                unidad: 'PZA',
                stock: '',
                punto_reorden: '',
                stock_seguridad: '',
                tiempo_entrega_dias: ''
              })
            }}>
              {mostrarFormulario ? 'Cancelar' : '+ Nuevo Producto'}
            </button>
          </div>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} style={{
            marginTop: '1.5rem',
            maxHeight: '80vh',
            overflowY: 'auto',
            paddingBottom: '100px'
          }}>
            {/* Selector de Plantillas */}
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                📋 Usar Plantilla (Opcional)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem'
              }}>
                {Object.entries(PLANTILLAS_PRODUCTOS).map(([key, plantilla]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => aplicarPlantilla(key)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: plantillaSeleccionada === key ? '#667eea' : 'white',
                      color: plantillaSeleccionada === key ? 'white' : '#495057',
                      border: `2px solid ${plantillaSeleccionada === key ? '#667eea' : '#dee2e6'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      if (plantillaSeleccionada !== key) {
                        e.target.style.backgroundColor = '#f0f4ff'
                        e.target.style.borderColor = '#667eea'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plantillaSeleccionada !== key) {
                        e.target.style.backgroundColor = 'white'
                        e.target.style.borderColor = '#dee2e6'
                      }
                    }}
                    title={plantilla.descripcion}
                  >
                    <div style={{
                      fontSize: '1.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      {plantilla.icono}
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '0.25rem'
                    }}>
                      {plantilla.nombre}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}>
                      {plantilla.descripcion}
                    </div>
                  </button>
                ))}
              </div>
              {plantillaSeleccionada && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  backgroundColor: '#e7f3ff',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#0066cc'
                }}>
                  ✓ Plantilla "{PLANTILLAS_PRODUCTOS[plantillaSeleccionada].nombre}" aplicada.
                  Puedes modificar los valores antes de guardar.
                </div>
              )}
            </div>

            {/* Sección: Información de Movimiento */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f4ff', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#667eea' }}>📋 Información de Movimiento</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Número de Movimiento</label>
                  <input
                    type="text"
                    value={formData.num_movimiento}
                    onChange={(e) => setFormData({ ...formData, num_movimiento: e.target.value })}
                    placeholder="Ej: VEX2275"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Movimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_movimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_movimiento: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Información Básica */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#495057' }}>📦 Información Básica</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Referencia *</label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    placeholder="Ej: 139D010, 169D101"
                    required
                    style={{
                      border: formData.referencia ? '1px solid #dee2e6' : '2px solid #ffc107',
                      backgroundColor: formData.referencia ? 'white' : '#fffbf0'
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    Referencia del producto (requerido)
                  </small>
                </div>
                <div className="form-group">
                  <label>Grupo Comercial</label>
                  <input
                    type="text"
                    value={formData.grupo_comercial}
                    onChange={(e) => setFormData({ ...formData, grupo_comercial: e.target.value })}
                    placeholder="Ej: REBECA DEL"
                  />
                </div>
                <div className="form-group">
                  <label>SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="Identificador único del producto/variante"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="3"
                    placeholder="Ej: PANTALÓN (9D), SUETER TEJID 9D"
                  />
                </div>
                <div className="form-group">
                  <label>Colección</label>
                  <input
                    type="text"
                    value={formData.coleccion}
                    onChange={(e) => setFormData({ ...formData, coleccion: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Variantes */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#dc3545' }}>🎨 Variantes</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Talla</label>
                  <input
                    type="text"
                    value={formData.talla}
                    onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
                    placeholder="Ej: XS, S, M, L, XL, 10, 12, 14, 34-L, 34-M"
                  />
                </div>
                <div className="form-group">
                  <label>Color (Código)</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Ej: A00948, A02168, A01099"
                  />
                </div>
                <div className="form-group">
                  <label>Descripción del Color</label>
                  <input
                    type="text"
                    value={formData.desc_color}
                    onChange={(e) => setFormData({ ...formData, desc_color: e.target.value })}
                    placeholder="Ej: CRUDO PURO, AZUL NAVEG, AZUL TRANQ"
                  />
                </div>
                <div className="form-group">
                  <label>Código de Barras (máx. 50 caracteres)</label>
                  <input
                    type="text"
                    value={formData.cod_barras}
                    onChange={(e) => {
                      const valor = e.target.value.substring(0, 50)
                      setFormData({ ...formData, cod_barras: valor })
                    }}
                    placeholder="Ej: 77064558581"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Precios y Unidades */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fff4', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#28a745' }}>💰 Precios y Unidades</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Precio de Costo</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.precio_costo}
                    onChange={(e) => {
                      const valor = parsearNumero(e.target.value)
                      setFormData({ ...formData, precio_costo: valor > 0 ? valor.toString() : e.target.value })
                    }}
                    onBlur={(e) => {
                      const valor = parsearNumero(e.target.value)
                      setFormData({ ...formData, precio_costo: valor > 0 ? formatearNumero(valor) : '' })
                    }}
                    placeholder="Precio de compra"
                  />
                </div>
                <div className="form-group">
                  <label>Precio Público (Venta) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => {
                      const valor = parsearNumero(e.target.value)
                      setFormData({ ...formData, precio: valor > 0 ? valor.toString() : e.target.value })
                    }}
                    onBlur={(e) => {
                      const valor = parsearNumero(e.target.value)
                      setFormData({ ...formData, precio: valor > 0 ? formatearNumero(valor) : '' })
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unidad</label>
                  <select
                    value={formData.unidad}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem' }}
                  >
                    <option value="PZA">PZA - Pieza</option>
                    <option value="KG">KG - Kilogramo</option>
                    <option value="L">L - Litro</option>
                    <option value="M">M - Metro</option>
                    <option value="M2">M² - Metro cuadrado</option>
                    <option value="M3">M³ - Metro cúbico</option>
                    <option value="PAR">PAR - Par</option>
                    <option value="SET">SET - Set</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Control de Inventario */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fffbf0', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#f59e0b' }}>⚠️ Control de Inventario</h3>
              <div className="grid grid-2">

                <div className="form-group">
                  <label>Punto de Reorden</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.punto_reorden || ''}
                    onChange={(e) => setFormData({ ...formData, punto_reorden: e.target.value })}
                    placeholder="Alerta cuando stock baja de este valor"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    Alerta automática cuando el stock baja de este valor
                  </small>
                </div>

                <div className="form-group">
                  <label>Stock de Seguridad</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_seguridad || ''}
                    onChange={(e) => setFormData({ ...formData, stock_seguridad: e.target.value })}
                    placeholder="Colchón extra para evitar quiebres"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    Colchón extra para evitar quiebres de stock ante picos de demanda
                  </small>
                </div>

                <div className="form-group">
                  <label>Tiempo de Entrega (días)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tiempo_entrega_dias || ''}
                    onChange={(e) => setFormData({ ...formData, tiempo_entrega_dias: e.target.value })}
                    placeholder="Tiempo de entrega del proveedor"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    Tiempo de entrega del proveedor en días (para cálculo de punto de reorden)
                  </small>
                </div>
              </div>
            </div>

            {/* Botón de Guardar - Fijo y visible */}
            <div style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white',
              padding: '1rem',
              marginTop: '1.5rem',
              borderTop: '2px solid #dee2e6',
              borderRadius: '8px',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setMostrarFormulario(false)
                    setEditingId(null)
                    setPlantillaSeleccionada('')
                    setFormData({
                      num_movimiento: '',
                      fecha_movimiento: new Date().toISOString().split('T')[0],
                      codigo: '',
                      grupo_comercial: '',
                      referencia: '',
                      sku: '',
                      nombre: '',
                      descripcion: '',
                      coleccion: '',
                      categoria: '',
                      talla: '',
                      color: '',
                      desc_color: '',
                      cod_barras: '',
                      precio_costo: '',
                      precio: '',
                      unidad: 'PZA',
                      stock: '',
                      punto_reorden: '',
                      stock_seguridad: '',
                      tiempo_entrega_dias: ''
                    })
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    minWidth: '150px',
                    fontSize: '1rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {editingId ? '💾 Actualizar' : '✅ Crear'} Producto
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Modal de Ingreso Masivo */}
      {mostrarIngresoMasivo && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>📥 Ingreso Masivo de Productos</h2>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setMostrarIngresoMasivo(false)
                setDatosMasivos('')
                setProductosMasivos([])
              }}
            >
              ✕ Cerrar
            </button>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>📋 Formato de Datos</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
              <strong>Opción 1:</strong> Importa directamente desde Excel (.xlsx, .xls) - El sistema detectará automáticamente las columnas.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
              <strong>Opción 2:</strong> Pega datos separados por <strong>|</strong> (pipe) o importa CSV. Una línea por producto:
            </p>
            <code style={{
              display: 'block',
              padding: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginBottom: '0.5rem'
            }}>
              descripcion|talla|color|codigo_barras|precio|stock|punto_reorden|stock_seguridad|num_movimiento|fecha_movimiento|grupo_comercial|referencia|coleccion|categoria|desc_color|precio_costo|unidad
            </code>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
              <strong>Columnas de Excel detectadas automáticamente:</strong> descripcion, talla, color, codigo_barras, precio, stock, punto_reorden, stock_seguridad, num_movimiento, fecha_movimiento, grupo_comercial, referencia, coleccion, categoria, desc_color, precio_costo, unidad
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
              <strong>Ejemplo CSV/TXT:</strong>
            </p>
            <code style={{
              display: 'block',
              padding: '0.5rem',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap'
            }}>
              {`PANTALÓN (9D)|10|CRUDO PURO|77064558581|25.9|2|30|15|VEX2275|2024-01-15|REBECA DEL|139D010|||CRUDO PURO|15.50|PZA
PANTALÓN (9D)|12|CRUDO PURO|77064558582|25.9|1|30|15|VEX2275|2024-01-15|REBECA DEL|139D010|||CRUDO PURO|15.50|PZA`}
            </code>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 'bold' }}>
                Datos a Importar:
              </label>
              <div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return

                    const extension = file.name.split('.').pop().toLowerCase()
                    if (extension === 'xlsx' || extension === 'xls') {
                      manejarArchivoExcel(e)
                    } else {
                      manejarArchivoCSV(e)
                    }

                    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
                    e.target.value = ''
                  }}
                  style={{ display: 'none' }}
                  id="file-input-excel"
                />
                <label
                  htmlFor="file-input-excel"
                  className="btn"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    cursor: 'pointer',
                    marginRight: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}
                  title="Importar desde Excel (.xlsx, .xls) o CSV (.csv, .txt)"
                >
                  📊 Importar desde Excel/CSV
                </label>
              </div>
            </div>
            <textarea
              value={datosMasivos}
              onChange={(e) => setDatosMasivos(e.target.value)}
              placeholder="Pega aquí los datos separados por | (pipe) o importa desde Excel/CSV...&#10;&#10;Ejemplo:&#10;PANTALÓN (9D)|10|CRUDO PURO|77064558581|25.9|2|30|15|VEX2275|2024-01-15|REBECA DEL|139D010|||CRUDO PURO|15.50|PZA"
              rows="10"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: '#667eea',
                  color: 'white'
                }}
                onClick={procesarIngresoMasivo}
                disabled={!datosMasivos.trim()}
              >
                🔍 Procesar y Vista Previa
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white'
                }}
                onClick={() => {
                  setDatosMasivos('')
                  setProductosMasivos([])
                }}
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>

          {productosMasivos.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>
                Vista Previa ({productosMasivos.length} productos)
              </h3>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th>Código</th>
                      <th>SKU</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosMasivos.map((producto, index) => (
                      <tr key={index}>
                        <td>{producto.codigo}</td>
                        <td>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: '#667eea'
                          }}>
                            {producto.sku}
                          </span>
                        </td>
                        <td>{producto.nombre}</td>
                        <td>${formatearNumero(producto.precio)}</td>
                        <td>{producto.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'white',
                padding: '1rem',
                marginTop: '1rem',
                borderTop: '2px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setProductosMasivos([])
                    setDatosMasivos('')
                  }}
                >
                  Limpiar Vista Previa
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    minWidth: '200px',
                    fontSize: '1rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 'bold'
                  }}
                  onClick={crearProductosMasivos}
                  disabled={procesandoMasivo || productosMasivos.length === 0}
                >
                  {procesandoMasivo ? '⏳ Creando...' : `✅ Crear ${productosMasivos.length} Productos`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>Lista de Productos</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={copiarTablaProductos}
              title="Copiar toda la tabla de productos al portapapeles"
            >
              📋 Copiar Tabla
            </button>
            <button
              className="btn"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={exportarProductosCSV}
              title="Exportar productos a CSV"
            >
              📥 Exportar CSV
            </button>
            <button
              className="btn"
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onClick={exportarProductosExcel}
              title="Exportar productos a Excel"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>
        <table className="table" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
          <thead>
            <tr>
              <th style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>Código</th>
              <th>Referencia</th>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>P. Reorden</th>
              <th>Stock Seg.</th>
              <th>Inventario</th>
              <th>Ventas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id}>
                <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={producto.codigo}>
                  {producto.codigo?.substring(0, 15) || 'N/A'}
                </td>
                <td>{producto.referencia || 'N/A'}</td>
                <td>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: '#667eea',
                    backgroundColor: '#f0f4ff',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {producto.sku || 'N/A'}
                  </span>
                </td>
                <td>{producto.nombre}</td>
                <td>{producto.descripcion || 'N/A'}</td>
                <td>${formatearNumero(producto.precio)}</td>
                <td>
                  <span className={
                    producto.stock === 0 ? 'badge badge-danger' :
                      producto.punto_reorden && producto.stock <= producto.punto_reorden ? 'badge badge-warning' :
                        producto.stock < 10 ? 'badge badge-warning' : ''
                  }>
                    {producto.stock}
                  </span>
                  {producto.punto_reorden && producto.stock <= producto.punto_reorden && (
                    <span style={{
                      marginLeft: '5px',
                      fontSize: '0.7rem',
                      color: '#f59e0b',
                      fontWeight: 'bold'
                    }} title="Alcanzó punto de reorden">
                      ⚠️
                    </span>
                  )}
                </td>
                <td>
                  {producto.punto_reorden ? (
                    <span style={{
                      fontSize: '0.85rem',
                      color: producto.stock <= producto.punto_reorden ? '#f59e0b' : '#6b7280'
                    }}>
                      {producto.punto_reorden}
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>-</span>
                  )}
                </td>
                <td>
                  {producto.stock_seguridad ? (
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {producto.stock_seguridad}
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>-</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                    <a
                      href={`/inventario?kardex=${producto.id}`}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        background: '#8b5cf6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                      title="Ver Kardex"
                    >
                      📑 Kardex
                    </a>
                    {productosInfo[producto.id]?.movimientos?.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                        {productosInfo[producto.id].movimientos.length} movimientos
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                    {productosInfo[producto.id]?.totalVentas > 0 ? (
                      <>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>
                          ${formatearMoneda(productosInfo[producto.id].totalVentas)}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                          {productosInfo[producto.id].cantidadVendida} unidades
                        </span>
                        {productosInfo[producto.id].facturas?.length > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#667eea' }}>
                            {productosInfo[producto.id].facturas.length} facturas
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>Sin ventas</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      onClick={() => editarProducto(producto)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      onClick={() => eliminarProducto(producto.id)}
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
    </div>
  )
}

export default Productos





