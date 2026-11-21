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
  CPagination,
  CPaginationItem,
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
import { cargarResultadosPaginados } from '../api/paginacion'
import MenuDesglose from '../MenuDesglose'
import { toast } from 'react-toastify'

const MAX_DECIMAL_9_2 = 9999999.99

const calcularPrecioMenu = (menu) => {
  const total = (menu.detalles || menu.detalle_menu || []).reduce((acumulador, detalle) => {
    const articulo =
      detalle.producto_data ||
      detalle.bebida_data ||
      (typeof detalle.producto === 'object' && detalle.producto) ||
      (typeof detalle.bebida === 'object' && detalle.bebida)
    const precio = Number(articulo?.precio_unitario || 0)
    const descuento = Number(detalle.descuento || 0)
    const cantidad = Number(detalle.cantidad || 0)
    return acumulador + precio * (1 - descuento / 100) * cantidad
  }, 0)
  return Number(total.toFixed(2))
}

const fechaLocalActual = () => {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`
}

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
    tipo: 'producto',
    articulo: '',
    cantidad: '',
  })
  const [productos, setProductos] = useState([])
  const [menus, setMenus] = useState([])
  const [metodos, setMetodos] = useState([])
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('')
  const [bebidas, setBebidas] = useState([])
  const [ventas, setVentas] = useState([])
  const [ventasHistorial, setVentasHistorial] = useState([])
  const [cajasHistorial, setCajasHistorial] = useState([])
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [cajaFiltro, setCajaFiltro] = useState('')
  const [historialVentasVisible, setHistorialVentasVisible] = useState(false)
  const [cargandoHistorialVentas, setCargandoHistorialVentas] = useState(false)
  const [paginaHistorialVentas, setPaginaHistorialVentas] = useState(1)
  const [totalPaginasVentas, setTotalPaginasVentas] = useState(1)
  const [ventaDetalle, setVentaDetalle] = useState(null)

  const [errores, setErrores] = useState({})
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pedidoACancelar, setPedidoACancelar] = useState(null)
  const [cancelandoPedido, setCancelandoPedido] = useState(false)
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
      const cajasActivas = lista.filter((c) => c.estado || !c.fecha_hora_cierre)
      setCajas(cajasActivas)

      if (cajasActivas.length === 1) {
        setCajaSeleccionada(cajasActivas[0])
        cargarVentasCaja(cajasActivas[0].id_cajas)
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error)
      notificar('error', 'No se pudieron cargar las cajas activas.')
    }
  }

  const cargarPedidos = async () => {
    try {
      const lista = await cargarResultadosPaginados('/api/pedidos/', {
        ...getAuthConfig(),
        params: { date: 'today', pagado: false },
      })
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

  const cargarBebidas = async () => {
    try {
      const respuesta = await api.get('/api/bebidas/', getAuthConfig())
      setBebidas(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar bebidas:', error)
      notificar('error', error.response?.data?.detail || 'No se pudieron cargar las bebidas.')
    }
  }

  const cargarVentasCaja = async (cajaId) => {
    if (!cajaId) {
      setVentas([])
      return
    }

    setVentas([])
    try {
      const respuesta = await api.get('/api/ventas/', {
        ...getAuthConfig(),
        params: { id_cajas: cajaId },
      })
      setVentas(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar las ventas de la caja:', error)
      notificar('error', error.response?.data?.detail || 'No se pudieron cargar las ventas de la caja.')
    }
  }

  const cargarVentasHistorial = async (pagina = 1) => {
    setCargandoHistorialVentas(true)
    try {
      const respuesta = await api.get('/api/ventas/', {
        ...getAuthConfig(),
        params: {
          page: pagina,
          fecha_desde: fechaDesde || undefined,
          fecha_hasta: fechaHasta || undefined,
          id_cajas: cajaFiltro || undefined,
        },
      })
      const data = respuesta.data
      setVentasHistorial(Array.isArray(data) ? data : data.results || [])
      setPaginaHistorialVentas(pagina)
      setTotalPaginasVentas(
        Array.isArray(data) ? 1 : Math.max(1, Math.ceil((data.count || 0) / 20)),
      )
    } catch (error) {
      console.error('Error al cargar el historial completo de ventas:', error)
      notificar('error', error.response?.data?.detail || 'No se pudo cargar el historial de ventas.')
    } finally {
      setCargandoHistorialVentas(false)
    }
  }

  const abrirHistorialVentas = () => {
    setHistorialVentasVisible(true)
    cargarVentasHistorial(1)
  }

  const filtrarVentasHistorial = () => {
    const hoy = fechaLocalActual()
    if ((fechaDesde && fechaDesde > hoy) || (fechaHasta && fechaHasta > hoy)) {
      notificar('advertencia', 'No puedes seleccionar fechas futuras.')
      return
    }
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      notificar('advertencia', 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".')
      return
    }
    cargarVentasHistorial(1)
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

  const cancelarPedidoImportado = async () => {
    if (!pedidoACancelar) return

    setCancelandoPedido(true)
    try {
      await api.patch(
        `/api/pedidos/${pedidoACancelar.id_pedidos}/`,
        { estado: 'Cancelado' },
        getAuthConfig(),
      )
      notificar('exito', `Pedido #${pedidoACancelar.id_pedidos} cancelado correctamente.`)
      setPedidoACancelar(null)
      setPedidoSeleccionado(null)
      setModoVenta(null)
      setIdSeleccionado('')
      setMetodoSeleccionado('')
      setErrores({})
      await cargarPedidos()
    } catch (error) {
      console.error('Error al cancelar el pedido importado:', error.response?.data || error)
      notificar(
        'error',
        error.response?.data?.detail || 'No se pudo cancelar el pedido. Inténtalo nuevamente.',
      )
    } finally {
      setCancelandoPedido(false)
    }
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
    if (!productoSeleccionado.articulo) {
      nuevosErr.articulo = 'Selecciona un producto, una bebida o un menú.'
    }
    const cantidadNum = Number(productoSeleccionado.cantidad)
    if (!productoSeleccionado.cantidad || cantidadNum <= 0) {
      nuevosErr.cantidad = 'Ingresa una cantidad mayor a 0.'
    }

    if (Object.keys(nuevosErr).length > 0) {
      setErrores((prev) => ({ ...prev, ...nuevosErr }))
      notificar('advertencia', 'Selecciona un artículo y una cantidad válida.')
      return
    }

    const esMenu = productoSeleccionado.tipo === 'menu'
    const esBebida = productoSeleccionado.tipo === 'bebida'
    const articulos = esMenu ? menusActivos : esBebida ? bebidasActivas : productosActivos
    const idArticulo = esMenu ? 'id_menus' : esBebida ? 'id_bebidas' : 'id_productos'
    const articuloCompleto = articulos.find(
      (articulo) => String(articulo[idArticulo]) === String(productoSeleccionado.articulo),
    )
    if (!articuloCompleto) return

    const precioUnitario = esMenu
      ? calcularPrecioMenu(articuloCompleto)
      : Number(articuloCompleto.precio_unitario)
    const claveArticulo = esMenu ? 'menu' : esBebida ? 'bebida' : 'producto'
    const existente = nuevoPedido.detalles.find(
      (item) => String(item[claveArticulo]?.[idArticulo]) === String(articuloCompleto[idArticulo]),
    )

    const nuevaCantidadTotal = existente ? existente.cantidad + cantidadNum : cantidadNum
    if (nuevaCantidadTotal > 9999) {
      notificar('advertencia', 'La cantidad máxima por artículo es 9.999 unidades.')
      return
    }

    const nuevoSubtotalItem = nuevaCantidadTotal * precioUnitario
    const totalSinEsteProducto = nuevoPedido.detalles
      .filter(
        (item) =>
          String(item[claveArticulo]?.[idArticulo]) !== String(articuloCompleto[idArticulo]),
      )
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
          String(item[claveArticulo]?.[idArticulo]) === String(articuloCompleto[idArticulo])
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
        id_temporal: `${productoSeleccionado.tipo}-${articuloCompleto[idArticulo]}`,
        [claveArticulo]: {
          ...(esMenu ? articuloCompleto : {}),
          [idArticulo]: articuloCompleto[idArticulo],
          nombre: articuloCompleto.nombre,
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
      tipo: 'producto',
      articulo: '',
      cantidad: '',
    })
    setErrores((prev) => ({ ...prev, articulo: null, cantidad: null, detalles: null }))
  }

  const handleAjustarCantidad = (idTemporal, delta) => {
    setNuevoPedido((prev) => {
      const actualizados = prev.detalles
        .map((item) => {
          if (item.id_temporal !== idTemporal) return item
          const nuevaCant = item.cantidad + delta
          if (nuevaCant <= 0) return null
          if (nuevaCant > 9999) return item
          const nuevoSub =
            nuevaCant *
            Number(
              item.menu?.precio_unitario ??
                item.producto?.precio_unitario ??
                item.bebida?.precio_unitario ??
                0,
            )
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
        id_menus: item.menu ? Number(item.menu.id_menus) : null,
        id_productos: item.producto ? Number(item.producto.id_productos) : null,
        id_bebidas: item.bebida ? Number(item.bebida.id_bebidas) : null,
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
      cargarVentasCaja(cajaSeleccionada?.id_cajas)
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
    cargarBebidas()
    cargarMetodos()
    const cargarMenus = async () => {
      try {
        const respuesta = await api.get('/api/menus/', getAuthConfig())
        setMenus(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
      } catch (error) {
        console.error('Error al cargar menús:', error)
        notificar('error', error.response?.data?.detail || 'No se pudieron cargar los menús.')
      }
    }
    cargarMenus()
    const cargarCajasHistorial = async () => {
      try {
        const respuesta = await api.get('/api/cajas/', getAuthConfig())
        setCajasHistorial(
          Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [],
        )
      } catch (error) {
        console.error('Error al cargar cajas para filtrar ventas:', error)
        notificar('error', error.response?.data?.detail || 'No se pudieron cargar las cajas.')
      }
    }
    cargarCajasHistorial()
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
  const bebidasActivas = bebidas.filter((b) => b.estado !== false)
  const menusActivos = menus.filter((menu) => menu.estado === true)
  const obtenerPrecioMenu = (menu) => {
    const menuCatalogo = menus.find((item) => String(item.id_menus) === String(menu?.id_menus))
    return Number(menu?.precio_unitario ?? calcularPrecioMenu(menuCatalogo || menu || {}))
  }
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
                      cargarVentasCaja(item.id_cajas)
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
                  <CIcon icon={cilFindInPage} className="me-1" /> Importar Pedido Pendiente de Cobro{' '}
                  <span className="text-danger">*</span>
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
                    <div className="d-flex align-items-center gap-2">
                      <CBadge color="info" shape="rounded-pill">
                        {pedidoSeleccionado.estado}
                      </CBadge>
                      <CButton
                        type="button"
                        size="sm"
                        color="danger"
                        variant="outline"
                        onClick={() => setPedidoACancelar(pedidoSeleccionado)}
                        disabled={loading}
                      >
                        Cancelar pedido
                      </CButton>
                    </div>
                  </div>
                  <CTable responsive align="middle" hover bordered>
                    <CTableHead className="table-theme-header">
                      <CTableRow>
                        <CTableHeaderCell>Artículo</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {pedidoSeleccionado?.pedido_detalle?.map((item) => (
                        <CTableRow key={item.id_detalles_pedidos}>
                          <CTableDataCell>
                            {item.menu?.nombre || item.producto?.nombre || item.bebida?.nombre}
                            {item.menu && <MenuDesglose menu={item.menu} />}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            $
                            {formatearMoneda(
                              Number(item.cantidad) > 0
                                ? Number(item.subtotal) / Number(item.cantidad)
                                : 0,
                            )}
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
                    <CCol md={8}>
                      <CFormSelect
                        name="articulo"
                        label={
                          <span>
                            Producto, bebida o menú <span className="text-danger">*</span>
                          </span>
                        }
                        value={
                          productoSeleccionado.articulo
                            ? `${productoSeleccionado.tipo}:${productoSeleccionado.articulo}`
                            : ''
                        }
                        onChange={(e) => {
                          const [tipo, articulo] = e.target.value.split(':')
                          setProductoSeleccionado((prev) => ({
                            ...prev,
                            tipo: tipo || 'producto',
                            articulo: articulo || '',
                          }))
                          setErrores((prev) => ({ ...prev, articulo: null }))
                        }}
                        invalid={!!errores.articulo}
                        feedbackInvalid={errores.articulo}
                      >
                        <option value="">-- Seleccione un artículo --</option>
                        <optgroup label="Productos">
                          {productosActivos.map((item) => (
                            <option key={`producto-${item.id_productos}`} value={`producto:${item.id_productos}`}>
                              {item.nombre} (${formatearMoneda(item.precio_unitario)})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Bebidas">
                          {bebidasActivas.map((item) => (
                            <option key={`bebida-${item.id_bebidas}`} value={`bebida:${item.id_bebidas}`}>
                              {item.nombre} (${formatearMoneda(item.precio_unitario)})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Menús">
                          {menusActivos.map((item) => (
                            <option key={`menu-${item.id_menus}`} value={`menu:${item.id_menus}`}>
                              {item.nombre} (${formatearMoneda(calcularPrecioMenu(item))})
                            </option>
                          ))}
                        </optgroup>
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        inputMode="numeric"
                        name="cantidad"
                        label={
                          <span>
                            Cantidad <span className="text-danger">*</span>
                          </span>
                        }
                        placeholder="Ej: 1"
                        maxLength={4}
                        value={productoSeleccionado.cantidad}
                        onChange={handleChange}
                        invalid={!!errores.cantidad}
                        feedbackInvalid={errores.cantidad}
                      />
                    </CCol>
                  </CRow>

                  <div className="mb-3">
                    <CButton
                      type="button"
                      color="info"
                      variant="outline"
                      onClick={handleAgregarProducto}
                    >
                      <CIcon icon={cilPlus} className="me-1" /> Agregar artículo
                    </CButton>
                  </div>
                  <CTable
                    responsive
                    align="middle"
                    hover
                    bordered
                    className={errores.detalles ? 'border-danger' : ''}
                  >
                    <CTableHead className="table-theme-header">
                      <CTableRow>
                        <CTableHeaderCell>Artículo</CTableHeaderCell>
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
                            <CTableDataCell>
                              {item.menu?.nombre || item.producto?.nombre || item.bebida?.nombre}
                              {item.menu && <MenuDesglose menu={item.menu} />}
                            </CTableDataCell>
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
                              $
                              {formatearMoneda(
                                item.menu
                                  ? obtenerPrecioMenu(item.menu)
                                  : (item.producto?.precio_unitario ??
                                    item.bebida?.precio_unitario),
                              )}
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
                        label={
                          <span>
                            Nombre del cliente <span className="text-danger">*</span>
                          </span>
                        }
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
                      label={
                        <span>
                          Método de Pago <span className="text-danger">*</span>
                        </span>
                      }
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

              <CFormText className="d-block mt-3">
                <span className="text-danger">*</span> Campos obligatorios
              </CFormText>

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

      <CCol xs={12} lg={4}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-body-secondary d-flex justify-content-between align-items-center gap-2">
            <strong>Ventas de la caja</strong>
            <CButton size="sm" color="primary" onClick={abrirHistorialVentas}>
              Historial Completo
            </CButton>
          </CCardHeader>
          <CCardBody>
            {cajaSeleccionada && ventas.length ? (
              <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <CTable responsive hover small>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Venta</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                      <CTableHeaderCell>Detalle</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {ventas.map((venta) => (
                      <CTableRow key={venta.id_ventas}>
                        <CTableDataCell>
                          #{venta.id_ventas}
                          <small className="d-block text-body-secondary">
                            {venta.metodo_detalle?.nombre || 'Sin método'}
                          </small>
                        </CTableDataCell>
                        <CTableDataCell>
                          {venta.fecha_hora_creacion
                            ? new Date(venta.fecha_hora_creacion).toLocaleString()
                            : '-'}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          ${formatearMoneda(venta.precio_total)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            onClick={() => setVentaDetalle(venta)}
                          >
                            Detalles
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            ) : !cajaSeleccionada ? (
              <p className="text-center text-body-secondary mb-0">
                Selecciona una caja abierta para consultar sus ventas.
              </p>
            ) : (
              <p className="text-center text-body-secondary mb-0">
                No hay ventas registradas en esta caja.
              </p>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal
        visible={historialVentasVisible}
        onClose={() => setHistorialVentasVisible(false)}
        size="xl"
      >
        <CModalHeader>
          <CModalTitle>Historial Completo de Ventas</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-2 align-items-end mb-3">
            <CCol md={3}>
              <CFormInput
                label="Desde"
                type="date"
                max={fechaHasta || fechaLocalActual()}
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                label="Hasta"
                type="date"
                min={fechaDesde || undefined}
                max={fechaLocalActual()}
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label="Caja"
                value={cajaFiltro}
                onChange={(e) => setCajaFiltro(e.target.value)}
              >
                <option value="">Todas las cajas</option>
                {cajasHistorial.map((caja) => (
                  <option key={caja.id_cajas} value={caja.id_cajas}>
                    Caja #{caja.id_cajas}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CButton color="secondary" className="w-100" onClick={filtrarVentasHistorial}>
                Filtrar
              </CButton>
            </CCol>
          </CRow>
          {cargandoHistorialVentas ? (
            <p className="text-center text-body-secondary">Cargando ventas...</p>
          ) : (
            <>
              <CTable responsive hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Venta</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Caja</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                    <CTableHeaderCell>Detalle</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {ventasHistorial.map((venta) => (
                    <CTableRow key={venta.id_ventas}>
                      <CTableDataCell>
                        #{venta.id_ventas}
                        <small className="d-block text-body-secondary">
                          {venta.metodo_detalle?.nombre || 'Sin método'}
                        </small>
                      </CTableDataCell>
                      <CTableDataCell>
                        {venta.fecha_hora_creacion
                          ? new Date(venta.fecha_hora_creacion).toLocaleString()
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {venta.caja_detalle?.id_cajas
                          ? `Caja #${venta.caja_detalle.id_cajas}`
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        ${formatearMoneda(venta.precio_total)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          onClick={() => setVentaDetalle(venta)}
                        >
                          Detalles
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {!ventasHistorial.length && (
                <p className="text-center text-body-secondary mb-0">No hay ventas para mostrar.</p>
              )}
              {totalPaginasVentas > 1 && (
                <CPagination aria-label="Paginación del historial de ventas">
                  <CPaginationItem
                    disabled={paginaHistorialVentas <= 1}
                    onClick={(event) => {
                      event.preventDefault()
                      cargarVentasHistorial(paginaHistorialVentas - 1)
                    }}
                  >
                    Anterior
                  </CPaginationItem>
                  <CPaginationItem active>
                    {paginaHistorialVentas} / {totalPaginasVentas}
                  </CPaginationItem>
                  <CPaginationItem
                    disabled={paginaHistorialVentas >= totalPaginasVentas}
                    onClick={(event) => {
                      event.preventDefault()
                      cargarVentasHistorial(paginaHistorialVentas + 1)
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
          <CButton color="secondary" onClick={() => setHistorialVentasVisible(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

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
      <CModal
        visible={!!pedidoACancelar}
        onClose={() => !cancelandoPedido && setPedidoACancelar(null)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Confirmar cancelación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Deseas cancelar el pedido <strong>#{pedidoACancelar?.id_pedidos}</strong>? Esta acción
          quitará el pedido de la terminal de ventas.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setPedidoACancelar(null)}
            disabled={cancelandoPedido}
          >
            Volver
          </CButton>
          <CButton color="danger" onClick={cancelarPedidoImportado} disabled={cancelandoPedido}>
            {cancelandoPedido ? 'Cancelando...' : 'Confirmar cancelación'}
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={!!ventaDetalle} onClose={() => setVentaDetalle(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Detalle de Venta #{ventaDetalle?.id_ventas}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
            <span>
              Fecha:{' '}
              <strong>
                {ventaDetalle?.fecha_hora_creacion
                  ? new Date(ventaDetalle.fecha_hora_creacion).toLocaleString()
                  : '-'}
              </strong>
            </span>
            <span>
              Método: <strong>{ventaDetalle?.metodo_detalle?.nombre || '-'}</strong>
            </span>
            <span>
              Caja:{' '}
              <strong>
                {ventaDetalle?.caja_detalle?.id_cajas
                  ? `#${ventaDetalle.caja_detalle.id_cajas}`
                  : '-'}
              </strong>
            </span>
            <span>
              Empleado:{' '}
              <strong>{ventaDetalle?.caja_detalle?.empleado_nombre || '-'}</strong>
            </span>
            <span>
              Total: <strong>${formatearMoneda(ventaDetalle?.precio_total)}</strong>
            </span>
          </div>
          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Artículo</CTableHeaderCell>
                <CTableHeaderCell>Cantidad</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(ventaDetalle?.detalle_venta || []).map((detalle) => (
                <CTableRow key={detalle.id_detalles_ventas}>
                  <CTableDataCell>
                    {detalle.menu?.nombre ||
                      detalle.producto?.nombre ||
                      detalle.bebida?.nombre ||
                      '-'}
                    {detalle.menu && <MenuDesglose menu={detalle.menu} />}
                  </CTableDataCell>
                  <CTableDataCell>{detalle.cantidad}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    $
                    {formatearMoneda(
                      Number(detalle.cantidad) > 0
                        ? Number(detalle.subtotal) / Number(detalle.cantidad)
                        : 0,
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    ${formatearMoneda(detalle.subtotal)}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVentaDetalle(null)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Ventas
