import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../config/api'
import './AdminConfiguracion.css'

const AdminConfiguracion = ({ configuracion, puntosVenta = [], onSave, loading }) => {
    const [activeTab, setActiveTab] = useState('emision')
    const [localConfig, setLocalConfig] = useState({})
    const [validationReport, setValidationReport] = useState(null)
    const [validating, setValidating] = useState(false)
    const [showValidationModal, setShowValidationModal] = useState(false)
    const [testingSmtp, setTestingSmtp] = useState(false)
    const [testResult, setTestResult] = useState(null)

    useEffect(() => {
        if (Array.isArray(configuracion) && configuracion.length > 0) {
            const configObj = configuracion.reduce((acc, item) => {
                acc[item.clave] = { valor: item.valor }
                return acc
            }, {})
            setLocalConfig(configObj)
        } else if (configuracion && Object.keys(configuracion).length > 0) {
            setLocalConfig(JSON.parse(JSON.stringify(configuracion)))
        }
    }, [configuracion])

    const [localPuntosVenta, setLocalPuntosVenta] = useState([])

    useEffect(() => {
        if (puntosVenta && puntosVenta.length > 0) {
            setLocalPuntosVenta(JSON.parse(JSON.stringify(puntosVenta)))
        }
    }, [puntosVenta])

    const handlePuntoChange = (index, field, value) => {
        const updatedPoints = [...localPuntosVenta]
        updatedPoints[index][field] = value
        setLocalPuntosVenta(updatedPoints)
    }

    const handleUpdateSecuenciales = async () => {
        try {
            const promises = localPuntosVenta.map(pv =>
                axios.patch(`${API_URL}/puntos-venta/${pv.id}`, {
                    secuencia_factura: parseInt(pv.secuencia_factura),
                    secuencia_nota_credito: parseInt(pv.secuencia_nota_credito)
                })
            )
            await Promise.all(promises)
            alert('¡Secuenciales actualizados correctamente!')
        } catch (error) {
            console.error('Error actualizando secuenciales:', error)
            alert('Error al guardar: ' + (error.response?.data?.message || error.message))
        }
    }

    const [emailLogs, setEmailLogs] = useState([])
    const [cargandoLogs, setCargandoLogs] = useState(false)

    const fetchEmailLogs = async () => {
        setCargandoLogs(true)
        try {
            const res = await axios.get(`${API_URL}/admin/emails?limit=20`)
            setEmailLogs(res.data)
        } catch (error) {
            console.error('Error cargando logs de correo:', error)
        } finally {
            setCargandoLogs(false)
        }
    }

    const [establecimientos, setEstablecimientos] = useState([])
    const [loadingEst, setLoadingEst] = useState(false)
    const [newEst, setNewEst] = useState({ codigo: '', nombre_comercial: '', direccion: '' })



    const fetchEstablecimientos = async () => {
        setLoadingEst(true)
        try {
            const res = await axios.get(`${API_URL}/establecimientos`)
            setEstablecimientos(res.data)
        } catch (error) {
            console.error('Error fetching establecimientos:', error)
        } finally {
            setLoadingEst(false)
        }
    }

    const handleCreateEstablecimiento = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/establecimientos`, newEst)
            setNewEst({ codigo: '', nombre_comercial: '', direccion: '' })
            fetchEstablecimientos()
            alert('Establecimiento creado')
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || error.message))
        }
    }

    const handleDeleteEstablecimiento = async (id) => {
        if (!confirm('¿Eliminar establecimiento?')) return
        try {
            await axios.delete(`${API_URL}/establecimientos/${id}`)
            fetchEstablecimientos()
        } catch (error) {
            alert('Error al eliminar')
        }
    }

    const [ivaRates, setIvaRates] = useState([])
    const [retenciones, setRetenciones] = useState([])
    const [newIva, setNewIva] = useState({ codigo: '', descripcion: '', porcentaje: 15 })
    const [newRet, setNewRet] = useState({ codigo: '', descripcion: '', tipo: 'RENTA', porcentaje: 1 })

    const fetchIvaRates = async () => {
        try {
            const res = await axios.get(`${API_URL}/sri/parametros/iva`)
            setIvaRates(res.data)
        } catch (err) { console.error(err) }
    }

    const fetchRetenciones = async () => {
        try {
            const res = await axios.get(`${API_URL}/sri/parametros/retenciones`)
            setRetenciones(res.data)
        } catch (err) { console.error(err) }
    }

    const handleCreateIva = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/sri/parametros/iva`, newIva)
            setNewIva({ codigo: '', descripcion: '', porcentaje: 15 })
            fetchIvaRates()
        } catch (error) { alert('Error: ' + error.message) }
    }

    const handleCreateRetencion = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/sri/parametros/retenciones`, newRet)
            setNewRet({ codigo: '', descripcion: '', tipo: 'RENTA', porcentaje: 1 })
            fetchRetenciones()
        } catch (error) { alert('Error: ' + error.message) }
    }

    const [logoFile, setLogoFile] = useState(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [customFieldInput, setCustomFieldInput] = useState('')

    const getCustomFields = () => {
        const val = localConfig.factura_campos_default?.valor
        return val ? val.split(',').map(s => s.trim()).filter(Boolean) : []
    }

    const handleLogoUpload = async () => {
        if (!logoFile) return
        if (!confirm('¿Subir este logo? Reemplazará el anterior.')) return

        setUploadingLogo(true)
        const formData = new FormData()
        formData.append('file', logoFile)

        try {
            const empresaRes = await axios.get(`${API_URL}/empresa/activa`)
            const ruc = empresaRes.data.ruc;

            await axios.post(`${API_URL}/empresa/${ruc}/logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            alert('Logo subido exitosamente')
            setLogoFile(null)
        } catch (error) {
            alert('Error subiendo logo: ' + (error.response?.data?.message || error.message))
        } finally {
            setUploadingLogo(false)
        }
        setUploadingLogo(false)
    }

    const addCustomField = () => {
        if (!customFieldInput.trim()) return
        const current = getCustomFields()
        if (current.includes(customFieldInput.trim())) return

        const newVal = [...current, customFieldInput.trim()].join(',')
        handleChange('factura_campos_default', newVal)
        setCustomFieldInput('')
    }

    const removeCustomField = (field) => {
        const current = getCustomFields()
        const newVal = current.filter(f => f !== field).join(',')
        handleChange('factura_campos_default', newVal)
    }

    useEffect(() => {
        if (activeTab === 'correo') {
            fetchEmailLogs()
        }
        if (activeTab === 'estructura') {
            fetchEstablecimientos()
        }
        if (activeTab === 'impuestos') {
            fetchIvaRates()
            fetchRetenciones()
        }

    }, [activeTab])

    if (!configuracion || Object.keys(configuracion).length === 0) {
        return (
            <div className="admin-configuracion-container" style={{ textAlign: 'center', padding: '40px' }}>
                <p>⏳ Cargando configuración o no hay datos inicializados...</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
                >Recargar Página</button>
            </div>
        )
    }

    const handleChange = (clave, valor) => {
        setLocalConfig(prev => ({
            ...prev,
            [clave]: { ...prev[clave], valor }
        }))
    }

    const handleSave = () => {
        onSave(localConfig)
    }

    const runValidation = async () => {
        setValidating(true)
        setShowValidationModal(true)
        try {
            const res = await axios.get(`${API_URL}/admin/validate-config`)
            setValidationReport(res.data)
        } catch (error) {
            console.error('Error validating:', error)
            setValidationReport({ error: 'Error al conectar con el validador' })
        } finally {
            setValidating(false)
        }
    }

    const handleTestSmtp = async () => {
        setTestingSmtp(true)
        setTestResult(null)
        try {
            const config = {
                host: localConfig.smtp_host?.valor,
                port: localConfig.smtp_port?.valor,
                user: localConfig.smtp_user?.valor,
                password: localConfig.smtp_password?.valor,
                secure: localConfig.smtp_secure?.valor
            }
            const res = await axios.post(`${API_URL}/admin/test-smtp`, config)
            if (res.data.success) {
                setTestResult({ success: true, message: res.data.message })
                alert(res.data.message);
            } else {
                setTestResult({ success: false, message: res.data.message })
                alert('Error: ' + res.data.message);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            setTestResult({ success: false, message: msg })
            alert('Error al probar conexión: ' + msg);
        } finally {
            setTestingSmtp(false)
        }
    }

    return (
        <div className="admin-configuracion-container">
            <div className="config-header-actions">
                <h2>Configuración Avanzada</h2>
                <button className="btn-validator" onClick={runValidation}>
                    🏥 Check Salud Sistema
                </button>
            </div>

            <div className="config-tabs">

                <button type="button" className={`tab-btn ${activeTab === 'emision' ? 'active' : ''}`} onClick={() => setActiveTab('emision')}>
                    📡 Emisión Electrónica
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'ride' ? 'active' : ''}`} onClick={() => setActiveTab('ride')}>
                    🎨 Personalización RIDE
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'estructura' ? 'active' : ''}`} onClick={() => setActiveTab('estructura')}>
                    🏗️ Estructura Operativa
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'impuestos' ? 'active' : ''}`} onClick={() => setActiveTab('impuestos')}>
                    💰 Impuestos
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'correo' ? 'active' : ''}`} onClick={() => setActiveTab('correo')}>
                    📧 Correo y Notificaciones
                </button>
            </div>

            <div className="config-body">


                <div style={{ display: activeTab === 'emision' ? 'block' : 'none' }}>
                    <h3>Configuración de Emisión Electrónica</h3>
                    <p className="section-desc">ADN legal de la factura y parámetros SRI.</p>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Ambiente SRI</label>
                            <select value={localConfig.sri_ambiente?.valor || '1'} onChange={(e) => handleChange('sri_ambiente', e.target.value)}>
                                <option value="1">Pruebas</option>
                                <option value="2">Producción</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Emisión</label>
                            <select value={localConfig.sri_tipo_emision?.valor || '1'} onChange={(e) => handleChange('sri_tipo_emision', e.target.value)}>
                                <option value="1">Normal (Offline/Online)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Porcentaje IVA Actual (%)</label>
                            <input type="number" placeholder="Ej: 15" value={localConfig.impuesto_iva_porcentaje?.valor || '15'} onChange={(e) => handleChange('impuesto_iva_porcentaje', e.target.value)} />
                        </div>
                    </div>
                    <div className="switch-group" style={{ marginTop: '20px' }}>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div className="toggle-switch">
                                <input type="checkbox" checked={localConfig.sri_regimen_rimpe?.valor === 'true'} onChange={(e) => handleChange('sri_regimen_rimpe', e.target.checked ? 'true' : 'false')} />
                                <span className="slider round"></span>
                            </div>
                            <label style={{ margin: 0 }}>Contribuyente Régimen RIMPE</label>
                        </div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div className="toggle-switch">
                                <input type="checkbox" checked={localConfig.sri_obligado_contabilidad?.valor === 'true'} onChange={(e) => handleChange('sri_obligado_contabilidad', e.target.checked ? 'true' : 'false')} />
                                <span className="slider round"></span>
                            </div>
                            <label style={{ margin: 0 }}>Obligado a Llevar Contabilidad</label>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Agente de Retención (Resolución No.)</label>
                        <input type="text" placeholder="Ej: 1" value={localConfig.sri_agente_retencion?.valor || ''} onChange={(e) => handleChange('sri_agente_retencion', e.target.value)} />
                        <small style={{ color: '#6b7280' }}>Dejar vacío si no es Agente de Retención</small>
                    </div>
                </div>


                <div style={{ display: activeTab === 'ride' ? 'block' : 'none' }}>
                    <h3>Personalización del RIDE (PDF)</h3>
                    <p className="section-desc">Diseño y apariencia de tus documentos PDF.</p>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Color Primario (En cabezados)</label>
                            <div className="color-picker-wrapper">
                                <input type="color" value={localConfig.ride_color_primario?.valor || '#333333'} onChange={(e) => handleChange('ride_color_primario', e.target.value)} />
                                <span>{localConfig.ride_color_primario?.valor || '#333333'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Color Secundario (Bordes/Detalles)</label>
                            <div className="color-picker-wrapper">
                                <input type="color" value={localConfig.ride_color_secundario?.valor || '#666666'} onChange={(e) => handleChange('ride_color_secundario', e.target.value)} />
                                <span>{localConfig.ride_color_secundario?.valor || '#666666'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="requirements-section" style={{ marginTop: '20px' }}>
                        <h4>Logotipo</h4>
                        <div className="form-group">
                            <label>Logo en RIDE</label>
                            <div className="switch-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                                <div className="toggle-switch">
                                    <input type="checkbox" checked={localConfig.ride_mostrar_logo?.valor === 'true'} onChange={(e) => handleChange('ride_mostrar_logo', e.target.checked ? 'true' : 'false')} />
                                    <span className="slider round"></span>
                                </div>
                                <span>Mostrar Logotipo en encabezado</span>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label>Actualizar Logo (PNG/JPG)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="file" accept="image/png, image/jpeg" onChange={e => setLogoFile(e.target.files[0])} />
                                <button className="btn-save-config" style={{ padding: '5px 15px', fontSize: '0.9em' }} onClick={handleLogoUpload} disabled={!logoFile || uploadingLogo}>
                                    {uploadingLogo ? 'Subiendo...' : '🔼 Subir'}
                                </button>
                            </div>
                            <small>Se recomienda imagen cuadrada o rectangular, fondo transparente. (Max 2MB)</small>
                        </div>
                    </div>
                    <div className="requirements-section" style={{ marginTop: '20px' }}>
                        <h4>Campos Adicionales Predeterminados</h4>
                        <p style={{ fontSize: '0.9em', color: '#666' }}>Defina qué etiquetas extras desea llenar en sus facturas (Ej: Vendedor, Zona, Orden Compra).</p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input placeholder="Nuevo campo (Ej: Vendedor)" value={customFieldInput} onChange={e => setCustomFieldInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomField()} />
                            <button onClick={addCustomField} style={{ cursor: 'pointer', padding: '0 15px' }}>➕</button>
                        </div>
                        <div className="tags-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {getCustomFields().map(field => (
                                <span key={field} style={{ background: '#e0e7ff', padding: '5px 12px', borderRadius: '15px', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {field}
                                    <button onClick={() => removeCustomField(field)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Pie de Página Personalizado</label>
                        <textarea rows="3" placeholder="Texto adicional al final del PDF (Ej: Gracias por su compra...)" value={localConfig.ride_pie_pagina?.valor || ''} onChange={(e) => handleChange('ride_pie_pagina', e.target.value)}></textarea>
                    </div>
                </div>

                <div style={{ display: activeTab === 'estructura' ? 'block' : 'none' }}>
                    <h3>Estructura Operativa</h3>
                    <p className="section-desc">Gestiona tus locales (Establecimientos) y puntos de emisión.</p>
                    <div className="requirements-section">
                        <h4>Nuevo Establecimiento</h4>
                        <form onSubmit={handleCreateEstablecimiento} className="form-grid">
                            <input placeholder="Código (001)" value={newEst.codigo} onChange={e => setNewEst({ ...newEst, codigo: e.target.value })} maxLength={3} required />
                            <input placeholder="Nombre Comercial (Opcional)" value={newEst.nombre_comercial} onChange={e => setNewEst({ ...newEst, nombre_comercial: e.target.value })} />
                            <input placeholder="Dirección" value={newEst.direccion} onChange={e => setNewEst({ ...newEst, direccion: e.target.value })} required />
                            <button type="submit" className="btn-save-config">Agregar</button>
                        </form>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Código</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Nombre/Dirección</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {establecimientos.map(est => (
                                    <tr key={est.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}><strong>{est.codigo}</strong></td>
                                        <td style={{ padding: '10px' }}>
                                            <div>{est.nombre_comercial || 'Matriz'}</div>
                                            <small>{est.direccion}</small>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => handleDeleteEstablecimiento(est.id)} style={{ color: 'red', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="requirements-section" style={{ marginTop: '30px' }}>
                        <h4>Puntos de Emisión (Cajas)</h4>
                        <p style={{ fontSize: '0.9em', color: '#666' }}>Crea puntos de emisión dentro de tus establecimientos.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <button className="btn-save-config" style={{ padding: '8px 15px', fontSize: '0.9em' }} onClick={() => handleUpdateSecuenciales()} disabled={loading}>
                                💾 Guardar Cambios en Secuenciales
                            </button>
                        </div>
                        <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Establecimiento</th>
                                    <th style={{ padding: '10px' }}>Punto</th>
                                    <th style={{ padding: '10px' }}>Sec. Factura</th>
                                    <th style={{ padding: '10px' }}>Sec. Nota Crédito</th>
                                    <th style={{ padding: '10px' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localPuntosVenta.map((pv, index) => (
                                    <tr key={pv.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '10px' }}>
                                            {pv.establecimiento ? `${pv.establecimiento.codigo} - ${pv.establecimiento.nombre_comercial || ''}` : 'Sin Asignar'}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <strong>{pv.codigo}</strong><br />
                                            <small>{pv.nombre}</small>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <input type="number" className="data-input" value={pv.secuencia_factura || 1} onChange={(e) => handlePuntoChange(index, 'secuencia_factura', e.target.value)} style={{ width: '80px', padding: '5px' }} />
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <input type="number" className="data-input" value={pv.secuencia_nota_credito || 1} onChange={(e) => handlePuntoChange(index, 'secuencia_nota_credito', e.target.value)} style={{ width: '80px', padding: '5px' }} />
                                        </td>
                                        <td style={{ padding: '10px' }}><span className="badge badge-blue">Activo</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p style={{ fontSize: '0.8em', marginTop: '10px', color: '#888' }}>* Para crear nuevos puntos de emisión, contacte a soporte técnico o use la configuración avanzada en base de datos por el momento, ya que requiere asignación de establecimiento.</p>
                    </div>
                </div>

                <div style={{ display: activeTab === 'impuestos' ? 'block' : 'none' }}>
                    <h3>Parametrización de Impuestos</h3>
                    <div className="requirements-section">
                        <h4>Tasas de IVA</h4>
                        <form onSubmit={handleCreateIva} className="form-grid" style={{ gridTemplateColumns: '1fr 2fr 1fr auto' }}>
                            <input required placeholder="Código SRI (Ej: 4)" value={newIva.codigo} onChange={e => setNewIva({ ...newIva, codigo: e.target.value })} />
                            <input required placeholder="Descripción (IVA 15%)" value={newIva.descripcion} onChange={e => setNewIva({ ...newIva, descripcion: e.target.value })} />
                            <input required type="number" step="0.01" placeholder="%" value={newIva.porcentaje} onChange={e => setNewIva({ ...newIva, porcentaje: parseFloat(e.target.value) })} />
                            <button type="submit" className="btn-save-config">➕</button>
                        </form>
                        <div className="tags-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {ivaRates.map(iva => (
                                <span key={iva.id} style={{ background: '#e0f2fe', padding: '5px 10px', borderRadius: '15px', border: '1px solid #7dd3fc' }}>
                                    {iva.descripcion} ({iva.porcentaje}%) [{iva.codigo}]
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="requirements-section" style={{ marginTop: '20px' }}>
                        <h4>Códigos de Retención</h4>
                        <form onSubmit={handleCreateRetencion} className="form-grid" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr auto' }}>
                            <input required placeholder="Código (312)" value={newRet.codigo} onChange={e => setNewRet({ ...newRet, codigo: e.target.value })} />
                            <input required placeholder="Descripción" value={newRet.descripcion} onChange={e => setNewRet({ ...newRet, descripcion: e.target.value })} />
                            <select value={newRet.tipo} onChange={e => setNewRet({ ...newRet, tipo: e.target.value })}>
                                <option value="RENTA">RENTA</option>
                                <option value="IVA">IVA</option>
                            </select>
                            <input required type="number" step="0.01" placeholder="%" value={newRet.porcentaje} onChange={e => setNewRet({ ...newRet, porcentaje: parseFloat(e.target.value) })} />
                            <button type="submit" className="btn-save-config">➕</button>
                        </form>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                            <table style={{ width: '100%', fontSize: '0.9em' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}><th>Cód</th><th>Desc</th><th>Tipo</th><th>%</th></tr>
                                </thead>
                                <tbody>
                                    {retenciones.map(ret => (
                                        <tr key={ret.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td>{ret.codigo}</td>
                                            <td>{ret.descripcion}</td>
                                            <td>{ret.tipo}</td>
                                            <td>{ret.porcentaje}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="requirements-section" style={{ marginTop: '20px' }}>
                        <h4>Sustento Tributario (ATS)</h4>
                        <p style={{ fontSize: '0.9em', color: '#666' }}>Configura los códigos de sustento tributario para reporte ATS.</p>
                        <p><i>(Funcionalidad disponible en API - Interfaz en desarrollo)</i></p>
                    </div>
                </div>

                <div style={{ display: activeTab === 'correo' ? 'block' : 'none' }}>
                    <h3>Configuración de Servidor de Correo (SMTP)</h3>
                    <p className="section-desc">Configura el servidor para enviar facturas y notificaciones por email.</p>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Servidor SMTP (Host)</label>
                            <input type="text" placeholder="Ej: smtp.gmail.com" value={localConfig.smtp_host?.valor || ''} onChange={(e) => handleChange('smtp_host', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Puerto SMTP</label>
                            <input type="number" placeholder="Ej: 587 o 465" value={localConfig.smtp_port?.valor || ''} onChange={(e) => handleChange('smtp_port', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Usuario / Correo</label>
                            <input type="email" placeholder="tu-email@gmail.com" value={localConfig.smtp_user?.valor || ''} onChange={(e) => handleChange('smtp_user', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Contraseña / App Password</label>
                            <input type="password" placeholder="Contraseña de aplicación" value={localConfig.smtp_password?.valor || ''} onChange={(e) => handleChange('smtp_password', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Nombre Remitente</label>
                            <input type="text" placeholder="Tu Empresa S.A." value={localConfig.smtp_from_name?.valor || ''} onChange={(e) => handleChange('smtp_from_name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Seguridad (SSL/TLS)</label>
                            <select value={localConfig.smtp_secure?.valor || 'false'} onChange={(e) => handleChange('smtp_secure', e.target.value)}>
                                <option value="false">STARTTLS (Puerto 587)</option>
                                <option value="true">SSL/TLS (Puerto 465)</option>
                            </select>
                        </div>
                    </div>
                    <div className="smtp-test-area" style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button className="btn-save-config" style={{ background: '#64748b' }} onClick={handleTestSmtp} disabled={testingSmtp}>
                                {testingSmtp ? '⏳ Probando...' : '🔌 Probar Conexión'}
                            </button>
                            {testResult && (
                                <span style={{ color: testResult.success ? '#16a34a' : '#dc2626', fontWeight: 'bold', fontSize: '0.9em' }}>
                                    {testResult.message}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="email-logs-section" style={{ marginTop: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 style={{ margin: 0 }}>📜 Historial de Envíos Recientes</h4>
                            <button onClick={fetchEmailLogs} style={{ padding: '5px 10px', fontSize: '0.85em', cursor: 'pointer', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                🔄 Actualizar
                            </button>
                        </div>
                        {cargandoLogs ? (
                            <p>Cargando historial...</p>
                        ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Destinatario</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Asunto</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emailLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                    No hay registros de envío.
                                                </td>
                                            </tr>
                                        ) : (
                                            emailLogs.map(log => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '8px 10px' }}>{new Date(log.fecha_creacion).toLocaleString()}</td>
                                                    <td style={{ padding: '8px 10px' }}>{log.destinatario}</td>
                                                    <td style={{ padding: '8px 10px' }}>{log.asunto}</td>
                                                    <td style={{ padding: '8px 10px' }}>
                                                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.85em', background: log.estado === 'ENVIADO' ? '#dcfce7' : log.estado === 'ERROR' ? '#fee2e2' : '#f1f5f9', color: log.estado === 'ENVIADO' ? '#166534' : log.estado === 'ERROR' ? '#991b1b' : '#475569', fontWeight: '500' }}>
                                                            {log.estado}
                                                            {log.estado === 'ERROR' && (
                                                                <span title={log.error_detalle} style={{ marginLeft: '5px', cursor: 'help' }}>⚠️</span>
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <p style={{ fontSize: '0.8em', color: '#64748b', marginTop: '10px' }}>
                        Nota: Si usas Gmail, asegúrate de generar una "Contraseña de Aplicación" en tu cuenta de Google.
                    </p>
                </div>
            </div>

            <div className="config-footer">
                <button className="btn-save-config" onClick={handleSave} disabled={loading}>
                    {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
            </div>

            {showValidationModal && (
                <div className="modal-overlay" onClick={() => setShowValidationModal(false)}>
                    <div className="modal-content validation-modal" onClick={e => e.stopPropagation()}>
                        <h3>Diagnóstico del Sistema</h3>
                        {validating ? (
                            <div className="loading-spinner">Analizando...</div>
                        ) : validationReport ? (
                            <div className="validation-results">
                                <div className={`result-item ${validationReport.firma?.status}`}>
                                    <span className="icon">{validationReport.firma?.status === 'ok' ? '✅' : validationReport.firma?.status === 'warning' ? '⚠️' : '❌'}</span>
                                    <div className="info">
                                        <strong>Firma Electrónica</strong>
                                        <p>{validationReport.firma?.message}</p>
                                    </div>
                                </div>
                                <div className={`result-item ${validationReport.secuenciales?.status}`}>
                                    <span className="icon">{validationReport.secuenciales?.status === 'ok' ? '✅' : '❌'}</span>
                                    <div className="info">
                                        <strong>Secuenciales</strong>
                                        <p>{validationReport.secuenciales?.message}</p>
                                    </div>
                                </div>
                                <div className={`result-item ${validationReport.impuestos?.status}`}>
                                    <span className="icon">{validationReport.impuestos?.status === 'ok' ? '✅' : '❌'}</span>
                                    <div className="info">
                                        <strong>Impuestos</strong>
                                        <p>{validationReport.impuestos?.message}</p>
                                    </div>
                                </div>
                                <div className={`result-item ${validationReport.correo?.status}`}>
                                    <span className="icon">{validationReport.correo?.status === 'ok' ? '✅' : '⚠️'}</span>
                                    <div className="info">
                                        <strong>Servidor de Correos</strong>
                                        <p>{validationReport.correo?.message}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>Error desconocido</p>
                        )}
                        <button className="btn-close-modal" onClick={() => setShowValidationModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminConfiguracion
