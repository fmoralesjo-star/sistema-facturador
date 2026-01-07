import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import './ReportesConsolidados.css'

function ReportesConsolidados({ socket }) {
  const navigate = useNavigate()
  const [reporteActivo, setReporteActivo] = useState('ventas-vendedor')
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarReporte()
  }, [reporteActivo, fechaInicio, fechaFin])

  const cargarReporte = async () => {
    setLoading(true)
    try {
      let url = `${API_URL}/reportes/${reporteActivo}`
      if (reporteActivo !== 'rotacion-inventario') {
        url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      }

      const response = await axios.get(url)
      setDatos(response.data)
    } catch (error) {
      console.error('Error al cargar reporte:', error)
      setDatos([])
    } finally {
      setLoading(false)
    }
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(valor || 0)
  }

  return (
    <div className="reportes-consolidados-container">
      <div className="reportes-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
          >
            Inicio
          </button>
          <h1>📊 Reportes Consolidados</h1>
        </div>
      </div>

      <div className="reportes-filtros">
        {reporteActivo !== 'rotacion-inventario' && (
          <>
            <div className="filtro-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="filtro-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </>
        )}
        <button onClick={cargarReporte} className="btn-actualizar">
          🔄 Actualizar
        </button>
      </div>

      <div className="reportes-tabs">
        <button
          className={`tab ${reporteActivo === 'ventas-vendedor' ? 'active' : ''}`}
          onClick={() => setReporteActivo('ventas-vendedor')}
        >
          👤 Ventas por Vendedor
        </button>
        <button
          className={`tab ${reporteActivo === 'productos-mas-vendidos' ? 'active' : ''}`}
          onClick={() => setReporteActivo('productos-mas-vendidos')}
        >
          📦 Productos Más Vendidos
        </button>
        <button
          className={`tab ${reporteActivo === 'rotacion-inventario' ? 'active' : ''}`}
          onClick={() => setReporteActivo('rotacion-inventario')}
        >
          🔄 Rotación de Inventario
        </button>
        <button
          className={`tab ${reporteActivo === 'efectividad-promociones' ? 'active' : ''}`}
          onClick={() => setReporteActivo('efectividad-promociones')}
        >
          🎁 Efectividad de Promociones
        </button>
        <button
          className={`tab ${reporteActivo === 'compras-vs-ventas' ? 'active' : ''}`}
          onClick={() => setReporteActivo('compras-vs-ventas')}
        >
          💰 Compras vs Ventas
        </button>
      </div>

      <div className="reportes-contenido">
        {loading ? (
          <div className="loading">Cargando reporte...</div>
        ) : reporteActivo === 'ventas-vendedor' ? (
          <div className="tabla-reporte">
            <table>
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Total Facturas</th>
                  <th>Total Ventas</th>
                  <th>Promedio por Venta</th>
                </tr>
              </thead>
              <tbody>
                {datos && datos.length > 0 ? (
                  datos.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.vendedor_nombre} {item.vendedor_apellido || ''}
                        {!item.vendedor_id && <span style={{ color: '#999' }}> (Sin asignar)</span>}
                      </td>
                      <td>{item.total_facturas}</td>
                      <td>{formatearMoneda(parseFloat(item.total_ventas || 0))}</td>
                      <td>{formatearMoneda(parseFloat(item.promedio_venta || 0))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="sin-datos">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : reporteActivo === 'productos-mas-vendidos' ? (
          <div className="tabla-reporte">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Total Vendido</th>
                  <th>Total Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {datos && datos.length > 0 ? (
                  datos.map((item, index) => (
                    <tr key={index}>
                      <td>{item.producto_nombre}</td>
                      <td>{item.producto_codigo}</td>
                      <td>{item.total_vendido} unidades</td>
                      <td>{formatearMoneda(parseFloat(item.total_ingresos || 0))}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="sin-datos">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : reporteActivo === 'rotacion-inventario' ? (
          <div className="tabla-reporte">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Stock Actual</th>
                  <th>Total Entradas</th>
                  <th>Total Salidas</th>
                  <th>Rotación</th>
                </tr>
              </thead>
              <tbody>
                {datos && datos.length > 0 ? (
                  datos.map((item, index) => (
                    <tr key={index}>
                      <td>{item.producto_nombre}</td>
                      <td>{item.producto_codigo}</td>
                      <td>{item.stock_actual}</td>
                      <td>{item.total_entradas}</td>
                      <td>{item.total_salidas}</td>
                      <td>
                        <span className={`rotacion ${parseFloat(item.rotacion) > 1 ? 'alta' : 'baja'}`}>
                          {item.rotacion}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="sin-datos">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : reporteActivo === 'efectividad-promociones' ? (
          <div className="tabla-reporte">
            <table>
              <thead>
                <tr>
                  <th>Promoción</th>
                  <th>Total Usos</th>
                  <th>Facturas Aplicadas</th>
                  <th>Total Descuento</th>
                  <th>Efectividad</th>
                </tr>
              </thead>
              <tbody>
                {datos && datos.length > 0 ? (
                  datos.map((item, index) => (
                    <tr key={index}>
                      <td>{item.promocion_nombre}</td>
                      <td>{item.total_usos}</td>
                      <td>{item.facturas_aplicadas}</td>
                      <td>{formatearMoneda(parseFloat(item.total_descuento || 0))}</td>
                      <td>
                        {item.efectividad !== null ? `${item.efectividad.toFixed(1)}%` : 'Ilimitada'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="sin-datos">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : reporteActivo === 'compras-vs-ventas' ? (
          <div className="reporte-resumen">
            {datos && (
              <>
                <div className="resumen-card compras">
                  <h3>🛒 Compras</h3>
                  <div className="resumen-valor">{formatearMoneda(datos.compras.total)}</div>
                  <div className="resumen-detalle">{datos.compras.cantidad} compras</div>
                </div>
                <div className="resumen-card ventas">
                  <h3>📄 Ventas</h3>
                  <div className="resumen-valor">{formatearMoneda(datos.ventas.total)}</div>
                  <div className="resumen-detalle">{datos.ventas.cantidad} facturas</div>
                </div>
                <div className="resumen-card utilidad">
                  <h3>💰 Utilidad</h3>
                  <div className={`resumen-valor ${datos.utilidad >= 0 ? 'positivo' : 'negativo'}`}>
                    {formatearMoneda(datos.utilidad)}
                  </div>
                  <div className="resumen-detalle">Margen: {datos.margen}%</div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ReportesConsolidados












