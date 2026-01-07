import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './SRI.css'
import { API_URL } from '../config/api'

function SRI() {
  const navigate = useNavigate()
  const [certificadoInfo, setCertificadoInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadFile, setUploadFile] = useState(null)
  const [password, setPassword] = useState('')
  const [ruc, setRuc] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ambiente, setAmbiente] = useState('pruebas')

  useEffect(() => {
    cargarInfoCertificado()
  }, [])

  const cargarInfoCertificado = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_URL}/sri/certificado/info`)
      setCertificadoInfo(response.data.certificado)
      setMostrarFormulario(false)
    } catch (error) {
      if (error.response?.status === 404) {
        // No hay certificado cargado, mostrar formulario
        setCertificadoInfo(null)
        setMostrarFormulario(true)
      } else {
        setError(error.response?.data?.message || 'Error al cargar información del certificado')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.endsWith('.p12')) {
        setError('El archivo debe ser un certificado .p12')
        return
      }
      setUploadFile(file)
      setError(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!uploadFile) {
      setError('Por favor selecciona un archivo .p12')
      return
    }

    if (!password) {
      setError('Por favor ingresa la contraseña del certificado')
      return
    }

    if (!ruc || ruc.length !== 13) {
      setError('Por favor ingresa un RUC válido (13 dígitos)')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('password', password)
      formData.append('ruc', ruc)

      const response = await axios.post(`${API_URL}/sri/certificado/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess('Certificado cargado exitosamente')
      setPassword('')
      setRuc('')
      setUploadFile(null)

      // Recargar información del certificado
      await cargarInfoCertificado()

      // Resetear el input de archivo
      const fileInput = document.getElementById('certificado-file')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar el certificado')
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const diasRestantes = (fechaVencimiento) => {
    if (!fechaVencimiento) return 0
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diffTime = vencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="sri-container">
      <div className="sri-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => navigate('/')}
            className="btn-home"
            title="Volver a la pantalla principal"
          >
            Inicio
          </button>
          <h1>Configuración SRI - Facturación Electrónica</h1>
        </div>
        <p>Gestiona tu certificado de firma electrónica para facturar</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Éxito:</strong> {success}
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Cargando...</p>
        </div>
      )}

      {/* Información del certificado cargado */}
      {certificadoInfo && !mostrarFormulario && (
        <div className="certificado-info">
          <div className="certificado-header">
            <h2>Certificado de Firma Electrónica</h2>
            <button
              className="btn btn-secondary"
              onClick={() => setMostrarFormulario(true)}
            >
              Cambiar Certificado
            </button>
          </div>

          <div className="certificado-details">
            <div className="detail-row">
              <span className="detail-label">RUC:</span>
              <span className="detail-value">{certificadoInfo.ruc}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Razón Social:</span>
              <span className="detail-value">{certificadoInfo.razonSocial}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Número de Serie:</span>
              <span className="detail-value">{certificadoInfo.numeroSerie}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha de Emisión:</span>
              <span className="detail-value">{formatearFecha(certificadoInfo.fechaEmision)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha de Vencimiento:</span>
              <span className="detail-value">{formatearFecha(certificadoInfo.fechaVencimiento)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className={`detail-value status ${certificadoInfo.vigente ? 'vigente' : 'vencido'}`}>
                {certificadoInfo.vigente ? (
                  <>
                    ✓ Vigente
                    {diasRestantes(certificadoInfo.fechaVencimiento) > 0 && (
                      <span className="dias-restantes">
                        ({diasRestantes(certificadoInfo.fechaVencimiento)} días restantes)
                      </span>
                    )}
                  </>
                ) : (
                  '✗ Vencido'
                )}
              </span>
            </div>
          </div>

          {!certificadoInfo.vigente && (
            <div className="alert alert-warning">
              <strong>Advertencia:</strong> El certificado está vencido. Debes renovarlo para continuar facturando.
            </div>
          )}

          {certificadoInfo.vigente && diasRestantes(certificadoInfo.fechaVencimiento) <= 30 && (
            <div className="alert alert-warning">
              <strong>Advertencia:</strong> El certificado vencerá pronto. Considera renovarlo.
            </div>
          )}
        </div>
      )}

      {/* Formulario para cargar certificado */}
      {(mostrarFormulario || !certificadoInfo) && (
        <div className="certificado-upload">
          <h2>{certificadoInfo ? 'Cambiar Certificado' : 'Cargar Certificado'}</h2>
          <p>Sube tu certificado de firma electrónica (.p12) proporcionado por el SRI</p>

          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label htmlFor="certificado-file">Archivo Certificado (.p12)</label>
              <input
                type="file"
                id="certificado-file"
                accept=".p12"
                onChange={handleFileChange}
                required
              />
              {uploadFile && (
                <span className="file-name">✓ {uploadFile.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ruc">RUC del Emisor</label>
              <input
                type="text"
                id="ruc"
                value={ruc}
                onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="0999999999001"
                required
                maxLength={13}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña del Certificado</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña del certificado"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Cargar Certificado'}
              </button>
              {certificadoInfo && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setMostrarFormulario(false)
                    setError(null)
                    setPassword('')
                    setRuc('')
                    setUploadFile(null)
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Configuración de ambiente */}
      <div className="ambiente-config">
        <h2>Configuración del Ambiente</h2>
        <div className="ambiente-selector">
          <label>
            <input
              type="radio"
              name="ambiente"
              value="pruebas"
              checked={ambiente === 'pruebas'}
              onChange={(e) => setAmbiente(e.target.value)}
            />
            <span>Ambiente de Pruebas</span>
          </label>
          <label>
            <input
              type="radio"
              name="ambiente"
              value="produccion"
              checked={ambiente === 'produccion'}
              onChange={(e) => setAmbiente(e.target.value)}
            />
            <span>Ambiente de Producción</span>
          </label>
        </div>
        <p className="ambiente-info">
          {ambiente === 'pruebas'
            ? 'Las facturas se enviarán al ambiente de pruebas del SRI. Úsalo para validar antes de producción.'
            : 'Las facturas se enviarán al ambiente de producción del SRI. Solo úsalo cuando estés listo para facturar reales.'}
        </p>
      </div>

      {/* Información adicional */}
      <div className="sri-info">
        <h2>Información Importante</h2>
        <ul>
          <li>El certificado debe ser un archivo .p12 válido proporcionado por el SRI</li>
          <li>La contraseña será encriptada y almacenada de forma segura</li>
          <li>El certificado debe estar vigente para poder facturar</li>
          <li>Se recomienda renovar el certificado antes de que expire</li>
          <li>En ambiente de pruebas, puedes probar sin afectar facturas reales</li>
        </ul>
      </div>
    </div>
  )
}

export default SRI


















