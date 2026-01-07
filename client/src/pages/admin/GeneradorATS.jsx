import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import '../Admin.css';

function GeneradorATS() {
    const navigate = useNavigate();
    const [anio, setAnio] = useState(2026);
    const [mes, setMes] = useState(1);
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [generando, setGenerando] = useState(false);

    const meses = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' }
    ];

    useEffect(() => {
        const fechaActual = new Date();
        setAnio(fechaActual.getFullYear());
        setMes(fechaActual.getMonth() + 1);
    }, []);

    const cargarResumen = async () => {
        setCargando(true);
        try {
            const response = await axios.get(`${API_URL}/ats/resumen`, {
                params: { anio, mes }
            });
            setResumen(response.data);
        } catch (error) {
            console.error('Error al cargar resumen:', error);
            alert('Error al cargar el resumen del período');
        } finally {
            setCargando(false);
        }
    };

    const generarATS = async () => {
        if (!window.confirm(`¿Generar ATS para ${meses[mes - 1].label} ${anio}?`)) {
            return;
        }

        setGenerando(true);
        try {
            const response = await axios.post(
                `${API_URL}/ats/generar`,
                { anio, mes },
                { responseType: 'blob' }
            );

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ATS_${mes.toString().padStart(2, '0')}_${anio}.xml`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            alert('Archivo ATS generado correctamente');
        } catch (error) {
            console.error('Error al generar ATS:', error);
            alert('Error al generar el archivo ATS: ' + (error.response?.data?.message || error.message));
        } finally {
            setGenerando(false);
        }
    };

    return (
        <div className="ats-page" style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
            {/* Card Principal */}
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Selector de Período */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#374151' }}>Seleccionar Período</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#6b7280' }}>
                                Mes
                            </label>
                            <select
                                value={mes}
                                onChange={(e) => setMes(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            >
                                {meses.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#6b7280' }}>
                                Año
                            </label>
                            <input
                                type="number"
                                value={anio}
                                onChange={(e) => setAnio(parseInt(e.target.value))}
                                min="2020"
                                max="2030"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={cargarResumen}
                        disabled={cargando}
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: cargando ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            opacity: cargando ? 0.6 : 1
                        }}
                    >
                        {cargando ? 'Cargando...' : '🔍 Vista Previa'}
                    </button>
                </div>

                {/* Resumen del Período */}
                {resumen && (
                    <div style={{
                        background: '#f9fafb',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{ marginBottom: '15px', color: '#374151' }}>
                            Resumen del Período: {resumen.periodo}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '5px' }}>
                                    📈 Ventas
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                                    ${resumen.totalVentas}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                    {resumen.cantidadVentas} facturas
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '5px' }}>
                                    📉 Compras
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                                    ${resumen.totalCompras}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                    {resumen.cantidadCompras} compras
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de Acción */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={generarATS}
                        disabled={generando || !resumen}
                        style={{
                            padding: '12px 30px',
                            background: generando ? '#9ca3af' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: (generando || !resumen) ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            opacity: (generando || !resumen) ? 0.6 : 1
                        }}
                    >
                        {generando ? '⏳ Generando...' : '📥 Generar XML'}
                    </button>
                </div>

                {/* Información */}
                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    background: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    borderRadius: '4px'
                }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af' }}>
                        <strong>ℹ️ Información:</strong> El archivo XML generado está listo para ser subido
                        directamente al portal del SRI (DIMM) para cumplir con la declaración del Anexo Transaccional Simplificado.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default GeneradorATS;
