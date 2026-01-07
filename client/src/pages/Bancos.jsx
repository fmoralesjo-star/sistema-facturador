import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config/api'
import { redondear4Decimales, redondear2Decimales, formatearNumero, formatearMoneda, parsearNumero } from '../utils/formateo'
import './Bancos.css'

function Bancos() {
  const navigate = useNavigate()
  const [bancos, setBancos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [bancoEditando, setBancoEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    numero_cuenta: '',
    tipo_cuenta: 'Corriente',
    saldo_inicial: 0,
    descripcion: '',
    activo: true
  })

  useEffect(() => {
    cargarBancos()
  }, [])

  const cargarBancos = async () => {
    try {
      const response = await axios.get(`${API_URL}/bancos`)
      setBancos(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error al cargar bancos:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (bancoEditando) {
        await axios.patch(`${API_URL}/bancos/${bancoEditando.id}`, formData)
      } else {
        await axios.post(`${API_URL}/bancos`, formData)
      }
      cargarBancos()
      setMostrarFormulario(false)
      setBancoEditando(null)
      setFormData({
        nombre: '',
        codigo: '',
        numero_cuenta: '',
        tipo_cuenta: 'Corriente',
        saldo_inicial: 0,
        descripcion: '',
        activo: true
      })
    } catch (error) {
      console.error('Error al guardar banco:', error)
      alert('Error al guardar el banco')
    }
  }

  const handleEditar = (banco) => {
    setBancoEditando(banco)
    setFormData({
      nombre: banco.nombre,
      codigo: banco.codigo || '',
      numero_cuenta: banco.numero_cuenta || '',
      tipo_cuenta: banco.tipo_cuenta || 'Corriente',
      saldo_inicial: banco.saldo_inicial || 0,
      descripcion: banco.descripcion || '',
      activo: banco.activo !== undefined ? banco.activo : true
    })
    setMostrarFormulario(true)
  }

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este banco?')) {
      try {
        await axios.delete(`${API_URL}/bancos/${id}`)
        cargarBancos()
      } catch (error) {
        console.error('Error al eliminar banco:', error)
        alert('Error al eliminar el banco')
      }
    }
  }

  if (loading) {
    return <div className="bancos-container">Cargando...</div>
  }

  return (
    <div className="bancos-container">
      <div className="bancos-header">
        <button onClick={() => navigate('/')} className="btn-home">
          Inicio
        </button>
        <h1>🏦 Gestión de Bancos</h1>
        <button onClick={() => {
          setMostrarFormulario(true)
          setBancoEditando(null)
          setFormData({
            nombre: '',
            codigo: '',
            numero_cuenta: '',
            tipo_cuenta: 'Corriente',
            saldo_inicial: 0,
            descripcion: '',
            activo: true
          })
        }} className="btn-agregar">
          + Agregar Banco
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => {
          setMostrarFormulario(false)
          setBancoEditando(null)
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{bancoEditando ? 'Editar Banco' : 'Nuevo Banco'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Banco *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Código</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Número de Cuenta</label>
                <input
                  type="text"
                  value={formData.numero_cuenta}
                  onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tipo de Cuenta</label>
                <select
                  value={formData.tipo_cuenta}
                  onChange={(e) => setFormData({ ...formData, tipo_cuenta: e.target.value })}
                >
                  <option value="Corriente">Corriente</option>
                  <option value="Ahorros">Ahorros</option>
                  <option value="Plazo Fijo">Plazo Fijo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Saldo Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.saldo_inicial}
                  onChange={(e) => setFormData({ ...formData, saldo_inicial: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-guardar">
                  {bancoEditando ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={() => {
                  setMostrarFormulario(false)
                  setBancoEditando(null)
                }} className="btn-cancelar">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bancos-grid">
        {bancos.map((banco) => (
          <div key={banco.id} className="banco-card">
            <div className="banco-header-card">
              <h3>{banco.nombre}</h3>
              <span className={`estado ${banco.activo ? 'activo' : 'inactivo'}`}>
                {banco.activo ? '✓ Activo' : '✗ Inactivo'}
              </span>
            </div>
            <div className="banco-info">
              {banco.codigo && <p><strong>Código:</strong> {banco.codigo}</p>}
              {banco.numero_cuenta && <p><strong>Cuenta:</strong> {banco.numero_cuenta}</p>}
              <p><strong>Tipo:</strong> {banco.tipo_cuenta || 'N/A'}</p>
              <p className="saldo"><strong>Saldo Actual:</strong> {formatearMoneda(banco.saldo_actual || 0)}</p>
              {banco.descripcion && <p><strong>Descripción:</strong> {banco.descripcion}</p>}
            </div>
            <div className="banco-actions">
              <button onClick={() => handleEditar(banco)} className="btn-editar">
                Editar
              </button>
              <button onClick={() => navigate(`/conciliaciones?banco_id=${banco.id}`)} className="btn-conciliar">
                Ver Conciliaciones
              </button>
              <button onClick={() => handleEliminar(banco.id)} className="btn-eliminar">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Bancos



