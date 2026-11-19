import React, { useCallback, useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [pedido, setPedido] = useState(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const cargar = useCallback(async (paginaSolicitada = 1, filtros = {}) => {
    try {
      const { data } = await api.get('/api/pedidos/', {
        params: {
          page: paginaSolicitada,
          ...filtros,
        },
      })
      setPedidos(Array.isArray(data) ? data : data.results || [])
      setPagina(paginaSolicitada)
      setTotalPaginas(
        Array.isArray(data) ? 1 : Math.max(1, Math.ceil((data.count || 0) / 20)),
      )
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo cargar el historial de pedidos.')
    }
  }, [])
  useEffect(() => {
    cargar(1)
  }, [cargar])

  const lista = pedidos.filter((item) =>
    `${item.id_pedidos} ${item.cliente} ${item.estado}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase()),
  )

  const filtrar = () => {
    setPedido(null)
    cargar(1, {
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    })
  }

  return (
    <>
      <CCard>
        <CCardHeader>
          <strong>Historial de Pedidos</strong>
        </CCardHeader>
        <CCardBody>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-4">
              <CFormInput
                label="Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <CFormInput
                label="Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <CButton color="secondary" className="w-100" onClick={filtrar}>
                Filtrar fechas
              </CButton>
            </div>
          </div>
          <CFormInput
            className="mb-3"
            placeholder="Buscar por número, cliente o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <CTable responsive hover>
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
              {lista.map((item) => (
                <CTableRow key={item.id_pedidos}>
                  <CTableDataCell>#{item.id_pedidos}</CTableDataCell>
                  <CTableDataCell>
                    {item.fecha_hora_creacion
                      ? new Date(item.fecha_hora_creacion).toLocaleString()
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    {item.empleado_detalle
                      ? `${item.empleado_detalle.nombre} ${item.empleado_detalle.apellido}`
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell>{item.cliente}</CTableDataCell>
                  <CTableDataCell>{item.direccion || '-'}</CTableDataCell>
                  <CTableDataCell>{item.estado}</CTableDataCell>
                  <CTableDataCell>{item.pagado ? 'Sí' : 'No'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    ${Number(item.precio_total || 0).toFixed(2)}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      onClick={() => setPedido(item)}
                    >
                      Ver
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {!lista.length && (
            <p className="text-center text-body-secondary mb-0">No hay pedidos para mostrar.</p>
          )}
          {totalPaginas > 1 && (
            <CPagination aria-label="Paginación del historial de pedidos">
              <CPaginationItem
                disabled={pagina <= 1}
                onClick={(event) => {
                  event.preventDefault()
                  setPedido(null)
                  cargar(pagina - 1, {
                    fecha_desde: fechaDesde || undefined,
                    fecha_hasta: fechaHasta || undefined,
                  })
                }}
              >
                Anterior
              </CPaginationItem>
              <CPaginationItem active>
                {pagina} / {totalPaginas}
              </CPaginationItem>
              <CPaginationItem
                disabled={pagina >= totalPaginas}
                onClick={(event) => {
                  event.preventDefault()
                  setPedido(null)
                  cargar(pagina + 1, {
                    fecha_desde: fechaDesde || undefined,
                    fecha_hasta: fechaHasta || undefined,
                  })
                }}
              >
                Siguiente
              </CPaginationItem>
            </CPagination>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={!!pedido} onClose={() => setPedido(null)}>
        <CModalHeader>
          <CModalTitle>Pedido #{pedido?.id_pedidos}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Cliente: <strong>{pedido?.cliente}</strong> · Estado: {pedido?.estado} ·{' '}
            {pedido?.pagado ? 'Pagado' : 'Sin pagar'}
          </p>
          <CTable responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Producto / bebida</CTableHeaderCell>
                <CTableHeaderCell>Cantidad</CTableHeaderCell>
                <CTableHeaderCell>Subtotal</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(pedido?.pedido_detalle || []).map((item) => (
                <CTableRow key={item.id_detalles_pedidos}>
                  <CTableDataCell>
                    {item.producto?.nombre || item.bebida?.nombre || '-'}
                  </CTableDataCell>
                  <CTableDataCell>{item.cantidad}</CTableDataCell>
                  <CTableDataCell>${Number(item.subtotal).toFixed(2)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div className="text-end fw-bold">
            Total: ${Number(pedido?.precio_total || 0).toFixed(2)}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPedido(null)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default HistorialPedidos
