import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormText,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react'
import api from '../api/api'
import { toast } from 'react-toastify'

const MAX_STOCK = 9999999.99 // DECIMAL(9,2)

const ModalFormInsumo = ({ visible, onClose, insumo, categorias, proveedores, onSuccess }) => {
  const [data, setData] = useState({
    categoria: '',
    proveedor: '',
    nombre: '',
    descripcion: '',
    unidad: '',
    stock_actual: '',
    stock_minimo: '',
  })

  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const modoEditar = !!insumo

  const unidades = ['kg', 'gr', 'l', 'ml']

  const notificar = (tipo, mensaje) => {
    switch (tipo) {
      case 'exito':
        toast.success(mensaje)
        break
      case 'error':
        toast.error(mensaje)
        break
      case 'advertencia':
        toast.warning(mensaje)
        break
      default:
        toast(mensaje)
    }
  }

  useEffect(() => {
    setErrores({})
    if (modoEditar && insumo) {
      const proveedorId =
        insumo.proveedores_asociados && insumo.proveedores_asociados.length > 0
          ? insumo.proveedores_asociados[0].proveedor?.id_proveedores
          : ''

      setData({
        categoria: insumo.categoria_detalle?.id_categorias || '',
        proveedor: proveedorId || '',
        nombre: insumo.nombre || '',
        descripcion: insumo.descripcion || '',
        unidad: insumo.unidad || '',
        stock_actual: insumo.stock_actual ?? '',
        stock_minimo: insumo.stock_minimo ?? '',
      })
    } else {
      setData({
        categoria: '',
        proveedor: '',
        nombre: '',
        descripcion: '',
        unidad: '',
        stock_actual: '',
        stock_minimo: '',
      })
    }
  }, [insumo, visible, modoEditar])

  const normalizarDecimal = (valor) => valor.replace(',', '.')

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'stock_actual' || name === 'stock_minimo') {
      const valorNormalizado = normalizarDecimal(value)
      const regexDecimal92 = /^\d{0,7}(\.\d{0,2})?$/
      if (valorNormalizado !== '' && !regexDecimal92.test(valorNormalizado)) {
        return
      }

      setData((prev) => ({
        ...prev,
        [name]: valorNormalizado,
      }))
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleKeyDownDecimal = (e) => {
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

    if (teclasControl.includes(e.key) || e.ctrlKey || e.metaKey) {
      return
    }

    const esDigito = /^[0-9]$/.test(e.key)
    const esSeparadorDecimal = e.key === '.' || e.key === ','
    const valorActual = String(e.currentTarget.value || '')

    if (esSeparadorDecimal && valorActual.includes('.')) {
      e.preventDefault()
      return
    }

    if (!esDigito && !esSeparadorDecimal) {
      e.preventDefault()
    }
  }

  const handlePasteDecimal = (e, campo) => {
    e.preventDefault()
    const textoPegado = normalizarDecimal(e.clipboardData.getData('text').trim())
    const regexDecimal92 = /^\d{1,7}(\.\d{0,2})?$/

    if (regexDecimal92.test(textoPegado) && Number(textoPegado) <= MAX_STOCK) {
      setData((prev) => ({
        ...prev,
        [campo]: textoPegado,
      }))
      if (errores[campo]) {
        setErrores((prev) => ({ ...prev, [campo]: null }))
      }
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    const nombreLimpio = data.nombre.trim()
    const stockActualNum = Number(data.stock_actual)
    const stockMinimoNum = Number(data.stock_minimo)

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre del insumo es obligatorio.'
    } else if (nombreLimpio.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.'
    } else if (!/[a-zA-ZÀ-ÿ]/.test(nombreLimpio)) {
      nuevosErrores.nombre = 'El nombre debe contener al menos una letra.'
    }

    if (!data.categoria) {
      nuevosErrores.categoria = 'Selecciona una categoría.'
    }

    if (!data.proveedor) {
      nuevosErrores.proveedor = 'Selecciona un proveedor.'
    }

    if (!data.unidad) {
      nuevosErrores.unidad = 'Selecciona una unidad de medida.'
    }

    if (data.stock_actual === '' || isNaN(stockActualNum) || stockActualNum < 0) {
      nuevosErrores.stock_actual = 'Ingresa un stock actual válido (0 o mayor).'
    } else if (stockActualNum > MAX_STOCK) {
      nuevosErrores.stock_actual = `El stock no puede superar ${MAX_STOCK.toLocaleString('es-AR')}.`
    }

    if (data.stock_minimo === '' || isNaN(stockMinimoNum) || stockMinimoNum < 0) {
      nuevosErrores.stock_minimo = 'Ingresa un stock mínimo válido (0 o mayor).'
    } else if (stockMinimoNum > MAX_STOCK) {
      nuevosErrores.stock_minimo = `El stock mínimo no puede superar ${MAX_STOCK.toLocaleString('es-AR')}.`
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      notificar('advertencia', 'Por favor, corrige los campos marcados antes de guardar.')
      return
    }

    setLoading(true)

    const stockActualFinal = Number(data.stock_actual)
    const stockMinimoFinal = Number(data.stock_minimo)

    const payload = {
      categoria: data.categoria,
      proveedor: data.proveedor,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      unidad: data.unidad,
      stock_actual: stockActualFinal.toFixed(2),
      stock_minimo: stockMinimoFinal.toFixed(2),
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        const idInsumo = insumo.id_insumos
        await api.put(`/api/insumos/${idInsumo}/`, payload, { headers })
        notificar('exito', 'Insumo actualizado con éxito.')
      } else {
        await api.post('/api/insumos/', payload, { headers })
        notificar('exito', 'Insumo registrado con éxito.')
      }

      if (stockActualFinal <= stockMinimoFinal && stockMinimoFinal > 0) {
        notificar('advertencia', 'Atención: El stock actual está igual o por debajo del stock mínimo.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al guardar el insumo:', error)
      const mensajeBackend =
        error.response?.data?.nombre?.[0] ||
        error.response?.data?.detail ||
        (modoEditar
          ? 'No se pudo actualizar el insumo. Intenta nuevamente.'
          : 'No se pudo registrar el insumo. Intenta nuevamente.')
      notificar('error', mensajeBackend)
    } finally {
      setLoading(false)
    }
  }

  const mostrarAlertaStockBajo =
    data.stock_actual !== '' &&
    data.stock_minimo !== '' &&
    !isNaN(Number(data.stock_actual)) &&
    !isNaN(Number(data.stock_minimo)) &&
    Number(data.stock_minimo) > 0 &&
    Number(data.stock_actual) <= Number(data.stock_minimo)

  const categoriasActivas = categorias.filter(
    (cat) => cat.estado === undefined || cat.estado === true || cat.id_categorias === Number(data.categoria)
  )

  const proveedoresActivos = proveedores.filter(
    (pro) => pro.estado === undefined || pro.estado === true || pro.id_proveedores === Number(data.proveedor)
  )

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {modoEditar ? 'Modificar Insumo' : 'Agregar Nuevo Insumo'}
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            {/* Nombre del Insumo - VARCHAR(50) */}
            <CCol md={8}>
              <CFormInput
                type="text"
                label="Nombre del Insumo"
                name="nombre"
                maxLength={50}
                value={data.nombre}
                onChange={handleChange}
                invalid={!!errores.nombre}
                feedbackInvalid={errores.nombre}
                placeholder="Ej. Harina 000"
              />
            </CCol>

            {/* Categoría - FK INT */}
            <CCol md={4}>
              <CFormSelect
                label="Categoría"
                name="categoria"
                value={data.categoria}
                onChange={handleChange}
                invalid={!!errores.categoria}
                feedbackInvalid={errores.categoria}
              >
                <option value="">Selecciona...</option>
                {categoriasActivas.map((cat) => (
                  <option key={cat.id_categorias} value={cat.id_categorias}>
                    {cat.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Descripción - VARCHAR(200) */}
            <CCol md={8}>
              <CFormTextarea
                label="Descripción"
                name="descripcion"
                rows={2}
                maxLength={200}
                value={data.descripcion}
                onChange={handleChange}
                placeholder="Detalles específicos del insumo..."
              />
              <CFormText className="d-flex justify-content-end">
                {data.descripcion.length}/200
              </CFormText>
            </CCol>

            {/* Proveedor - FK INT */}
            <CCol md={4}>
              <CFormSelect
                label="Proveedor"
                name="proveedor"
                value={data.proveedor}
                onChange={handleChange}
                invalid={!!errores.proveedor}
                feedbackInvalid={errores.proveedor}
              >
                <option value="">Selecciona...</option>
                {proveedoresActivos.map((pro) => (
                  <option key={pro.id_proveedores} value={pro.id_proveedores}>
                    {pro.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Unidad de Medida - VARCHAR(10) */}
            <CCol md={4}>
              <CFormSelect
                label="Unidad de Medida"
                name="unidad"
                value={data.unidad}
                onChange={handleChange}
                invalid={!!errores.unidad}
                feedbackInvalid={errores.unidad}
              >
                <option value="">Selecciona...</option>
                {unidades.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Stock Actual - DECIMAL(9,2) */}
            <CCol md={4}>
              <CFormInput
                type="text"
                inputMode="decimal"
                label="Stock Actual"
                name="stock_actual"
                value={data.stock_actual}
                onKeyDown={handleKeyDownDecimal}
                onChange={handleChange}
                onPaste={(e) => handlePasteDecimal(e, 'stock_actual')}
                invalid={!!errores.stock_actual}
                feedbackInvalid={errores.stock_actual}
                placeholder="0.00"
                autoComplete="off"
              />
            </CCol>

            {/* Stock Mínimo - DECIMAL(9,2) */}
            <CCol md={4}>
              <CFormInput
                type="text"
                inputMode="decimal"
                label="Stock Mínimo"
                name="stock_minimo"
                value={data.stock_minimo}
                onKeyDown={handleKeyDownDecimal}
                onChange={handleChange}
                onPaste={(e) => handlePasteDecimal(e, 'stock_minimo')}
                invalid={!!errores.stock_minimo}
                feedbackInvalid={errores.stock_minimo}
                placeholder="0.00"
                autoComplete="off"
              />
            </CCol>

            {mostrarAlertaStockBajo && (
              <CCol md={12}>
                <CAlert color="warning" className="mb-0 py-2">
                  El <strong>Stock Actual</strong> es igual o inferior al <strong>Stock Mínimo</strong> establecido.
                </CAlert>
              </CCol>
            )}
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={modoEditar ? 'info' : 'primary'} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Registrar Insumo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormInsumo
