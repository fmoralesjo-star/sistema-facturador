import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { formatearMoneda } from '../utils/formateo'

export function TransferenciaScanner({ puntosVenta, onTerminar, puntoVentaActual }) {
    const [productosScan, setProductosScan] = useState([]) // { producto, cantidad }
    const [codigoBarras, setCodigoBarras] = useState('')
    const [origenId, setOrigenId] = useState('')
    const [destinoId, setDestinoId] = useState('')
    const [procesando, setProcesando] = useState(false)
    const [buscando, setBuscando] = useState(false)
    const inputRef = useRef(null)

    // Auto-seleccionar punto de venta actual como origen
    useEffect(() => {
        if (puntoVentaActual?.id && !origenId) {
            setOrigenId(String(puntoVentaActual.id))
        }
    }, [puntoVentaActual])

    // Autofocus en el input al cargar
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const buscarProductoPorCodigo = async (codigo) => {
        if (!codigo.trim()) return

        setBuscando(true)
        try {
            const response = await axios.get(`${API_URL}/productos`)
            const producto = response.data.find(p =>
                p.codigo === codigo || p.sku === codigo || p.codigo_barras === codigo
            )

            if (producto) {
                agregarProducto(producto)
                // Beep visual o sonido (opcional)
                inputRef.current?.classList.add('scan-success')
                setTimeout(() => inputRef.current?.classList.remove('scan-success'), 300)
            } else {
                alert(`Producto con código "${codigo}" no encontrado`)
            }
        } catch (error) {
            console.error('Error buscando producto:', error)
            alert('Error al buscar producto')
        } finally {
            setBuscando(false)
            setCodigoBarras('')
            inputRef.current?.focus()
        }
    }

    const agregarProducto = (producto) => {
        setProductosScan(prev => {
            const existe = prev.find(p => p.producto.id === producto.id)
            if (existe) {
                // Incrementar cantidad
                return prev.map(p =>
                    p.producto.id === producto.id
                        ? { ...p, cantidad: p.cantidad + 1 }
                        : p
                )
            } else {
                // Agregar nuevo
                return [...prev, { producto, cantidad: 1 }]
            }
        })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            buscarProductoPorCodigo(codigoBarras)
        }
    }

    const eliminarProducto = (productoId) => {
        setProductosScan(prev => prev.filter(p => p.producto.id !== productoId))
    }

    const actualizarCantidad = (productoId, nuevaCantidad) => {
        const cantidad = parseInt(nuevaCantidad) || 1
        setProductosScan(prev => prev.map(p =>
            p.producto.id === productoId ? { ...p, cantidad } : p
        ))
    }

    const limpiarTodo = () => {
        if (window.confirm('¿Limpiar todos los productos escaneados?')) {
            setProductosScan([])
            setCodigoBarras('')
            inputRef.current?.focus()
        }
    }

    const ejecutarTransferencia = async () => {
        if (!origenId || !destinoId) {
            alert('Selecciona Punto de Venta Origen y Destino')
            return
        }

        if (origenId === destinoId) {
            alert('El origen y destino no pueden ser el mismo')
            return
        }

        if (productosScan.length === 0) {
            alert('No hay productos para transferir')
            return
        }

        if (!window.confirm(`¿Transferir ${productosScan.length} productos diferentes?`)) return

        setProcesando(true)
        try {
            const transferencias = productosScan.map(p => ({
                producto_id: p.producto.id,
                cantidad: p.cantidad
            }))

            const response = await axios.post(`${API_URL}/inventario/transferencia-masiva`, {
                transferencias,
                punto_venta_origen: parseInt(origenId),
                punto_venta_destino: parseInt(destinoId),
                motivo: 'Transferencia Masiva vía Scanner',
                fecha: new Date().toISOString()
            })

            alert(`✅ Transferencia exitosa:\n${response.data.procesados} productos transferidos\n${response.data.fallidos} fallidos`)

            // Limpiar y volver
            setProductosScan([])
            setCodigoBarras('')
            if (onTerminar) onTerminar()
        } catch (error) {
            console.error('Error en transferencia masiva:', error)
            alert(`Error: ${error.response?.data?.message || error.message}`)
        } finally {
            setProcesando(false)
        }
    }

    return (
        <div className="transferencia-scanner-container">
            <div className="scanner-header">
                <h3>📦 Transferencia Masiva (Scanner)</h3>
                <p className="scanner-description">Escanea múltiples productos para transferir entre bodegas</p>
            </div>

            <div className="scanner-config">
                <div className="config-row">
                    <div className="config-field">
                        <label>Punto de Venta Origen</label>
                        <select
                            value={origenId}
                            onChange={e => setOrigenId(e.target.value)}
                            className="select-punto-venta"
                        >
                            <option value="">Seleccionar...</option>
                            {puntosVenta.map(pv => (
                                <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="arrow-icon">→</div>
                    <div className="config-field">
                        <label>Punto de Venta Destino</label>
                        <select
                            value={destinoId}
                            onChange={e => setDestinoId(e.target.value)}
                            className="select-punto-venta"
                        >
                            <option value="">Seleccionar...</option>
                            {puntosVenta.map(pv => (
                                <option key={pv.id} value={pv.id}>{pv.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="scanner-input-section">
                <label>Escanear Código de Barras</label>
                <div className="scanner-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        value={codigoBarras}
                        onChange={e => setCodigoBarras(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escanea o ingresa código..."
                        className="scanner-input"
                        disabled={buscando}
                    />
                    <button
                        onClick={() => buscarProductoPorCodigo(codigoBarras)}
                        className="btn-scan"
                        disabled={buscando || !codigoBarras.trim()}
                    >
                        {buscando ? '⏳' : '🔍'}
                    </button>
                </div>
            </div>

            <div className="productos-escaneados">
                <div className="productos-header">
                    <h4>Productos Escaneados ({productosScan.length})</h4>
                    {productosScan.length > 0 && (
                        <button onClick={limpiarTodo} className="btn-limpiar">
                            🗑️ Limpiar Todo
                        </button>
                    )}
                </div>

                {productosScan.length === 0 ? (
                    <div className="empty-scan">
                        <p>📭 No hay productos escaneados. Comienza escaneando un código de barras.</p>
                    </div>
                ) : (
                    <div className="scan-list">
                        {productosScan.map(item => (
                            <div key={item.producto.id} className="scan-item">
                                <div className="scan-item-info">
                                    <strong>{item.producto.nombre}</strong>
                                    <small>{item.producto.codigo || item.producto.sku}</small>
                                </div>
                                <div className="scan-item-controls">
                                    <label>Cantidad:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.cantidad}
                                        onChange={e => actualizarCantidad(item.producto.id, e.target.value)}
                                        className="cantidad-input"
                                    />
                                    <button
                                        onClick={() => eliminarProducto(item.producto.id)}
                                        className="btn-eliminar-item"
                                        title="Eliminar"
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="scanner-actions">
                <button
                    onClick={ejecutarTransferencia}
                    className="btn-ejecutar-transfer"
                    disabled={procesando || productosScan.length === 0 || !origenId || !destinoId}
                >
                    {procesando ? '⏳ Procesando...' : '✅ Ejecutar Transferencia'}
                </button>
            </div>
        </div>
    )
}
