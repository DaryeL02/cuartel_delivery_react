import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'

const HistorialPrecios = ({ historial }) => {
  return (
    <div className="table-responsive" style={{ minHeight: '450px' }}>
      <CTable align="middle" className="mb-0 border-0" hover responsive>
        <CTableHead className="table-theme-header text-nowrap fw-bold">
          <CTableRow>
            <CTableHeaderCell className="border-0 ps-4" style={{ width: '18%' }}>
              Fecha y Hora
            </CTableHeaderCell>
            <CTableHeaderCell className="border-0" style={{ width: '17%' }}>
              Usuario Responsable
            </CTableHeaderCell>
            <CTableHeaderCell className="border-0" style={{ width: '25%' }}>
              Menú / Producto
            </CTableHeaderCell>
            <CTableHeaderCell className="border-0" style={{ width: '18%' }}>
              Tipo de Movimiento
            </CTableHeaderCell>
            <CTableHeaderCell className="border-0 pe-4" style={{ width: '22%' }}>
              Detalle / Variación
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {historial.map((log) => (
            <CTableRow key={log.id_historial} style={{ height: '54px' }}>
              <CTableDataCell className="ps-4 text-body-secondary text-nowrap">
                {log.fecha_hora}
              </CTableDataCell>
              <CTableDataCell>
                <CBadge color="dark" shape="rounded-pill">
                  {log.usuario}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell className="fw-semibold text-body">
                {log.menu_nombre}
              </CTableDataCell>
              <CTableDataCell className="text-body-secondary">
                {log.tipo_cambio}
              </CTableDataCell>
              <CTableDataCell className="pe-4 fw-medium text-body">
                {log.detalle}
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default HistorialPrecios