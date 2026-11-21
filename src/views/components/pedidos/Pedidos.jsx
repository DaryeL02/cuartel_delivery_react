import React, { useState, useEffect, useCallback } from 'react'
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
  CBadge,
  CFormInput,
  CFormSelect,
  CPlaceholder,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilListRich,
  cilPlus,
  cilClock,
  cilCheckCircle,
  cilUser,
  cilLocationPin,
  cilPencil,
} from '@coreui/icons'
import api from '../api/api'
import { cargarResultadosPaginados } from '../api/paginacion'
import ModalFormPedido from './ModalFormPedido'
import { toast } from 'react-toastify'
import {
  isOperationalUser,
  isPedidoCreationRestricted,
  readCurrentUser,
} from '../../../utils/roles'

const Pedidos = () => {
  const usuarioActual = readCurrentUser()
  const esOperativo = isOperationalUser(usuarioActual)
  const puedeCrearPedido = !isPedidoCreationRestricted(usuarioActual)
  // Estados de datos desde API
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [bebidas, setBebidas] = useState([])
  const [cajas, setCajas] = useState([])
  const [empleadoActual, setEmpleadoActual] = useState(null)
  const [empleadoActualCargado, setEmpleadoActualCargado] = useState(!esOperativo)
  const [loading, setLoading] = useState(true)
  const [historialVisible, setHistorialVisible] = useState(false)
  const [historialPedidos, setHistorialPedidos] = useState([])
  const [pedidoDetalleHistorial, setPedidoDetalleHistorial] = useState(null)
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [fechaDesdeHistorial, setFechaDesdeHistorial] = useState('')
  const [fechaHastaHistorial, setFechaHastaHistorial] = useState('')
  const [paginaHistorial, setPaginaHistorial] = useState(1)
  const [totalPaginasHistorial, setTotalPaginasHistorial] = useState(1)

  // Filtros en tabla
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  // Estados para control del Modal de formulario
  const [modalOpen, setModalOpen] = useState(false)
  const [pedidoAEditar, setPedidoAEditar] = useState(null)

  // Estados para confirmación de Finalizar Pedido
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pedidoACompletar, setPedidoACompletar] = useState(null)
  const [completando, setCompletando] = useState(false)
  const [pedidoACancelar, setPedidoACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  const notificar = useCallback((tipo, mensaje) => {
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
  }, [])

  // --- CARGA DE DATOS ---
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  }, [])

  const cargarPedidos = useCallback(async () => {
    setLoading(true)
    try {
      const lista = await cargarResultadosPaginados('/api/pedidos/', {
        ...getAuthConfig(),
        params: { date: 'today' },
      })
      setPedidos(lista)
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
      notificar('error', 'No se pudieron cargar los pedidos del día.')
    } finally {
      setLoading(false)
    }
  }, [getAuthConfig, notificar])

  const cargarProductos = useCallback(async () => {
    try {
      const respuesta = await api.get('/api/productos-listado/', getAuthConfig())
      setProductos(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }, [getAuthConfig])

  const cargarBebidas = useCallback(async () => {
    try {
      const respuesta = await api.get('/api/bebidas/', getAuthConfig())
      setBebidas(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar bebidas:', error)
      notificar('error', error.response?.data?.detail || 'No se pudieron cargar las bebidas.')
    }
  }, [getAuthConfig, notificar])

  const cargarHistorial = async (pagina = 1) => {
    setCargandoHistorial(true)
    try {
      const respuesta = await api.get('/api/pedidos/', {
        ...getAuthConfig(),
        params: {
          page: pagina,
          fecha_desde: fechaDesdeHistorial || undefined,
          fecha_hasta: fechaHastaHistorial || undefined,
        },
      })
      const data = respuesta.data
      setHistorialPedidos(Array.isArray(data) ? data : data.results || [])
      setPaginaHistorial(pagina)
      setTotalPaginasHistorial(
        Array.isArray(data) ? 1 : Math.max(1, Math.ceil((data.count || 0) / 20)),
      )
    } catch (error) {
      console.error('Error al cargar el historial de pedidos:', error)
      notificar('error', error.response?.data?.detail || 'No se pudo cargar el historial de pedidos.')
    } finally {
      setCargandoHistorial(false)
    }
  }

  const abrirHistorial = () => {
    setHistorialVisible(true)
    setPedidoDetalleHistorial(null)
    cargarHistorial(1)
  }

  const filtrarHistorial = () => {
    setPedidoDetalleHistorial(null)
    cargarHistorial(1)
  }

  const cargarCajas = useCallback(async () => {
    try {
      const respuesta = await api.get('/api/cajas/?status=active', getAuthConfig())
      setCajas(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar cajas:', error)
    }
  }, [getAuthConfig])

  const cargarEmpleadoActual = useCallback(async () => {
    try {
      const respuesta = await api.get('/api/pedidos/contexto/', getAuthConfig())
      setEmpleadoActual(respuesta.data.empleado)
    } catch (error) {
      console.error('Error al cargar los datos del empleado actual:', error)
      notificar(
        'error',
        error.response?.data?.detail || 'No se pudieron cargar los datos para crear el pedido.',
      )
    } finally {
      setEmpleadoActualCargado(true)
    }
  }, [getAuthConfig, notificar])

  useEffect(() => {
    cargarPedidos()
    cargarProductos()
    cargarBebidas()
    if (esOperativo) {
      cargarEmpleadoActual()
    } else {
      cargarCajas()
    }
  }, [
    esOperativo,
    cargarBebidas,
    cargarCajas,
    cargarEmpleadoActual,
    cargarPedidos,
    cargarProductos,
  ])

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Confirmar y marcar pedido como Finalizado
  const confirmarCompletarPedido = async () => {
    if (!pedidoACompletar) return
    setCompletando(true)
    try {
      await api.patch(
        `/api/pedidos/${pedidoACompletar.id_pedidos}/`,
        {
          estado: 'Finalizado',
        },
        getAuthConfig()
      )
      notificar('exito', `Pedido #${pedidoACompletar.id_pedidos} marcado como Finalizado.`)
      setConfirmModalOpen(false)
      setPedidoACompletar(null)
      cargarPedidos()
    } catch (error) {
      console.error('Error al finalizar pedido:', error.response?.data || error)
      notificar('error', 'No se pudo cambiar el estado del pedido.')
    } finally {
      setCompletando(false)
    }
  }

  const confirmarCancelarPedido = async () => {
    if (!pedidoACancelar) return
    setCancelando(true)
    try {
      await api.patch(
        `/api/pedidos/${pedidoACancelar.id_pedidos}/`,
        { estado: 'Cancelado' },
        getAuthConfig(),
      )
      notificar('exito', `Pedido #${pedidoACancelar.id_pedidos} cancelado.`)
      setPedidoACancelar(null)
      cargarPedidos()
    } catch (error) {
      console.error('Error al cancelar pedido:', error.response?.data || error)
      notificar('error', error.response?.data?.detail || 'No se pudo cancelar el pedido.')
    } finally {
      setCancelando(false)
    }
  }

  const getBadgeColor = (estado) => {
    const est = (estado || '').toLowerCase()
    if (est.includes('finalizado') || est.includes('completado') || est.includes('pagado')) {
      return 'success'
    }
    if (est.includes('proceso')) return 'warning'
    if (est.includes('cancelado')) return 'danger'
    return 'info'
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const coincideEstado =
      filtroEstado === 'Todos' ||
      (pedido.estado || '').toLowerCase() === filtroEstado.toLowerCase()

    const termino = busqueda.trim().toLowerCase()
    const coincideTexto =
      !termino ||
      (pedido.cliente || '').toLowerCase().includes(termino) ||
      (pedido.direccion || '').toLowerCase().includes(termino) ||
      String(pedido.id_pedidos).includes(termino)

    return coincideEstado && coincideTexto
  })

  return (
    <div>
      <CRow>
        {/* CABECERA Y ACCIÓN RÁPIDA */}
        <CCol xs={12} className="mb-4">
          <div className="d-flex justify-content-between align-items-center bg-body p-3 rounded shadow-sm border">
            <div>
              <h4 className="mb-1 text-primary fw-bold">
                <CIcon icon={cilListRich} className="me-2" />
                Gestión de Pedidos y Comandas
              </h4>
              <p className="text-body-secondary small mb-0">
                Administra el flujo de pedidos del día y modifica sus ítems o estado.
              </p>
            </div>
            <div className="d-flex gap-2">
              <CButton color="info" variant="outline" onClick={abrirHistorial}>
                <CIcon icon={cilClock} className="me-1" /> Historial
              </CButton>
              <CButton
                color="primary"
                onClick={() => {
                  setPedidoAEditar(null)
                  setModalOpen(true)
                }}
                disabled={!puedeCrearPedido || (esOperativo && !empleadoActualCargado)}
                title={!puedeCrearPedido ? 'Tu rol no puede crear pedidos.' : undefined}
              >
                <CIcon icon={cilPlus} className="me-1" />
                {!puedeCrearPedido
                  ? 'Creación no permitida'
                  : esOperativo && !empleadoActualCargado
                    ? 'Cargando...'
                    : 'Nuevo Pedido'}
              </CButton>
            </div>
          </div>
        </CCol>

        {/* SECCIÓN PRINCIPAL: Tabla de Pedidos */}
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-body-secondary d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
              <span className="fw-bold">Listado de Pedidos del Día</span>
              <div className="d-flex align-items-center gap-2" style={{ maxWidth: '450px', width: '100%' }}>
                <CFormInput
                  type="text"
                  size="sm"
                  placeholder="Buscar por cliente, mesa o #ID..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <CFormSelect
                  size="sm"
                  style={{ maxWidth: '160px' }}
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </CFormSelect>
              </div>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" responsive hover bordered>
                <CTableHead className="table-theme-header">
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
                    <CTableHeaderCell className="text-center">Pagado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={6} />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={8} />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={8} />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={10} />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={6} />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={7} className="rounded-pill" />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={8} className="rounded-pill" />
                          </CPlaceholder>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CPlaceholder animation="glow">
                            <CPlaceholder xs={8} />
                          </CPlaceholder>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : pedidosFiltrados.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center text-body-secondary py-4">
                        {pedidos.length === 0
                          ? 'No hay pedidos registrados hoy.'
                          : 'No se encontraron pedidos con los filtros seleccionados.'}
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    pedidosFiltrados.map((pedido) => {
                      const detalles = pedido.pedido_detalle || []
                      const resumenItems =
                        detalles.length > 0
                          ? `${detalles.length} ítem(s): ${detalles
                              .map((d) => `${d.cantidad}x ${d.producto?.nombre || d.bebida?.nombre}`)
                              .join(', ')}`
                          : 'Sin detalles'

                      const estadoPedido = (pedido.estado || '').toLowerCase()
                      const esCancelado = estadoPedido === 'cancelado'
                      const esFinalizado = (pedido.estado || '').toLowerCase() === 'finalizado'
                      const esEnProceso = estadoPedido === 'en proceso'
                      const bloquearEdicion = esCancelado || (esFinalizado && pedido.pagado)

                      return (
                        <CTableRow key={pedido.id_pedidos}>
                          <CTableDataCell className="fw-bold">#{pedido.id_pedidos}</CTableDataCell>
                          <CTableDataCell>{pedido.cliente}</CTableDataCell>
                          <CTableDataCell className="text-body-secondary">
                            {pedido.direccion || '-'}
                          </CTableDataCell>
                          <CTableDataCell className="small">{resumenItems}</CTableDataCell>
                          <CTableDataCell className="text-end fw-bold">
                            ${formatearMoneda(pedido.precio_total)}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CBadge color={pedido.pagado ? 'success' : 'danger'} shape="rounded-pill">
                              {pedido.pagado ? 'Pagado' : 'Sin pagar'}
                            </CBadge>
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
                              disabled={bloquearEdicion}
                              onClick={() => {
                                setPedidoAEditar(pedido)
                                setModalOpen(true)
                              }}
                              title={
                                bloquearEdicion
                                  ? 'No se puede modificar un pedido cancelado o finalizado y pagado'
                                  : 'Ver y Modificar Pedido'
                              }
                            >
                              <CIcon icon={cilPencil} className="me-1" /> Editar
                            </CButton>
                            {!esFinalizado && !esCancelado && (
                              <CButton
                                color="success"
                                size="sm"
                                variant="outline"
                                className="ms-1"
                                onClick={() => {
                                  setPedidoACompletar(pedido)
                                  setConfirmModalOpen(true)
                                }}
                              >
                                <CIcon icon={cilCheckCircle} className="me-1" /> Finalizado
                              </CButton>
                            )}
                            {esEnProceso && (
                              <CButton
                                color="danger"
                                size="sm"
                                variant="outline"
                                className="ms-1"
                                onClick={() => setPedidoACancelar(pedido)}
                              >
                                Cancelar pedido
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
      </CRow>

      {/* MODAL UNIFICADO: CREAR Y MODIFICAR PEDIDO */}
      <ModalFormPedido
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        pedido={pedidoAEditar}
        productos={productos}
        bebidas={bebidas}
        cajas={cajas}
        empleadoActual={empleadoActual}
        esOperativo={esOperativo}
        onSuccess={cargarPedidos}
      />

      <CModal
        visible={historialVisible}
        onClose={() => {
          setHistorialVisible(false)
          setPedidoDetalleHistorial(null)
        }}
        size="xl"
      >
        <CModalHeader>
          <CModalTitle>Historial de Pedidos</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {cargandoHistorial ? (
            <p className="text-center text-body-secondary">Cargando pedidos...</p>
          ) : (
            <>
              <CRow className="g-2 align-items-end mb-3">
                <CCol md={4}>
                  <CFormInput
                    label="Desde"
                    type="date"
                    value={fechaDesdeHistorial}
                    onChange={(e) => setFechaDesdeHistorial(e.target.value)}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Hasta"
                    type="date"
                    value={fechaHastaHistorial}
                    onChange={(e) => setFechaHastaHistorial(e.target.value)}
                  />
                </CCol>
                <CCol md={4}>
                  <CButton color="secondary" className="w-100" onClick={filtrarHistorial}>
                    Filtrar
                  </CButton>
                </CCol>
              </CRow>
              <CTable responsive hover bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Pedido</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Empleado</CTableHeaderCell>
                    <CTableHeaderCell>Cliente</CTableHeaderCell>
                    <CTableHeaderCell>Dirección</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Pagado</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                    <CTableHeaderCell>Detalle</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {historialPedidos.map((pedido) => (
                    <CTableRow key={pedido.id_pedidos}>
                      <CTableDataCell>#{pedido.id_pedidos}</CTableDataCell>
                      <CTableDataCell>
                        {pedido.fecha_hora_creacion
                          ? new Date(pedido.fecha_hora_creacion).toLocaleString()
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {pedido.empleado_detalle
                          ? `${pedido.empleado_detalle.nombre} ${pedido.empleado_detalle.apellido}`
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>{pedido.cliente}</CTableDataCell>
                      <CTableDataCell>{pedido.direccion || '-'}</CTableDataCell>
                      <CTableDataCell>{pedido.estado}</CTableDataCell>
                      <CTableDataCell>{pedido.pagado ? 'Sí' : 'No'}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        ${formatearMoneda(pedido.precio_total)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          onClick={() =>
                            setPedidoDetalleHistorial(
                              pedidoDetalleHistorial?.id_pedidos === pedido.id_pedidos
                                ? null
                                : pedido,
                            )
                          }
                        >
                          Detalles
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {!historialPedidos.length && !cargandoHistorial && (
                <p className="text-center text-body-secondary mb-0">No hay pedidos para mostrar.</p>
              )}
              {pedidoDetalleHistorial && (
                <div className="mt-4">
                  <h6 className="fw-bold">
                    Detalle del pedido #{pedidoDetalleHistorial.id_pedidos}
                  </h6>
                  <CTable responsive hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Producto / bebida</CTableHeaderCell>
                        <CTableHeaderCell>Cantidad</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {(pedidoDetalleHistorial.pedido_detalle || []).map((detalle) => (
                        <CTableRow key={detalle.id_detalles_pedidos}>
                          <CTableDataCell>
                            {detalle.producto?.nombre || detalle.bebida?.nombre || '-'}
                          </CTableDataCell>
                          <CTableDataCell>{detalle.cantidad}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            ${formatearMoneda(detalle.subtotal)}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  <div className="text-end fw-bold">
                    Total: ${formatearMoneda(pedidoDetalleHistorial.precio_total)}
                  </div>
                </div>
              )}
              {totalPaginasHistorial > 1 && (
                <CPagination aria-label="Paginación del historial de pedidos">
                  <CPaginationItem
                    disabled={paginaHistorial <= 1}
                    onClick={(event) => {
                      event.preventDefault()
                      cargarHistorial(paginaHistorial - 1)
                    }}
                  >
                    Anterior
                  </CPaginationItem>
                  <CPaginationItem active>
                    {paginaHistorial} / {totalPaginasHistorial}
                  </CPaginationItem>
                  <CPaginationItem
                    disabled={paginaHistorial >= totalPaginasHistorial}
                    onClick={(event) => {
                      event.preventDefault()
                      cargarHistorial(paginaHistorial + 1)
                    }}
                  >
                    Siguiente
                  </CPaginationItem>
                </CPagination>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setHistorialVisible(false)
              setPedidoDetalleHistorial(null)
            }}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal
        visible={!!pedidoACancelar}
        onClose={() => !cancelando && setPedidoACancelar(null)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle className="fw-semibold">Confirmar cancelación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Deseas cancelar el pedido <strong>#{pedidoACancelar?.id_pedidos}</strong> de{' '}
          <strong>{pedidoACancelar?.cliente}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => setPedidoACancelar(null)}
            disabled={cancelando}
          >
            Volver
          </CButton>
          <CButton color="danger" onClick={confirmarCancelarPedido} disabled={cancelando}>
            {cancelando ? 'Cancelando...' : 'Cancelar pedido'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL DE CONFIRMACIÓN PARA COMPLETAR PEDIDO */}
      <CModal
        visible={confirmModalOpen}
        onClose={() => !completando && setConfirmModalOpen(false)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle className="fw-semibold">Confirmar Finalización</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Deseas marcar el pedido <strong>#{pedidoACompletar?.id_pedidos}</strong> de{' '}
          <strong>{pedidoACompletar?.cliente}</strong> como <strong>Finalizado</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => setConfirmModalOpen(false)}
            disabled={completando}
          >
            Cancelar
          </CButton>
          <CButton
            color="success"
            className="text-white"
            onClick={confirmarCompletarPedido}
            disabled={completando}
          >
            {completando ? 'Finalizando...' : 'Confirmar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Pedidos
