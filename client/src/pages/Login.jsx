import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [nombreCompleto, setNombreCompleto] = useState('')
  // Campos extra RRHH
  const [identificacion, setIdentificacion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [fotoAnverso, setFotoAnverso] = useState(null)
  const [fotoReverso, setFotoReverso] = useState(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!nombreCompleto || !identificacion) {
          setError('Nombre e Identificación son requeridos')
          setLoading(false)
          return
        }

        if (!fotoAnverso || !fotoReverso) {
          setError('Debe subir las fotos de su cédula (ambos lados)')
          setLoading(false)
          return
        }

        // Convertir fotos a Base64
        const fotoAnversoB64 = await convertToBase64(fotoAnverso);
        const fotoReversoB64 = await convertToBase64(fotoReverso);

        // Preparar datos extra
        const extraData = {
          identificacion,
          telefono,
          direccion,
          fecha_nacimiento: fechaNacimiento,
          sueldo: 460,
          foto_cedula_anverso: fotoAnversoB64,
          foto_cedula_reverso: fotoReversoB64
        }

        await signup(email, password, nombreCompleto, extraData)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (error) {
      setError(error.message || 'Error al autenticar')
      console.error('Error de autenticación:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 Sistema Facturador</h1>
          <p>{isSignUp ? 'Registro de Personal' : 'Iniciar sesión'}</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  required
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Identificación *</label>
                  <input
                    type="text"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    required
                    placeholder="Cédula/RUC"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="099..."
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. Principal..."
                />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>📸 Foto Cédula (Anverso)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoAnverso(e.target.files[0])}
                  required
                />
              </div>

              <div className="form-group" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>📸 Foto Cédula (Reverso)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoReverso(e.target.files[0])}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@ejemplo.com o superuser"
            />
          </div>

          <div className="form-group">
            <label>Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="btn-toggle"
          >
            {isSignUp
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <div className="login-info">
          <p>
            <small>
              {isSignUp
                ? 'Al registrarte, aceptas nuestros términos y condiciones'
                : 'Ingrese sus credenciales para iniciar sesión'}
            </small>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login


