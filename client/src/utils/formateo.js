// Funciones de formateo y redondeo compartidas para todos los módulos

// Función helper para redondear a 4 decimales (para cálculos internos y entrada de datos)
export const redondear4Decimales = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return 0
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  return Math.round(num * 10000) / 10000
}

// Función helper para redondear a 2 decimales (para visualización)
export const redondear2Decimales = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return 0
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  return Math.round(num * 100) / 100
}

// Función helper para formatear números a 2 decimales sin signo de dólar
export const formatearNumero = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '0.00'
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  return redondear2Decimales(num).toFixed(2)
}

// Función helper para formatear números a 2 decimales con signo de dólar
export const formatearMoneda = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '$0.00'
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  return `$${redondear2Decimales(num).toFixed(2)}`
}

// Función helper para parsear valores numéricos permitiendo 4 decimales
export const parsearNumero = (texto) => {
  if (!texto || texto.trim() === '') return 0
  const num = parseFloat(texto.trim())
  return isNaN(num) ? 0 : redondear4Decimales(num)
}










