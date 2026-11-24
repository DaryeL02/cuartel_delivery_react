import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSwitch,
  CFormText,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const MAX_STOCK = 2147483647
const MAX_PRECIO = 9999999.99

const getStockBadgeColor = (stockActual, stockMinimo) => {
  const actual = Number(stockActual)
  const minimo = Number(stockMinimo)
  if (actual <= 0) return 'danger'
  if (actual <= minimo) return 'warning'
  return 'success'
}

const emptyBebida = {
  nombre: '',
  descripcion: '',
  estado: true,
  stock_actual: '',
  stock_minimo: '',
  precio_unitario: '',
  unidad: 'unidades',
}

const Bebidas = () => {
  const [bebidas, setBebidas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [bebida, setBebida] = useState(emptyBebida)
  const [errores, setErrores] = useState({})
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const cargar = async () => {
    try {
      const { data } = await api.get('/api/bebidas/')
      setBebidas(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudieron cargar las bebidas.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const abrirModal = (item = null) => {
    setErrores({})
    if (item) {
      setBebida({
        ...item,
        descripcion: item.descripcion || '',
        stock_actual: item.stock_actual ?? '',
        stock_minimo: item.stock_minimo ?? '',
        precio_unitario:
          item.precio_unitario !== undefined && item.precio_unitario !== null
            ? String(item.precio_unitario)
            : '',
        unidad: 'unidades',
      })
    } else {
      setBebida(emptyBebida)
    }
    setVisible(true)
  }

  const cerrarModal = () => {
    if (loading) return
    setVisible(false)
    setErrores({})
  }

  const campo = (name, value) => {
    setBebida((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleChangeEntero = (e) => {
    const { name, value } = e.target
    if (value !== '' && !/^\d{0,10}$/.test(value)) {
      return
    }
    campo(name, value)
  }

  const handleKeyDownEntero = (e) => {
    const teclasControl = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]
    if (teclasControl.includes(e.key) || e.ctrlKey || e.metaKey) return
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handlePasteEntero = (e, name) => {
    e.preventDefault()
    const textoPegado = e.clipboardData.getData('text').trim()
    if (/^\d{1,10}$/.test(textoPegado) && Number(textoPegado) <= MAX_STOCK) {
      campo(name, textoPegado)
    }
  }

  const handleChangePrecio = (e) => {
    const valorNormalizado = e.target.value.replace(',', '.')
    if (valorNormalizado !== '' && !/^\d{0,7}(\.\d{0,2})?$/.test(valorNormalizado)) {
      return
    }
    campo('precio_unitario', valorNormalizado)
  }

  const handleKeyDownPrecio = (e) => {
    const teclasControl = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]
    if (teclasControl.includes(e.key) || e.ctrlKey || e.metaKey) return

    if (e.key === '.' || e.key === ',') {
      if (String(bebida.precio_unitario).includes('.')) {
        e.preventDefault()
      }
      return
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handlePastePrecio = (e) => {
    e.preventDefault()
    const textoPegado = e.clipboardData.getData('text').trim().replace(',', '.')
    if (/^\d{1,7}(\.\d{1,2})?$/.test(textoPegado) && Number(textoPegado) <= MAX_PRECIO) {
      campo('precio_unitario', textoPegado)
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    const nombreLimpio = bebida.nombre.trim()
    const stockActualNum = Number(bebida.stock_actual)
    const stockMinimoNum = Number(bebida.stock_minimo)
    const precioNum = Number(bebida.precio_unitario)

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre de la bebida es obligatorio.'
    } else if (nombreLimpio.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.'
    } else if (!/[a-zA-ZÀ-ÿ]/.test(nombreLimpio)) {
      nuevosErrores.nombre = 'El nombre debe contener al menos una letra.'
    }

    if (bebida.stock_actual === '' || isNaN(stockActualNum) || stockActualNum < 0) {
      nuevosErrores.stock_actual = 'Ingresa un stock actual válido (0 o mayor).'
    } else if (stockActualNum > MAX_STOCK) {
      nuevosErrores.stock_actual = `El stock no puede superar ${MAX_STOCK.toLocaleString('es-AR')}.`
    }

    if (bebida.stock_minimo === '' || isNaN(stockMinimoNum) || stockMinimoNum < 0) {
      nuevosErrores.stock_minimo = 'Ingresa un stock mínimo válido (0 o mayor).'
    } else if (stockMinimoNum > MAX_STOCK) {
      nuevosErrores.stock_minimo = `El stock mínimo no puede superar ${MAX_STOCK.toLocaleString('es-AR')}.`
    }

    if (bebida.precio_unitario === '' || isNaN(precioNum) || precioNum <= 0) {
      nuevosErrores.precio_unitario = 'Ingresa un precio unitario mayor a 0.'
    } else if (precioNum > MAX_PRECIO) {
      nuevosErrores.precio_unitario = `El precio no puede superar ${MAX_PRECIO.toLocaleString('es-AR')}.`
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const guardar = async (event) => {
    event.preventDefault()

    if (!validarFormulario()) {
      toast.warning('Por favor, corrige los campos marcados antes de guardar.')
      return
    }

    setLoading(true)
    try {
      const stockActualFinal = Number(bebida.stock_actual)
      const stockMinimoFinal = Number(bebida.stock_minimo)

      const payload = {
        ...bebida,
        nombre: bebida.nombre.trim(),
        descripcion: (bebida.descripcion || '').trim(),
        unidad: 'unidades',
        precio_unitario: Number(bebida.precio_unitario).toFixed(2),
        stock_actual: stockActualFinal,
        stock_minimo: stockMinimoFinal,
      }

      if (bebida.id_bebidas) {
        await api.put(`/api/bebidas/${bebida.id_bebidas}/`, payload)
        toast.success('Bebida actualizada con éxito.')
      } else {
        await api.post('/api/bebidas/', payload)
        toast.success('Bebida registrada con éxito.')
      }

      if (stockActualFinal <= stockMinimoFinal && stockMinimoFinal > 0) {
        toast.warning('Atención: El stock actual está igual o por debajo del stock mínimo.')
      }

      setVisible(false)
      setBebida(emptyBebida)
      await cargar()
    } catch (error) {
      const datosError = error.response?.data
      if (datosError && typeof datosError === 'object') {
        const mensajes = Object.fromEntries(
          Object.entries(datosError).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]),
        )
        setErrores((prev) => ({ ...prev, ...mensajes }))
      }
      toast.error(
        datosError?.detail ||
          datosError?.nombre?.[0] ||
          'No se pudo guardar la bebida.',
      )
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar ${item.nombre}?`)) return
    try {
      await api.delete(`/api/bebidas/${item.id_bebidas}/`)
      toast.success('Bebida eliminada.')
      await cargar()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar la bebida.')
    }
  }

  const mostrarAlertaStockBajo =
    bebida.stock_actual !== '' &&
    bebida.stock_minimo !== '' &&
    !isNaN(Number(bebida.stock_actual)) &&
    !isNaN(Number(bebida.stock_minimo)) &&
    Number(bebida.stock_minimo) > 0 &&
    Number(bebida.stock_actual) <= Number(bebida.stock_minimo)

  const lista = bebidas.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  )

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center gap-2">
          <strong>Gestión de Bebidas</strong>
          <div className="d-flex gap-2">
            <CFormInput
              placeholder="Buscar bebida..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <CButton color="primary" onClick={() => abrirModal()}>
              Nueva bebida
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Stock</CTableHeaderCell>
                <CTableHeaderCell>Mínimo</CTableHeaderCell>
                <CTableHeaderCell>Unidad</CTableHeaderCell>
                <CTableHeaderCell>Precio</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {lista.map((item) => (
                <CTableRow key={item.id_bebidas}>
                  <CTableDataCell>{item.nombre}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={getStockBadgeColor(item.stock_actual, item.stock_minimo)}
                      shape="rounded-pill"
                    >
                      {item.stock_actual}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{item.stock_minimo}</CTableDataCell>
                  <CTableDataCell>{item.unidad}</CTableDataCell>
                  <CTableDataCell>${Number(item.precio_unitario).toFixed(2)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={item.estado ? 'success' : 'secondary'}>
                      {item.estado ? 'Activa' : 'Inactiva'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-nowrap">
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      className="me-2"
                      onClick={() => abrirModal(item)}
                    >
                      Editar
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="outline"
                      onClick={() => eliminar(item)}
                    >
                      Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {!lista.length && (
            <p className="text-center text-body-secondary mb-0">No hay bebidas registradas.</p>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={visible} onClose={cerrarModal} backdrop="static">
        <CModalHeader>
          <CModalTitle className="fw-semibold">
            {bebida.id_bebidas ? 'Editar bebida' : 'Nueva bebida'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={guardar} noValidate>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={12}>
                <CFormInput
                  type="text"
                  label={
                    <span>
                      Nombre <span className="text-danger">*</span>
                    </span>
                  }
                  name="nombre"
                  maxLength={200}
                  value={bebida.nombre}
                  onChange={(e) => campo('nombre', e.target.value)}
                  invalid={!!errores.nombre}
                  feedbackInvalid={errores.nombre}
                  placeholder="Ej. Coca-Cola 500ml"
                />
              </CCol>

              <CCol md={12}>
                <CFormTextarea
                  label="Descripción"
                  name="descripcion"
                  rows={2}
                  maxLength={200}
                  value={bebida.descripcion || ''}
                  onChange={(e) => campo('descripcion', e.target.value)}
                  invalid={!!errores.descripcion}
                  feedbackInvalid={errores.descripcion}
                  placeholder="Detalles específicos de la bebida..."
                />
                <CFormText className="d-flex justify-content-end">
                  {(bebida.descripcion || '').length}/200
                </CFormText>
              </CCol>

              <CCol md={6}>
                <CFormInput
                  type="text"
                  inputMode="numeric"
                  label={
                    <span>
                      Stock actual <span className="text-danger">*</span>
                    </span>
                  }
                  name="stock_actual"
                  value={bebida.stock_actual}
                  onKeyDown={handleKeyDownEntero}
                  onChange={handleChangeEntero}
                  onPaste={(e) => handlePasteEntero(e, 'stock_actual')}
                  invalid={!!errores.stock_actual}
                  feedbackInvalid={errores.stock_actual}
                  placeholder="0"
                  autoComplete="off"
                />
              </CCol>

              <CCol md={6}>
                <CFormInput
                  type="text"
                  inputMode="numeric"
                  label={
                    <span>
                      Stock mínimo <span className="text-danger">*</span>
                    </span>
                  }
                  name="stock_minimo"
                  value={bebida.stock_minimo}
                  onKeyDown={handleKeyDownEntero}
                  onChange={handleChangeEntero}
                  onPaste={(e) => handlePasteEntero(e, 'stock_minimo')}
                  invalid={!!errores.stock_minimo}
                  feedbackInvalid={errores.stock_minimo}
                  placeholder="0"
                  autoComplete="off"
                />
              </CCol>

              <CCol md={6}>
                <CFormInput
                  type="text"
                  inputMode="decimal"
                  label={
                    <span>
                      Precio unitario <span className="text-danger">*</span>
                    </span>
                  }
                  name="precio_unitario"
                  value={bebida.precio_unitario}
                  onKeyDown={handleKeyDownPrecio}
                  onChange={handleChangePrecio}
                  onPaste={handlePastePrecio}
                  invalid={!!errores.precio_unitario}
                  feedbackInvalid={errores.precio_unitario}
                  placeholder="0.00"
                  autoComplete="off"
                />
              </CCol>

              <CCol md={6}>
                <CFormInput label="Unidad" value="unidades" readOnly />
              </CCol>

              {mostrarAlertaStockBajo && (
                <CCol md={12}>
                  <CAlert color="warning" className="mb-0 py-2">
                    El <strong>Stock actual</strong> es igual o inferior al{' '}
                    <strong>Stock mínimo</strong> establecido.
                  </CAlert>
                </CCol>
              )}

              <CCol md={12}>
                <CFormSwitch
                  label={bebida.estado ? 'Activa' : 'Inactiva'}
                  checked={!!bebida.estado}
                  onChange={(e) => campo('estado', e.target.checked)}
                />
              </CCol>
            </CRow>

            <small className="text-body-secondary d-block mt-3">
              <span className="text-danger">*</span> Campos obligatorios
            </small>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="ghost"
              type="button"
              onClick={cerrarModal}
              disabled={loading}
            >
              Cancelar
            </CButton>
            <CButton color={bebida.id_bebidas ? 'info' : 'primary'} type="submit" disabled={loading}>
              {loading ? 'Guardando...' : bebida.id_bebidas ? 'Guardar Cambios' : 'Guardar'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Bebidas
