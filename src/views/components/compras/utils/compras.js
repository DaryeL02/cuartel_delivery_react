import api from '../../api/api'

export const getErrorMessage = (error) => {
  const data = error.response?.data
  if (!data) return error.message || 'No se pudo completar la operación.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail

  return Object.entries(data)
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ')
        : typeof messages === 'object'
          ? JSON.stringify(messages)
          : String(messages)
      return `${field}: ${message}`
    })
    .join(' ')
}

export const loadAll = async (endpoint) => {
  const items = []
  let url = endpoint

  while (url) {
    const response = await api.get(url)
    const data = response.data

    if (Array.isArray(data)) {
      items.push(...data)
      break
    }

    if (!Array.isArray(data?.results)) {
      throw new Error(`La respuesta de ${endpoint} tiene un formato inesperado.`)
    }

    items.push(...data.results)
    url = data.next
  }

  return items
}

export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })
