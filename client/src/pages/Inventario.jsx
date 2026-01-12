import React, { useState, useEffect } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import './Inventario.css'
import { API_URL } from '../config/api'
import { redondear4Decimales, redondear2Decimales, formatearNumero, formatearMoneda, parsearNumero } from '../utils/formateo'
import { TomaFisicaInventario } from '../components/TomaFisicaInventario'
import { TransferenciaScanner } from '../components/TransferenciaScanner'

function Inventario({ socket }) {
  const navigate = useNavigate()
  const [seccionActiva, setSeccionActiva] = useState('inventario')
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroStock, setFiltroStock] = useState('todos') // todos, bajo, normal, alto
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState(null)
  const [puntosVenta, setPuntosVenta] = useState([])

  useEffect(() => {
    const cargarPuntosVenta = async () => {
      try {
        const response = await axios.get(`${API_URL}/puntos-venta`)
        setPuntosVenta(response.data || [])

        // Si no hay punto de venta seleccionado, seleccionar el primero o el guardado
        const puntoVentaGuardado = localStorage.getItem('puntoVentaSeleccionado')
        if (puntoVentaGuardado) {
          setPuntoVentaSeleccionado(JSON.parse(puntoVentaGuardado))
        } else if (response.data.length > 0) {
          const principal = response.data.find(pv => pv.es_principal) || response.data[0]
          setPuntoVentaSeleccionado(principal)
          localStorage.setItem('puntoVentaSeleccionado', JSON.stringify(principal))
        }
      } catch (error) {
        console.error('Error al cargar puntos de venta:', error)
      }
    }
    cargarPuntosVenta()
  }, [])
  const [mostrarFormularioMovimiento, setMostrarFormularioMovimiento] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada') // entrada, salida, ajuste
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cantidadMovimiento, setCantidadMovimiento] = useState('')
  const [motivoMovimiento, setMotivoMovimiento] = useState('')
  const [fechaMovimiento, setFechaMovimiento] = useState(new Date().toISOString().split('T')[0])
  const [mostrarAlertas, setMostrarAlertas] = useState(true)
  const [productoKardex, setProductoKardex] = useState(null)
  const [kardexData, setKardexData] = useState(null)
  const [cargandoKardex, setCargandoKardex] = useState(false)
  const [mostrarTransferencia, setMostrarTransferencia] = useState(false)
  const [transferenciaData, setTransferenciaData] = useState({
    producto_id: null,
    punto_venta_origen: null,
    punto_venta_destino: null,
    cantidad: ''
  })
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    valorTotal: 0,
    productosBajoStock: 0,
    productosSinStock: 0,
    movimientosHoy: 0,
    ventasHoy: 0,
    costoVentasHoy: 0
  })
  const [facturas, setFacturas] = useState([])
  const [asientosContables, setAsientosContables] = useState([])



  useEffect(() => {
    if (puntoVentaSeleccionado) {
      cargarDatos()
    }

    if (socket) {
      socket.on('producto-actualizado', () => {
        if (puntoVentaSeleccionado) {
          cargarDatos()
        }
      })
      socket.on('inventario-actualizado', () => {
        if (puntoVentaSeleccionado) {
          cargarDatos()
        }
      })
    }

    return () => {
      if (socket) {
        socket.off('producto-actualizado')
        socket.off('inventario-actualizado')
      }
    }
  }, [socket, puntoVentaSeleccionado])

  const cargarDatos = async () => {
    if (!puntoVentaSeleccionado) return

    setLoading(true)
    try {
      const [productosRes, movimientosRes, estadisticasRes] = await Promise.all([
        axios.get(`${API_URL}/inventario/punto-venta/${puntoVentaSeleccionado.id}`),
        axios.get(`${API_URL}/inventario/movimientos`),
        axios.get(`${API_URL}/inventario/estadisticas`).catch(() => ({ data: null }))
      ])

      // Los productos ya vienen con stock_punto_venta desde el backend
      setProductos(productosRes.data || [])
      setMovimientos(movimientosRes.data || [])

      // Cargar facturas relacionadas con movimientos
      const facturasIds = [...new Set(movimientosRes.data
        .filter(m => m.factura_id || m.factura_numero)
        .map(m => m.factura_id || m.factura_numero)
        .filter(Boolean))]

      if (facturasIds.length > 0) {
        try {
          const facturasRes = await axios.get(`${API_URL}/facturas/buscar`, {
            params: { ids: facturasIds.join(',') }
          }).catch(() => ({ data: [] }))
          setFacturas(facturasRes.data || [])
        } catch (err) {
          console.error('Error al cargar facturas:', err)
        }
      }

      calcularEstadisticas(productosRes.data || [], movimientosRes.data || [], estadisticasRes.data)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      // Si no existe el endpoint, usar productos como fallback
      try {
        const productosRes = await axios.get(`${API_URL}/productos`)
        // Mapear productos para incluir stock_punto_venta (usar stock global como fallback)
        const productosMapeados = (productosRes.data || []).map(p => ({
          ...p,
          stock_punto_venta: p.stock || 0
        }))
        setProductos(productosMapeados)
        setMovimientos([])
        calcularEstadisticas(productosMapeados, [], null)
      } catch (err) {
        console.error('Error al cargar productos:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = (productosData, movimientosData = [], estadisticasBackend = null) => {
    const totalProductos = productosData.length
    let valorTotal = 0
    let productosBajoStock = 0
    let productosSinStock = 0
    const hoy = new Date().toISOString().split('T')[0]
    const movimientosHoy = movimientosData.filter(m => {
      const fechaMov = m.fecha?.split('T')[0] || m.fecha
      return fechaMov === hoy
    }).length

    // Calcular ventas y costo de ventas del día
    const movimientosSalidaHoy = movimientosData.filter(m => {
      const fechaMov = m.fecha?.split('T')[0] || m.fecha
      return fechaMov === hoy && (m.tipo === 'SALIDA' || m.tipo === 'salida')
    })

    let ventasHoy = 0
    let costoVentasHoy = 0

    movimientosSalidaHoy.forEach(mov => {
      const producto = productosData.find(p => p.id === mov.producto_id)
      if (producto) {
        const precioCosto = redondear4Decimales(parseFloat(producto.precio_costo) || 0)
        const cantidad = redondear4Decimales(mov.cantidad || 0)
        costoVentasHoy = redondear2Decimales(costoVentasHoy + (cantidad * precioCosto))
        // Si hay factura relacionada, obtener el precio de venta
        if (mov.factura_id || mov.factura_numero) {
          const factura = facturas.find(f => f.id === mov.factura_id || f.numero === mov.factura_numero)
          if (factura) {
            const detalle = factura.detalles?.find(d => d.producto_id === mov.producto_id)
            if (detalle) {
              const subtotalDetalle = detalle.subtotal || (redondear4Decimales(detalle.cantidad) * redondear4Decimales(detalle.precio_unitario))
              ventasHoy = redondear2Decimales(ventasHoy + subtotalDetalle)
            }
          }
        }
      }
    })

    productosData.forEach(producto => {
      // Usar stock_punto_venta si existe, sino usar stock global
      const stock = parseInt(producto.stock_punto_venta !== undefined ? producto.stock_punto_venta : producto.stock) || 0
      const precioCosto = redondear4Decimales(parseFloat(producto.precio_costo) || 0)
      valorTotal = redondear2Decimales(valorTotal + (stock * precioCosto))

      const puntoReorden = parseInt(producto.punto_reorden) || 0
      if (stock === 0) {
        productosSinStock++
      } else if (stock <= puntoReorden) {
        productosBajoStock++
      }
    })

    setEstadisticas({
      totalProductos,
      valorTotal: estadisticasBackend?.valor_total || valorTotal,
      productosBajoStock,
      productosSinStock,
      movimientosHoy,
      ventasHoy: estadisticasBackend?.ventas_hoy || ventasHoy,
      costoVentasHoy: estadisticasBackend?.costo_ventas_hoy || costoVentasHoy
    })
  }

  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = !busqueda ||
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.cod_barras?.toLowerCase().includes(busqueda.toLowerCase())

    // Usar stock_punto_venta si existe, sino usar stock global
    const stock = parseInt(producto.stock_punto_venta !== undefined ? producto.stock_punto_venta : producto.stock) || 0
    const puntoReorden = parseInt(producto.punto_reorden) || 0

    let coincideFiltroStock = true
    if (filtroStock === 'bajo') {
      coincideFiltroStock = stock > 0 && stock <= puntoReorden
    } else if (filtroStock === 'sin') {
      coincideFiltroStock = stock === 0
    } else if (filtroStock === 'normal') {
      coincideFiltroStock = stock > puntoReorden
    }

    const coincideCategoria = !filtroCategoria || producto.categoria === filtroCategoria

    return coincideBusqueda && coincideFiltroStock && coincideCategoria
  })

  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]

  const handleCrearMovimiento = async (e) => {
    e.preventDefault()
    if (!productoSeleccionado || !cantidadMovimiento || !puntoVentaSeleccionado) {
      alert('Por favor complete todos los campos')
      return
    }

    try {
      const movimiento = {
        producto_id: productoSeleccionado.id,
        tipo: tipoMovimiento, // El backend lo convertirá a mayúsculas
        cantidad: parseFloat(cantidadMovimiento),
        motivo: motivoMovimiento,
        fecha: fechaMovimiento,
        punto_venta_id: puntoVentaSeleccionado.id
      }

      await axios.post(`${API_URL}/inventario/movimientos`, movimiento)

      if (socket) {
        socket.emit('inventario-actualizado')
      }

      setMostrarFormularioMovimiento(false)
      setProductoSeleccionado(null)
      setCantidadMovimiento('')
      setMotivoMovimiento('')
      cargarDatos()
      alert('Movimiento registrado exitosamente')
    } catch (error) {
      console.error('Error al crear movimiento:', error)
      alert('Error al registrar el movimiento: ' + (error.response?.data?.message || error.message))
    }
  }

  const cargarKardex = async (productoId, puntoVentaId = null) => {
    try {
      setCargandoKardex(true)
      const url = puntoVentaId
        ? `${API_URL}/inventario/kardex/${productoId}?punto_venta_id=${puntoVentaId}`
        : `${API_URL}/inventario/kardex/${productoId}`
      const response = await axios.get(url)
      setKardexData(response.data)
    } catch (error) {
      console.error('Error al cargar kardex:', error)
      alert('Error al cargar el kardex del producto')
      setKardexData(null)
    } finally {
      setCargandoKardex(false)
    }
  }

  const handleProductoKardexChange = (e) => {
    const productoId = parseInt(e.target.value)
    if (productoId) {
      const producto = productos.find(p => p.id === productoId)
      setProductoKardex(producto)
      cargarKardex(productoId)
    } else {
      setProductoKardex(null)
      setKardexData(null)
    }
  }

  const productosConAlerta = productos.filter(p => {
    const stock = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
    const puntoReorden = parseInt(p.punto_reorden) || 0
    return stock <= puntoReorden
  })

  const handleTransferencia = async (e) => {
    e.preventDefault()
    if (!transferenciaData.producto_id || !transferenciaData.punto_venta_origen ||
      !transferenciaData.punto_venta_destino || !transferenciaData.cantidad) {
      alert('Por favor complete todos los campos')
      return
    }

    try {
      await axios.post(`${API_URL}/inventario/transferencia`, {
        producto_id: transferenciaData.producto_id,
        punto_venta_origen: transferenciaData.punto_venta_origen,
        punto_venta_destino: transferenciaData.punto_venta_destino,
        cantidad: parseFloat(transferenciaData.cantidad)
      })

      setMostrarTransferencia(false)
      setTransferenciaData({
        producto_id: null,
        punto_venta_origen: null,
        punto_venta_destino: null,
        cantidad: ''
      })
      cargarDatos()
      alert('Transferencia realizada exitosamente')
    } catch (error) {
      console.error('Error al transferir stock:', error)
      alert('Error al transferir stock: ' + (error.response?.data?.message || error.message))
    }
  }

  const exportarInventarioExcel = () => {
    try {
      if (!puntoVentaSeleccionado) {
        alert('Por favor seleccione un punto de venta')
        return
      }

      const productosReporte = productosFiltrados.map(producto => {
        const stock = parseInt(producto.stock_punto_venta !== undefined ? producto.stock_punto_venta : producto.stock) || 0
        const precioCosto = parseFloat(producto.precio_costo) || 0
        const valorTotal = stock * precioCosto
        const puntoReorden = parseInt(producto.punto_reorden) || 0

        let estado = 'Normal'
        if (stock === 0) {
          estado = 'Sin Stock'
        } else if (stock <= puntoReorden) {
          estado = 'Stock Bajo'
        }

        return {
          'Código': producto.codigo || '',
          'Referencia': producto.referencia || '',
          'SKU': producto.sku || '',
          'Nombre': producto.nombre || '',
          'Descripción': producto.descripcion || '',
          'Categoría': producto.categoria || '',
          'Stock': stock,
          'Punto Reorden': puntoReorden,
          'Stock Seguridad': producto.stock_seguridad || '',
          'Precio Costo': precioCosto,
          'Precio Venta': parseFloat(producto.precio || 0),
          'Valor Total': valorTotal,
          'Estado': estado,
          'Unidad': producto.unidad || '',
          'Código Barras': producto.cod_barras || ''
        }
      })

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(productosReporte)

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 15 }, // Código
        { wch: 15 }, // Referencia
        { wch: 15 }, // SKU
        { wch: 30 }, // Nombre
        { wch: 40 }, // Descripción
        { wch: 15 }, // Categoría
        { wch: 10 }, // Stock
        { wch: 12 }, // Punto Reorden
        { wch: 12 }, // Stock Seguridad
        { wch: 12 }, // Precio Costo
        { wch: 12 }, // Precio Venta
        { wch: 12 }, // Valor Total
        { wch: 12 }, // Estado
        { wch: 10 }, // Unidad
        { wch: 15 }  // Código Barras
      ]
      ws['!cols'] = colWidths

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new()

      // Agregar hoja de resumen
      const resumenData = [
        ['REPORTE DE INVENTARIO'],
        ['Punto de Venta:', puntoVentaSeleccionado.nombre],
        ['Código:', puntoVentaSeleccionado.codigo],
        ['Fecha de Reporte:', new Date().toLocaleDateString('es-ES')],
        [''],
        ['RESUMEN'],
        ['Total Productos:', estadisticas.totalProductos],
        ['Valor Total Inventario:', formatearMoneda(estadisticas.valorTotal)],
        ['Productos con Stock Bajo:', estadisticas.productosBajoStock],
        ['Productos Sin Stock:', estadisticas.productosSinStock],
        ['']
      ]
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

      // Agregar hoja de productos
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

      // Descargar archivo
      const nombreArchivo = `inventario_${puntoVentaSeleccionado.codigo}_${puntoVentaSeleccionado.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      alert(`✅ Reporte Excel descargado!\n\n${productosReporte.length} productos exportados.\nPunto de Venta: ${puntoVentaSeleccionado.nombre}`)
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      alert('❌ Error al exportar Excel: ' + error.message)
    }
  }

  const exportarInventarioCSV = () => {
    try {
      if (!puntoVentaSeleccionado) {
        alert('Por favor seleccione un punto de venta')
        return
      }

      // Crear encabezados
      const encabezados = ['Código', 'Referencia', 'SKU', 'Nombre', 'Descripción', 'Categoría', 'Stock', 'P. Reorden', 'Stock Seg.', 'Precio Costo', 'Precio Venta', 'Valor Total', 'Estado', 'Unidad', 'Código Barras']

      // Crear filas de datos
      const filas = productosFiltrados.map(producto => {
        const stock = parseInt(producto.stock_punto_venta !== undefined ? producto.stock_punto_venta : producto.stock) || 0
        const precioCosto = parseFloat(producto.precio_costo) || 0
        const valorTotal = stock * precioCosto
        const puntoReorden = parseInt(producto.punto_reorden) || 0

        let estado = 'Normal'
        if (stock === 0) {
          estado = 'Sin Stock'
        } else if (stock <= puntoReorden) {
          estado = 'Stock Bajo'
        }

        return [
          producto.codigo || '',
          producto.referencia || '',
          producto.sku || '',
          `"${(producto.nombre || '').replace(/"/g, '""')}"`,
          `"${(producto.descripcion || '').replace(/"/g, '""')}"`,
          producto.categoria || '',
          stock,
          puntoReorden,
          producto.stock_seguridad || '',
          formatearNumero(precioCosto),
          formatearNumero(producto.precio || 0),
          formatearNumero(valorTotal),
          estado,
          producto.unidad || '',
          producto.cod_barras || ''
        ]
      })

      // Crear contenido CSV
      const contenidoCSV = [
        `REPORTE DE INVENTARIO - ${puntoVentaSeleccionado.nombre} (${puntoVentaSeleccionado.codigo})`,
        `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
        `Total Productos: ${estadisticas.totalProductos}`,
        `Valor Total: ${formatearMoneda(estadisticas.valorTotal)}`,
        '',
        encabezados.join(','),
        ...filas.map(fila => fila.join(','))
      ].join('\n')

      // Crear blob y descargar
      const blob = new Blob(['\ufeff' + contenidoCSV], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `inventario_${puntoVentaSeleccionado.codigo}_${puntoVentaSeleccionado.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      alert(`✅ Reporte CSV descargado!\n\n${productosFiltrados.length} productos exportados.\nPunto de Venta: ${puntoVentaSeleccionado.nombre}`)
    } catch (error) {
      console.error('Error al exportar CSV:', error)
      alert('❌ Error al exportar CSV: ' + error.message)
    }
  }

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
            title="Volver a la pantalla principal"
          >
            Inicio
          </button>
          <h1>📦 Control de Inventario</h1>
          <div className="punto-venta-selector">
            <label>Filtrar por Punto de Venta:</label>
            <select
              value={puntoVentaSeleccionado?.id || ''}
              onChange={(e) => {
                const puntoVenta = puntosVenta.find(pv => pv.id === parseInt(e.target.value))
                if (puntoVenta) {
                  setPuntoVentaSeleccionado(puntoVenta)
                  localStorage.setItem('puntoVentaSeleccionado', JSON.stringify(puntoVenta))
                }
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {puntosVenta.map(pv => (
                <option key={pv.id} value={pv.id}>
                  {pv.nombre} ({pv.codigo})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setTipoMovimiento('entrada')
              setMostrarFormularioMovimiento(true)
            }}
          >
            ➕ Nueva Entrada
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setTipoMovimiento('salida')
              setMostrarFormularioMovimiento(true)
            }}
          >
            ➖ Nueva Salida
          </button>
          <button
            className="btn-warning"
            onClick={() => {
              setTipoMovimiento('ajuste')
              setMostrarFormularioMovimiento(true)
            }}
          >
            🔄 Ajuste de Stock
          </button>
          <button
            className="btn-secondary"
            onClick={() => setMostrarTransferencia(true)}
            style={{ background: '#667eea' }}
          >
            🔄 Transferir Stock
          </button>
          <button
            className="btn-secondary"
            onClick={() => setSeccionActiva('reportes')}
            style={{ background: '#10b981' }}
            title="Ver reportes de inventario"
          >
            📊 Reportes
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.totalProductos}</div>
            <div className="stat-label">Total Productos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{formatearMoneda(estadisticas.valorTotal)}</div>
            <div className="stat-label">Valor Total</div>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.productosBajoStock}</div>
            <div className="stat-label">Stock Bajo</div>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.productosSinStock}</div>
            <div className="stat-label">Sin Stock</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{estadisticas.movimientosHoy}</div>
            <div className="stat-label">Movimientos Hoy</div>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      {mostrarAlertas && productosConAlerta.length > 0 && (
        <div className="alertas-container">
          <div className="alertas-header">
            <h3>⚠️ Alertas de Stock</h3>
            <button onClick={() => setMostrarAlertas(false)}>✕</button>
          </div>
          <div className="alertas-list">
            {productosConAlerta.slice(0, 5).map(producto => (
              <div key={producto.id} className="alerta-item">
                <span className="alerta-producto">{producto.nombre}</span>
                <span className="alerta-stock">
                  Stock: {producto.stock || 0} | Mínimo: {producto.punto_reorden || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="filtros-container">
        <div className="busqueda-container">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, código, SKU o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>
        <div className="filtros-row">
          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="select-filtro"
          >
            <option value="todos">Todos los productos</option>
            <option value="bajo">Stock bajo</option>
            <option value="sin">Sin stock</option>
            <option value="normal">Stock normal</option>
          </select>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${seccionActiva === 'inventario' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('inventario')}
        >
          📦 Inventario ({productosFiltrados.length})
        </button>
        <button
          className={`tab ${seccionActiva === 'movimientos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('movimientos')}
        >
          📋 Movimientos ({movimientos.length})
        </button>
        <button
          className={`tab ${seccionActiva === 'kardex' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('kardex')}
        >
          📑 Kardex
        </button>
        <button
          className={`tab ${seccionActiva === 'fisica' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('fisica')}
        >
          📋 Toma Física
        </button>
        <button
          className={`tab ${seccionActiva === 'scanner' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('scanner')}
        >
          📦 Transfer Scanner
        </button>
        <button
          className={`tab ${seccionActiva === 'reportes' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('reportes')}
        >
          📊 Reportes
        </button>
      </div>

      {/* Contenido según tab activo */}
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : seccionActiva === 'fisica' ? (
        <TomaFisicaInventario
          productos={productos}
          puntoVenta={puntoVentaSeleccionado}
          onTerminar={() => {
            cargarDatos()
            setSeccionActiva('inventario')
          }}
        />
      ) : seccionActiva === 'scanner' ? (
        <TransferenciaScanner
          puntosVenta={puntosVenta}
          puntoVentaActual={puntoVentaSeleccionado}
          onTerminar={() => {
            cargarDatos()
            setSeccionActiva('inventario')
          }}
        />
      ) : seccionActiva === 'inventario' ? (
        <div className="tabla-container">
          <table className="tabla-inventario">
            <thead>
              <tr>
                <th style={{ maxWidth: '100px' }}>Código</th>
                <th>Referencia</th>
                <th>Producto</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Precio Costo</th>
                <th>Valor Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="12" className="sin-datos">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productosFiltrados.map(producto => {
                  // Usar stock_punto_venta si existe, sino usar stock global
                  const stock = parseInt(producto.stock_punto_venta !== undefined ? producto.stock_punto_venta : producto.stock) || 0
                  const puntoReorden = parseInt(producto.punto_reorden) || 0
                  const precioCosto = parseFloat(producto.precio_costo) || 0
                  const valorTotal = stock * precioCosto

                  let estado = 'normal'
                  let estadoTexto = 'Normal'
                  if (stock === 0) {
                    estado = 'sin-stock'
                    estadoTexto = 'Sin Stock'
                  } else if (stock <= puntoReorden) {
                    estado = 'bajo'
                    estadoTexto = 'Stock Bajo'
                  }

                  return (
                    <tr key={producto.id} className={estado}>
                      <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={producto.codigo || producto.sku || '-'}>
                        {(producto.codigo || producto.sku || '-').substring(0, 15)}
                      </td>
                      <td>{producto.referencia || 'N/A'}</td>
                      <td>
                        <div className="producto-info">
                          <strong>{producto.nombre || '-'}</strong>
                          {producto.descripcion && (
                            <small>{producto.descripcion}</small>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold', color: '#1e40af' }}>{producto.talla || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: '#1e40af' }} title={producto.desc_color}>{producto.color || '-'}</td>
                      <td>{producto.categoria || '-'}</td>
                      <td className="stock-cell relative-cell">
                        <span className={`stock-badge ${estado} has-tooltip`}>
                          {stock}
                          {producto.desglose_stock && producto.desglose_stock.length > 0 && (
                            <div className="stock-tooltip">
                              <div className="tooltip-header">Stock por Bodega</div>
                              {producto.desglose_stock.map(d => (
                                <div key={d.punto_venta_id} className="tooltip-row">
                                  <span>{d.nombre} ({d.codigo}):</span>
                                  <strong>{d.stock}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </span>
                      </td>
                      <td>{puntoReorden}</td>
                      <td>{formatearMoneda(precioCosto)}</td>
                      <td className="valor-cell">{formatearMoneda(valorTotal)}</td>
                      <td>
                        <span className={`estado-badge ${estado}`}>
                          {estadoTexto}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-accion"
                          onClick={() => {
                            setProductoSeleccionado(producto)
                            setMostrarFormularioMovimiento(true)
                          }}
                          title="Registrar movimiento"
                        >
                          📝
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : seccionActiva === 'movimientos' ? (
        <div className="tabla-container">
          <table className="tabla-inventario">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock Anterior</th>
                <th>Stock Nuevo</th>
                <th>Factura</th>
                <th>Asiento Contable</th>
                <th>Motivo</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan="10" className="sin-datos">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movimientos
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map(movimiento => {
                    const facturaRelacionada = facturas.find(f =>
                      f.id === movimiento.factura_id ||
                      f.numero === movimiento.factura_numero
                    )

                    return (
                      <tr key={movimiento.id}>
                        <td>{new Date(movimiento.fecha).toLocaleDateString()}</td>
                        <td>{movimiento.producto?.nombre || movimiento.producto_nombre || '-'}</td>
                        <td>
                          <span className={`tipo-badge ${(movimiento.tipo || '').toLowerCase()}`}>
                            {(movimiento.tipo || '').toUpperCase() === 'ENTRADA' ? '➕ Entrada' :
                              (movimiento.tipo || '').toUpperCase() === 'SALIDA' ? '➖ Salida' :
                                '🔄 Ajuste'}
                          </span>
                        </td>
                        <td>{movimiento.cantidad}</td>
                        <td>{movimiento.stock_anterior || '-'}</td>
                        <td>{movimiento.stock_nuevo || movimiento.stock_despues || (movimiento.stock_anterior || 0) + ((movimiento.tipo || '').toUpperCase() === 'ENTRADA' ? movimiento.cantidad : (movimiento.tipo || '').toUpperCase() === 'SALIDA' ? -movimiento.cantidad : 0)}</td>
                        <td>
                          {facturaRelacionada ? (
                            <a
                              href={`/facturacion?factura=${facturaRelacionada.id}`}
                              style={{ color: '#667eea', textDecoration: 'none' }}
                              title={`Ver factura ${facturaRelacionada.numero}`}
                            >
                              📄 {facturaRelacionada.numero || `#${facturaRelacionada.id}`}
                            </a>
                          ) : movimiento.factura_numero ? (
                            <span title={`Factura ${movimiento.factura_numero}`}>
                              📄 {movimiento.factura_numero}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {facturaRelacionada?.numero_asiento_contable ? (
                            <a
                              href={`/contabilidad?asiento=${facturaRelacionada.numero_asiento_contable}`}
                              style={{ color: '#10b981', textDecoration: 'none' }}
                              title={`Ver asiento ${facturaRelacionada.numero_asiento_contable}`}
                            >
                              📊 {facturaRelacionada.numero_asiento_contable}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{movimiento.motivo || movimiento.observaciones || '-'}</td>
                        <td>{movimiento.usuario || '-'}</td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>
      ) : seccionActiva === 'kardex' ? (
        <div>
          <div className="filtros-container" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                🔍 Escanear Código de Barras
              </label>
              <input
                type="text"
                placeholder="Escanea o ingresa código de barras, SKU o código..."
                className="scanner-input"
                style={{ width: '100%', maxWidth: '500px', padding: '10px 15px', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const codigo = e.target.value.trim()
                    if (codigo) {
                      const producto = productos.find(p =>
                        p.codigo === codigo || p.sku === codigo || p.codigo_barras === codigo
                      )
                      if (producto) {
                        setProductoKardex(producto)
                        cargarKardex(producto.id, puntoVentaSeleccionado?.id)
                        e.target.value = ''
                      } else {
                        alert(`Producto con código "${codigo}" no encontrado`)
                        e.target.value = ''
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                O seleccionar producto manualmente
              </label>
              <select
                value={productoKardex?.id || ''}
                onChange={handleProductoKardexChange}
                className="select-filtro"
                style={{ width: '100%', maxWidth: '500px' }}
              >
                <option value="">-- Seleccione un producto --</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.id}>
                    {producto.codigo || producto.sku || '-'} - {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargandoKardex ? (
            <div className="loading">Cargando kardex...</div>
          ) : kardexData ? (
            <div>
              {/* Información del Producto */}
              <div className="filtros-container" style={{ marginBottom: '1rem', background: '#f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                    📦 {kardexData.producto?.nombre || 'Producto'}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                      value={puntoVentaSeleccionado?.id || ''}
                      onChange={(e) => {
                        const puntoVenta = puntosVenta.find(pv => pv.id === parseInt(e.target.value))
                        setPuntoVentaSeleccionado(puntoVenta || null)
                        cargarKardex(productoKardex?.id, puntoVenta?.id)
                      }}
                      className="select-filtro"
                      style={{ minWidth: '200px' }}
                    >
                      <option value="">📦 Todas las Bodegas</option>
                      {puntosVenta.map(pv => (
                        <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Código:</strong> {kardexData.producto?.codigo || kardexData.producto?.sku || '-'}
                  </div>
                  <div>
                    <strong>Stock Inicial:</strong> {kardexData.stock_inicial || 0}
                  </div>
                  <div>
                    <strong>Stock Actual:</strong> {kardexData.stock_actual || 0}
                  </div>
                  <div>
                    <strong>Total Entradas:</strong> {kardexData.total_entradas || 0}
                  </div>
                  <div>
                    <strong>Total Salidas:</strong> {kardexData.total_salidas || 0}
                  </div>
                </div>
              </div>

              {/* Tabla de Movimientos del Kardex */}
              <div className="tabla-container">
                <table className="tabla-inventario">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Bodega/Sucursal</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Stock Después</th>
                      <th>Motivo</th>
                      <th>Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kardexData.movimientos && kardexData.movimientos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="sin-datos">
                          No hay movimientos registrados para este producto
                        </td>
                      </tr>
                    ) : (
                      kardexData.movimientos?.map((movimiento, index) => (
                        <tr key={movimiento.id || index}>
                          <td>{new Date(movimiento.fecha).toLocaleDateString()}</td>
                          <td>
                            {movimiento.bodega ? (
                              <span style={{ fontSize: '0.9em', color: '#6b7280' }}>
                                🏢 {movimiento.bodega.nombre}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.85em', color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td>
                            <span className={`tipo-badge ${(movimiento.tipo || '').toLowerCase()}`}>
                              {(movimiento.tipo || '').toUpperCase() === 'ENTRADA' ? '➕ Entrada' :
                                (movimiento.tipo || '').toUpperCase() === 'SALIDA' ? '➖ Salida' :
                                  '🔄 Ajuste'}
                            </span>
                          </td>
                          <td>{movimiento.cantidad}</td>
                          <td>
                            <span className={`stock-badge ${movimiento.stock_despues <= 0 ? 'sin-stock' : movimiento.stock_despues <= (kardexData.producto?.punto_reorden || 0) ? 'bajo' : 'normal'}`}>
                              {movimiento.stock_despues || 0}
                            </span>
                          </td>
                          <td>{movimiento.motivo || movimiento.observaciones || '-'}</td>
                          <td>
                            {movimiento.factura?.numero ? (
                              <a
                                href={`/facturacion?factura=${movimiento.factura_id}`}
                                style={{ color: '#667eea', textDecoration: 'none' }}
                              >
                                📄 {movimiento.factura.numero}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="sin-datos" style={{ padding: '3rem', textAlign: 'center' }}>
              Seleccione un producto para ver su kardex
            </div>
          )}
        </div>
      ) : (
        <div className="reportes-container">
          <div className="reporte-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>📊 Resumen de Inventario</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={exportarInventarioCSV}
                  className="btn-secondary"
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  title="Exportar reporte a CSV"
                >
                  📥 Exportar CSV
                </button>
                <button
                  onClick={exportarInventarioExcel}
                  className="btn-secondary"
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  title="Exportar reporte a Excel"
                >
                  📊 Exportar Excel
                </button>
              </div>
            </div>
            <div className="reporte-content">
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
                <p><strong>Punto de Venta:</strong> {puntoVentaSeleccionado?.nombre || 'No seleccionado'} ({puntoVentaSeleccionado?.codigo || 'N/A'})</p>
                <p><strong>Fecha del Reporte:</strong> {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <p><strong>Total de Productos:</strong> {estadisticas.totalProductos}</p>
              <p><strong>Valor Total del Inventario:</strong> {formatearMoneda(estadisticas.valorTotal)}</p>
              <p><strong>Productos con Stock Bajo:</strong> {estadisticas.productosBajoStock}</p>
              <p><strong>Productos Sin Stock:</strong> {estadisticas.productosSinStock}</p>
              <p><strong>Ventas del Día:</strong> {formatearMoneda(estadisticas.ventasHoy)}</p>
              <p><strong>Costo de Ventas del Día:</strong> {formatearMoneda(estadisticas.costoVentasHoy)}</p>
              <p><strong>Utilidad Bruta del Día:</strong> {formatearMoneda(redondear2Decimales(estadisticas.ventasHoy - estadisticas.costoVentasHoy))}</p>
            </div>
          </div>

          {/* Reporte detallado por categoría */}
          <div className="reporte-card" style={{ marginTop: '1rem' }}>
            <h3>📋 Inventario por Categoría</h3>
            <div className="reporte-content">
              {categorias.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Categoría</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>Productos</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>Stock Total</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(categoria => {
                      const productosCategoria = productosFiltrados.filter(p => p.categoria === categoria)
                      const stockTotal = productosCategoria.reduce((sum, p) => {
                        const stock = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
                        return sum + stock
                      }, 0)
                      const valorTotal = productosCategoria.reduce((sum, p) => {
                        const stock = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
                        const precioCosto = parseFloat(p.precio_costo) || 0
                        return sum + (stock * precioCosto)
                      }, 0)

                      return (
                        <tr key={categoria}>
                          <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{categoria}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>{productosCategoria.length}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>{stockTotal}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #ddd' }}>{formatearMoneda(valorTotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No hay categorías disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Movimiento */}
      {mostrarFormularioMovimiento && (
        <div className="modal-overlay" onClick={() => setMostrarFormularioMovimiento(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {tipoMovimiento === 'entrada' ? '➕ Nueva Entrada' :
                  tipoMovimiento === 'salida' ? '➖ Nueva Salida' :
                    '🔄 Ajuste de Stock'}
              </h2>
              <button onClick={() => setMostrarFormularioMovimiento(false)}>✕</button>
            </div>
            <form onSubmit={handleCrearMovimiento} className="form-movimiento">
              <div className="form-group">
                <label>Producto</label>
                <select
                  value={productoSeleccionado?.id || ''}
                  onChange={(e) => {
                    const producto = productos.find(p => p.id === parseInt(e.target.value))
                    setProductoSeleccionado(producto)
                  }}
                  required
                  className="form-input"
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock: {p.stock || 0})
                    </option>
                  ))}
                </select>
              </div>
              {productoSeleccionado && (
                <div className="info-producto">
                  <p><strong>Stock Actual ({puntoVentaSeleccionado?.nombre || 'Punto de Venta'}):</strong> {productoSeleccionado.stock_punto_venta !== undefined ? productoSeleccionado.stock_punto_venta : productoSeleccionado.stock || 0}</p>
                  <p><strong>Punto de Reorden:</strong> {productoSeleccionado.punto_reorden || 0}</p>
                </div>
              )}
              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cantidadMovimiento}
                  onChange={(e) => setCantidadMovimiento(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <textarea
                  value={motivoMovimiento}
                  onChange={(e) => setMotivoMovimiento(e.target.value)}
                  className="form-input"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={fechaMovimiento}
                  onChange={(e) => setFechaMovimiento(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Guardar Movimiento
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormularioMovimiento(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Transferencia */}
      {mostrarTransferencia && (
        <div className="modal-overlay" onClick={() => setMostrarTransferencia(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔄 Transferir Stock entre Puntos de Venta</h2>
              <button onClick={() => setMostrarTransferencia(false)}>✕</button>
            </div>
            <form onSubmit={handleTransferencia} className="form-movimiento">
              <div className="form-group">
                <label>Producto</label>
                <select
                  value={transferenciaData.producto_id || ''}
                  onChange={(e) => setTransferenciaData({ ...transferenciaData, producto_id: parseInt(e.target.value) })}
                  required
                  className="form-input"
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock: {p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Punto de Venta Origen</label>
                <select
                  value={transferenciaData.punto_venta_origen || ''}
                  onChange={(e) => setTransferenciaData({ ...transferenciaData, punto_venta_origen: parseInt(e.target.value) })}
                  required
                  className="form-input"
                >
                  <option value="">Seleccione punto de venta origen</option>
                  {puntosVenta.map(pv => (
                    <option key={pv.id} value={pv.id}>
                      {pv.nombre} ({pv.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Punto de Venta Destino</label>
                <select
                  value={transferenciaData.punto_venta_destino || ''}
                  onChange={(e) => setTransferenciaData({ ...transferenciaData, punto_venta_destino: parseInt(e.target.value) })}
                  required
                  className="form-input"
                >
                  <option value="">Seleccione punto de venta destino</option>
                  {puntosVenta.filter(pv => pv.id !== transferenciaData.punto_venta_origen).map(pv => (
                    <option key={pv.id} value={pv.id}>
                      {pv.nombre} ({pv.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transferenciaData.cantidad}
                  onChange={(e) => setTransferenciaData({ ...transferenciaData, cantidad: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Transferir Stock
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarTransferencia(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario

