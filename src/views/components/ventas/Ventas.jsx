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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CInputGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCart,
  cilDollar,
  cilPlus,
  cilTrash,
  cilFindInPage,
} from '@coreui/icons'
import api from '../api/api'
import { toast } from 'react-toastify'


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

  const [error, setError] = useState('')
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
      setCajas(respuesta.data)
    } catch (error) {
      console.error('Error al cargar cajas:', error)
    }
  }

  const cargarPedidos = async () => {
    try {
      const respuesta = await api.get('/api/pedidos/?date=today&pagado=false', getAuthConfig())
      setPedidos(respuesta.data)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
    }
  }

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get('/api/productos-listado/', getAuthConfig())
      setProductos(respuesta.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const cargarMetodos = async () => {
    try {
      const respuesta = await api.get('/api/metodos/', getAuthConfig())
      setMetodos(respuesta.data)
    } catch (error) {
      console.error('Error al cargar metodos:', error)
    }
  }

  const handleCargarPedido = () => {
    if (!idSeleccionado) {
      notificar('advertencia', 'Por favor, selecciona un pedido pendiente o elige crear uno nuevo.')
      setPedidoSeleccionado(null)
      setModoVenta(null)
      return
    }

    if (idSeleccionado === '0') {
      setPedidoSeleccionado(null)
      setModoVenta('nuevo')
      return
    }

    const pedidoEncontrado = pedidos.find(
      (item) => String(item.id_pedidos) === String(idSeleccionado)
    )

    if (pedidoEncontrado) {
      setPedidoSeleccionado(pedidoEncontrado)
      setModoVenta('importado')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'cantidad') {
      const soloNumeros = value.replace(/\D/g, '')
      setProductoSeleccionado((prev) => ({
        ...prev,
        cantidad: soloNumeros,
      }))
      return
    }

    setProductoSeleccionado((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAgregarProducto = () => {
    if (modoVenta !== 'nuevo') {
      notificar('advertencia', 'Primero selecciona "-- Nuevo pedido --" y presiona Seleccionar.')
      return
    }

    if (
      !productoSeleccionado.producto ||
      !productoSeleccionado.cantidad ||
      Number(productoSeleccionado.cantidad) <= 0
    ) {
      notificar('advertencia', 'Por favor, selecciona un producto y una cantidad mayor a 0.')
      return
    }

    const productoCompleto = productos.find(
      (p) => String(p.id_productos) === String(productoSeleccionado.producto)
    )
    if (!productoCompleto) return

    const cantidadNum = Number(productoSeleccionado.cantidad)
    const precioUnitario = Number(productoCompleto.precio_unitario)
    const subtotal = cantidadNum * precioUnitario

    const nuevoDetalle = {
      id_temporal: Date.now(),
      producto: {
        id_productos: productoCompleto.id_productos,
        nombre: productoCompleto.nombre,
        precio_unitario: precioUnitario,
      },
      cantidad: cantidadNum,
      subtotal: subtotal,
    }

    setNuevoPedido((prev) => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle],
    }))
    setProductoSeleccionado({
      producto: '',
      cantidad: '',
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
  }

  const handleProcesarVenta = async () => {
    setError('')

    if (!cajaSeleccionada) {
      notificar('advertencia', 'Por favor, selecciona una caja antes de procesar la venta.')
      return
    }
    if (!idSeleccionado) {
      notificar('advertencia', 'Por favor, selecciona un pedido pendiente o elige crear uno nuevo.')
      return
    }
    if (!modoVenta) {
      notificar('advertencia', 'Presiona el botón "Seleccionar" para confirmar la operación.')
      return
    }
    if (modoVenta === 'importado' && String(pedidoSeleccionado?.id_pedidos) !== String(idSeleccionado)) {
      notificar('advertencia', 'Presiona el botón "Seleccionar" para cargar el pedido elegido.')
      return
    }
    if (modoVenta === 'nuevo' && nuevoPedido.detalles.length === 0) {
      notificar('advertencia', 'Agrega al menos un producto al pedido.')
      return
    }
    if (modoVenta === 'nuevo' && !nuevoPedido.cliente.trim()) {
      notificar('advertencia', 'Ingresa el nombre del cliente para el nuevo pedido.')
      return
    }
    if (!metodoSeleccionado) {
      notificar('advertencia', 'Por favor, selecciona un método de pago.')
      return
    }

    setLoading(true)

    try {
      const config = getAuthConfig()

      const listaOrigen = modoVenta === 'importado'
        ? pedidoSeleccionado.pedido_detalle
        : nuevoPedido.detalles

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
          cliente: nuevoPedido.cliente,
          direccion: nuevoPedido.direccion,
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

      notificar('exito', 'Venta registrada con éxito')

      // 4. Limpiamos el formulario y recargamos los pedidos pendientes de pago
      setPedidoSeleccionado(null)
      setModoVenta(null)
      setIdSeleccionado('')
      setMetodoSeleccionado('')
      setNuevoPedido({ cliente: '', direccion: '', detalles: [] })
      cargarPedidos()
    } catch (error) {
      console.error('Error al procesar la venta:', error.response?.data || error)

      notificar('error', 'No se pudo registrar la venta. Por favor, intenta nuevamente.')
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

  const totalACobrar = modoVenta === 'importado' && pedidoSeleccionado
    ? Number(pedidoSeleccionado.precio_total || 0)
    : modoVenta === 'nuevo'
      ? nuevoPedido.detalles.reduce((acumulador, item) => acumulador + Number(item.subtotal), 0)
      : 0

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Filtramos únicamente los pedidos que aún no fueron pagados
  const pedidosPendientesDePago = pedidos.filter((item) => !item.pagado)

  return (
    <CRow>
      {/* COLUMNA IZQUIERDA: Terminal de Venta / Caja */}
      <CCol xs={12} lg={7}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-primary text-white d-flex align-items-center justify-content-between py-3">
            <strong className="d-flex align-items-center fs-5">
              <CIcon icon={cilCart} className="me-2" />
              Terminal de Venta
            </strong>

            {/* Dropdown de Caja */}
            <CDropdown variant="btn-group">
              <CDropdownToggle color="light" size="sm" className="text-primary fw-bold">
                {cajaSeleccionada
                  ? `Caja # ${cajaSeleccionada.id_cajas} (${
                      cajaSeleccionada.empleado_detalle
                        ? `${cajaSeleccionada.empleado_detalle.nombre} ${cajaSeleccionada.empleado_detalle.apellido}`
                        : `Usuario # ${cajaSeleccionada.usuario}`
                    })`
                  : 'Seleccione una caja...'}
              </CDropdownToggle>
              <CDropdownMenu placement="bottom-end">
                {cajas.map((item) => (
                  <CDropdownItem
                    key={item.id_cajas}
                    component="button"
                    type="button"
                    onClick={() => setCajaSeleccionada(item)}
                  >
                    Caja # {item.id_cajas} (
                    {item.empleado_detalle
                      ? `${item.empleado_detalle.nombre} ${item.empleado_detalle.apellido}`
                      : `Usuario # ${item.usuario}`}
                    )
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>

          <CCardBody>
            <CForm>
              {/* Opción 1: Cargar Pedido pendiente de pago */}
              <div className="p-3 mb-3 bg-body-secondary border rounded">
                <label htmlFor="importarPedido" className="form-label fw-bold text-body-secondary">
                  <CIcon icon={cilFindInPage} className="me-1" /> Importar Pedido Pendiente de Cobro
                </label>
                <CInputGroup>
                  <CFormSelect
                    id="importarPedido"
                    value={idSeleccionado}
                    onChange={(e) => {
                      const val = e.target.value
                      setIdSeleccionado(val)
                      if (!val) {
                        setModoVenta(null)
                        setPedidoSeleccionado(null)
                      }
                    }}
                  >
                    <option value="">-- Seleccionar pedido para facturar --</option>
                    <option value="0">-- Nuevo pedido --</option>
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
                </CInputGroup>
              </div>

              {/* Opción 2: Detalle del Comprobante o Venta Directa (solo visible tras elegir modo) */}
              {modoVenta === 'importado' && pedidoSeleccionado && (
                <div>
                  <h6 className="mt-4 mb-2 fw-bold text-body">
                    Detalle del Comprobante (Pedido #{pedidoSeleccionado.id_pedidos} -{' '}
                    {pedidoSeleccionado.cliente})
                  </h6>
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
                          <CTableDataCell className="text-end">
                            ${formatearMoneda(item.subtotal)}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}

              {modoVenta === 'nuevo' && (
                <div>
                  <CRow className="g-2 mb-3">
                    <CCol md={6}>
                      <CFormSelect
                        name="producto"
                        label="Producto Directo"
                        value={productoSeleccionado.producto}
                        onChange={handleChange}
                      >
                        <option value="">-- Seleccione un producto --</option>
                        {productos.map((item) => (
                          <option key={item.id_productos} value={item.id_productos}>
                            {item.nombre} (${formatearMoneda(item.precio_unitario)})
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="text"
                        name="cantidad"
                        label="Cantidad"
                        value={productoSeleccionado.cantidad}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={3} className="d-flex align-items-end">
                      <CButton color="primary" className="w-100" onClick={handleAgregarProducto}>
                        <CIcon icon={cilPlus} /> Agregar
                      </CButton>
                    </CCol>
                  </CRow>
                  <CTable responsive align="middle" hover bordered>
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
                      {nuevoPedido?.detalles?.map((item) => (
                        <CTableRow key={item.id_temporal}>
                          <CTableDataCell>{item.producto.nombre}</CTableDataCell>
                          <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            ${formatearMoneda(item.producto.precio_unitario)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
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
                      ))}
                    </CTableBody>
                  </CTable>
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
                        value={nuevoPedido.cliente}
                        maxLength={50}
                        onChange={handleClienteChange}
                        required
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormInput
                        type="text"
                        label="Dirección"
                        name="direccion"
                        value={nuevoPedido.direccion}
                        maxLength={200}
                        onChange={handleClienteChange}
                      />
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
                      onChange={(e) => setMetodoSeleccionado(e.target.value)}
                    >
                      <option value="">-- Seleccione un método --</option>
                      {metodos.map((item) => (
                        <option key={item.id_metodos} value={item.id_metodos}>
                          {item.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="text-end">
                    <span className="d-block text-body-secondary small uppercase fw-bold">
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
                  onClick={handleProcesarVenta}
                  disabled={loading}
                >
                  <CIcon icon={cilDollar} className="me-2" />
                  {loading ? 'Procesando Venta...' : 'Procesar Venta'}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Ventas
