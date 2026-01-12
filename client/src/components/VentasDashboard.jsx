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
    const [topProductos, setTopProductos] = useState([]);
    const [topClientes, setTopClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('mes'); // mes, semana, dia, año
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        vendedorId: '',
        puntoVentaId: '',
        productoId: ''
    });

    const [listas, setListas] = useState({
        vendedores: [],
        locales: []
    });

    useEffect(() => {
        // Cargar listas para filtros
        const fetchCatalogos = async () => {
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const [resVendedores, resLocales] = await Promise.all([
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/vendedores?periodo=año`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/locales?periodo=año`, { headers })
                ]);
                setListas({
                    vendedores: resVendedores.data,
                    locales: resLocales.data
                });
            } catch (e) { console.error("Error cargando catálogos", e); }
        };
        fetchCatalogos();
    }, [getToken]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };

                let queryParams = `?periodo=${periodo}`;
                if (filtros.fechaInicio) queryParams += `&fechaInicio=${filtros.fechaInicio}`;
                if (filtros.fechaFin) queryParams += `&fechaFin=${filtros.fechaFin}`;
                if (filtros.vendedorId) queryParams += `&vendedorId=${filtros.vendedorId}`;
                if (filtros.puntoVentaId) queryParams += `&puntoVentaId=${filtros.puntoVentaId}`;
                if (filtros.productoId) queryParams += `&productoId=${filtros.productoId}`;

                const [resResumen, resVendedores, resLocales, resTopProductos, resTopClientes] = await Promise.all([
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/resumen${queryParams}`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/vendedores${queryParams}`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/locales${queryParams}`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/productos${queryParams}`, { headers }),
                    axios.get(`${API_URL}/contabilidad/kpis/ventas/clientes${queryParams}`, { headers })
                ]);

                setResumen(resResumen.data);
                setVendedores(resVendedores.data);
                setLocales(resLocales.data);
                setTopProductos(resTopProductos.data);
                setTopClientes(resTopClientes.data);
            } catch (error) {
                console.error("Error fetching sales dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [periodo, filtros, getToken]);

    const handleFiltroChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value
        });
    };

    const opcionesBar = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Ventas por Vendedor' },
        },
    };

    const opcionesHorizontalBar = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Top 10 Productos Vendidos' },
        },
    };

    const opcionesHorizontalBarClientes = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Top 10 Mejores Clientes' },
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

    const dataTopProductos = {
        labels: topProductos.map(p => p.producto),
        datasets: [
            {
                label: 'Total Vendido ($)',
                data: topProductos.map(p => p.total),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
            },
            {
                label: 'Cantidad (Unidades)',
                data: topProductos.map(p => p.cantidad),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                hidden: true
            }
        ],
    };

    const dataTopClientes = {
        labels: topClientes.map(c => c.cliente),
        datasets: [
            {
                label: 'Total Comprado ($)',
                data: topClientes.map(c => c.total),
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
            },
            {
                label: 'Cantidad Compras',
                data: topClientes.map(c => c.cantidadCompras),
                backgroundColor: 'rgba(201, 203, 207, 0.7)',
                hidden: true
            }
        ],
    };

    return (
        <div className="ventas-dashboard" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    padding: '10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    border: '1px solid #e2e8f0'
                }}
                onClick={toggleExpand}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#334155' }}>📊 Dashboard de Ventas</h3>
                </div>
                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>

            <div
                style={{
                    maxHeight: isExpanded ? '2000px' : '0',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.5s ease-in-out'
                }}
            >
                <div style={{ padding: '5px' }}>
                    {/* Filtros */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                        <select
                            value={periodo}
                            onChange={(e) => {
                                setPeriodo(e.target.value);
                                setFiltros({ ...filtros, fechaInicio: '', fechaFin: '' });
                            }}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                        >
                            <option value="dia">Hoy</option>
                            <option value="semana">Esta Semana</option>
                            <option value="mes">Este Mes</option>
                            <option value="año">Este Año</option>
                        </select>

                        <input
                            type="date"
                            name="fechaInicio"
                            value={filtros.fechaInicio}
                            onChange={handleFiltroChange}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                            title="Fecha Inicio"
                        />
                        <input
                            type="date"
                            name="fechaFin"
                            value={filtros.fechaFin}
                            onChange={handleFiltroChange}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                            title="Fecha Fin"
                        />

                        <select
                            name="vendedorId"
                            value={filtros.vendedorId}
                            onChange={handleFiltroChange}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', maxWidth: '150px' }}
                        >
                            <option value="">Todos los Vendedores</option>
                            {listas.vendedores.map(v => (
                                <option key={v.id} value={v.id}>{v.vendedor}</option>
                            ))}
                        </select>

                        <select
                            name="puntoVentaId"
                            value={filtros.puntoVentaId}
                            onChange={handleFiltroChange}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', maxWidth: '150px' }}
                        >
                            <option value="">Todos los Locales</option>
                            {listas.locales.map(l => (
                                <option key={l.id} value={l.id}>{l.local}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="productoId"
                            placeholder="ID Producto"
                            value={filtros.productoId}
                            onChange={handleFiltroChange}
                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '120px' }}
                            title="ID Producto"
                        />
                    </div>

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Actualizando datos...</div>
                    ) : (
                        <>
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
                                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Bar options={opcionesHorizontalBar} data={dataTopProductos} />
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Bar options={opcionesHorizontalBarClientes} data={dataTopClientes} />
                                </div>
                            </div>
                        </>
                    )}

                    {!loading && vendedores.length === 0 && locales.length === 0 && topProductos.length === 0 && topClientes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic' }}>
                            No hay datos de ventas registrados para estos criterios.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VentasDashboard;
