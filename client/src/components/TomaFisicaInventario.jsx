import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { formatearMoneda } from '../utils/formateo'

export function TomaFisicaInventario({ productos, puntoVenta, onTerminar }) {
    const [conteo, setConteo] = useState({}) // { producto_id: cantidad_fisica }
    const [filtro, setFiltro] = useState('')
    const [procesando, setProcesando] = useState(false)
    const [codigoBarras, setCodigoBarras] = useState('')
    const [ultimoEscaneado, setUltimoEscaneado] = useState(null)
    const scannerInputRef = useRef(null)

    // Inicializar conteo con el stock actual (Snapshot)
    useEffect(() => {
        const snapshot = {}
        productos.forEach(p => {
            const stock = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
            snapshot[p.id] = stock // Por defecto asumimos que está correcto, usuario modifica lo que difiere
        })
        setConteo(snapshot)
    }, [productos])

    const handleCantidadChange = (productoId, valor) => {
        setConteo(prev => ({
            ...prev,
            [productoId]: parseFloat(valor) || 0
        }))
    }

    const buscarYActualizarPorCodigo = (codigo) => {
        if (!codigo.trim()) return

        // Buscar producto por código
        const producto = productos.find(p =>
            p.codigo === codigo || p.sku === codigo || p.codigo_barras === codigo
        )

        if (producto) {
            // Incrementar cantidad física en 1
            setConteo(prev => ({
                ...prev,
                [producto.id]: (prev[producto.id] || 0) + 1
            }))

            // Feedback visual
            setUltimoEscaneado(producto.id)
            setTimeout(() => setUltimoEscaneado(null), 1000)

            // Scroll al producto si está fuera de vista
            const elemento = document.getElementById(`producto-${producto.id}`)
            if (elemento) {
                elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        } else {
            alert(`Producto con código "${codigo}" no encontrado`)
        }

        setCodigoBarras('')
        scannerInputRef.current?.focus()
    }

    const handleScannerKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            buscarYActualizarPorCodigo(codigoBarras)
        }
    }

    const guardarAjustes = async () => {
        if (!window.confirm('¿Estás seguro de procesar estos ajustes? Esto modificará el stock permanentemente.')) return

        setProcesando(true)
        try {
            const ajustes = productos.map(p => {
                const stockSistema = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
                const cantidadFisica = conteo[p.id] !== undefined ? conteo[p.id] : stockSistema

                // Solo enviar si hay diferencia
                if (stockSistema !== cantidadFisica) {
                    return {
                        producto_id: p.id,
                        stock_sistema: stockSistema,
                        cantidad_fisica: cantidadFisica
                    }
                }
                return null
            }).filter(Boolean)

            if (ajustes.length === 0) {
                alert('No hay diferencias para ajustar.')
                setProcesando(false)
                return
            }

            await axios.post(`${API_URL}/inventario/ajuste-masivo`, {
                ajustes,
                punto_venta_id: puntoVenta?.id,
                motivo: 'Toma Física de Inventario',
                fecha: new Date().toISOString()
            })

            alert(`✅ Se procesaron ${ajustes.length} ajustes de stock correctamente.`)
            onTerminar()
        } catch (error) {
            console.error('Error procesando ajustes:', error)
            alert('Error al procesar ajustes')
        } finally {
            setProcesando(false)
        }
    }

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(filtro.toLowerCase())
    )

    // Cálculos de Resumen
    let totalSobrante = 0
    let totalFaltante = 0

    productosFiltrados.forEach(p => {
        const stockSistema = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
        const stockFisico = conteo[p.id] !== undefined ? conteo[p.id] : stockSistema
        const diff = stockFisico - stockSistema
        const costo = parseFloat(p.precio_costo) || 0

        if (diff > 0) totalSobrante += (diff * costo)
        if (diff < 0) totalFaltante += (Math.abs(diff) * costo)
    })

    return (
        <div className="toma-fisica-container">
            <div className="toma-fisica-header">
                <div className="scanner-fisica-section">
                    <label>🔍 Escanear Código de Barras</label>
                    <div className="scanner-input-wrapper">
                        <input
                            ref={scannerInputRef}
                            type="text"
                            value={codigoBarras}
                            onChange={e => setCodigoBarras(e.target.value)}
                            onKeyDown={handleScannerKeyDown}
                            placeholder="Escanea código para incrementar..."
                            className="scanner-input"
                            autoFocus
                        />
                        <button
                            onClick={() => buscarYActualizarPorCodigo(codigoBarras)}
                            className="btn-scan"
                            disabled={!codigoBarras.trim()}
                        >
                            🔍
                        </button>
                    </div>
                </div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Buscar producto en la tabla..."
                        value={filtro}
                        onChange={e => setFiltro(e.target.value)}
                    />
                </div>
                <div className="impact-summary">
                    <div className="impact-card success">
                        <span>Sobrante (Ganancia)</span>
                        <strong>{formatearMoneda(totalSobrante)}</strong>
                    </div>
                    <div className="impact-card danger">
                        <span>Faltante (Pérdida)</span>
                        <strong>{formatearMoneda(totalFaltante)}</strong>
                    </div>
                </div>
                <button
                    className="btn-save-audit"
                    onClick={guardarAjustes}
                    disabled={procesando}
                >
                    {procesando ? 'Procesando...' : '💾 Guardar Ajustes'}
                </button>
            </div>

            <div className="audit-table-container">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th className="text-right">Stock Sistema</th>
                            <th className="text-center" width="120">Físico</th>
                            <th className="text-right">Diferencia</th>
                            <th className="text-right">Valor Diff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map(p => {
                            const stockSistema = parseInt(p.stock_punto_venta !== undefined ? p.stock_punto_venta : p.stock) || 0
                            const stockFisico = conteo[p.id] !== undefined ? conteo[p.id] : stockSistema
                            const diff = stockFisico - stockSistema
                            const diffValor = diff * (parseFloat(p.precio_costo) || 0)

                            return (
                                <tr
                                    key={p.id}
                                    id={`producto-${p.id}`}
                                    className={`
                                        ${diff !== 0 ? (diff > 0 ? 'bg-success-light' : 'bg-danger-light') : ''} 
                                        ${ultimoEscaneado === p.id ? 'highlight-scan' : ''}
                                    `}
                                >
                                    <td>{p.codigo}</td>
                                    <td>{p.nombre}</td>
                                    <td className="text-right font-bold">{stockSistema}</td>
                                    <td className="text-center">
                                        <input
                                            type="number"
                                            className="audit-input"
                                            value={stockFisico}
                                            onChange={(e) => handleCantidadChange(p.id, e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </td>
                                    <td className={`text-right font-bold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted'}`}>
                                        {diff > 0 ? `+${diff}` : diff}
                                    </td>
                                    <td className="text-right">
                                        {formatearMoneda(Math.abs(diffValor))}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
