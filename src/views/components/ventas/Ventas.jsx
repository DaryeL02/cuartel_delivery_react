import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CForm,
  CFormSelect,
  CFormInput,
  CFormText,
  CFormFeedback,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CInputGroup,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCart,
  cilDollar,
  cilPlus,
  cilMinus,
  cilTrash,
  cilFindInPage,
  cilWarning,
  cilCheckCircle,
} from '@coreui/icons'
import api from '../api/api'
import { toast } from 'react-toastify'

const MAX_DECIMAL_9_2 = 9999999.99

const Ventas = () => {
  const [cajas, setCajas] = useState([])
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [nuevoPedido, setNuevoPedido] = useState({
    cliente: '',
    direccion: '',
    detalles: [],
  })
  const [idSeleccionado, setIdSeleccionado] = useState('')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [modoVenta, setModoVenta] = useState(null) // null | 'nuevo' | 'importado'
  const [productoSeleccionado, setProductoSeleccionado] = useState({
    producto: '',
    cantidad: '',
  })
  const [productos, setProductos] = useState([])
  const [metodos, setMetodos] = useState([])
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('')

  const [errores, setErrores] = useState({})
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
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

  const getAuthConfig = () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  }

  const cargarCajas = async () => {
    try {
      const respuesta = await api.get('/api/cajas/?status=active', getAuthConfig())
      const lista = Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || []
      const cajasActivas = lista.filter((c) => c.estado !== false)
      setCajas(cajasActivas)

      if (cajasActivas.length === 1) {
        setCajaSeleccionada(cajasActivas[0])
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error)
      notificar('error', 'No se pudieron cargar las cajas activas.')
    }
  }

  const cargarPedidos = async () => {
    try {
      const respuesta = await api.get('/api/pedidos/?date=today&pagado=false', getAuthConfig())
      const lista = Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || []
      setPedidos(lista)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
      notificar('error', 'No se pudieron cargar los pedidos pendientes.')
    }
  }

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get('/api/productos-listado/', getAuthConfig())
      const lista = Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || []
      setProductos(lista)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      notificar('error', 'No se pudieron cargar los productos.')
    }
  }

  const cargarMetodos = async () => {
    try {
      const respuesta = await api.get('/api/metodos/', getAuthConfig())
      const lista = Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || []
      setMetodos(lista)
    } catch (error) {
      console.error('Error al cargar metodos:', error)
      notificar('error', 'No se pudieron cargar los métodos de pago.')
    }
  }

  const seleccionarModoOPedido = (valorId) => {
    setErrores((prev) => ({ ...prev, pedido: null, detalles: null, cliente: null }))

    if (!valorId) {
      setPedidoSeleccionado(null)
      setModoVenta(null)
      return
    }

    if (valorId === '0') {
      setPedidoSeleccionado(null)
      setModoVenta('nuevo')
      return
    }

    const pedidoEncontrado = pedidos.find(
      (item) => String(item.id_pedidos) === String(valorId)
    )

    if (pedidoEncontrado) {
      const totalPedido = Number(pedidoEncontrado.precio_total || 0)
      if (totalPedido <= 0 || totalPedido > MAX_DECIMAL_9_2) {
        notificar('advertencia', 'El monto del pedido seleccionado no es válido para facturar.')
        setPedidoSeleccionado(null)
        setModoVenta(null)
        return
      }
      setPedidoSeleccionado(pedidoEncontrado)
      setModoVenta('importado')
    }
  }

  const handleCargarPedido = () => {
    if (!idSeleccionado) {
      setErrores((prev) => ({
        ...prev,
        pedido: 'Selecciona un pedido pendiente o elige crear uno nuevo.',
      }))
      notificar('advertencia', 'Por favor, selecciona un pedido pendiente o elige crear uno nuevo.')
      setPedidoSeleccionado(null)
      setModoVenta(null)
      return
    }
    seleccionarModoOPedido(idSeleccionado)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'cantidad') {
      const soloNumeros = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 4)
      setProductoSeleccionado((prev) => ({
        ...prev,
        cantidad: soloNumeros,
      }))
      if (errores.cantidad) {
        setErrores((prev) => ({ ...prev, cantidad: null }))
      }
      return
    }

    setProductoSeleccionado((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleAgregarProducto = () => {
    if (modoVenta !== 'nuevo') {
      notificar('advertencia', 'Primero selecciona "-- Nuevo pedido --".')
      return
    }

    const nuevosErr = {}
    if (!productoSeleccionado.producto) {
      nuevosErr.producto = 'Selecciona un producto.'
    }
    const cantidadNum = Number(productoSeleccionado.cantidad)
    if (!productoSeleccionado.cantidad || cantidadNum <= 0) {
      nuevosErr.cantidad = 'Ingresa una cantidad mayor a 0.'
    }

    if (Object.keys(nuevosErr).length > 0) {
      setErrores((prev) => ({ ...prev, ...nuevosErr }))
      notificar('advertencia', 'Selecciona un producto y una cantidad válida.')
      return
    }

    const productoCompleto = productos.find(
      (p) => String(p.id_productos) === String(productoSeleccionado.producto)
    )
    if (!productoCompleto) return

    const precioUnitario = Number(productoCompleto.precio_unitario)
    const existente = nuevoPedido.detalles.find(
      (item) => String(item.producto.id_productos) === String(productoCompleto.id_productos)
    )

    const nuevaCantidadTotal = existente ? existente.cantidad + cantidadNum : cantidadNum
    if (nuevaCantidadTotal > 9999) {
      notificar('advertencia', 'La cantidad máxima por producto es 9.999 unidades.')
      return
    }

    const nuevoSubtotalItem = nuevaCantidadTotal * precioUnitario
    const totalSinEsteProducto = nuevoPedido.detalles
      .filter((item) => String(item.producto.id_productos) !== String(productoCompleto.id_productos))
      .reduce((acc, item) => acc + Number(item.subtotal), 0)

    if (nuevoSubtotalItem > MAX_DECIMAL_9_2 || totalSinEsteProducto + nuevoSubtotalItem > MAX_DECIMAL_9_2) {
      notificar(
        'advertencia',
        `El monto supera el límite máximo permitido ($${MAX_DECIMAL_9_2.toLocaleString('es-AR')}).`
      )
      return
    }

    if (existente) {
      setNuevoPedido((prev) => ({
        ...prev,
        detalles: prev.detalles.map((item) =>
          String(item.producto.id_productos) === String(productoCompleto.id_productos)
            ? {
                ...item,
                cantidad: nuevaCantidadTotal,
                subtotal: nuevoSubtotalItem,
              }
            : item
        ),
      }))
    } else {
      const nuevoDetalle = {
        id_temporal: Date.now() + Math.random(),
        producto: {
          id_productos: productoCompleto.id_productos,
          nombre: productoCompleto.nombre,
          precio_unitario: precioUnitario,
        },
        cantidad: cantidadNum,
        subtotal: cantidadNum * precioUnitario,
      }

      setNuevoPedido((prev) => ({
        ...prev,
        detalles: [...prev.detalles, nuevoDetalle],
      }))
    }

    setProductoSeleccionado({
      producto: '',
      cantidad: '',
    })
    setErrores((prev) => ({ ...prev, producto: null, cantidad: null, detalles: null }))
  }

  const handleAjustarCantidad = (idTemporal, delta) => {
    setNuevoPedido((prev) => {
      const actualizados = prev.detalles
        .map((item) => {
          if (item.id_temporal !== idTemporal) return item
          const nuevaCant = item.cantidad + delta
          if (nuevaCant <= 0) return null
          if (nuevaCant > 9999) return item
          const nuevoSub = nuevaCant * Number(item.producto.precio_unitario)
          return {
            ...item,
            cantidad: nuevaCant,
            subtotal: nuevoSub,
          }
        })
        .filter(Boolean)

      const nuevoTotal = actualizados.reduce((acc, it) => acc + Number(it.subtotal), 0)
      if (nuevoTotal > MAX_DECIMAL_9_2) {
        notificar(
          'advertencia',
          `El total no puede superar $${MAX_DECIMAL_9_2.toLocaleString('es-AR')}.`
        )
        return prev
      }

      return { ...prev, detalles: actualizados }
    })
  }

  const handleEliminarProductoNuevo = (idTemporal) => {
    setNuevoPedido((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((item) => item.id_temporal !== idTemporal),
    }))
  }

  const handleClienteChange = (e) => {
    const { name, value } = e.target
    setNuevoPedido((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const totalACobrar =
    modoVenta === 'importado' && pedidoSeleccionado
      ? Number(pedidoSeleccionado.precio_total || 0)
      : modoVenta === 'nuevo'
        ? nuevoPedido.detalles.reduce((acumulador, item) => acumulador + Number(item.subtotal), 0)
        : 0

  const validarVenta = () => {
    const nuevosErr = {}

    if (!cajaSeleccionada) {
      nuevosErr.caja = 'Selecciona una caja activa antes de procesar la venta.'
    }
    if (!idSeleccionado || !modoVenta) {
      nuevosErr.pedido = 'Selecciona un pedido pendiente o elige crear uno nuevo.'
    } else if (
      modoVenta === 'importado' &&
      String(pedidoSeleccionado?.id_pedidos) !== String(idSeleccionado)
    ) {
      nuevosErr.pedido = 'Confirma la selección del pedido antes de continuar.'
    }

    if (modoVenta === 'nuevo') {
      if (nuevoPedido.detalles.length === 0) {
        nuevosErr.detalles = 'Agrega al menos un producto al pedido.'
      }
      const clienteLimpio = nuevoPedido.cliente.trim()
      if (!clienteLimpio) {
        nuevosErr.cliente = 'Ingresa el nombre del cliente.'
      } else if (clienteLimpio.length < 2) {
        nuevosErr.cliente = 'El nombre debe tener al menos 2 caracteres.'
      } else if (!/[a-zA-ZÀ-ÿ]/.test(clienteLimpio)) {
        nuevosErr.cliente = 'El nombre debe contener al menos una letra.'
      }
    }

    if (!metodoSeleccionado) {
      nuevosErr.metodo = 'Selecciona un método de pago.'
    }

    if (totalACobrar <= 0 || totalACobrar > MAX_DECIMAL_9_2) {
      nuevosErr.total = 'El total a cobrar debe ser mayor a $0,00 y no superar el límite permitido.'
    }

    setErrores(nuevosErr)

    if (Object.keys(nuevosErr).length > 0) {
      const primerMensaje = Object.values(nuevosErr)[0]
      notificar('advertencia', primerMensaje)
      return false
    }

    return true
  }

  const handleSolicitarConfirmacion = () => {
    if (validarVenta()) {
      setConfirmModalOpen(true)
    }
  }

  const handleProcesarVenta = async () => {
    setConfirmModalOpen(false)
    setLoading(true)

    try {
      const config = getAuthConfig()

      const listaOrigen =
        modoVenta === 'importado' ? pedidoSeleccionado.pedido_detalle : nuevoPedido.detalles

      const detallesFormateados = listaOrigen.map((item) => ({
        id_productos: Number(item.producto.id_productos),
        cantidad: Number(item.cantidad),
      }))

      const idEmpleado =
        cajaSeleccionada?.empleado_detalle?.id_empleados ??
        cajaSeleccionada?.empleado ??
        cajaSeleccionada?.usuario

      if (!idEmpleado) {
        notificar('error', 'La caja seleccionada no tiene un empleado asignado.')
        return
      }

      // 1. Si es un PEDIDO NUEVO, lo creamos ya marcado como pagado: true
      if (modoVenta === 'nuevo') {
        const payloadPedido = {
          empleado: Number(idEmpleado),
          cliente: nuevoPedido.cliente.trim(),
          direccion: nuevoPedido.direccion.trim(),
          estado: 'En proceso',
          pagado: true,
          detalles: detallesFormateados,
        }

        await api.post('/api/pedidos/', payloadPedido, config)
      }

      // 2. Registramos la venta en /api/ventas/
      const datosVenta = {
        caja: Number(cajaSeleccionada.id_cajas),
        metodo: Number(metodoSeleccionado),
        detalles: detallesFormateados,
      }

      await api.post('/api/ventas/', datosVenta, config)

      // 3. Si es un PEDIDO IMPORTADO, actualizamos pagado: true sin tocar su estado de preparación
      if (modoVenta === 'importado') {
        await api.patch(
          `/api/pedidos/${pedidoSeleccionado.id_pedidos}/`,
          { pagado: true },
          config
        )
      }

      notificar('exito', 'Venta registrada con éxito.')

      // 4. Limpiamos el formulario y recargamos los pedidos pendientes de pago
      setPedidoSeleccionado(null)
      setModoVenta(null)
      setIdSeleccionado('')
      setMetodoSeleccionado('')
      setNuevoPedido({ cliente: '', direccion: '', detalles: [] })
      setErrores({})
      cargarPedidos()
    } catch (error) {
      console.error('Error al procesar la venta:', error.response?.data || error)
      const mensajeBackend =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'No se pudo registrar la venta. Por favor, intenta nuevamente.'
      notificar('error', mensajeBackend)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCajas()
    cargarPedidos()
    cargarProductos()
    cargarMetodos()
  }, [])

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Filtramos pedidos no pagados, no cancelados y con ítems válidos
  const pedidosPendientesDePago = pedidos.filter(
    (item) =>
      !item.pagado &&
      item.estado !== 'Cancelado' &&
      Array.isArray(item.pedido_detalle) &&
      item.pedido_detalle.length > 0
  )

  const productosActivos = productos.filter((p) => p.estado !== false)
  const metodosActivos = metodos.filter((m) => m.estado !== false)
  const metodoActualObj = metodosActivos.find(
    (m) => String(m.id_metodos) === String(metodoSeleccionado)
  )

  return (
    <CRow>
      {/* COLUMNA IZQUIERDA: Terminal de Venta / Caja */}
      <CCol xs={12} lg={8}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-primary text-white d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
            <strong className="d-flex align-items-center fs-5">
              <CIcon icon={cilCart} className="me-2" />
              Terminal de Venta
            </strong>

            {/* Dropdown de Caja */}
            <CDropdown variant="btn-group">
              <CDropdownToggle
                color={errores.caja ? 'danger' : 'light'}
                size="sm"
                className={errores.caja ? 'text-white fw-bold' : 'text-primary fw-bold'}
                disabled={cajas.length === 0}
              >
                {cajaSeleccionada
                  ? `Caja #${cajaSeleccionada.id_cajas} (${
                      cajaSeleccionada.empleado_detalle
                        ? `${cajaSeleccionada.empleado_detalle.nombre} ${cajaSeleccionada.empleado_detalle.apellido}`
                        : `Usuario #${cajaSeleccionada.usuario}`
                    })`
                  : cajas.length === 0
                    ? 'Sin cajas abiertas'
                    : 'Seleccione una caja...'}
              </CDropdownToggle>
              <CDropdownMenu placement="bottom-end">
                {cajas.map((item) => (
                  <CDropdownItem
                    key={item.id_cajas}
                    component="button"
                    type="button"
                    onClick={() => {
                      setCajaSeleccionada(item)
                      setErrores((prev) => ({ ...prev, caja: null }))
                    }}
                  >
                    Caja #{item.id_cajas} (
                    {item.empleado_detalle
                      ? `${item.empleado_detalle.nombre} ${item.empleado_detalle.apellido}`
                      : `Usuario #${item.usuario}`}
                    )
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>

          <CCardBody>
            {cajas.length === 0 && (
              <CAlert color="warning" className="d-flex align-items-center gap-2">
                <CIcon icon={cilWarning} />
                <div>
                  <strong>No hay cajas abiertas:</strong> Debes abrir una caja antes de poder
                  registrar ventas.
                </div>
              </CAlert>
            )}

            <CForm noValidate>
              {/* Opción 1: Cargar Pedido pendiente de pago */}
              <div className="p-3 mb-3 bg-body-secondary border rounded">
                <label htmlFor="importarPedido" className="form-label fw-bold text-body-secondary">
                  <CIcon icon={cilFindInPage} className="me-1" /> Importar Pedido Pendiente de Cobro
                </label>
                <CInputGroup>
                  <CFormSelect
                    id="importarPedido"
                    value={idSeleccionado}
                    invalid={!!errores.pedido}
                    onChange={(e) => {
                      const val = e.target.value
                      setIdSeleccionado(val)
                      seleccionarModoOPedido(val)
                    }}
                  >
                    <option value="">-- Seleccionar pedido para facturar --</option>
                    <option value="0">-- Nuevo pedido (Venta directa) --</option>
                    {pedidosPendientesDePago.map((item) => (
                      <option key={item.id_pedidos} value={item.id_pedidos}>
                        Pedido #{item.id_pedidos} - Cliente: {item.cliente} ($
                        {formatearMoneda(item.precio_total)}) [{item.estado}]
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton
                    type="button"
                    color="secondary"
                    variant="outline"
                    onClick={handleCargarPedido}
                  >
                    Seleccionar
                  </CButton>
                  {errores.pedido && <CFormFeedback invalid>{errores.pedido}</CFormFeedback>}
                </CInputGroup>
              </div>

              {/* Opción 2: Detalle del Comprobante Importado */}
              {modoVenta === 'importado' && pedidoSeleccionado && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                    <h6 className="fw-bold text-body mb-0">
                      Detalle del Comprobante (Pedido #{pedidoSeleccionado.id_pedidos} -{' '}
                      {pedidoSeleccionado.cliente})
                    </h6>
                    <CBadge color="info" shape="rounded-pill">
                      {pedidoSeleccionado.estado}
                    </CBadge>
                  </div>
                  <CTable responsive align="middle" hover bordered>
                    <CTableHead className="table-theme-header">
                      <CTableRow>
                        <CTableHeaderCell>Producto</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {pedidoSeleccionado?.pedido_detalle?.map((item) => (
                        <CTableRow key={item.id_detalles_pedidos}>
                          <CTableDataCell>{item.producto.nombre}</CTableDataCell>
                          <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            ${formatearMoneda(item.producto.precio_unitario)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end fw-semibold">
                            ${formatearMoneda(item.subtotal)}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}

              {/* Opción 3: Venta Directa (Nuevo Pedido) */}
              {modoVenta === 'nuevo' && (
                <div>
                  <CRow className="g-2 mb-3 align-items-start">
                    <CCol md={6}>
                      <CFormSelect
                        name="producto"
                        label="Producto Directo"
                        value={productoSeleccionado.producto}
                        onChange={handleChange}
                        invalid={!!errores.producto}
                        feedbackInvalid={errores.producto}
                      >
                        <option value="">-- Seleccione un producto --</option>
                        {productosActivos.map((item) => (
                          <option key={item.id_productos} value={item.id_productos}>
                            {item.nombre} (${formatearMoneda(item.precio_unitario)})
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="text"
                        inputMode="numeric"
                        name="cantidad"
                        label="Cantidad"
                        placeholder="Ej: 1"
                        maxLength={4}
                        value={productoSeleccionado.cantidad}
                        onChange={handleChange}
                        invalid={!!errores.cantidad}
                        feedbackInvalid={errores.cantidad}
                      />
                    </CCol>
                    <CCol md={3} style={{ marginTop: '32px' }}>
                      <CButton
                        type="button"
                        color="primary"
                        className="w-100"
                        onClick={handleAgregarProducto}
                      >
                        <CIcon icon={cilPlus} className="me-1" /> Agregar
                      </CButton>
                    </CCol>
                  </CRow>

                  <CTable
                    responsive
                    align="middle"
                    hover
                    bordered
                    className={errores.detalles ? 'border-danger' : ''}
                  >
                    <CTableHead className="table-theme-header">
                      <CTableRow>
                        <CTableHeaderCell>Producto</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {nuevoPedido.detalles.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={5} className="text-center text-body-secondary py-3">
                            Aún no hay productos agregados a la venta.
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        nuevoPedido.detalles.map((item) => (
                          <CTableRow key={item.id_temporal}>
                            <CTableDataCell>{item.producto.nombre}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              <div className="d-inline-flex align-items-center gap-1">
                                <CButton
                                  type="button"
                                  color="secondary"
                                  variant="outline"
                                  size="sm"
                                  className="px-1 py-0"
                                  onClick={() => handleAjustarCantidad(item.id_temporal, -1)}
                                  title="Restar 1"
                                >
                                  <CIcon icon={cilMinus} size="sm" />
                                </CButton>
                                <span className="px-2 fw-semibold">{item.cantidad}</span>
                                <CButton
                                  type="button"
                                  color="secondary"
                                  variant="outline"
                                  size="sm"
                                  className="px-1 py-0"
                                  onClick={() => handleAjustarCantidad(item.id_temporal, 1)}
                                  title="Sumar 1"
                                >
                                  <CIcon icon={cilPlus} size="sm" />
                                </CButton>
                              </div>
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              ${formatearMoneda(item.producto.precio_unitario)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end fw-semibold">
                              ${formatearMoneda(item.subtotal)}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CButton
                                type="button"
                                color="danger"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarProductoNuevo(item.id_temporal)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                  {errores.detalles && (
                    <div className="text-danger small mb-2">{errores.detalles}</div>
                  )}
                </div>
              )}

              {/* Selección de Método de Pago y Total */}
              <div className="p-3 border rounded bg-body-secondary mt-4">
                {modoVenta === 'nuevo' && (
                  <CRow className="g-2 mb-3">
                    <CCol md={6}>
                      <CFormInput
                        type="text"
                        label="Nombre del cliente"
                        name="cliente"
                        placeholder="Ej: Juan Pérez"
                        value={nuevoPedido.cliente}
                        maxLength={50}
                        onChange={handleClienteChange}
                        invalid={!!errores.cliente}
                        feedbackInvalid={errores.cliente}
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormInput
                        type="text"
                        label="Dirección / Mesa (opcional)"
                        name="direccion"
                        placeholder="Ej: Mesa 4 o Av. San Martín 123"
                        value={nuevoPedido.direccion}
                        maxLength={200}
                        onChange={handleClienteChange}
                      />
                      <CFormText className="text-end d-block">
                        {nuevoPedido.direccion.length}/200
                      </CFormText>
                    </CCol>
                  </CRow>
                )}

                <CRow className="align-items-center">
                  <CCol md={6}>
                    <CFormSelect
                      id="selectMetodoPago"
                      label="Método de Pago"
                      className="fw-bold"
                      value={metodoSeleccionado}
                      invalid={!!errores.metodo}
                      feedbackInvalid={errores.metodo}
                      onChange={(e) => {
                        setMetodoSeleccionado(e.target.value)
                        if (errores.metodo) {
                          setErrores((prev) => ({ ...prev, metodo: null }))
                        }
                      }}
                    >
                      <option value="">-- Seleccione un método --</option>
                      {metodosActivos.map((item) => (
                        <option key={item.id_metodos} value={item.id_metodos}>
                          {item.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="text-end mt-3 mt-md-0">
                    <span className="d-block text-body-secondary small text-uppercase fw-bold">
                      Total a Cobrar
                    </span>
                    <h2 className="text-success fw-bolder mb-0">
                      ${formatearMoneda(totalACobrar)}
                    </h2>
                  </CCol>
                </CRow>
              </div>

              {/* Botón Principal de Confirmación */}
              <div className="d-grid gap-2 mt-4">
                <CButton
                  type="button"
                  color="success"
                  size="lg"
                  className="text-white py-3 fw-bold"
                  onClick={handleSolicitarConfirmacion}
                  disabled={loading || cajas.length === 0}
                >
                  <CIcon icon={cilDollar} className="me-2" />
                  {loading ? 'Procesando Venta...' : 'Procesar Venta'}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL DE CONFIRMACIÓN DE COBRO */}
      <CModal
        visible={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle className="fw-bold">Confirmar Cobro de Venta</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-2">¿Confirmas el registro de esta venta con los siguientes datos?</p>
          <div className="p-3 bg-body-secondary rounded border">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-body-secondary">Caja:</span>
              <strong>Caja #{cajaSeleccionada?.id_cajas}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-body-secondary">Operación:</span>
              <strong>
                {modoVenta === 'importado'
                  ? `Pedido #${pedidoSeleccionado?.id_pedidos} (${pedidoSeleccionado?.cliente})`
                  : `Venta Directa (${nuevoPedido.cliente.trim()})`}
              </strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-body-secondary">Método de Pago:</span>
              <strong>{metodoActualObj?.nombre || '-'}</strong>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">Total a Cobrar:</span>
              <span className="fs-4 fw-bolder text-success">${formatearMoneda(totalACobrar)}</span>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => setConfirmModalOpen(false)}
            disabled={loading}
          >
            Cancelar
          </CButton>
          <CButton
            color="success"
            className="text-white"
            onClick={handleProcesarVenta}
            disabled={loading}
          >
            <CIcon icon={cilCheckCircle} className="me-1" />
            {loading ? 'Registrando...' : 'Confirmar y Cobrar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Ventas
