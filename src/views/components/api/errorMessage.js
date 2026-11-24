export const extraerMensajeError = (error, fallback = 'Ocurrió un error inesperado.') => {
  const data = error?.response?.data

  if (!data) return fallback
  if (typeof data === 'string') return data
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : data.detail

  const buscarMensaje = (valor) => {
    if (typeof valor === 'string') return valor
    if (Array.isArray(valor)) {
      for (const item of valor) {
        const mensaje = buscarMensaje(item)
        if (mensaje) return mensaje
      }
    }
    if (valor && typeof valor === 'object') {
      for (const item of Object.values(valor)) {
        const mensaje = buscarMensaje(item)
        if (mensaje) return mensaje
      }
    }
    return null
  }

  return buscarMensaje(data) || fallback
}
