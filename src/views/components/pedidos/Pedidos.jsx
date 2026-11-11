import React, { useState } from 'react'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilListRich,
  cilPlus,
  cilClock,
  cilCheckCircle,
  cilTrash,
  cilFastfood,
  cilUser,
  cilLocationPin,
} from '@coreui/icons'

const Pedidos = () => {
  // Modal para Nuevo Pedido
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false)
  
  // Modal para Ver Detalle del Pedido
  const [modalDetalle, setModalDetalle] = useState(false)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  // Función placeholder para abrir el modal de detalle con la información del pedido
  const handleVerDetalle = (pedido) => {
    setPedidoSeleccionado(pedido)
    setModalDetalle(true)
  }

  return (
    <CRow>
      {/* CABECERA Y ACCIÓN RÁPIDA */}
      <CCol xs={12} className="mb-4">
        <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm border">
          <div>
            <h4 className="mb-1 text-primary fw-bold">
              <CIcon icon={cilListRich} className="me-2" />
              Gestión de Pedidos y Comandas
            </h4>
            <p className="text-muted small mb-0">
              Administra el flujo de pedidos (DER: <code>PEDIDOS</code> y <code>DETALLES DE PEDIDO</code>).
            </p>
          </div>
          <CButton color="primary" onClick={() => setModalNuevoPedido(true)}>
            <CIcon icon={cilPlus} className="me-1" /> Nuevo Pedido
          </CButton>
        </div>
      </CCol>

      {/* SECCIÓN PRINCIPAL: Tabla de Pedidos Activos */}
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-light fw-bold">
            Listado de Pedidos Activos
          </CCardHeader>
          <CCardBody>
            <CTable align="middle" responsive hover bordered>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#ID Pedido</CTableHeaderCell>
                  <CTableHeaderCell>
                    <CIcon icon={cilUser} className="me-1" /> Cliente
                  </CTableHeaderCell>
                  <CTableHeaderCell>
                    <CIcon icon={cilLocationPin} className="me-1" /> Dirección / Mesa
                  </CTableHeaderCell>
                  <CTableHeaderCell>Resumen Ítems</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Total Est.</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Estado (DER)</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {/* Pedido 1 */}
                <CTableRow>
                  <CTableDataCell className="fw-bold">#501</CTableDataCell>
                  <CTableDataCell>Juan Pérez</CTableDataCell>
                  <CTableDataCell className="text-muted">Mesa 4</CTableDataCell>
                  <CTableDataCell className="small">2 productos (Hamburguesa, Gaseosa)</CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$5.800,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge color="warning" shape="rounded-pill">
                      <CIcon icon={cilClock} className="me-1" /> En Proceso
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      variant="ghost"
                      className="me-1 text-white bg-info-subtle"
                      onClick={() => handleVerDetalle({ id: 501, cliente: 'Juan Pérez', ubicacion: 'Mesa 4', estado: 'En Proceso', total: '$5.800,00' })}
                      title="Ver Detalle"
                    >
                      <CIcon icon={cilTrash} className="me-1" /> Detalle
                    </CButton>
                    <CButton color="success" size="sm" variant="outline">
                      <CIcon icon={cilCheckCircle} className="me-1" /> Completar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>

                {/* Pedido 2 */}
                <CTableRow>
                  <CTableDataCell className="fw-bold">#502</CTableDataCell>
                  <CTableDataCell>Sofía Martínez</CTableDataCell>
                  <CTableDataCell className="text-muted">Delivery / Domicilio</CTableDataCell>
                  <CTableDataCell className="small">3 productos (Papas, Cervezas)</CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$4.200,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge color="info" shape="rounded-pill">
                      Generado
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      variant="ghost"
                      className="me-1 text-white bg-info-subtle"
                      onClick={() => handleVerDetalle({ id: 502, cliente: 'Sofía Martínez', ubicacion: 'Delivery', estado: 'Generado', total: '$4.200,00' })}
                      title="Ver Detalle"
                    >
                      <CIcon icon={cilTrash} className="me-1" /> Detalle
                    </CButton>
                    <CButton color="success" size="sm" variant="outline">
                      <CIcon icon={cilCheckCircle} className="me-1" /> Completar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* MODAL 1: NUEVO PEDIDO */}
      <CModal visible={modalNuevoPedido} onClose={() => setModalNuevoPedido(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilFastfood} className="me-2" />
            Crear Nuevo Pedido (Comanda)
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormInput label="Nombre del Cliente" placeholder="Ej: Carlos Ruiz" />
              </CCol>
              <CCol md={6}>
                <CFormInput label="Dirección / Mesa" placeholder="Ej: Mesa 2 o Av. Libertador 123" />
              </CCol>
            </CRow>

            <hr className="my-3" />
            <h6 className="fw-bold text-secondary mb-3">Agregar Productos al Pedido</h6>

            <CRow className="g-2 align-items-end mb-3">
              <CCol md={7}>
                <CFormSelect label="Seleccionar Producto">
                  <option value="">Seleccione...</option>
                  <option value="1">Hamburguesa Doble ($2.500,00)</option>
                  <option value="2">Papas Fritas Grandes ($1.200,00)</option>
                  <option value="3">Gaseosa 500ml ($800,00)</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormInput type="number" label="Cantidad" defaultValue={1} min={1} />
              </CCol>
              <CCol md={2}>
                <CButton color="primary" className="w-100">
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            <CTable small responsive hover bordered className="mt-3">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Producto</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell>Hamburguesa Doble</CTableDataCell>
                  <CTableDataCell className="text-center">1</CTableDataCell>
                  <CTableDataCell className="text-end">$2.500,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="danger" variant="ghost" size="sm">
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setModalNuevoPedido(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={() => setModalNuevoPedido(false)}>
            Guardar y Generar Pedido
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL 2: VER DETALLE DEL PEDIDO (DETALLES DE PEDIDO) */}
      <CModal visible={modalDetalle} onClose={() => setModalDetalle(false)} size="lg">
        <CModalHeader className="bg-light">
          <CModalTitle className="fw-bold">
            <CIcon icon={cilTrash} className="me-2 text-info" />
            Detalle del Pedido #{pedidoSeleccionado?.id}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {pedidoSeleccionado && (
            <>
              {/* Información general del pedido (PEDIDOS) */}
              <div className="p-3 bg-light rounded mb-3 border">
                <CRow>
                  <CCol md={4}>
                    <span className="text-muted small d-block">Cliente</span>
                    <strong className="fs-6">{pedidoSeleccionado.cliente}</strong>
                  </CCol>
                  <CCol md={4}>
                    <span className="text-muted small d-block">Ubicación / Mesa</span>
                    <strong>{pedidoSeleccionado.ubicacion}</strong>
                  </CCol>
                  <CCol md={4}>
                    <span className="text-muted small d-block">Estado Actual</span>
                    <CBadge color="warning" className="mt-1">
                      {pedidoSeleccionado.estado}
                    </CBadge>
                  </CCol>
                </CRow>
              </div>

              {/* Tabla desglosada (DETALLES DE PEDIDO) */}
              <h6 className="fw-bold mb-2">Ítems del Pedido</h6>
              <CTable responsive align="middle" bordered hover>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>#ID Producto</CTableHeaderCell>
                    <CTableHeaderCell>Descripción / Nombre</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cantidad</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Precio Unitario</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell>#10</CTableDataCell>
                    <CTableDataCell>Hamburguesa Doble</CTableDataCell>
                    <CTableDataCell className="text-center">2</CTableDataCell>
                    <CTableDataCell className="text-end">$2.500,00</CTableDataCell>
                    <CTableDataCell className="text-end fw-bold">$5.000,00</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>#15</CTableDataCell>
                    <CTableDataCell>Gaseosa 500ml</CTableDataCell>
                    <CTableDataCell className="text-center">1</CTableDataCell>
                    <CTableDataCell className="text-end">$800,00</CTableDataCell>
                    <CTableDataCell className="text-end fw-bold">$800,00</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>

              {/* Resumen Total */}
              <div className="d-flex justify-content-end align-items-center mt-3 p-2 bg-light rounded">
                <span className="me-3 text-muted">Total Estimado del Pedido:</span>
                <h4 className="text-primary mb-0 fw-bold">{pedidoSeleccionado.total}</h4>
              </div>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDetalle(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Pedidos