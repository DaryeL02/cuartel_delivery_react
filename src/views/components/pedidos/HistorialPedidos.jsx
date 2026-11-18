import React, { useEffect, useState } from 'react'
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
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const HistorialPedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [pedido, setPedido] = useState(null)

  const cargar = async () => {
    try {
      const { data } = await api.get('/api/pedidos/')
      setPedidos(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo cargar el historial de pedidos.')
    }
  }
  useEffect(() => {
    cargar()
  }, [])

  const lista = pedidos.filter((item) =>
    `${item.id_pedidos} ${item.cliente} ${item.estado}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase()),
  )

  return (
    <>
      <CCard>
        <CCardHeader>
          <strong>Historial de Pedidos</strong>
        </CCardHeader>
        <CCardBody>
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
