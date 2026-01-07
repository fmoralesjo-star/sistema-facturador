import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './DashboardFinanciero.css';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

function DashboardFinanciero() {
    const [periodo, setPeriodo] = useState('mes');
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargarResumen();
    }, [periodo]);

    const cargarResumen = async () => {
        setCargando(true);
        try {
            const response = await axios.get(`${API_URL}/contabilidad/kpis/resumen-completo`, {
                params: { periodo }
            });
            setResumen(response.data);
        } catch (error) {
            console.error('Error al cargar KPIs:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
            alert(`Error al cargar los indicadores financieros: ${errorMsg}`);
        } finally {
            setCargando(false);
        }
    };

    if (cargando && !resumen) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner">Cargando Dashboard Financiero...</div>
            </div>
        );
    }

    if (!resumen) return null;

    // Configuración gráfico Punto de Equilibrio
    const dataPuntoEquilibrio = {
        labels: ['Ventas Realizadas', 'Punto de Equilibrio'],
        datasets: [
            {
                label: 'Unidades',
                data: [resumen.puntoEquilibrio.ventasRealizadas, resumen.puntoEquilibrio.puntoEquilibrio],
                backgroundColor: [
                    resumen.puntoEquilibrio.estado === 'superado' ? '#10b981' : '#ef4444',
                    '#6366f1'
                ],
                borderColor: [
                    resumen.puntoEquilibrio.estado === 'superado' ? '#059669' : '#dc2626',
                    '#4f46e5'
                ],
                borderWidth: 2
            }
        ]
    };

    // Configuración gráfico Top Productos
    const dataTopProductos = {
        labels: resumen.topProductos.map(p => p.nombre.substring(0, 20)),
        datasets: [
            {
                label: 'Cantidad Vendida',
                data: resumen.topProductos.map(p => p.cantidadVendida),
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }
        ]
    };

    // Configuración gráfico Márgenes (Doughnut)
    const dataMargenes = {
        labels: ['Margen Bruto', 'Margen Neto'],
        datasets: [
            {
                data: [resumen.margenes.margenBruto, resumen.margenes.margenNeto],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderColor: ['#059669', '#d97706'],
                borderWidth: 2
            }
        ]
    };

    return (
        <div className="dashboard-financiero">
            {/* Header con selector de período */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>
                        📊 Dashboard Financiero - KPIs
                    </h2>
                    <div>
                        <label style={{ marginRight: '10px', fontWeight: 500 }}>Período:</label>
                        <select
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="dia">Hoy</option>
                            <option value="semana">Última Semana</option>
                            <option value="mes">Este Mes</option>
                            <option value="trimestre">Este Trimestre</option>
                            <option value="año">Este Año</option>
                        </select>
                        <button
                            onClick={cargarResumen}
                            disabled={cargando}
                            style={{
                                marginLeft: '10px',
                                padding: '8px 16px',
                                background: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                opacity: cargando ? 0.6 : 1
                            }}
                        >
                            {cargando ? '...' : '🔄 Actualizar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid de KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* ROI */}
                <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '2rem', marginRight: '12px' }}>💰</span>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>ROI</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: resumen.roi.roi >= 0 ? '#10b981' : '#ef4444' }}>
                                {resumen.roi.roi.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        Ganancia: ${resumen.roi.ganancia.toLocaleString()}
                    </div>
                </div>

                {/* Rotación Inventario */}
                <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '2rem', marginRight: '12px' }}>📦</span>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Rotación Inventario</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6' }}>
                                {resumen.rotacionInventario.diasRotacion} días
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        Velocidad: {resumen.rotacionInventario.velocidad}
                    </div>
                </div>

                {/* Días Cuentas por Cobrar */}
                <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '2rem', marginRight: '12px' }}>📅</span>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Días Cuentas por Cobrar</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {resumen.diasCuentasCobrar.diasCuentasCobrar}
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {resumen.diasCuentasCobrar.saludFinanciera}
                    </div>
                </div>

                {/* Ratio Corriente */}
                <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '2rem', marginRight: '12px' }}>💧</span>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Ratio Corriente (Liquidez)</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: resumen.ratioCorriente.ratioCorriente >= 1.5 ? '#10b981' : '#ef4444' }}>
                                {resumen.ratioCorriente.ratioCorriente.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        {resumen.ratioCorriente.liquidez}
                    </div>
                </div>
            </div>

            {/* Gráficos principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Punto de Equilibrio */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ marginTop: 0 }}>📈 Punto de Equilibrio</h3>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
                            Estado: <strong style={{ color: resumen.puntoEquilibrio.estado === 'superado' ? '#10b981' : '#ef4444' }}>
                                {resumen.puntoEquilibrio.estado === 'superado' ? '✓ Superado' : '⚠ Pendiente'}
                            </strong>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                            Progreso: <strong>{resumen.puntoEquilibrio.porcentajeAlcanzado.toFixed(1)}%</strong>
                        </div>
                    </div>
                    <Bar data={dataPuntoEquilibrio} options={{
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            title: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }} />
                </div>

                {/* Top 5 Productos */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ marginTop: 0 }}>🏆 Top 5 Productos Más Vendidos</h3>
                    <Bar data={dataTopProductos} options={{
                        indexAxis: 'y',
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }} />
                </div>
            </div>

            {/* Márgenes de Utilidad */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ marginTop: 0 }}>📊 Márgenes de Utilidad</h3>
                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                        <Doughnut data={dataMargenes} options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }} />
                    </div>
                    <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <span>Ventas Totales:</span>
                            <strong>${resumen.margenes.totalVentas.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <span>Utilidad Bruta:</span>
                            <strong style={{ color: '#10b981' }}>${resumen.margenes.utilidadBruta.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f9fafb', borderRadius: '6px' }}>
                            <span>Utilidad Neta:</span>
                            <strong style={{ color: '#f59e0b' }}>${resumen.margenes.utilidadNeta.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                {/* Resumen Financiero */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ marginTop: 0 }}>💼 Resumen Financiero</h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Margen Bruto</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(resumen.margenes.margenBruto, 100)}%`,
                                        height: '100%',
                                        background: '#10b981',
                                        borderRadius: '999px',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                                <strong style={{ minWidth: '60px', textAlign: 'right' }}>{resumen.margenes.margenBruto.toFixed(1)}%</strong>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Margen Neto</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(resumen.margenes.margenNeto, 100)}%`,
                                        height: '100%',
                                        background: '#f59e0b',
                                        borderRadius: '999px',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                                <strong style={{ minWidth: '60px', textAlign: 'right' }}>{resumen.margenes.margenNeto.toFixed(1)}%</strong>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', padding: '16px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e40af', marginBottom: '8px' }}>
                                💡 Interpretación
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                                {resumen.margenes.margenBruto > 30
                                    ? 'Excelente margen bruto. La empresa genera buen valor.'
                                    : resumen.margenes.margenBruto > 20
                                        ? 'Margen bruto saludable. Buen control de costos.'
                                        : 'Margen bruto bajo. Revisar estructura de costos.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardFinanciero;
