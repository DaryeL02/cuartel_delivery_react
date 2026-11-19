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
  CFormCheck,
  CRow,
  CCol,
  CFormSwitch,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const MAX_PRECIO = 9999999.99 // Límite exacto para DECIMAL(9,2)

const ModalFormProducto = ({ visible, onClose, producto, insumos_lista, onSuccess }) => {
  const [data, setData] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    estado: true,
    insumos: [],
  })

  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const modoEditar = !!producto

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
    if (modoEditar && producto) {
      setData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_unitario: producto.precio_unitario !== undefined && producto.precio_unitario !== null ? String(producto.precio_unitario) : '',
        estado: producto.estado ?? true,
        insumos: producto.insumos_asociados
          ? producto.insumos_asociados.map((item) => ({
              id_insumos: item.insumo.id_insumos,
              cantidad: String(item.cantidad ?? 1),
            }))
          : [],
      })
    } else {
      setData({
        nombre: '',
        descripcion: '',
        precio_unitario: '',
        estado: true,
        insumos: [],
      })
    }
  }, [producto, visible, modoEditar])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'precio_unitario') {
      // Normaliza coma a punto si el usuario escribe coma decimal
      const valorNormalizado = value.replace(',', '.')
      // Solo permite dígitos (máximo 7) y un punto opcional con máximo 2 decimales
      const regexDecimal92 = /^\d{0,7}(\.\d{0,2})?$/
      if (valorNormalizado !== '' && !regexDecimal92.test(valorNormalizado)) {
        return
      }
      setData((prev) => ({
        ...prev,
        precio_unitario: valorNormalizado,
      }))
      if (errores.precio_unitario) {
        setErrores((prev) => ({ ...prev, precio_unitario: null }))
      }
      return
    }

    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleKeyDownPrecio = (e) => {
    const teclasPermitidas = [
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

    if (teclasPermitidas.includes(e.key) || e.ctrlKey || e.metaKey) {
      return
    }

    // Permite dígitos del 0 al 9 y un único punto o coma decimal
    if (/^[0-9]$/.test(e.key)) {
      return
    }

    if ((e.key === '.' || e.key === ',') && !String(data.precio_unitario).includes('.')) {
      return
    }

    e.preventDefault()
  }

  const handlePastePrecio = (e) => {
    const textoPegado = e.clipboardData.getData('text').replace(',', '.').trim()
    const regexDecimal92 = /^\d{1,7}(\.\d{1,2})?$/
    if (!regexDecimal92.test(textoPegado)) {
      e.preventDefault()
    }
  }

  const handleInsumoCheck = (idInsumo) => {
    setData((prev) => {
      const yaSeleccionado = prev.insumos.some((item) => item.id_insumos === idInsumo)
      const nuevosInsumos = yaSeleccionado
        ? prev.insumos.filter((item) => item.id_insumos !== idInsumo)
        : [...prev.insumos, { id_insumos: idInsumo, cantidad: '1' }]

      return {
        ...prev,
        insumos: nuevosInsumos,
      }
    })

    if (errores.insumos) {
      setErrores((prev) => ({ ...prev, insumos: null }))
    }
  }

  const cambiarCantidadInsumo = (idInsumo, cantidad) => {
    setData((prev) => ({
      ...prev,
      insumos: prev.insumos.map((item) =>
        item.id_insumos === idInsumo ? { ...item, cantidad } : item
      ),
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    const nombreLimpio = data.nombre.trim()
    const precioNum = Number(data.precio_unitario)

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre del producto es obligatorio.'
    } else if (nombreLimpio.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.'
    } else if (!/[a-zA-ZÀ-ÿ]/.test(nombreLimpio)) {
      nuevosErrores.nombre = 'El nombre debe contener al menos una letra.'
    }

    if (data.precio_unitario === '' || isNaN(precioNum) || precioNum <= 0) {
      nuevosErrores.precio_unitario = 'Ingresa un precio mayor a $0.00.'
    } else if (precioNum > MAX_PRECIO) {
      nuevosErrores.precio_unitario = `El precio no puede superar $${MAX_PRECIO.toLocaleString('es-AR')}.`
    }

    if (data.insumos.length === 0) {
      nuevosErrores.insumos = 'Debes seleccionar al menos un insumo para el producto.'
    } else if (data.insumos.some((item) => !Number.isFinite(Number(item.cantidad)) || Number(item.cantidad) <= 0)) {
      nuevosErrores.insumos = 'Indica una cantidad mayor a cero para cada insumo.'
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

    const payload = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      precio_unitario: Number(data.precio_unitario).toFixed(2),
      estado: data.estado,
      insumos: data.insumos.map((item) => ({
        id_insumos: item.id_insumos,
        cantidad: Number(item.cantidad).toFixed(2),
      })),
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        const idProducto = producto.id_productos
        await api.put(`/api/productos/${idProducto}/`, payload, { headers })
        notificar('exito', 'Producto actualizado con éxito.')
      } else {
        await api.post('/api/productos/', payload, { headers })
        notificar('exito', 'Producto registrado con éxito.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      const mensajeBackend =
        error.response?.data?.nombre?.[0] ||
        error.response?.data?.detail ||
        (modoEditar
          ? 'No se pudo actualizar el producto. Por favor, intenta nuevamente.'
          : 'No se pudo registrar el producto. Por favor, intenta nuevamente.')
      notificar('error', mensajeBackend)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {modoEditar ? 'Modificar Producto' : 'Agregar Nuevo Producto'}
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            {/* Nombre del Producto - VARCHAR(100) */}
            <CCol md={8}>
              <CFormInput
                type="text"
                label={<span>Nombre del Producto <span className="text-danger">*</span></span>}
                name="nombre"
                maxLength={100}
                value={data.nombre}
                onChange={handleChange}
                invalid={!!errores.nombre}
                feedbackInvalid={errores.nombre}
                placeholder="Ej. Hamburguesa Completa"
              />
            </CCol>

            {/* Precio Unitario - DECIMAL(9,2) */}
            <CCol md={4}>
              <CFormInput
                type="text"
                inputMode="decimal"
                label={<span>Precio Unitario ($) <span className="text-danger">*</span></span>}
                name="precio_unitario"
                value={data.precio_unitario}
                onKeyDown={handleKeyDownPrecio}
                onPaste={handlePastePrecio}
                onChange={handleChange}
                invalid={!!errores.precio_unitario}
                feedbackInvalid={errores.precio_unitario}
                placeholder="0.00"
              />
            </CCol>

            {/* Descripción - VARCHAR(200) */}
            <CCol md={12}>
              <CFormTextarea
                label="Descripción"
                name="descripcion"
                rows={2}
                maxLength={200}
                value={data.descripcion}
                onChange={handleChange}
                placeholder="Detalles específicos del producto final..."
              />
              <div className="d-flex justify-content-end">
                <small className="text-body-secondary">{data.descripcion.length}/200</small>
              </div>
            </CCol>

            {/* Selección de Insumos Asociados */}
            <CCol md={12}>
              <label className="form-label fw-medium text-body-secondary">
                Insumos del Producto <span className="text-danger">*</span>
              </label>
              <div
                className={`border rounded p-3 bg-body-secondary ${
                  errores.insumos ? 'border-danger' : ''
                }`}
                style={{ maxHeight: '180px', overflowY: 'auto' }}
              >
                {insumos_lista.length === 0 ? (
                  <p className="text-body-secondary small mb-0">
                    No hay insumos disponibles para asociar.
                  </p>
                ) : (
                  <CRow>
                    {insumos_lista.map((insumo) => (
                      <CCol xs={12} sm={6} key={insumo.id_insumos} className="mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <CFormCheck
                            id={`insumo-${insumo.id_insumos}`}
                            label={insumo.nombre}
                            checked={data.insumos.some((item) => item.id_insumos === insumo.id_insumos)}
                            onChange={() => handleInsumoCheck(insumo.id_insumos)}
                          />
                          {data.insumos.some((item) => item.id_insumos === insumo.id_insumos) && (
                            <div className="d-flex align-items-center gap-2">
                              <CFormInput
                                aria-label={`Cantidad de ${insumo.nombre}`}
                                type="number"
                                min="0.01"
                                step="0.01"
                                size="sm"
                                style={{ maxWidth: '90px' }}
                                value={data.insumos.find((item) => item.id_insumos === insumo.id_insumos)?.cantidad ?? '1'}
                                onChange={(e) => cambiarCantidadInsumo(insumo.id_insumos, e.target.value)}
                              />
                              <small className="text-body-secondary">{insumo.unidad}</small>
                            </div>
                          )}
                        </div>
                      </CCol>
                    ))}
                  </CRow>
                )}
              </div>
              {errores.insumos ? (
                <div className="text-danger small mt-1">{errores.insumos}</div>
              ) : (
                <small className="text-body-secondary mt-1 d-block">
                  Selecciona todos los insumos necesarios para la elaboración de este producto.
                </small>
              )}
            </CCol>
          </CRow>
          <CRow className="align-items-center mt-2">
            <CCol xs="auto">
              <CFormSwitch
                label={data.estado ? 'Producto Activo' : 'Producto Inactivo'}
                id="switchEstadoProducto"
                name="estado"
                checked={data.estado}
                onChange={handleChange}
                size="xl"
              />
            </CCol>
          </CRow>
          <small className="text-body-secondary d-block mt-3">
            <span className="text-danger">*</span> Campos obligatorios
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={modoEditar ? 'info' : 'primary'} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Registrar Producto'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormProducto
