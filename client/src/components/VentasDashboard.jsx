import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const VentasDashboard = () => {
    const { getToken } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [vendedores, setVendedores] = useState([]);
    const [locales, setLocales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('mes'); // mes, semana, dia, año

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [resResumen, resVendedores, resLocales] = await Promise.all([
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/resumen?periodo=${periodo}`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/vendedores?periodo=${periodo}`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/locales?periodo=${periodo}`, { headers })
                ]);

                setResumen(resResumen.data);
                setVendedores(resVendedores.data);
                setLocales(resLocales.data);
            } catch (error) {
                console.error("Error fetching sales dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [periodo, getToken]);

    const opcionesBar = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Ventas por Vendedor' },
        },
    };

    const dataVendedores = {
        labels: vendedores.map(v => v.vendedor),
        datasets: [
            {
                label: 'Total Vendido ($)',
                data: vendedores.map(v => v.total),
                backgroundColor: 'rgba(53, 162, 235, 0.7)',
            },
        ],
    };

    const dataLocales = {
        labels: locales.map(l => l.local),
        datasets: [
            {
                label: 'Ventas por Local',
                data: locales.map(l => l.total),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
            },
        ],
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando estadísticas...</div>;

    return (
        <div className="ventas-dashboard" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#334155' }}>📊 Dashboard de Ventas</h3>
                <select
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="dia">Hoy</option>
                    <option value="semana">Esta Semana</option>
                    <option value="mes">Este Mes</option>
                    <option value="año">Este Año</option>
                </select>
            </div>

            {/* Tarjetas Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Ventas Totales</p>
                    <h2 style={{ margin: '5px 0 0', color: '#1e293b' }}>${resumen?.totalVentas?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Nro. Facturas</p>
                    <h2 style={{ margin: '5px 0 0', color: '#1e293b' }}>{resumen?.cantidadFacturas}</h2>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Ticket Promedio</p>
                    <h2 style={{ margin: '5px 0 0', color: '#1e293b' }}>${resumen?.ticketPromedio?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            {/* Gráficos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <Bar options={opcionesBar} data={dataVendedores} />
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ textAlign: 'center', color: '#666', marginBottom: '15px' }}>Ventas por Local</h4>
                    <div style={{ maxHeight: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={dataLocales} />
                    </div>
                </div>
            </div>

            {/* Si no hay datos */}
            {vendedores.length === 0 && locales.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic' }}>
                    No hay datos de ventas registrados para este período.
                </div>
            )}
        </div>
    );
};

export default VentasDashboard;
