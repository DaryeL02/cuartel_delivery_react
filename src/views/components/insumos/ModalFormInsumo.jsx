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

const MAX_STOCK = 2147483647

const ModalFormInsumo = ({ visible, onClose, insumo, categorias, proveedores, onSuccess, onProveedorCreado }) => {
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
  const [modalProveedorVisible, setModalProveedorVisible] = useState(false)
  const [erroresProveedor, setErroresProveedor] = useState({})
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '', direccion: '', telefono: '', email: '', cuit: '', descripcion: '',
  })
  const modoEditar = !!insumo

  const unidades = ['kg', 'gr', 'l', 'ml', 'Unidades']

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

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'stock_actual' || name === 'stock_minimo') {
      if (value !== '' && !/^\d{0,10}$/.test(value)) {
        return
      }

      setData((prev) => ({
        ...prev,
        [name]: value,
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
    if (!esDigito) {
      e.preventDefault()
    }
  }

  const handlePasteDecimal = (e, campo) => {
    e.preventDefault()
    const textoPegado = e.clipboardData.getData('text').trim()
    const regexEntero = /^\d{1,10}$/

    if (regexEntero.test(textoPegado) && Number(textoPegado) <= MAX_STOCK) {
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
      stock_actual: stockActualFinal,
      stock_minimo: stockMinimoFinal,
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

  const crearProveedor = async (e) => {
    e.preventDefault()
    setErroresProveedor({})
    if (!nuevoProveedor.nombre.trim()) {
      setErroresProveedor({ nombre: 'El nombre del proveedor es obligatorio.' })
      notificar('advertencia', 'El nombre del proveedor es obligatorio.')
      return
    }
    try {
      const { data: proveedor } = await api.post('/api/proveedores/', {
        ...nuevoProveedor,
        nombre: nuevoProveedor.nombre.trim(),
      })
      setData((prev) => ({ ...prev, proveedor: String(proveedor.id_proveedores) }))
      if (onProveedorCreado) onProveedorCreado(proveedor)
      setNuevoProveedor({ nombre: '', direccion: '', telefono: '', email: '', cuit: '', descripcion: '' })
      setModalProveedorVisible(false)
      notificar('exito', 'Proveedor creado y seleccionado.')
    } catch (error) {
      const datosError = error.response?.data
      if (datosError && typeof datosError === 'object') {
        const mensajes = Object.fromEntries(
          Object.entries(datosError).map(([campo, valor]) => [
            campo,
            Array.isArray(valor) ? valor[0] : String(valor),
          ]),
        )
        setErroresProveedor(mensajes)
      }
      const mensaje =
        datosError?.detail ||
        datosError?.nombre?.[0] ||
        Object.values(datosError || {}).flat()[0] ||
        'No se pudo crear el proveedor.'
      notificar('error', mensaje)
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
    <>
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
                label={<span>Nombre del Insumo <span className="text-danger">*</span></span>}
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
                label={<span>Categoría <span className="text-danger">*</span></span>}
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
                label={<span>Proveedor <span className="text-danger">*</span></span>}
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
              <CButton
                type="button"
                color="link"
                className="px-0"
                onClick={() => setModalProveedorVisible(true)}
              >
                + Nuevo proveedor
              </CButton>
            </CCol>

            {/* Unidad de Medida - VARCHAR(10) */}
            <CCol md={4}>
              <CFormSelect
                label={<span>Unidad de Medida <span className="text-danger">*</span></span>}
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

            {/* Stock Actual - INTEGER */}
            <CCol md={4}>
              <CFormInput
                type="text"
                inputMode="numeric"
                label={<span>Stock Actual <span className="text-danger">*</span></span>}
                name="stock_actual"
                value={data.stock_actual}
                onKeyDown={handleKeyDownDecimal}
                onChange={handleChange}
                onPaste={(e) => handlePasteDecimal(e, 'stock_actual')}
                invalid={!!errores.stock_actual}
                feedbackInvalid={errores.stock_actual}
                placeholder="0"
                autoComplete="off"
              />
            </CCol>

            {/* Stock Mínimo - INTEGER */}
            <CCol md={4}>
              <CFormInput
                type="text"
                inputMode="numeric"
                label={<span>Stock Mínimo <span className="text-danger">*</span></span>}
                name="stock_minimo"
                value={data.stock_minimo}
                onKeyDown={handleKeyDownDecimal}
                onChange={handleChange}
                onPaste={(e) => handlePasteDecimal(e, 'stock_minimo')}
                invalid={!!errores.stock_minimo}
                feedbackInvalid={errores.stock_minimo}
                placeholder="0"
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
          <small className="text-body-secondary d-block mt-3">
            <span className="text-danger">*</span> Campos obligatorios
          </small>
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
    <CModal visible={modalProveedorVisible} onClose={() => setModalProveedorVisible(false)} backdrop="static">
      <CModalHeader><CModalTitle>Nuevo proveedor</CModalTitle></CModalHeader>
      <CForm onSubmit={crearProveedor}>
        <CModalBody className="d-grid gap-3">
          <CFormInput
            label={<span>Nombre <span className="text-danger">*</span></span>}
            value={nuevoProveedor.nombre}
            required
            maxLength={100}
            invalid={!!erroresProveedor.nombre}
            feedbackInvalid={erroresProveedor.nombre}
            onChange={(e) => {
              setNuevoProveedor((prev) => ({ ...prev, nombre: e.target.value }))
              setErroresProveedor((prev) => ({ ...prev, nombre: null }))
            }}
          />
          <CFormInput label="Dirección" value={nuevoProveedor.direccion} maxLength={200}
            invalid={!!erroresProveedor.direccion} feedbackInvalid={erroresProveedor.direccion}
            onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, direccion: e.target.value }))} />
          <CFormInput label="Teléfono" value={nuevoProveedor.telefono} maxLength={20}
            invalid={!!erroresProveedor.telefono} feedbackInvalid={erroresProveedor.telefono}
            onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, telefono: e.target.value }))} />
          <CFormInput label="Correo" type="email" value={nuevoProveedor.email} maxLength={30}
            invalid={!!erroresProveedor.email} feedbackInvalid={erroresProveedor.email}
            onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, email: e.target.value }))} />
          <CFormInput label="CUIT" value={nuevoProveedor.cuit} maxLength={30}
            invalid={!!erroresProveedor.cuit} feedbackInvalid={erroresProveedor.cuit}
            onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, cuit: e.target.value }))} />
          <CFormTextarea label="Descripción" value={nuevoProveedor.descripcion} maxLength={200}
            invalid={!!erroresProveedor.descripcion} feedbackInvalid={erroresProveedor.descripcion}
            onChange={(e) => setNuevoProveedor((prev) => ({ ...prev, descripcion: e.target.value }))} />
          <small className="text-body-secondary">
            <span className="text-danger">*</span> Campos obligatorios
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" type="button" onClick={() => setModalProveedorVisible(false)}>Cancelar</CButton>
          <CButton color="primary" type="submit">Crear y seleccionar</CButton>
        </CModalFooter>
      </CForm>
    </CModal>
    </>
  )
}

export default ModalFormInsumo
