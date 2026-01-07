import React, { useState, useEffect } from 'react'

const PlanCuentasModal = ({ isOpen, onClose, onSave, cuentaEditar, cuentaPadre, cuentas }) => {
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        tipo: 'ACTIVO',
        padre_id: '',
        permite_movimiento: false,
        descripcion: ''
    })
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            if (cuentaEditar) {
                setFormData({
                    codigo: cuentaEditar.codigo,
                    nombre: cuentaEditar.nombre,
                    tipo: cuentaEditar.tipo,
                    padre_id: cuentaEditar.padre_id || '',
                    permite_movimiento: cuentaEditar.permite_movimiento,
                    naturaleza: cuentaEditar.naturaleza || 'DEUDORA',
                    sri_codigo: cuentaEditar.sri_codigo || '',
                    requiere_auxiliar: cuentaEditar.requiere_auxiliar || false,
                    requiere_centro_costo: cuentaEditar.requiere_centro_costo || false,
                    descripcion: cuentaEditar.descripcion || ''
                })
            } else if (cuentaPadre) {
                // Pre-fill parent info if adding a child
                setFormData({
                    codigo: `${cuentaPadre.codigo}.`,
                    nombre: '',
                    tipo: cuentaPadre.tipo,
                    padre_id: cuentaPadre.id,
                    permite_movimiento: true, // Default to true for leaf nodes
                    naturaleza: cuentaPadre.naturaleza || 'DEUDORA', // Inherit nature usually
                    sri_codigo: '',
                    requiere_auxiliar: false,
                    requiere_centro_costo: false,
                    descripcion: ''
                })
            } else {
                // Reset for new root account
                setFormData({
                    codigo: '',
                    nombre: '',
                    tipo: 'ACTIVO',
                    padre_id: '',
                    permite_movimiento: false,
                    naturaleza: 'DEUDORA',
                    sri_codigo: '',
                    requiere_auxiliar: false,
                    requiere_centro_costo: false,
                    descripcion: ''
                })
            }
            setError('')
        }
    }, [isOpen, cuentaEditar, cuentaPadre])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.codigo || !formData.nombre) {
            setError('El código y el nombre son obligatorios')
            return
        }
        onSave(formData)
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                background: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%'
            }}>
                <h2>{cuentaEditar ? 'Editar Cuenta' : 'Nueva Cuenta Contable'}</h2>

                {error && <div className="alert alert-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Código *</label>
                        <input
                            type="text"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            placeholder="Ej: 1.1.01"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            disabled={!!cuentaEditar} // Don't allow changing code on edit to prevent hierarchy issues easily
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Nombre *</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre de la cuenta"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Tipo</label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            disabled={!!cuentaPadre || !!cuentaEditar} // Inherit type from parent or keep existing
                        >
                            <option value="ACTIVO">ACTIVO</option>
                            <option value="PASIVO">PASIVO</option>
                            <option value="PATRIMONIO">PATRIMONIO</option>
                            <option value="INGRESO">INGRESO</option>
                            <option value="EGRESO">GASTO (EGRESO)</option>
                            <option value="COSTO">COSTO</option>
                        </select>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px' }}>Naturaleza</label>
                            <select
                                name="naturaleza"
                                value={formData.naturaleza || 'DEUDORA'}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            >
                                <option value="DEUDORA">Deudora</option>
                                <option value="ACREEDORA">Acreedora</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '5px' }}>Cód. SRI (101/102)</label>
                            <input
                                type="text"
                                name="sri_codigo"
                                value={formData.sri_codigo || ''}
                                onChange={handleChange}
                                placeholder="Ej: 312"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Validaciones y Reglas</label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <input
                                type="checkbox"
                                name="permite_movimiento"
                                checked={formData.permite_movimiento}
                                onChange={handleChange}
                            />
                            Permite Movimientos Directos
                        </label>

                        <div style={{ marginLeft: '25px', opacity: formData.permite_movimiento ? 1 : 0.5 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                <input
                                    type="checkbox"
                                    name="requiere_auxiliar"
                                    checked={formData.requiere_auxiliar || false}
                                    onChange={handleChange}
                                    disabled={!formData.permite_movimiento}
                                />
                                Requiere Auxiliar (Cliente/Prov/Emp/Banco)
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="requiere_centro_costo"
                                    checked={formData.requiere_centro_costo || false}
                                    onChange={handleChange}
                                    disabled={!formData.permite_movimiento}
                                />
                                Requiere Centro de Costos
                            </label>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="2"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '8px 16px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer'
                        }}>Cancelar</button>
                        <button type="submit" style={{
                            padding: '8px 16px', border: 'none', background: '#10b981', color: 'white', borderRadius: '4px', cursor: 'pointer'
                        }}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PlanCuentasModal
