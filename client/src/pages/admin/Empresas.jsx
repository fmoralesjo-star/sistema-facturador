
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'
import './Empresas.css'

const Empresas = () => {
    const { getToken, currentUser } = useAuth()
    const [empresas, setEmpresas] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        ruc: '',
        razon_social: '',
        nombre_comercial: '',
        direccion_matriz: '',
        telefono: '',
        email: '',
        obligado_contabilidad: false,
        activa: true
    })
    const [logoFile, setLogoFile] = useState(null)

    // Solo permitir acceso si es superadmin (o lógica personalizada)
    // if (!currentUser?.is_superuser) return <div>Acceso denegado</div> 

    const fetchEmpresas = async () => {
        setLoading(true)
        try {
            const token = await getToken()
            // Asumimos que GET /empresa devuelve todas las empresas si es superuser
            const res = await axios.get(`${API_URL}/empresa`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setEmpresas(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error('Error fetching empresas:', error)
            alert('Error cargando lista de empresas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmpresas()
    }, [])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const token = await getToken()
            let res
            if (editingId) {
                // Update
                res = await axios.patch(`${API_URL}/empresa/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else {
                // Create
                res = await axios.post(`${API_URL}/empresa`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }

            const empresaId = editingId || res.data.id

            // Upload logo if exists
            if (logoFile && empresaId) {
                const logoData = new FormData()
                logoData.append('file', logoFile)
                // Usar RUC o ID según soporte el endpoint
                await axios.post(`${API_URL}/empresa/${formData.ruc}/logo`, logoData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
            }

            alert(editingId ? 'Empresa actualizada' : 'Empresa creada con éxito')
            setShowModal(false)
            resetForm()
            fetchEmpresas()
        } catch (error) {
            console.error('Error saving empresa:', error)
            alert('Error al guardar: ' + (error.response?.data?.message || error.message))
        }
    }

    const handleEdit = (empresa) => {
        setEditingId(empresa.id)
        setFormData({
            ruc: empresa.ruc,
            razon_social: empresa.razon_social,
            nombre_comercial: empresa.nombre_comercial || '',
            direccion_matriz: empresa.direccion_matriz,
            telefono: empresa.telefono || '',
            email: empresa.email || '',
            obligado_contabilidad: empresa.obligado_contabilidad,
            activa: empresa.activa
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({
            ruc: '',
            razon_social: '',
            nombre_comercial: '',
            direccion_matriz: '',
            telefono: '',
            email: '',
            obligado_contabilidad: false,
            activa: true
        })
        setLogoFile(null)
    }

    const toggleEstado = async (id, estadoActual) => {
        if (!window.confirm(`¿${estadoActual ? 'Desactivar' : 'Activar'} esta empresa?`)) return
        try {
            const token = await getToken()
            const endpoint = estadoActual ? 'desactivar' : 'activar'
            await axios.post(`${API_URL}/empresa/${id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchEmpresas()
        } catch (error) {
            alert('Error cambiando estado')
        }
    }

    return (
        <div className="empresas-admin-container">
            <div className="header-actions">
                <h2>Gestión de Empresas (Tenants)</h2>
                <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true) }}>
                    + Nueva Empresa
                </button>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>RUC</th>
                                <th>Razón Social</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresas.map(emp => (
                                <tr key={emp.id}>
                                    <td>{emp.id}</td>
                                    <td>{emp.ruc}</td>
                                    <td>
                                        <strong>{emp.razon_social}</strong>
                                        <br />
                                        <small>{emp.nombre_comercial}</small>
                                    </td>
                                    <td>
                                        <span className={`badge ${emp.activa ? 'success' : 'danger'}`}>
                                            {emp.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={() => handleEdit(emp)}>✏️</button>
                                        <button className="btn-icon" onClick={() => toggleEstado(emp.id, emp.activa)}>
                                            {emp.activa ? '🚫' : '✅'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingId ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>RUC</label>
                                <input name="ruc" value={formData.ruc} onChange={handleInputChange} required maxLength={13} />
                            </div>
                            <div className="form-group">
                                <label>Razón Social</label>
                                <input name="razon_social" value={formData.razon_social} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Nombre Comercial</label>
                                <input name="nombre_comercial" value={formData.nombre_comercial} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Dirección Matriz</label>
                                <textarea name="direccion_matriz" value={formData.direccion_matriz} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email Contacto</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Logo (Opcional)</label>
                                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input type="checkbox" name="obligado_contabilidad" checked={formData.obligado_contabilidad} onChange={handleInputChange} />
                                    Obligado a Contabilidad
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Empresas
