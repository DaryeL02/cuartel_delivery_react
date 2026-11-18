import React, { useCallback, useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const HistorialMovimientos = () => {
  const [movimientos, setMovimientos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/api/movimientos-caja/', {
        params: { desde: desde || undefined, hasta: hasta || undefined },
      })
      setMovimientos(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo cargar el historial de movimientos.')
    }
  }, [desde, hasta])
  useEffect(() => {
    cargar()
  }, [cargar])

  const lista = movimientos.filter((item) =>
    `${item.tipo_movimiento} ${item.concepto} ${item.caja_usuario} ${item.venta_id || ''} ${item.compra_id || ''}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase()),
  )

  return (
    <CCard>
      <CCardHeader>
        <strong>Historial de Movimientos de Caja</strong>
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
          <div className="col-md-2">
            <CButton color="secondary" onClick={cargar}>
              Filtrar fecha
            </CButton>
          </div>
        </div>
        <CFormInput
          className="mb-3"
          placeholder="Buscar por movimiento, responsable, venta o compra..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <CTable responsive hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Concepto</CTableHeaderCell>
              <CTableHeaderCell>Venta / compra</CTableHeaderCell>
              <CTableHeaderCell>Responsable</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Monto</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {lista.map((item) => (
              <CTableRow key={item.id_movimientos}>
                <CTableDataCell>
                  {new Date(item.fecha_hora_creacion).toLocaleString()}
                </CTableDataCell>
                <CTableDataCell>{item.tipo_movimiento}</CTableDataCell>
                <CTableDataCell>{item.concepto}</CTableDataCell>
                <CTableDataCell>
                  {item.venta_id
                    ? `Venta #${item.venta_id}`
                    : item.compra_id
                      ? `Compra #${item.compra_id}`
                      : '-'}
                </CTableDataCell>
                <CTableDataCell>{item.caja_usuario || '-'}</CTableDataCell>
                <CTableDataCell className="text-end">
                  ${Number(item.monto).toFixed(2)}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        {!lista.length && (
          <p className="text-center text-body-secondary mb-0">No hay movimientos registrados.</p>
        )}
      </CCardBody>
    </CCard>
  )
}

export default HistorialMovimientos
