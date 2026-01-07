import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import './Conciliaciones.css' // We will create this too

function Conciliaciones() {
  const [bancos, setBancos] = useState([])
  const [selectedBanco, setSelectedBanco] = useState('')
  const [movimientosSistema, setMovimientosSistema] = useState([])
  const [movimientosBanco, setMovimientosBanco] = useState([])
  const [loading, setLoading] = useState(false)
  const [resumen, setResumen] = useState({ importados: 0, duplicados: 0 })

  useEffect(() => {
    cargarBancos()
  }, [])

  useEffect(() => {
    if (selectedBanco) {
      cargarConciliacion()
    }
  }, [selectedBanco])

  const cargarBancos = async () => {
    try {
      const res = await axios.get(`${API_URL}/bancos`)
      setBancos(res.data)
    } catch (error) {
      console.error('Error cargando bancos:', error)
    }
  }

  const cargarConciliacion = async () => {
    setLoading(true)
    try {
      const [resSistema, resBanco] = await Promise.all([
        axios.get(`${API_URL}/conciliaciones?banco_id=${selectedBanco}`),
        axios.get(`${API_URL}/conciliaciones/extracto?banco_id=${selectedBanco}`)
      ])

      // Filtrar solo no conciliados para la vista principal
      setMovimientosSistema(resSistema.data.filter(m => !m.conciliado))
      setMovimientosBanco(resBanco.data.filter(m => !m.conciliado))
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const csvText = evt.target.result
      try {
        setLoading(true)
        const res = await axios.post(`${API_URL}/conciliaciones/importar-extracto`, {
          banco_id: parseInt(selectedBanco),
          csv: csvText
        })
        setResumen(res.data)
        alert(`Importación completada: ${res.data.importados} nuevos, ${res.data.duplicados} duplicados.`)
        cargarConciliacion()
      } catch (error) {
        console.error('Error importando:', error)
        alert('Error al importar el archivo.')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsText(file)
  }

  const handleAutoConciliar = async () => {
    if (!selectedBanco) return;
    // El endpoint de autoconciliación no está expuesto directamente en el controlador como tal, 
    // pero se autoconcilia al importar. Podemos agregar un botón si queremos forzarlo.
    // Por ahora, asumiremos que "Importar" ya lo hace.
    // Si el usuario quiere re-correrlo, podríamos necesitar un endpoint especifico. 
    // Vamos a agregar un botón simple que llame a una recarga por ahora, o implementar un endpoint de 're-conciliar'.
    // Dado el controlador actual, solo importar dispara la autoconciliación masiva. 
    // Agregaremos un mensaje manual.
    alert('La auto-conciliación se ejecuta automáticamente al importar nuevos extractos.')
  }

  return (
    <div className="conciliaciones-container">
      <h1>🏦 Conciliación Bancaria</h1>

      <div className="filtros-section">
        <label>Seleccionar Banco:</label>
        <select value={selectedBanco} onChange={e => setSelectedBanco(e.target.value)}>
          <option value="">-- Seleccione --</option>
          {bancos.map(b => (
            <option key={b.id} value={b.id}>{b.nombre} - ${parseFloat(b.saldo_actual).toFixed(2)}</option>
          ))}
        </select>
      </div>

      {selectedBanco && (
        <>
          <div className="acciones-section">
            <div className="card-importar">
              <h3>📤 Importar Estado (CSV)</h3>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
              <p className="help-text">Formato: Fecha, Descripción, Monto, Referencia</p>
            </div>
            <div className="resumen-stats">
              {resumen.importados > 0 && <div className="stat success">✅ {resumen.importados} importados</div>}
              {resumen.duplicados > 0 && <div className="stat warning">⚠️ {resumen.duplicados} duplicados</div>}
            </div>
          </div>

          <div className="dashboard-conciliacion">
            <div className="columna-sistema">
              <h3>📖 Libros (Sistema)</h3>
              <div className="lista-movimientos">
                {movimientosSistema.length === 0 ? <p className="empty-state">No hay movimientos pendientes</p> : (
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Ref</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosSistema.map(m => (
                        <tr key={m.id}>
                          <td>{new Date(m.fecha).toLocaleDateString()}</td>
                          <td>{m.referencia}</td>
                          <td className={m.tipo === 'DEPOSITO' ? 'positivo' : 'negativo'}>
                            ${parseFloat(m.monto).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="columna-banco">
              <h3>🏦 Banco (Extracto)</h3>
              <div className="lista-movimientos">
                {movimientosBanco.length === 0 ? <p className="empty-state">No hay movimientos pendientes</p> : (
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Desc</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosBanco.map(m => (
                        <tr key={m.id}>
                          <td>{new Date(m.fecha).toLocaleDateString()}</td>
                          <td>{m.descripcion}</td>
                          <td className={m.monto > 0 ? 'positivo' : 'negativo'}>
                            ${parseFloat(m.monto).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Conciliaciones
