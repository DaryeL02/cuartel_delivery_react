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
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilListRich,
  cilPlus,
  cilClock,
  cilCheckCircle,
  cilTrash,
  cilFastfood,
  cilUser,
  cilLocationPin,
  cilPencil,
} from '@coreui/icons'
import api from '../api/api'

const Pedidos = () => {
  // Estados de datos desde API
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [cajas, setCajas] = useState([])

  // Modal para Nuevo Pedido
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false)
  const [nuevoPedido, setNuevoPedido] = useState({
    empleado: '',
    cliente: '',
    direccion: '',
    estado: 'En proceso',
    detalles: [],
  })
  const [productoSeleccionado, setProductoSeleccionado] = useState({
    producto: '',
    cantidad: '',
  })

  // Modal para Ver / Modificar Pedido
  const [modalDetalle, setModalDetalle] = useState(false)
  const [pedidoEditando, setPedidoEditando] = useState(null)
  const [productoEditar, setProductoEditar] = useState({
    producto: '',
    cantidad: '',
  })

  // --- CARGA DE DATOS ---
  const getAuthConfig = () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  }

  const cargarPedidos = async () => {
    try {
      const respuesta = await api.get('/api/pedidos/?date=today', getAuthConfig())
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

  const cargarCajas = async () => {
    try {
      const respuesta = await api.get('/api/cajas/?status=active', getAuthConfig())
      setCajas(respuesta.data)
      const cajaConEmpleado = respuesta.data.find((c) => c.empleado_detalle?.id_empleados)
      if (cajaConEmpleado) {
        setNuevoPedido((prev) => ({
          ...prev,
          empleado: cajaConEmpleado.empleado_detalle.id_empleados,
        }))
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error)
    }
  }

  useEffect(() => {
    cargarPedidos()
    cargarProductos()
    cargarCajas()
  }, [])

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // --- LÓGICA MODAL 1: NUEVO PEDIDO ---
  const handleNuevoPedidoChange = (e) => {
    const { name, value } = e.target
    setNuevoPedido((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProductoNuevoChange = (e) => {
    const { name, value } = e.target
    if (name === 'cantidad') {
      const soloNumeros = value.replace(/\D/g, '')
      setProductoSeleccionado((prev) => ({ ...prev, cantidad: soloNumeros }))
      return
    }
    setProductoSeleccionado((prev) => ({ ...prev, [name]: value }))
  }

  const handleAgregarProductoNuevo = () => {
    if (
      !productoSeleccionado.producto ||
      !productoSeleccionado.cantidad ||
      Number(productoSeleccionado.cantidad) <= 0
    ) {
      alert('Selecciona un producto y una cantidad mayor a 0.')
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
    setProductoSeleccionado({ producto: '', cantidad: '' })
  }

  const handleEliminarProductoNuevo = (idTemporal) => {
    setNuevoPedido((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((item) => item.id_temporal !== idTemporal),
    }))
  }

  const handleGuardarNuevoPedido = async () => {
    if (!nuevoPedido.empleado) {
      alert('Selecciona un empleado/caja responsable.')
      return
    }
    if (!nuevoPedido.cliente.trim()) {
      alert('Ingresa el nombre del cliente.')
      return
    }
    if (nuevoPedido.detalles.length === 0) {
      alert('Agrega al menos un producto al pedido.')
      return
    }

    const payloadPedido = {
      empleado: Number(nuevoPedido.empleado),
      cliente: nuevoPedido.cliente,
      direccion: nuevoPedido.direccion,
      estado: 'En proceso',
      detalles: nuevoPedido.detalles.map((item) => ({
        id_productos: Number(item.producto.id_productos),
        cantidad: Number(item.cantidad),
      })),
    }

    try {
      await api.post('/api/pedidos/', payloadPedido, getAuthConfig())
      alert('Pedido creado correctamente.')
      setModalNuevoPedido(false)
      setNuevoPedido((prev) => ({
        ...prev,
        cliente: '',
        direccion: '',
        detalles: [],
      }))
      cargarPedidos()
    } catch (error) {
      console.error('Error al crear pedido:', error.response?.data || error)
      alert('Error al guardar el pedido. Revisa la consola.')
    }
  }

  // --- LÓGICA MODAL 2: VER Y MODIFICAR PEDIDO ---
  const handleAbrirDetalle = (pedido) => {
    setPedidoEditando({
      ...pedido,
      detallesEditados: (pedido.pedido_detalle || []).map((det) => ({
        id_temp: det.id_detalles_pedidos || Date.now() + Math.random(),
        producto: det.producto,
        cantidad: Number(det.cantidad),
        subtotal: Number(det.subtotal),
      })),
    })
    setProductoEditar({ producto: '', cantidad: '' })
    setModalDetalle(true)
  }

  const handleProductoEditarChange = (e) => {
    const { name, value } = e.target
    if (name === 'cantidad') {
      const soloNumeros = value.replace(/\D/g, '')
      setProductoEditar((prev) => ({ ...prev, cantidad: soloNumeros }))
      return
    }
    setProductoEditar((prev) => ({ ...prev, [name]: value }))
  }

  const handleAgregarProductoEdicion = () => {
    if (
      !productoEditar.producto ||
      !productoEditar.cantidad ||
      Number(productoEditar.cantidad) <= 0
    ) {
      alert('Selecciona un producto y una cantidad mayor a 0.')
      return
    }

    const productoCompleto = productos.find(
      (p) => String(p.id_productos) === String(productoEditar.producto)
    )
    if (!productoCompleto) return

    const cantidadNum = Number(productoEditar.cantidad)
    const precioUnitario = Number(productoCompleto.precio_unitario)

    const nuevoItem = {
      id_temp: Date.now(),
      producto: {
        id_productos: productoCompleto.id_productos,
        nombre: productoCompleto.nombre,
        precio_unitario: precioUnitario,
      },
      cantidad: cantidadNum,
      subtotal: cantidadNum * precioUnitario,
    }

    setPedidoEditando((prev) => ({
      ...prev,
      detallesEditados: [...prev.detallesEditados, nuevoItem],
    }))
    setProductoEditar({ producto: '', cantidad: '' })
  }

  const handleEliminarProductoEdicion = (idTemp) => {
    setPedidoEditando((prev) => ({
      ...prev,
      detallesEditados: prev.detallesEditados.filter((item) => item.id_temp !== idTemp),
    }))
  }

  const handleGuardarCambiosPedido = async () => {
    if (!pedidoEditando) return
    if (pedidoEditando.detallesEditados.length === 0) {
      alert('El pedido debe tener al menos un producto.')
      return
    }

    const payloadActualizacion = {
      cliente: pedidoEditando.cliente,
      direccion: pedidoEditando.direccion,
      estado: pedidoEditando.estado,
      detalles: pedidoEditando.detallesEditados.map((item) => ({
        id_productos: Number(item.producto.id_productos),
        cantidad: Number(item.cantidad),
      })),
    }

    try {
      await api.patch(
        `/api/pedidos/${pedidoEditando.id_pedidos}/`,
        payloadActualizacion,
        getAuthConfig()
      )
      alert('Pedido actualizado con éxito.')
      setModalDetalle(false)
      setPedidoEditando(null)
      cargarPedidos()
    } catch (error) {
      console.error('Error al actualizar pedido:', error.response?.data || error)
      alert('Error al modificar el pedido. Revisa la consola.')
    }
  }

  // Acción rápida en tabla para marcar como Finalizado
  const handleCompletarRapido = async (pedido) => {
    try {
      await api.patch(
        `/api/pedidos/${pedido.id_pedidos}/`,
        {
          estado: 'Finalizado',
        },
        getAuthConfig()
      )
      cargarPedidos()
    } catch (error) {
      console.error('Error al finalizar pedido:', error.response?.data || error)
      alert('No se pudo cambiar el estado del pedido.')
    }
  }

  const totalNuevoPedido = nuevoPedido.detalles.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0
  )

  const totalPedidoEditando = pedidoEditando
    ? pedidoEditando.detallesEditados.reduce((acc, item) => acc + Number(item.subtotal), 0)
    : 0

  const getBadgeColor = (estado) => {
    const est = (estado || '').toLowerCase()
    if (est.includes('finalizado') || est.includes('completado') || est.includes('pagado')) {
      return 'success'
    }
    if (est.includes('proceso')) return 'warning'
    if (est.includes('cancelado')) return 'danger'
    return 'info'
  }

  return (
    <CRow>
      {/* CABECERA Y ACCIÓN RÁPIDA */}
      <CCol xs={12} className="mb-4">
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm border">
          <div>
            <h4 className="mb-1 text-primary fw-bold">
              <CIcon icon={cilListRich} className="me-2" />
              Gestión de Pedidos y Comandas
            </h4>
            <p className="text-muted small mb-0">
              Administra el flujo de pedidos del día y modifica sus ítems o estado.
            </p>
          </div>
          <CButton color="primary" onClick={() => setModalNuevoPedido(true)}>
            <CIcon icon={cilPlus} className="me-1" /> Nuevo Pedido
          </CButton>
        </div>
      </CCol>

      {/* SECCIÓN PRINCIPAL: Tabla de Pedidos */}
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-light fw-bold">Listado de Pedidos del Día</CCardHeader>
          <CCardBody>
            <CTable align="middle" responsive hover bordered>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#ID Pedido</CTableHeaderCell>
                  <CTableHeaderCell>
                    <CIcon icon={cilUser} className="me-1" /> Cliente
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    <CIcon icon={cilLocationPin} className="me-1" /> Dirección / Mesa
                  </CTableHeaderCell>
                  <CTableHeaderCell>Resumen Ítems</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {pedidos.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center text-muted py-4">
                      No hay pedidos registrados hoy.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  pedidos.map((pedido) => {
                    const detalles = pedido.pedido_detalle || []
                    const resumenItems =
                      detalles.length > 0
                        ? `${detalles.length} ítem(s): ${detalles
                            .map((d) => `${d.cantidad}x ${d.producto?.nombre}`)
                            .join(', ')}`
                        : 'Sin detalles'

                    return (
                      <CTableRow key={pedido.id_pedidos}>
                        <CTableDataCell className="fw-bold">#{pedido.id_pedidos}</CTableDataCell>
                        <CTableDataCell>{pedido.cliente}</CTableDataCell>
                        <CTableDataCell className="text-muted">
                          {pedido.direccion || '-'}
                        </CTableDataCell>
                        <CTableDataCell className="small">{resumenItems}</CTableDataCell>
                        <CTableDataCell className="text-end fw-bold">
                          ${formatearMoneda(pedido.precio_total)}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={getBadgeColor(pedido.estado)} shape="rounded-pill">
                            <CIcon icon={cilClock} className="me-1" /> {pedido.estado}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="info"
                            size="sm"
                            variant="outline"
                            className="me-1"
                            onClick={() => handleAbrirDetalle(pedido)}
                            title="Ver y Modificar Pedido"
                          >
                            <CIcon icon={cilPencil} className="me-1" /> Editar
                          </CButton>
                          {pedido.estado !== 'Finalizado' && (
                            <CButton
                              color="success"
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompletarRapido(pedido)}
                            >
                              <CIcon icon={cilCheckCircle} className="me-1" /> Completar
                            </CButton>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL 1: CREAR NUEVO PEDIDO */}
      <CModal visible={modalNuevoPedido} onClose={() => setModalNuevoPedido(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilFastfood} className="me-2" />
            Crear Nuevo Pedido (Comanda)
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3 mb-3">
              <CCol md={4}>
                <CFormSelect
                  label="Empleado / Caja Activa"
                  name="empleado"
                  value={nuevoPedido.empleado}
                  onChange={handleNuevoPedidoChange}
                >
                  <option value="">-- Seleccione empleado --</option>
                  {cajas
                    .filter((c) => c.empleado_detalle)
                    .map((caja) => (
                      <option
                        key={caja.id_cajas}
                        value={caja.empleado_detalle.id_empleados}
                      >
                        {caja.empleado_detalle.nombre} {caja.empleado_detalle.apellido} (Caja #
                        {caja.id_cajas})
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Nombre del Cliente"
                  name="cliente"
                  placeholder="Ej: Juan Pérez"
                  value={nuevoPedido.cliente}
                  onChange={handleNuevoPedidoChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="Dirección / Mesa"
                  name="direccion"
                  placeholder="Ej: Mesa 2 o Av. San Martín 1234"
                  value={nuevoPedido.direccion}
                  onChange={handleNuevoPedidoChange}
                />
              </CCol>
            </CRow>

            <hr className="my-3" />
            <h6 className="fw-bold text-secondary mb-3">Agregar Productos al Pedido</h6>

            <CRow className="g-2 align-items-end mb-3">
              <CCol md={7}>
                <CFormSelect
                  label="Seleccionar Producto"
                  name="producto"
                  value={productoSeleccionado.producto}
                  onChange={handleProductoNuevoChange}
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
                  label="Cantidad"
                  name="cantidad"
                  value={productoSeleccionado.cantidad}
                  onChange={handleProductoNuevoChange}
                />
              </CCol>
              <CCol md={2}>
                <CButton
                  type="button"
                  color="primary"
                  className="w-100"
                  onClick={handleAgregarProductoNuevo}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            <CTable small responsive hover bordered className="mt-3">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Producto</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {nuevoPedido.detalles.map((item) => (
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

            <div className="d-flex justify-content-end align-items-center mt-3 p-2 bg-light rounded">
              <span className="me-3 text-muted fw-bold">Total del Pedido:</span>
              <h4 className="text-success mb-0 fw-bold">${formatearMoneda(totalNuevoPedido)}</h4>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setModalNuevoPedido(false)}>
            Cancelar
          </CButton>
          <CButton type="button" color="primary" onClick={handleGuardarNuevoPedido}>
            Guardar y Generar Pedido
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL 2: VER Y MODIFICAR PEDIDO EXISTENTE */}
      <CModal visible={modalDetalle} onClose={() => setModalDetalle(false)} size="lg">
        <CModalHeader className="bg-light">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilPencil} className="me-2 text-info" />
            Modificar Pedido #{pedidoEditando?.id_pedidos}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {pedidoEditando && (
            <>
              <div className="p-3 bg-light rounded mb-3 border">
                <CRow className="g-3">
                  <CCol md={4}>
                    <CFormInput
                      label="Cliente"
                      value={pedidoEditando.cliente}
                      onChange={(e) =>
                        setPedidoEditando({ ...pedidoEditando, cliente: e.target.value })
                      }
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormInput
                      label="Ubicación / Dirección"
                      value={pedidoEditando.direccion || ''}
                      onChange={(e) =>
                        setPedidoEditando({ ...pedidoEditando, direccion: e.target.value })
                      }
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormSelect
                      label="Estado del Pedido"
                      value={pedidoEditando.estado}
                      onChange={(e) =>
                        setPedidoEditando({ ...pedidoEditando, estado: e.target.value })
                      }
                    >
                      <option value="En proceso">En proceso</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
              </div>

              <h6 className="fw-bold mb-2">Agregar Producto al Pedido</h6>
              <CRow className="g-2 align-items-end mb-3">
                <CCol md={7}>
                  <CFormSelect
                    name="producto"
                    value={productoEditar.producto}
                    onChange={handleProductoEditarChange}
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
                    placeholder="Cantidad"
                    name="cantidad"
                    value={productoEditar.cantidad}
                    onChange={handleProductoEditarChange}
                  />
                </CCol>
                <CCol md={2}>
                  <CButton
                    type="button"
                    color="primary"
                    className="w-100"
                    onClick={handleAgregarProductoEdicion}
                  >
                    <CIcon icon={cilPlus} />
                  </CButton>
                </CCol>
              </CRow>

              <h6 className="fw-bold mb-2">Ítems del Pedido</h6>
              <CTable responsive align="middle" bordered hover>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Producto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cantidad</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Quitar</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pedidoEditando.detallesEditados.map((item) => (
                    <CTableRow key={item.id_temp}>
                      <CTableDataCell>{item.producto?.nombre}</CTableDataCell>
                      <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        ${formatearMoneda(item.producto?.precio_unitario)}
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
                          onClick={() => handleEliminarProductoEdicion(item.id_temp)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-end align-items-center mt-3 p-2 bg-light rounded">
                <span className="me-3 text-muted">Total Actualizado del Pedido:</span>
                <h4 className="text-primary mb-0 fw-bold">
                  ${formatearMoneda(totalPedidoEditando)}
                </h4>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setModalDetalle(false)}>
            Cancelar
          </CButton>
          <CButton type="button" color="success" className="text-white" onClick={handleGuardarCambiosPedido}>
            Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Pedidos
