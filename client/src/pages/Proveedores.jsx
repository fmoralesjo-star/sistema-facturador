import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config/api'
import './Compras.css' // Reutilizamos estilos de compras por ahora

function Proveedores({ socket }) {
    const navigate = useNavigate()
    const [proveedores, setProveedores] = useState([])
    const [filteredProveedores, setFilteredProveedores] = useState([])
    const [filterText, setFilterText] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        tipo_contribuyente: 'Persona Natural',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        ciudad: '',
        observaciones: ''
    })

    useEffect(() => {
        cargarProveedores()
    }, [])

    useEffect(() => {
        if (filterText) {
            const lower = filterText.toLowerCase()
            setFilteredProveedores(proveedores.filter(p =>
                (p.nombre?.toLowerCase().includes(lower)) ||
                (p.ruc?.includes(lower)) ||
                (p.email?.toLowerCase().includes(lower)) ||
                (p.codigo?.toLowerCase().includes(lower))
            ))
        } else {
            setFilteredProveedores(proveedores)
        }
    }, [filterText, proveedores])

    const cargarProveedores = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_URL}/proveedores`)
            setProveedores(res.data)
            setFilteredProveedores(res.data)
        } catch (error) {
            console.error('Error al cargar proveedores:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                await axios.put(`${API_URL}/proveedores/${editingId}`, formData)
            } else {
                await axios.post(`${API_URL}/proveedores`, formData)
            }
            setShowModal(false)
            cargarProveedores()
            resetForm()
        } catch (error) {
            console.error('Error al guardar proveedor:', error)
            alert('Error al guardar: ' + (error.response?.data?.message || error.message))
        }
    }

    const handleEdit = (proveedor) => {
        setEditingId(proveedor.id)
        setFormData({
            codigo: proveedor.codigo || '',
            nombre: proveedor.nombre || '',
            tipo_contribuyente: proveedor.tipo_contribuyente || 'Persona Natural',
            ruc: proveedor.ruc || '',
            direccion: proveedor.direccion || '',
            telefono: proveedor.telefono || '',
            email: proveedor.email || '',
            ciudad: proveedor.ciudad || '',
            observaciones: proveedor.observaciones || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
            try {
                await axios.delete(`${API_URL}/proveedores/${id}`)
                cargarProveedores()
            } catch (error) {
                console.error('Error al eliminar:', error)
                alert('No se puede eliminar el proveedor, posiblemente tenga compras asociadas.')
            }
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({
            codigo: '',
            nombre: '',
            tipo_contribuyente: 'Persona Natural',
            ruc: '',
            direccion: '',
            telefono: '',
            email: '',
            ciudad: '',
            observaciones: ''
        })
    }

    const handleImportXml = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            setLoading(true)
            const res = await axios.post(`${API_URL}/compras/importar-xml`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const proveedorData = res.data.proveedor
            if (proveedorData) {
                setFormData(prev => ({
                    ...prev,
                    ruc: proveedorData.codigo, // SRI RUC está en codigo
                    nombre: proveedorData.nombre,
                    direccion: proveedorData.direccion || '',
                    // El tipo contribuyente no siempre viene en el XML, lo inferimos si es posible o dejamos default
                    tipo_contribuyente: proveedorData.codigo.length === 13 ? 'Persona Natural' : 'Persona Natural'
                }))
                alert('¡Datos de proveedor extraídos del XML correctamente!')
            }
        } catch (error) {
            console.error('Error al importar XML:', error)
            alert('Error al leer el XML. Asegúrese de que sea una factura electrónica válida.')
        } finally {
            setLoading(false)
            e.target.value = '' // Reset input
        }
    }

    return (
        <div className="compras-container"> {/* Reutilizando contenedor */}
            <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-home"
                title="Volver a la pantalla principal"
                style={{ marginBottom: '1rem', width: 'fit-content' }}
            >
                Inicio
            </button>
            <div className="compras-header">
                <h1>🚛 Gestión de Proveedores</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                        className="btn-header active"
                        onClick={() => {
                            console.log('🔘 Button CLICKED');
                            resetForm();
                            console.log('🔄 Setting showModal TRUE');
                            setShowModal(true);
                        }}
                    >
                        + Nuevo Proveedor
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Cargando proveedores...</p>
            ) : (
                <div className="compras-registradas">
                    <table className="tabla-compras">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre / Razón Social</th>
                                <th>RUC / CI</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Ciudad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProveedores.length > 0 ? (
                                filteredProveedores.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.codigo}</td>
                                        <td>{p.nombre}</td>
                                        <td>{p.ruc}</td>
                                        <td>{p.email}</td>
                                        <td>{p.telefono}</td>
                                        <td>{p.ciudad}</td>
                                        <td>
                                            <button
                                                className="btn-editar"
                                                onClick={() => handleEdit(p)}
                                                style={{ marginRight: '5px', background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-eliminar"
                                                onClick={() => handleDelete(p.id)}
                                                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                    {!editingId && (
                        <div>
                            <input
                                type="file"
                                id="xmlInput"
                                accept=".xml"
                                style={{ display: 'none' }}
                                onChange={handleImportXml}
                            />
                            <button
                                type="button"
                                style={{
                                    background: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onClick={() => document.getElementById('xmlInput').click()}
                            >
                                📂 Importar desde XML
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    <div className="form-group">
                        <label>Código:</label>
                        <input
                            type="text"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nombre / Razón Social:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>RUC / CI:</label>
                        <input
                            type="text"
                            name="ruc"
                            value={formData.ruc}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo Contribuyente:</label>
                        <select name="tipo_contribuyente" value={formData.tipo_contribuyente} onChange={handleInputChange}>
                            <option value="Persona Natural">Persona Natural</option>
                            <option value="Sociedad">Sociedad</option>
                            <option value="Contribuyente Especial">Contribuyente Especial</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Teléfono:</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Dirección:</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Ciudad:</label>
                        <input
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Proveedores
