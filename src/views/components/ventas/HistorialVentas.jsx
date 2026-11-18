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
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [venta, setVenta] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/api/ventas/', {
        params: { desde: desde || undefined, hasta: hasta || undefined },
      })
      setVentas(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo cargar el historial de ventas.')
    }
  }, [desde, hasta])
  useEffect(() => {
    cargar()
  }, [cargar])

  const lista = ventas.filter((item) => String(item.id_ventas).includes(busqueda.trim()))
  const articulo = (detalle) => detalle.producto?.nombre || detalle.bebida?.nombre || 'Artículo'

  return (
    <>
      <CCard>
        <CCardHeader>
          <strong>Historial de Ventas</strong>
        </CCardHeader>
        <CCardBody>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-3">
              <CFormInput
                label="Desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <CFormInput
                label="Hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <CFormInput
                label="Buscar por número"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <CButton color="secondary" onClick={cargar}>
                Filtrar
              </CButton>
            </div>
          </div>
          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Venta</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Método</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                <CTableHeaderCell>Detalle</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {lista.map((item) => (
                <CTableRow key={item.id_ventas}>
                  <CTableDataCell>#{item.id_ventas}</CTableDataCell>
                  <CTableDataCell>
                    {item.fecha_hora_creacion
                      ? new Date(item.fecha_hora_creacion).toLocaleString()
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell>{item.metodo_detalle?.nombre || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    ${Number(item.precio_total).toFixed(2)}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      onClick={() => setVenta(item)}
                    >
                      Ver detalle
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {!lista.length && (
            <p className="text-center text-body-secondary mb-0">No hay ventas para mostrar.</p>
          )}
        </CCardBody>
      </CCard>
      <CModal visible={!!venta} onClose={() => setVenta(null)}>
        <CModalHeader>
          <CModalTitle>Venta #{venta?.id_ventas}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Fecha:{' '}
            {venta?.fecha_hora_creacion
              ? new Date(venta.fecha_hora_creacion).toLocaleString()
              : '-'}
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
              {(venta?.detalle_venta || []).map((item) => (
                <CTableRow key={item.id_detalles_ventas}>
                  <CTableDataCell>{articulo(item)}</CTableDataCell>
                  <CTableDataCell>{item.cantidad}</CTableDataCell>
                  <CTableDataCell>${Number(item.subtotal).toFixed(2)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div className="text-end fw-bold">
            Total: ${Number(venta?.precio_total || 0).toFixed(2)}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVenta(null)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default HistorialVentas
