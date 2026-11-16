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
  CBadge,
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
import ModalFormPedido from './ModalFormPedido'
import { toast } from 'react-toastify'

const Pedidos = () => {
  // Estados de datos desde API
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [cajas, setCajas] = useState([])

  // Estados para control del Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [pedidoAEditar, setPedidoAEditar] = useState(null)

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
      notificar('exito', `Pedido #${pedido.id_pedidos} marcado como Finalizado.`)
      cargarPedidos()
    } catch (error) {
      console.error('Error al finalizar pedido:', error.response?.data || error)
      notificar('error', 'No se pudo cambiar el estado del pedido.')
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
            <CButton
              color="primary"
              onClick={() => {
                setPedidoAEditar(null)
                setModalOpen(true)
              }}
            >
              <CIcon icon={cilPlus} className="me-1" /> Nuevo Pedido
            </CButton>
          </div>
        </CCol>

        {/* SECCIÓN PRINCIPAL: Tabla de Pedidos */}
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-body-secondary fw-bold">Listado de Pedidos del Día</CCardHeader>
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
                  {pedidos.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center text-body-secondary py-4">
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
                              onClick={() => {
                                setPedidoAEditar(pedido)
                                setModalOpen(true)
                              }}
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
      </CRow>

      {/* MODAL UNIFICADO: CREAR Y MODIFICAR PEDIDO */}
      <ModalFormPedido
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        pedido={pedidoAEditar}
        productos={productos}
        cajas={cajas}
        onSuccess={cargarPedidos}
      />
    </div>
  )
}

export default Pedidos
