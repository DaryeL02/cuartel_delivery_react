import React from 'react'
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCart,
  cilDollar,
  cilPlus,
  cilTrash,
  cilFindInPage,
  cilPrint,
  cilWallet,
} from '@coreui/icons'

const Ventas = () => {
  return (
    <CRow>
      {/* COLUMNA IZQUIERDA: Terminal de Venta / Caja */}
      <CCol xs={12} lg={7}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-primary text-white d-flex align-items-center justify-content-between py-3">
            <strong className="d-flex align-items-center fs-5">
              <CIcon icon={cilCart} className="me-2" />
              Terminal de Venta
            </strong>

            {/* Dropdown de Caja (Relación CAJAS -> MOVIMIENTOS DE CAJA) */}
            <CDropdown variant="btn-group">
              <CDropdownToggle color="light" size="sm" className="text-primary fw-bold">
                Caja #1 (Abierta)
              </CDropdownToggle>
              <CDropdownMenu placement="bottom-end">
                <CDropdownItem component="button" type="button" active>
                  Caja #1 (Abierta - Principal)
                </CDropdownItem>
                <CDropdownItem component="button" type="button">
                  Caja #2 (Abierta - TakeAway)
                </CDropdownItem>
                <CDropdownDivider />
                <CDropdownItem component="button" type="button" disabled>
                  Caja #3 (Cerrada)
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>

          <CCardBody>
            <CForm>
              {/* Opción 1: Cargar Pedido Finalizado desde la sección de Pedidos */}
              <div className="p-3 mb-3 bg-light border rounded">
                <label htmlFor="importarPedido" className="form-label fw-bold text-secondary">
                  <CIcon icon={cilFindInPage} className="me-1" /> Importar Pedido Completado
                </label>
                <CInputGroup>
                  <CFormSelect id="importarPedido">
                    <option value="">-- Seleccionar pedido para facturar --</option>
                    <option value="501">Pedido #501 - Cliente: Juan Pérez ($5.800,00)</option>
                    <option value="503">Pedido #503 - Cliente: Ana Gómez ($3.200,00)</option>
                  </CFormSelect>
                  <CButton type="button" color="secondary" variant="outline">
                    Cargar
                  </CButton>
                </CInputGroup>
              </div>

              {/* Opción 2: Venta Directa por Mostrador (Agregar Ítems) */}
              <CRow className="g-2 mb-3">
                <CCol md={6}>
                  <CFormSelect id="selectProducto" label="Producto Directo">
                    <option value="">Seleccione producto...</option>
                    <option value="1">Hamburguesa Doble ($2.500,00)</option>
                    <option value="2">Papas Fritas Grandes ($1.200,00)</option>
                    <option value="3">Gaseosa 500ml ($800,00)</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormInput type="number" id="cantidad" label="Cantidad" defaultValue={1} min={1} />
                </CCol>
                <CCol md={3} className="d-flex align-items-end">
                  <CButton color="primary" className="w-100">
                    <CIcon icon={cilPlus} /> Agregar
                  </CButton>
                </CCol>
              </CRow>

              {/* Detalle de la Venta (DETALLES DE VENTA) */}
              <h6 className="mt-4 mb-2 fw-bold text-dark">Detalle del Comprobante</h6>
              <CTable responsive align="middle" hover bordered>
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
                  <CTableRow>
                    <CTableDataCell>Hamburguesa Doble</CTableDataCell>
                    <CTableDataCell className="text-center">2</CTableDataCell>
                    <CTableDataCell className="text-end">$2.500,00</CTableDataCell>
                    <CTableDataCell className="text-end">$5.000,00</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton color="danger" variant="ghost" size="sm">
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>Gaseosa 500ml</CTableDataCell>
                    <CTableDataCell className="text-center">1</CTableDataCell>
                    <CTableDataCell className="text-end">$800,00</CTableDataCell>
                    <CTableDataCell className="text-end">$800,00</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton color="danger" variant="ghost" size="sm">
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>

              {/* Selección de Método de Pago y Total (METODOS DE PAGO / VENTAS) */}
              <div className="p-3 border rounded bg-light mt-4">
                <CRow className="align-items-center">
                  <CCol md={6}>
                    <CFormSelect id="selectMetodoPago" label="Método de Pago" className="fw-bold">
                      <option value="1">Efectivo</option>
                      <option value="2">Tarjeta de Débito</option>
                      <option value="3">Tarjeta de Crédito</option>
                      <option value="4">Transferencia MP</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="text-end">
                    <span className="d-block text-muted small uppercase fw-bold">Total a Cobrar</span>
                    <h2 className="text-success fw-bolder mb-0">$5.800,00</h2>
                  </CCol>
                </CRow>
              </div>

              {/* Botón Principal de Confirmación */}
              <div className="d-grid gap-2 mt-4">
                <CButton color="success" size="lg" className="text-white py-3 fw-bold">
                  <CIcon icon={cilDollar} className="me-2" />
                  Procesar Venta e Imprimir Ticket
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* COLUMNA DERECHA: Historial de Ventas y Balance Rápido de Caja */}
      <CCol xs={12} lg={5}>
        {/* Resumen Caja del Turno */}
        <CCard className="mb-4 shadow-sm border-top-info border-top-3">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold">
                <CIcon icon={cilWallet} className="me-1" /> Total Recaudado (Turno Activo)
              </span>
              <CBadge color="info">Caja #1</CBadge>
            </div>
            <h3 className="text-primary fw-bold mb-0">$45.800,00</h3>
          </CCardBody>
        </CCard>

        {/* Historial de Ventas emitidas (Tabla VENTAS) */}
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Últimas Ventas Registradas</strong>
            <CButton color="link" size="sm" className="text-decoration-none">Ver todas</CButton>
          </CCardHeader>
          <CCardBody>
            <CTable align="middle" responsive hover>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#ID Venta</CTableHeaderCell>
                  <CTableHeaderCell>Pago</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ticket</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell className="fw-bold">#1024</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">Efectivo</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$3.700,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm">
                      <CIcon icon={cilPrint} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="fw-bold">#1023</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="secondary">Débito</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$8.500,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm">
                      <CIcon icon={cilPrint} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="fw-bold">#1022</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="warning">Transferencia</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$2.100,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm">
                      <CIcon icon={cilPrint} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Ventas
