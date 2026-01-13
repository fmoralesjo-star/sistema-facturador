import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../config/api'
import '../../pages/Admin.css' // Reusing Admin styles

const Roles = () => {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingRol, setEditingRol] = useState(null)
    const [permisos, setPermisos] = useState({})

    const modulos = [
        { id: 'dashboard', nombre: 'Dashboard' },
        { id: 'facturacion', nombre: 'Facturación' },
        { id: 'notas_credito', nombre: 'Notas de Crédito' },
        { id: 'proformas', nombre: 'Proformas' },
        { id: 'clientes', nombre: 'Clientes' },
        { id: 'productos', nombre: 'Productos' },
        { id: 'inventario', nombre: 'Inventario' },
        { id: 'promociones', nombre: 'Promociones' },
        { id: 'compras', nombre: 'Compras' },
        { id: 'proveedores', nombre: 'Proveedores' },
        { id: 'contabilidad', nombre: 'Contabilidad' },
        { id: 'tesoreria', nombre: 'Tesorería' },
        { id: 'bancos', nombre: 'Bancos' },
        { id: 'cartera', nombre: 'Cartera (Cuentas por Cobrar/Pagar)' },
        { id: 'recursos_humanos', nombre: 'Recursos Humanos' },
        { id: 'reportes', nombre: 'Reportes' },
        { id: 'admin', nombre: 'Administración General' },
        { id: 'auditoría', nombre: 'Auditoría' },
        { id: 'administracion_ti', nombre: 'Administración TI' },
        { id: 'tienda', nombre: 'Tienda Online' },
        { id: 'sri', nombre: 'Configuración SRI' }
    ]

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_URL}/usuarios/roles`)
            setRoles(res.data)
        } catch (error) {
            console.error('Error fetching roles:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditPermisos = async (rol) => {
        setEditingRol(rol)
        try {
            const res = await axios.get(`${API_URL}/usuarios/roles/${rol.id}/permisos`)
            // Convert array of objects {modulo: 'xyz', ...} to map {xyz: true}
            const permisosMap = {}
            res.data.forEach(p => {
                permisosMap[p.modulo] = true
            })
            setPermisos(permisosMap)
        } catch (error) {
            console.error('Error fetching permissions:', error)
            setPermisos({})
        }
    }

    const handleSavePermisos = async () => {
        if (!editingRol) return

        const modulosActivos = Object.keys(permisos).filter(k => permisos[k])

        try {
            await axios.put(`${API_URL}/usuarios/roles/${editingRol.id}/permisos`, {
                modulos: modulosActivos
            })
            alert('Permisos actualizados correctamente')
            setEditingRol(null)
        } catch (error) {
            console.error('Error saving permissions:', error)
            alert('Error al guardar permisos')
        }
    }

    const togglePermiso = (moduloId) => {
        setPermisos(prev => ({
            ...prev,
            [moduloId]: !prev[moduloId]
        }))
    }

    return (
        <div className="admin-content">
            <h2>Gestión de Roles y Permisos</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Configura los permisos predeterminados para cada rol. Los nuevos usuarios heredarán estos permisos.
            </p>

            {loading ? (
                <p>Cargando roles...</p>
            ) : (
                <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {roles.map(rol => (
                        <div key={rol.id} className="stat-card" style={{ display: 'block' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{rol.nombre}</h3>
                                <span className="badge-rol" style={{ fontSize: '0.8rem' }}>ID: {rol.id}</span>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                {rol.descripcion || 'Sin descripción'}
                            </p>
                            <button
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.5rem' }}
                                onClick={() => handleEditPermisos(rol)}
                            >
                                Editar Permisos
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {editingRol && (
                <div className="modal-overlay" onClick={() => setEditingRol(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Permisos para: {editingRol.nombre}</h2>
                            <button className="btn-cerrar-modal" onClick={() => setEditingRol(null)}></button>
                        </div>

                        <div className="modal-body" style={{ padding: '1rem 0' }}>
                            <div className="permisos-grid">
                                {modulos.map(modulo => (
                                    <div key={modulo.id} className="permiso-item">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={!!permisos[modulo.id]}
                                                onChange={() => togglePermiso(modulo.id)}
                                            />
                                            <span>{modulo.nombre}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingRol(null)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSavePermisos}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Roles
