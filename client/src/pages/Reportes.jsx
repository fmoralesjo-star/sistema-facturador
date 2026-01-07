/**
 * NOTA: Los reportes financieros ahora están integrados en el módulo de Contabilidad.
 * Este archivo redirige a /contabilidad para mantener compatibilidad.
 */
import React from 'react'
import { Navigate } from 'react-router-dom'

function Reportes() {
  // Redirigir al módulo de Contabilidad donde están los reportes
  return <Navigate to="/contabilidad" replace />
}

export default Reportes
