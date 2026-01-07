import React, { useState, useEffect } from 'react'
import './Notificaciones.css'

function Notificaciones({ socket }) {
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    if (!socket) return

    const handleNotificacion = (notificacion) => {
      setNotificaciones(prev => [notificacion, ...prev.slice(0, 9)]) // Máximo 10 notificaciones
      
      // Auto-eliminar después de 5 segundos
      setTimeout(() => {
        setNotificaciones(prev => prev.filter(n => n !== notificacion))
      }, 5000)
    }

    const handleStockBajo = (data) => {
      handleNotificacion({
        ...data,
        tipo: 'warning',
        titulo: 'Stock Bajo',
        mensaje: data.mensaje || `El producto tiene stock bajo (${data.stock} unidades)`,
      })
    }

    socket.on('notificacion', handleNotificacion)
    socket.on('stock-bajo', handleStockBajo)

    return () => {
      socket.off('notificacion', handleNotificacion)
      socket.off('stock-bajo', handleStockBajo)
    }
  }, [socket])

  const eliminarNotificacion = (index) => {
    setNotificaciones(prev => prev.filter((_, i) => i !== index))
  }

  const getIcono = (tipo) => {
    switch (tipo) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  return (
    <div className="notificaciones-container">
      {notificaciones.map((notificacion, index) => (
        <div
          key={index}
          className={`notificacion notificacion-${notificacion.tipo}`}
          onClick={() => eliminarNotificacion(index)}
        >
          <div className="notificacion-icono">
            {getIcono(notificacion.tipo)}
          </div>
          <div className="notificacion-contenido">
            <div className="notificacion-titulo">{notificacion.titulo}</div>
            <div className="notificacion-mensaje">{notificacion.mensaje}</div>
            {notificacion.modulo && (
              <div className="notificacion-modulo">{notificacion.modulo}</div>
            )}
          </div>
          <button
            className="notificacion-cerrar"
            onClick={(e) => {
              e.stopPropagation()
              eliminarNotificacion(index)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default Notificaciones












