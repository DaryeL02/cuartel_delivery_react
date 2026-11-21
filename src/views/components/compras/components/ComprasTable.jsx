import React, { useMemo } from 'react'
import {
  CBadge,
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
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { formatCurrency } from '../utils/compras'

const ComprasTable = ({
  compras,
  loading,
  saving,
  searchTerm,
  onSearchChange,
  onCreate,
  onDelete,
  canCreate,
}) => {
  const filteredCompras = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return compras

    return compras.filter((compra) => {
      const proveedor = compra.proveedor_data?.nombre || ''
      const pagos = `${compra.monto_efectivo || ''} ${compra.monto_transferencia || ''} ${
        compra.metodo_data?.nombre || ''
      }`
      const insumos = (compra.detalles || [])
        .map((detalle) => detalle.insumo_data?.nombre || '')
        .join(' ')
      return `${compra.id_compras} ${proveedor} ${pagos} ${insumos}`.toLowerCase().includes(search)
    })
  }, [compras, searchTerm])

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h5 className="mb-0">Compras de insumos</h5>
          <small className="text-body-secondary">
            Registra compras y sus pagos en efectivo o transferencia.
          </small>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <CFormInput
            type="search"
            placeholder="Buscar compra..."
            aria-label="Buscar compra"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <CButton
            color="primary"
            className="d-flex align-items-center gap-2 text-nowrap"
            onClick={onCreate}
            disabled={!canCreate}
          >
            <CIcon icon={cilPlus} />
            Nueva compra
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody className="px-0 py-0">
        <div className="table-responsive">
          <CTable align="middle" hover responsive className="mb-0">
            <CTableHead className="text-nowrap bg-light">
              <CTableRow>
                <CTableHeaderCell className="text-center">N°</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Proveedor</CTableHeaderCell>
                <CTableHeaderCell>Pagos</CTableHeaderCell>
                <CTableHeaderCell>Insumos</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {loading ? (
                <CTableRow>
                  <CTableDataCell colSpan={7} className="py-4 text-center text-body-secondary">
                    Cargando compras...
                  </CTableDataCell>
                </CTableRow>
              ) : filteredCompras.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={7} className="py-4 text-center text-body-secondary">
                    {searchTerm
                      ? 'No hay compras que coincidan con la búsqueda.'
                      : 'Todavía no hay compras registradas.'}
                  </CTableDataCell>
                </CTableRow>
              ) : (
                filteredCompras.map((compra) => (
                  <CTableRow key={compra.id_compras}>
                    <CTableDataCell className="text-center fw-semibold">
                      #{compra.id_compras}
                    </CTableDataCell>
                    <CTableDataCell className="text-nowrap">
                      {compra.fecha_hora_creacion
                        ? new Date(compra.fecha_hora_creacion).toLocaleString('es-AR')
                        : '—'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {compra.proveedor_data?.nombre || 'Sin proveedor'}
                    </CTableDataCell>
                    <CTableDataCell className="text-nowrap">
                      {Number(compra.monto_efectivo) > 0 ||
                      Number(compra.monto_transferencia) > 0 ? (
                        <>
                          {Number(compra.monto_efectivo) > 0 && (
                            <div>Efectivo: {formatCurrency(compra.monto_efectivo)}</div>
                          )}
                          {Number(compra.monto_transferencia) > 0 && (
                            <div>Transferencia: {formatCurrency(compra.monto_transferencia)}</div>
                          )}
                        </>
                      ) : (
                        compra.metodo_data?.nombre || 'Sin pagos'
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex flex-wrap gap-1">
                        {(compra.detalles || []).map((detalle) => (
                          <CBadge
                            color="secondary"
                            key={detalle.id_detalles_compras}
                            title={`Subtotal: ${formatCurrency(detalle.subtotal)}`}
                          >
                            {detalle.insumo_data?.nombre || `Insumo #${detalle.insumo}`} ×{' '}
                            {detalle.cantidad}
                          </CBadge>
                        ))}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end text-nowrap fw-semibold">
                      {formatCurrency(compra.precio_total)}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        color="danger"
                        variant="ghost"
                        size="sm"
                        aria-label={`Eliminar compra ${compra.id_compras}`}
                        onClick={() => onDelete(compra)}
                        disabled={saving}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </div>
      </CCardBody>

      <div className="border-top bg-white px-4 py-3 small text-body-secondary">
        Mostrando {filteredCompras.length} {filteredCompras.length === 1 ? 'compra' : 'compras'}
      </div>
    </CCard>
  )
}

export default ComprasTable
