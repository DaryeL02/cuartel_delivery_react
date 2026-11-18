import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormSelect,
  CFormInput,
  CFormText,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFastfood, cilPencil, cilPlus, cilMinus, cilTrash, cilWarning } from '@coreui/icons'
import api from '../api/api'
import { toast } from 'react-toastify'

const MAX_DECIMAL_9_2 = 9999999.99
const MAX_CANTIDAD_ITEM = 999

const ModalFormPedido = ({ visible, onClose, pedido, productos, bebidas = [], cajas, onSuccess }) => {
  const modoEditar = !!pedido

  const [data, setData] = useState({
    empleado: '',
    cliente: '',
    direccion: '',
    estado: 'En proceso',
    detalles: [],
  })

  const [productoSeleccionado, setProductoSeleccionado] = useState({
    tipo: 'producto',
    articulo: '',
    cantidad: '',
  })

  const [errores, setErrores] = useState({})
  const [erroresItem, setErroresItem] = useState({})
  const [loading, setLoading] = useState(false)

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

  const cajasActivas = Array.isArray(cajas)
    ? cajas.filter((c) => c.empleado_detalle && c.estado !== false)
    : []

  const productosActivos = Array.isArray(productos)
    ? productos.filter((p) => p.estado !== false)
    : []
  const bebidasActivas = Array.isArray(bebidas) ? bebidas.filter((b) => b.estado !== false) : []

  useEffect(() => {
    if (!visible) return

    setErrores({})
    setErroresItem({})

    if (modoEditar && pedido) {
      setData({
        empleado: pedido.empleado || '',
        cliente: pedido.cliente || '',
        direccion: pedido.direccion || '',
        estado: pedido.estado || 'En proceso',
        detalles: (pedido.pedido_detalle || []).map((det) => ({
          id_temporal: det.id_detalles_pedidos || Date.now() + Math.random(),
          producto: det.producto,
          bebida: det.bebida,
          cantidad: Number(det.cantidad),
          subtotal: Number(det.subtotal),
        })),
      })
    } else {
      const cajaConEmpleado = cajasActivas[0]
      setData({
        empleado: cajaConEmpleado ? cajaConEmpleado.empleado_detalle.id_empleados : '',
        cliente: '',
        direccion: '',
        estado: 'En proceso',
        detalles: [],
      })
    }

    setProductoSeleccionado({ tipo: 'producto', articulo: '', cantidad: '' })
  }, [pedido, visible, modoEditar, cajas])

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleKeyDownCantidad = (e) => {
    const teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
    if (teclasPermitidas.includes(e.key) || e.ctrlKey || e.metaKey) return
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleProductoChange = (e) => {
    const { name, value } = e.target
    if (name === 'cantidad') {
      const soloNumerosSinCeroInicial = value.replace(/\D/g, '').replace(/^0+/, '')
      if (soloNumerosSinCeroInicial !== '' && Number(soloNumerosSinCeroInicial) > MAX_CANTIDAD_ITEM) {
        return
      }
      setProductoSeleccionado((prev) => ({ ...prev, cantidad: soloNumerosSinCeroInicial }))
      if (erroresItem.cantidad) {
        setErroresItem((prev) => ({ ...prev, cantidad: null }))
      }
      return
    }

    setProductoSeleccionado((prev) => ({ ...prev, [name]: value }))
    if (erroresItem[name]) {
      setErroresItem((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleAgregarProducto = () => {
    const nuevosErroresItem = {}

    if (!productoSeleccionado.articulo) {
      nuevosErroresItem.articulo = 'Selecciona un producto o una bebida.'
    }
    const cantidadNum = Number(productoSeleccionado.cantidad)
    if (!productoSeleccionado.cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
      nuevosErroresItem.cantidad = 'Ingresa una cantidad mayor a 0.'
    } else if (cantidadNum > MAX_CANTIDAD_ITEM) {
      nuevosErroresItem.cantidad = `Máximo ${MAX_CANTIDAD_ITEM} unidades.`
    }

    if (Object.keys(nuevosErroresItem).length > 0) {
      setErroresItem(nuevosErroresItem)
      return
    }

    const esBebida = productoSeleccionado.tipo === 'bebida'
    const articulos = esBebida ? bebidasActivas : productosActivos
    const idArticulo = esBebida ? 'id_bebidas' : 'id_productos'
    const articuloCompleto = articulos.find(
      (articulo) => String(articulo[idArticulo]) === String(productoSeleccionado.articulo)
    )
    if (!articuloCompleto) return

    const precioUnitario = Number(articuloCompleto.precio_unitario)
    const indiceExistente = data.detalles.findIndex(
      (item) =>
        (esBebida ? item.bebida?.id_bebidas : item.producto?.id_productos) ===
        articuloCompleto[idArticulo]
    )

    if (indiceExistente !== -1) {
      const itemActual = data.detalles[indiceExistente]
      const nuevaCantidad = itemActual.cantidad + cantidadNum
      if (nuevaCantidad > MAX_CANTIDAD_ITEM) {
        notificar('advertencia', `La cantidad máxima por artículo es ${MAX_CANTIDAD_ITEM} unidades.`)
        return
      }

      const nuevoSubtotal = Number((nuevaCantidad * precioUnitario).toFixed(2))
      if (nuevoSubtotal > MAX_DECIMAL_9_2) {
        notificar('advertencia', 'El subtotal excede el límite máximo permitido.')
        return
      }

      const totalProyectado =
        data.detalles.reduce((acc, it, idx) => (idx === indiceExistente ? acc : acc + Number(it.subtotal)), 0) +
        nuevoSubtotal

      if (totalProyectado > MAX_DECIMAL_9_2) {
        notificar('advertencia', 'El total del pedido excede el límite máximo permitido.')
        return
      }

      const detallesActualizados = [...data.detalles]
      detallesActualizados[indiceExistente] = {
        ...itemActual,
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal,
      }

      setData((prev) => ({ ...prev, detalles: detallesActualizados }))
    } else {
      const subtotal = Number((cantidadNum * precioUnitario).toFixed(2))
      if (subtotal > MAX_DECIMAL_9_2) {
        notificar('advertencia', 'El subtotal excede el límite máximo permitido.')
        return
      }

      const totalProyectado =
        data.detalles.reduce((acc, item) => acc + Number(item.subtotal), 0) + subtotal

      if (totalProyectado > MAX_DECIMAL_9_2) {
        notificar('advertencia', 'El total del pedido excede el límite máximo permitido.')
        return
      }

      const nuevoDetalle = {
        id_temporal: `${esBebida ? 'bebida' : 'producto'}-${articuloCompleto[idArticulo]}`,
        [esBebida ? 'bebida' : 'producto']: {
          [idArticulo]: articuloCompleto[idArticulo],
          nombre: articuloCompleto.nombre,
          precio_unitario: precioUnitario,
        },
        cantidad: cantidadNum,
        subtotal,
      }

      setData((prev) => ({
        ...prev,
        detalles: [...prev.detalles, nuevoDetalle],
      }))
    }

    setProductoSeleccionado({ tipo: 'producto', articulo: '', cantidad: '' })
    setErroresItem({})
    if (errores.detalles) {
      setErrores((prev) => ({ ...prev, detalles: null }))
    }
  }

  const handleActualizarCantidadTabla = (idTemporal, delta) => {
    setData((prev) => {
      const nuevosDetalles = prev.detalles
        .map((item) => {
          if (item.id_temporal !== idTemporal) return item
          const nuevaCantidad = item.cantidad + delta
          if (nuevaCantidad <= 0) return null
          if (nuevaCantidad > MAX_CANTIDAD_ITEM) {
            notificar('advertencia', `Máximo ${MAX_CANTIDAD_ITEM} unidades por ítem.`)
            return item
          }
          const precioUnitario = Number(
            item.producto?.precio_unitario || item.bebida?.precio_unitario || 0,
          )
          const nuevoSubtotal = Number((nuevaCantidad * precioUnitario).toFixed(2))
          if (nuevoSubtotal > MAX_DECIMAL_9_2) {
            notificar('advertencia', 'El subtotal excede el límite máximo permitido.')
            return item
          }
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevoSubtotal,
          }
        })
        .filter(Boolean)

      const totalCheck = nuevosDetalles.reduce((acc, it) => acc + Number(it.subtotal), 0)
      if (totalCheck > MAX_DECIMAL_9_2) {
        notificar('advertencia', 'El total del pedido excede el límite máximo permitido.')
        return prev
      }

      return { ...prev, detalles: nuevosDetalles }
    })
  }

  const handleEliminarProducto = (idTemporal) => {
    setData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((item) => item.id_temporal !== idTemporal),
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    const clienteLimpio = data.cliente.trim()

    if (!modoEditar && !data.empleado) {
      nuevosErrores.empleado = 'Selecciona un empleado con caja activa.'
    }

    if (!clienteLimpio) {
      nuevosErrores.cliente = 'El nombre del cliente es obligatorio.'
    } else if (clienteLimpio.length < 2) {
      nuevosErrores.cliente = 'El nombre debe tener al menos 2 caracteres.'
    } else if (!/[a-zA-ZÀ-ÿ]/.test(clienteLimpio)) {
      nuevosErrores.cliente = 'Ingresa un nombre válido (debe incluir al menos una letra).'
    }

    if (data.detalles.length === 0) {
      nuevosErrores.detalles = 'Debes agregar al menos un producto al pedido.'
    }

    const totalCalculado = data.detalles.reduce((acc, item) => acc + Number(item.subtotal), 0)
    if (totalCalculado > MAX_DECIMAL_9_2) {
      nuevosErrores.detalles = 'El total del pedido supera el límite permitido por el sistema.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      notificar('advertencia', 'Por favor, revisa los campos marcados antes de guardar.')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Token ${token}` }

    const detallesPayload = data.detalles.map((item) => ({
      ...(item.bebida
        ? { id_bebidas: Number(item.bebida.id_bebidas) }
        : { id_productos: Number(item.producto.id_productos) }),
      cantidad: Number(item.cantidad),
    }))

    try {
      if (modoEditar) {
        const payloadActualizacion = {
          cliente: data.cliente.trim(),
          direccion: data.direccion.trim(),
          estado: data.estado,
          detalles: detallesPayload,
        }
        await api.patch(`/api/pedidos/${pedido.id_pedidos}/`, payloadActualizacion, { headers })
        notificar('exito', 'Pedido actualizado con éxito.')
      } else {
        const payloadNuevo = {
          empleado: Number(data.empleado),
          cliente: data.cliente.trim(),
          direccion: data.direccion.trim(),
          estado: 'En proceso',
          detalles: detallesPayload,
        }
        await api.post('/api/pedidos/', payloadNuevo, { headers })
        notificar('exito', 'Pedido creado correctamente.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(
        modoEditar ? 'Error al actualizar pedido:' : 'Error al crear pedido:',
        error.response?.data || error
      )
      const mensajeError =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        (modoEditar
          ? 'Error al modificar el pedido. Por favor, intenta nuevamente.'
          : 'Error al guardar el pedido. Por favor, intenta nuevamente.')
      notificar('error', mensajeError)
    } finally {
      setLoading(false)
    }
  }

  const totalPedido = data.detalles.reduce((acc, item) => acc + Number(item.subtotal), 0)
  const sinCajasActivas = !modoEditar && cajasActivas.length === 0

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader className={modoEditar ? 'bg-body-secondary' : ''}>
        <CModalTitle className="fw-bold">
          {modoEditar ? (
            <>
              <CIcon icon={cilPencil} className="me-2 text-info" />
              Modificar Pedido #{pedido?.id_pedidos}
            </>
          ) : (
            <>
              <CIcon icon={cilFastfood} className="me-2" />
              Crear Nuevo Pedido (Comanda)
            </>
          )}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          {sinCajasActivas && (
            <CAlert color="warning" className="d-flex align-items-center mb-3">
              <CIcon icon={cilWarning} className="me-2 flex-shrink-0" size="lg" />
              <div>
                No hay ninguna <strong>caja abierta</strong> en este momento. Debes abrir una caja
                antes de poder registrar nuevos pedidos.
              </div>
            </CAlert>
          )}

          {modoEditar && pedido?.pagado && (
            <CAlert color="info" className="py-2 small mb-3">
              Este pedido ya se encuentra marcado como <strong>Pagado</strong>. Verifica cualquier
              modificación en los ítems con caja.
            </CAlert>
          )}

          {/* DATOS DE CABECERA DEL PEDIDO */}
          <div className={modoEditar ? 'p-3 bg-body-secondary rounded mb-3 border' : 'mb-3'}>
            <CRow className="g-3">
              {!modoEditar && (
                <CCol md={4}>
                  <CFormSelect
                    label="Empleado / Caja Activa"
                    name="empleado"
                    value={data.empleado}
                    onChange={handleChange}
                    invalid={!!errores.empleado}
                    feedbackInvalid={errores.empleado}
                    disabled={sinCajasActivas}
                  >
                    <option value="">-- Seleccione empleado --</option>
                    {cajasActivas.map((caja) => (
                      <option key={caja.id_cajas} value={caja.empleado_detalle.id_empleados}>
                        {caja.empleado_detalle.nombre} {caja.empleado_detalle.apellido} (Caja #
                        {caja.id_cajas})
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              )}

              <CCol md={4}>
                <CFormInput
                  type="text"
                  label={modoEditar ? 'Cliente' : 'Nombre del Cliente'}
                  name="cliente"
                  maxLength={50}
                  placeholder="Ej: Juan Pérez"
                  value={data.cliente}
                  onChange={handleChange}
                  invalid={!!errores.cliente}
                  feedbackInvalid={errores.cliente}
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  type="text"
                  label={modoEditar ? 'Ubicación / Dirección' : 'Dirección / Mesa'}
                  name="direccion"
                  maxLength={200}
                  placeholder="Ej: Mesa 2 o Av. San Martín 1234"
                  value={data.direccion}
                  onChange={handleChange}
                />
                <CFormText className="text-end">{data.direccion.length}/200</CFormText>
              </CCol>

              {modoEditar && (
                <CCol md={4}>
                  <CFormSelect
                    label="Estado del Pedido"
                    name="estado"
                    value={data.estado}
                    onChange={handleChange}
                  >
                    <option value="En proceso">En proceso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </CFormSelect>
                </CCol>
              )}
            </CRow>
          </div>

          {!modoEditar && <hr className="my-3" />}
          <h6 className="fw-bold text-body-secondary mb-3">Agregar Productos o Bebidas al Pedido</h6>

          {/* SELECTOR DE PRODUCTOS */}
          <CRow className="g-2 align-items-start mb-3">
            <CCol md={7}>
              <CFormSelect
                className="mb-2"
                label="Tipo de artículo"
                name="tipo"
                value={productoSeleccionado.tipo}
                onChange={(e) => {
                  setProductoSeleccionado({ tipo: e.target.value, articulo: '', cantidad: '' })
                  setErroresItem((prev) => ({ ...prev, articulo: null }))
                }}
              >
                <option value="producto">Producto</option>
                <option value="bebida">Bebida</option>
              </CFormSelect>
              <CFormSelect
                label={productoSeleccionado.tipo === 'bebida' ? 'Seleccionar Bebida' : 'Seleccionar Producto'}
                name="articulo"
                value={productoSeleccionado.articulo}
                onChange={handleProductoChange}
                invalid={!!erroresItem.articulo}
                feedbackInvalid={erroresItem.articulo}
              >
                <option value="">
                  {productoSeleccionado.tipo === 'bebida'
                    ? '-- Seleccione una bebida --'
                    : '-- Seleccione un producto --'}
                </option>
                {(productoSeleccionado.tipo === 'bebida' ? bebidasActivas : productosActivos).map(
                  (item) => {
                    const id = productoSeleccionado.tipo === 'bebida'
                      ? item.id_bebidas
                      : item.id_productos
                    return (
                      <option key={id} value={id}>
                        {item.nombre} (${formatearMoneda(item.precio_unitario)})
                      </option>
                    )
                  },
                )}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="text"
                inputMode="numeric"
                label="Cantidad"
                placeholder="Ej: 1"
                name="cantidad"
                maxLength={3}
                value={productoSeleccionado.cantidad}
                onKeyDown={handleKeyDownCantidad}
                onChange={handleProductoChange}
                invalid={!!erroresItem.cantidad}
                feedbackInvalid={erroresItem.cantidad}
              />
            </CCol>
            <CCol md={2} className="d-flex flex-column">
              <label className="form-label d-none d-md-block invisible">Agregar</label>
              <CButton
                type="button"
                color="primary"
                className="w-100"
                onClick={handleAgregarProducto}
                title="Agregar producto al pedido"
              >
                <CIcon icon={cilPlus} />
              </CButton>
            </CCol>
          </CRow>

          {/* TABLA DE ÍTEMS DEL PEDIDO */}
          {modoEditar && <h6 className="fw-bold mb-2">Ítems del Pedido</h6>}
          {errores.detalles && (
            <CAlert color="danger" className="py-2 small mb-2">
              {errores.detalles}
            </CAlert>
          )}
          <CTable
            small={!modoEditar}
            responsive
            align="middle"
            hover
            bordered
            className={`mt-2 ${errores.detalles ? 'border-danger' : ''}`}
          >
            <CTableHead className="table-theme-header">
              <CTableRow>
                <CTableHeaderCell>Artículo</CTableHeaderCell>
                <CTableHeaderCell className="text-center" style={{ width: '150px' }}>
                  Cantidad
                </CTableHeaderCell>
                <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.detalles.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center text-body-secondary py-3">
                    Aún no hay productos agregados al pedido.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                data.detalles.map((item) => (
                  <CTableRow key={item.id_temporal}>
                    <CTableDataCell>{item.producto?.nombre || item.bebida?.nombre}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <div className="d-inline-flex align-items-center gap-2">
                        <CButton
                          type="button"
                          color="secondary"
                          variant="outline"
                          size="sm"
                          className="px-2 py-0"
                          onClick={() => handleActualizarCantidadTabla(item.id_temporal, -1)}
                          title="Disminuir cantidad"
                        >
                          <CIcon icon={cilMinus} size="sm" />
                        </CButton>
                        <span className="fw-semibold" style={{ minWidth: '24px' }}>
                          {item.cantidad}
                        </span>
                        <CButton
                          type="button"
                          color="secondary"
                          variant="outline"
                          size="sm"
                          className="px-2 py-0"
                          onClick={() => handleActualizarCantidadTabla(item.id_temporal, 1)}
                          title="Aumentar cantidad"
                        >
                          <CIcon icon={cilPlus} size="sm" />
                        </CButton>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      ${formatearMoneda(item.producto?.precio_unitario || item.bebida?.precio_unitario)}
                    </CTableDataCell>
                    <CTableDataCell className="text-end fw-bold">
                      ${formatearMoneda(item.subtotal)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        type="button"
                        color="danger"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminarProducto(item.id_temporal)}
                        title="Quitar producto"
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>

          {/* TOTAL DEL PEDIDO */}
          <div className="d-flex justify-content-end align-items-center mt-3 p-2 bg-body-secondary rounded">
            <span className="me-3 text-body-secondary fw-bold">
              {modoEditar ? 'Total Actualizado del Pedido:' : 'Total del Pedido:'}
            </span>
            <h4 className={`${modoEditar ? 'text-primary' : 'text-success'} mb-0 fw-bold`}>
              ${formatearMoneda(totalPedido)}
            </h4>
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton
            type="submit"
            color={modoEditar ? 'success' : 'primary'}
            className={modoEditar ? 'text-white' : ''}
            disabled={loading || sinCajasActivas}
          >
            {loading
              ? 'Guardando...'
              : modoEditar
              ? 'Guardar Cambios'
              : 'Guardar y Generar Pedido'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormPedido
