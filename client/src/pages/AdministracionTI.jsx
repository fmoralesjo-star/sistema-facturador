import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './AdministracionTI.css'

import { API_URL } from '../config/api'
import { useAuth } from '../contexts/AuthContext'

function AdministracionTI({ socket }) {
  const { getToken } = useAuth()
  
  // Estados para información de empresa
  const [empresa, setEmpresa] = useState(null)
  const [editandoEmpresa, setEditandoEmpresa] = useState(false)
  const [formDataEmpresa, setFormDataEmpresa] = useState({
    ruc: '',
    razon_social: '',
    direccion: ''
  })
  const [logotipoFile, setLogotipoFile] = useState(null)
  const [logotipoPreview, setLogotipoPreview] = useState(null)
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false)
  const [errorConexion, setErrorConexion] = useState(false)
  const [cargandoEmpresa, setCargandoEmpresa] = useState(false)
  const [mostrarInfoEmpresa, setMostrarInfoEmpresa] = useState(false)

  useEffect(() => {
    cargarEmpresa()
  }, [])

  // Cargar información de la empresa
  const cargarEmpresa = async () => {
    setCargandoEmpresa(true)
    setErrorConexion(false)
    try {
      const token = await getToken()
      if (!token) {
        console.warn('No hay token de autenticación disponible')
        setCargandoEmpresa(false)
        return
      }

      const res = await axios.get(`${API_URL}/empresa/activa`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 segundos de timeout
      })
      
      if (res.data) {
        setEmpresa(res.data)
        setFormDataEmpresa({
          ruc: res.data.ruc || '',
          razon_social: res.data.razon_social || '',
          direccion: res.data.direccion || ''
        })
        
        // Cargar preview del logotipo si existe
        if (res.data.id) {
          try {
            const logoRes = await axios.get(`${API_URL}/empresa/${res.data.id}/logotipo`, {
              headers: { Authorization: `Bearer ${token}` },
              responseType: 'blob',
              timeout: 10000
            })
            const logoUrl = URL.createObjectURL(logoRes.data)
            setLogotipoPreview(logoUrl)
          } catch (error) {
            // No hay logotipo, está bien
            setLogotipoPreview(null)
          }
        }
      }
      setErrorConexion(false)
    } catch (error) {
      console.error('Error al cargar empresa:', error)
      setErrorConexion(true)
      
      // Verificar si es un error de conexión
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        console.error('❌ No hay conexión con el servidor. Verifica que el backend esté corriendo.')
      } else if (error.response?.status === 404) {
        // No hay empresa activa, está bien
        setErrorConexion(false)
      }
    } finally {
      setCargandoEmpresa(false)
    }
  }

  // Manejar cambio de logotipo
  const handleLogotipoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogotipoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogotipoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Guardar información de empresa
  const guardarEmpresa = async () => {
    setGuardandoEmpresa(true)
    setErrorConexion(false)
    try {
      const token = await getToken()
      if (!token) {
        alert('Error: No se pudo obtener el token de autenticación. Por favor, inicia sesión.')
        setGuardandoEmpresa(false)
        return
      }

      let empresaExistente = empresa

      if (!empresaExistente) {
        try {
          const resActiva = await axios.get(`${API_URL}/empresa/activa`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (resActiva.data) {
            empresaExistente = resActiva.data
          }
        } catch (error) {
          // Si no hay empresa activa, continuar con creación
        }
      }

      if (empresaExistente) {
        // Filtrar valores undefined o null antes de enviar
        const datosActualizacion = Object.fromEntries(
          Object.entries(formDataEmpresa).filter(([, value]) => value !== undefined && value !== null && value !== '')
        )

        const resActualizada = await axios.patch(`${API_URL}/empresa/${empresaExistente.id}`, datosActualizacion, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (resActualizada.data) {
          setEmpresa(resActualizada.data)
          setFormDataEmpresa({
            ruc: resActualizada.data.ruc || '',
            razon_social: resActualizada.data.razon_social || '',
            direccion: resActualizada.data.direccion || ''
          })
        }

        if (logotipoFile) {
          const formData = new FormData()
          formData.append('logotipo', logotipoFile)
          await axios.post(`${API_URL}/empresa/${empresaExistente.id}/logotipo`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          })
          // Recargar preview del logotipo
          const logoRes = await axios.get(`${API_URL}/empresa/${empresaExistente.id}/logotipo`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          })
          const logoUrl = URL.createObjectURL(logoRes.data)
          setLogotipoPreview(logoUrl)
        }

        alert('✅ Información de la empresa actualizada exitosamente')
      } else {
        const res = await axios.post(`${API_URL}/empresa`, {
          ...formDataEmpresa,
          activa: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (logotipoFile && res.data.id) {
          const formData = new FormData()
          formData.append('logotipo', logotipoFile)
          await axios.post(`${API_URL}/empresa/${res.data.id}/logotipo`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          })
        }

        alert('✅ Información de la empresa guardada exitosamente')
        await cargarEmpresa()
      }

      setEditandoEmpresa(false)
      setLogotipoFile(null)
      setErrorConexion(false)
    } catch (error) {
      console.error('Error al guardar empresa:', error)
      setErrorConexion(true)
      
      let mensajeError = 'Error al guardar empresa'
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        mensajeError = '❌ No hay conexión con el servidor. Verifica que el backend esté corriendo.'
      } else if (error.response?.status === 401) {
        mensajeError = 'Error de autenticación. Por favor, inicia sesión nuevamente.'
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message
      } else {
        mensajeError = error.message || mensajeError
      }
      
      alert(mensajeError)
    } finally {
      setGuardandoEmpresa(false)
    }
  }

  // Cancelar edición
  const cancelarEdicionEmpresa = () => {
    if (empresa) {
      setFormDataEmpresa({
        ruc: empresa.ruc || '',
        razon_social: empresa.razon_social || '',
        direccion: empresa.direccion || ''
      })
    }
    setEditandoEmpresa(false)
    setLogotipoFile(null)
    // Recargar el preview del logotipo original si existe
    if (empresa?.id) {
      getToken().then(token => {
        if (token) {
          axios.get(`${API_URL}/empresa/${empresa.id}/logotipo`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          }).then(logoRes => {
            const logoUrl = URL.createObjectURL(logoRes.data)
            setLogotipoPreview(logoUrl)
          }).catch(() => {
            setLogotipoPreview(null)
          })
        }
      })
    } else {
      setLogotipoPreview(null)
    }
  }

  return (
    <div className="administracion-ti-container">
      <div className="administracion-ti-header">
        <div className="administracion-ti-content">
          <div className="administracion-ti-icon">💻</div>
          <div className="administracion-ti-text">
            <h1>Administración TI</h1>
            <p>Gestión técnica del sistema</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn-configuracion-general"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMostrarInfoEmpresa(true)
              // Scroll suave hacia la sección de empresa
              setTimeout(() => {
                const elemento = document.querySelector('.empresa-info-section')
                if (elemento) {
                  elemento.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }, 100)
            }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            ⚙️ Configuración General de la Empresa
          </button>
        </div>
      </div>

      {/* Sección de Información de la Empresa - Visible cuando se hace clic en el botón */}
      {mostrarInfoEmpresa && (
      <div className="empresa-info-section">
        <div className="empresa-info-header">
          <h2>📋 Información de la Empresa</h2>
          {!editandoEmpresa ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {cargandoEmpresa && <span style={{ color: '#6b7280', fontSize: '14px' }}>Cargando...</span>}
              <button 
                className="btn-editar-empresa"
                onClick={() => setEditandoEmpresa(true)}
                disabled={cargandoEmpresa}
              >
                ✏️ Editar
              </button>
            </div>
          ) : (
            <div className="empresa-actions">
              <button 
                className="btn-cancelar-empresa"
                onClick={cancelarEdicionEmpresa}
                disabled={guardandoEmpresa}
              >
                Cancelar
              </button>
              <button 
                className="btn-guardar-empresa"
                onClick={guardarEmpresa}
                disabled={guardandoEmpresa}
              >
                {guardandoEmpresa ? 'Guardando...' : '💾 Guardar'}
              </button>
            </div>
          )}
        </div>

        {errorConexion && (
          <div className="alert-error" style={{ marginBottom: '20px', padding: '15px', borderRadius: '8px' }}>
            <strong>⚠️ Error de Conexión:</strong> No se pudo conectar con el servidor. 
            <br />
            <small>Verifica que el backend esté corriendo en: <code>{API_URL}</code></small>
            <br />
            <button 
              onClick={cargarEmpresa}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Reintentar
            </button>
          </div>
        )}

        <div className="empresa-info-content">
          <div className="empresa-info-grid">
            <div className="empresa-field">
              <label>RUC</label>
              {editandoEmpresa ? (
                <input
                  type="text"
                  value={formDataEmpresa.ruc}
                  onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, ruc: e.target.value })}
                  placeholder="Ingrese el RUC"
                />
              ) : (
                <div className="empresa-value">{empresa?.ruc || 'No especificado'}</div>
              )}
            </div>

            <div className="empresa-field">
              <label>Razón Social</label>
              {editandoEmpresa ? (
                <input
                  type="text"
                  value={formDataEmpresa.razon_social}
                  onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, razon_social: e.target.value })}
                  placeholder="Ingrese la razón social"
                />
              ) : (
                <div className="empresa-value">{empresa?.razon_social || 'No especificado'}</div>
              )}
            </div>

            <div className="empresa-field">
              <label>Dirección</label>
              {editandoEmpresa ? (
                <input
                  type="text"
                  value={formDataEmpresa.direccion}
                  onChange={(e) => setFormDataEmpresa({ ...formDataEmpresa, direccion: e.target.value })}
                  placeholder="Ingrese la dirección"
                />
              ) : (
                <div className="empresa-value">{empresa?.direccion || 'No especificado'}</div>
              )}
            </div>

            <div className="empresa-field empresa-logo-field">
              <label>Logotipo</label>
              {editandoEmpresa ? (
                <div className="logo-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogotipoChange}
                    id="logotipo-input-ti"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="logotipo-input-ti" className="btn-subir-logo">
                    📷 {logotipoFile ? 'Cambiar Logo' : 'Subir Logo'}
                  </label>
                  {logotipoPreview && (
                    <div className="logo-preview">
                      <img src={logotipoPreview} alt="Preview del logotipo" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="logo-display">
                  {logotipoPreview ? (
                    <img src={logotipoPreview} alt="Logotipo de la empresa" />
                  ) : (
                    <div className="logo-placeholder">No hay logotipo cargado</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default AdministracionTI
