
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config/api'
import './Cartera.css'

function Cartera() {
    const navigate = useNavigate()
    const [tabActiva, setTabActiva] = useState('cobrar') // 'cobrar' | 'pagar'
    const [documentos, setDocumentos] = useState([])
    const [loading, setLoading] = useState(false)
    const [procesando, setProcesando] = useState(null) // ID del documento procesándose

    // Cargar documentos al cambiar de pestaña
    useEffect(() => {
        cargarDocumentos()
    }, [tabActiva])

    const cargarDocumentos = async () => {
        setLoading(true)
        try {
            if (tabActiva === 'cobrar') {
                const res = await axios.get(`${API_URL}/facturas`)
                // Filtrar solo las pendientes
                // Asumiendo que 'PENDIENTE' es el estado por defecto, o 'AUTORIZADO' pero no pagado.
                // Por ahora, mostraremos todas las que no estén explícitamente 'PAGADA' o 'ANULADA'
                const pendientes = res.data.filter(f => f.estado !== 'PAGADA' && f.estado !== 'ANULADA')
                setDocumentos(pendientes)
            } else {
                const res = await axios.get(`${API_URL}/compras`)
                const pendientes = res.data.filter(c => c.estado !== 'COMPLETADA' && c.estado !== 'CANCELADA')
                setDocumentos(pendientes)
            }
        } catch (error) {
            console.error('Error cargando documentos:', error)
        } finally {
            setLoading(false)
        }
    }

    const registrarPago = async (doc) => {
        if (!window.confirm(`¿Confirmar pago del documento ${doc.numero}?`)) return

        setProcesando(doc.id)
        try {
            if (tabActiva === 'cobrar') {
                // Actualizar factura a PAGADA
                await axios.put(`${API_URL}/facturas/${doc.id}/estado`, { estado: 'PAGADA' })
            } else {
                // Actualizar compra a COMPLETADA
                await axios.post(`${API_URL}/compras/${doc.id}/estado`, { estado: 'COMPLETADA' })
            }
            // Recargar lista
            await cargarDocumentos()
        } catch (error) {
            console.error('Error registrando pago:', error)
            alert('Error registrando el pago')
        } finally {
            setProcesando(null)
        }
    }

    const totalCartera = documentos.reduce((acc, doc) => acc + parseFloat(doc.total || 0), 0)

    // Lógica de Antigüedad de Cartera
    const calcularAntiguedad = (fechaEmision) => {
        const hoy = new Date()
        const emision = new Date(fechaEmision)
        const diferenciaTiempo = hoy - emision
        const dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24))
        return dias
    }

    // Agrupar por buckets
    const resumenAntiguedad = {
        corriente: { total: 0, count: 0, label: '0-30 Días (Corriente)', class: 'corriente' },
        vencido30: { total: 0, count: 0, label: '31-60 Días', class: 'vencido-30' },
        vencido60: { total: 0, count: 0, label: '61-90 Días', class: 'vencido-60' },
        vencido90: { total: 0, count: 0, label: '> 90 Días (Crítico)', class: 'vencido-90' }
    }

    documentos.forEach(doc => {
        const dias = calcularAntiguedad(doc.fecha)
        const total = parseFloat(doc.total || 0)

        if (dias <= 30) {
            resumenAntiguedad.corriente.total += total
            resumenAntiguedad.corriente.count++
        } else if (dias <= 60) {
            resumenAntiguedad.vencido30.total += total
            resumenAntiguedad.vencido30.count++
        } else if (dias <= 90) {
            resumenAntiguedad.vencido60.total += total
            resumenAntiguedad.vencido60.count++
        } else {
            resumenAntiguedad.vencido90.total += total
            resumenAntiguedad.vencido90.count++
        }
    })

    return (
        <div className="cartera-container">
            <button
                onClick={() => navigate('/')}
                className="btn-home"
                title="Volver a la pantalla principal"
            >
                Inicio
            </button>

            <div className="cartera-header">
                <h1>💰 Cartera y Flujo de Caja</h1>
                <div className="cartera-total-badge">
                    <span>Total {tabActiva === 'cobrar' ? 'por Cobrar' : 'por Pagar'}</span>
                    <strong>${totalCartera.toFixed(2)}</strong>
                </div>
            </div>

            <div className="cartera-tabs">
                <button
                    className={`tab-btn ${tabActiva === 'cobrar' ? 'active' : ''}`}
                    onClick={() => setTabActiva('cobrar')}
                >
                    📥 Cuentas por Cobrar (Clientes)
                </button>
                <button
                    className={`tab-btn ${tabActiva === 'pagar' ? 'active' : ''}`}
                    onClick={() => setTabActiva('pagar')}
                >
                    📤 Cuentas por Pagar (Proveedores)
                </button>
            </div>

            {/* Reporte de Antigüedad */}
            {!loading && (
                <div className="aging-summary">
                    {Object.values(resumenAntiguedad).map((bucket, index) => (
                        <div key={index} className={`aging-card ${bucket.class}`}>
                            <h3>{bucket.label}</h3>
                            <div className="aging-amount">${bucket.total.toFixed(2)}</div>
                            <div className="aging-count">{bucket.count} documentos</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="cartera-content">
                {loading ? (
                    <div className="loading-state">Cargando documentos...</div>
                ) : documentos.length === 0 ? (
                    <div className="empty-state">
                        <span style={{ fontSize: '3rem' }}>✅</span>
                        <h3>¡Todo al día!</h3>
                        <p>No hay cuentas pendientes en esta categoría.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="cartera-table">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Fecha</th>
                                    <th>Antigüedad</th> {/* Nueva Columna */}
                                    <th>{tabActiva === 'cobrar' ? 'Cliente' : 'Proveedor'}</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documentos.map(doc => {
                                    const dias = calcularAntiguedad(doc.fecha)
                                    // Determinar color de badge de antigüedad
                                    let badgeClass = 'pendiente' // default reuse
                                    if (dias > 90) badgeClass = 'vencido-90' // we can reuse these if defined in css/global or inline

                                    return (
                                        <tr key={doc.id}>
                                            <td>{doc.numero}</td>
                                            <td>{new Date(doc.fecha).toLocaleDateString()}</td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    color: dias > 90 ? '#ef4444' : dias > 60 ? '#f97316' : dias > 30 ? '#f59e0b' : '#10b981'
                                                }}>
                                                    {dias} días
                                                </span>
                                            </td>
                                            <td>
                                                {tabActiva === 'cobrar'
                                                    ? (doc.cliente?.nombre || doc.cliente_nombre || 'Consumidor Final')
                                                    : (doc.proveedor?.razon_social || 'Proveedor General')
                                                }
                                            </td>
                                            <td className="amount-cell">${parseFloat(doc.total).toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${doc.estado.toLowerCase()}`}>
                                                    {doc.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-pay"
                                                    onClick={() => registrarPago(doc)}
                                                    disabled={procesando === doc.id}
                                                >
                                                    {procesando === doc.id ? '⏳' : '💵 Registrar Pago'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cartera
