import api from './api'

export const cargarResultadosPaginados = async (url, config = {}) => {
  const resultados = []
  let pagina = 1

  while (true) {
    const respuesta = await api.get(url, {
      ...config,
      params: { ...config.params, page: pagina },
    })
    const data = respuesta.data

    if (Array.isArray(data)) {
      return [...resultados, ...data]
    }

    resultados.push(...(data.results || []))
    if (!data.next) {
      return resultados
    }
    pagina += 1
  }
}
