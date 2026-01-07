import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import './SystemHealthWidget.css'

const SystemHealthWidget = () => {
    const [healthData, setHealthData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [lastUpdated, setLastUpdated] = useState(null)

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    const getStatusColor = (latency) => {
        if (latency < 100) return 'status-green'
        if (latency < 500) return 'status-yellow'
        return 'status-red'
    }

    const fetchHealth = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/health`)
            setHealthData(res.data)
            setLastUpdated(new Date())
            setError(null)
        } catch (err) {
            console.error('Error fetching health data:', err)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHealth()
        const interval = setInterval(fetchHealth, 30000) // Update every 30s
        return () => clearInterval(interval)
    }, [])

    if (loading && !healthData) {
        return <div className="health-widget loading">Cargando monitor...</div>
    }

    if (error && !healthData) {
        return <div className="health-widget error">⚠️ Sistema Offline</div>
    }

    return (
        <div className="health-widget">
            <div className="health-header">
                <h3>🩺 Salud del Sistema</h3>
                <span className="last-updated">
                    Actualizado: {lastUpdated?.toLocaleTimeString()}
                </span>
            </div>

            <div className="health-grid">
                {/* Database Status */}
                <div className="health-item">
                    <div className={`status-indicator ${healthData.status === 'online' ? 'online' : 'offline'}`}></div>
                    <div className="health-info">
                        <span className="label">Base de Datos</span>
                        <span className="value">{healthData.status === 'online' ? 'Conectado' : 'Desconectado'}</span>
                    </div>
                </div>

                {/* Latency */}
                <div className="health-item">
                    <div className={`status-indicator ${getStatusColor(healthData.latency)}`}></div>
                    <div className="health-info">
                        <span className="label">Latencia</span>
                        <span className="value">{healthData.latency} ms</span>
                    </div>
                </div>

                {/* Connections */}
                <div className="health-item">
                    <div className="stat-icon-small">🔌</div>
                    <div className="health-info">
                        <span className="label">Conexiones</span>
                        <span className="value">{healthData.connections} activas</span>
                    </div>
                </div>

                {/* Storage */}
                <div className="health-item">
                    <div className="stat-icon-small">💾</div>
                    <div className="health-info">
                        <span className="label">Almacenamiento</span>
                        <span className="value">{formatBytes(healthData.storage_size)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemHealthWidget
