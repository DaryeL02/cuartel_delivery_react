import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilPencil, cilTrash, cilFastfood, cilClock, cilCheckCircle } from '@coreui/icons';

const Pedidos = () => {
  // Estado para el listado de pedidos (Mock data)
  const [pedidos, setPedidos] = useState([
    { id: 101, cliente: 'Juan Pérez', detalle: '1x Lomito Completo, 1x Papas Fritas', total: 8500, estado: 'En Preparación', hora: '21:30' },
    { id: 102, cliente: 'María Gomez', detalle: '2x Milanesa TyC, 1x Coca-Cola 1.5L', total: 12400, estado: 'Pendiente', hora: '21:42' },
    { id: 103, cliente: 'Carlos López', detalle: '1x Hamburguesa Especial (sin cebolla)', total: 5200, estado: 'Listo para retirar', hora: '21:15' },
  ]);

  // Estados para el manejo del Modal (Crear / Editar)
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(false);
  const [pedidoActual, setPedidoActual] = useState({ id: '', cliente: '', detalle: '', total: '', estado: 'Pendiente' });

  // Abrir modal para nuevo pedido
  const handleNuevoPedido = () => {
    setEditando(false);
    setPedidoActual({ id: Date.now(), cliente: '', detalle: '', total: '', estado: 'Pendiente' });
    setModalVisible(true);
  };

  // Abrir modal para editar
  const handleEditarPedido = (pedido) => {
    setEditando(true);
    setPedidoActual(pedido);
    setModalVisible(true);
  };

  // Guardar pedido (Crear o Editar)
  const handleGuardar = (e) => {
    e.preventDefault();
    if (editando) {
      setPedidos(pedidos.map(p => p.id === pedidoActual.id ? pedidoActual : p));
    } else {
      const horaActual = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      setPedidos([...pedidos, { ...pedidoActual, hora: horaActual }]);
    }
    setModalVisible(false);
  };

  // Cancelar/Eliminar pedido
  const handleCancelarPedido = (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      setPedidos(pedidos.filter(p => p.id !== id));
    }
  };

  // Helper para el color de los Badges según el estado
  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'En Preparación': return 'info';
      case 'Listo para retirar': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* 1. Tarjetas de Resumen Rápido */}
      <CRow className="mb-4">
        <CCol sm={4}>
          <CCard className="text-white bg-warning mb-3">
            <CCardBody className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fs-4 fw-semibold">{pedidos.filter(p => p.estado === 'Pendiente').length}</div>
                <div>Nuevos / Pendientes</div>
              </div>
              <CIcon icon={cilClock} size="xl" />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-white bg-info mb-3">
            <CCardBody className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fs-4 fw-semibold">{pedidos.filter(p => p.estado === 'En Preparación').length}</div>
                <div>En Cocina</div>
              </div>
              <CIcon icon={cilFastfood} size="xl" />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard className="text-white bg-success mb-3">
            <CCardBody className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fs-4 fw-semibold">{pedidos.filter(p => p.estado === 'Listo para retirar').length}</div>
                <div>Listos para Despachar</div>
              </div>
              <CIcon icon={cilCheckCircle} size="xl" />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* 2. Sección Principal: Tabla de Pedidos */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-light">
              <strong className="text-uppercase">Panel de Pedidos Activos</strong>
              <CButton color="primary" onClick={handleNuevoPedido} className="d-flex align-items-center gap-2">
                <CIcon icon={cilPlus} /> Nuevo Pedido
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap bg-light">
                  <CTableRow>
                    <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
                    <CTableHeaderCell>Cliente</CTableHeaderCell>
                    <CTableHeaderCell>Detalle del Sandwich / Pedido</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Hora</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pedidos.map((pedido) => (
                    <CTableRow key={pedido.id}>
                      <CTableDataCell className="text-center fw-bold">{pedido.id}</CTableDataCell>
                      <CTableDataCell className="fw-semibold">{pedido.cliente}</CTableDataCell>
                      <CTableDataCell style={{ maxWidth: '300px' }}>{pedido.detalle}</CTableDataCell>
                      <CTableDataCell className="text-center text-muted">{pedido.hora}</CTableDataCell>
                      <CTableDataCell className="text-end fw-bold text-success">${pedido.total.toLocaleString()}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CBadge color={getBadgeColor(pedido.estado)} shape="rounded-pill" className="px-3 py-2">
                          {pedido.estado}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <CButton color="info" size="sm" variant="outline" onClick={() => handleEditarPedido(pedido)} title="Editar pedido">
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton color="danger" size="sm" variant="outline" onClick={() => handleCancelarPedido(pedido.id)} title="Cancelar pedido">
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* 3. Formulario Modal: Crear / Editar Pedido */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>{editando ? `Editar Pedido #${pedidoActual.id}` : 'Registrar Nuevo Pedido'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleGuardar}>
          <CModalBody>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormInput
                  label="Nombre del Cliente"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={pedidoActual.cliente}
                  onChange={(e) => setPedidoActual({ ...pedidoActual, cliente: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="Estado del Pedido"
                  value={pedidoActual.estado}
                  onChange={(e) => setPedidoActual({ ...pedidoActual, estado: e.target.value })}
                >
                  <option value="Pendiente">Pendiente (Caja)</option>
                  <option value="En Preparación">En Preparación (Cocina)</option>
                  <option value="Listo para retirar">Listo para retirar</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12}>
                <CFormTextarea
                  label="Detalle del Pedido (Sandwiches, agregados, bebidas, aclaraciones)"
                  rows={3}
                  placeholder="Ej. 1x Lomito Completo con huevo extra, sin cebolla. 1x Coca-Cola Zero."
                  value={pedidoActual.detalle}
                  onChange={(e) => setPedidoActual({ ...pedidoActual, detalle: e.target.value })}
                  required
                />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Monto Total</label>
                <CInputGroup>
                  <CInputGroupText>$</CInputGroupText>
                  <CFormInput
                    type="number"
                    placeholder="0.00"
                    value={pedidoActual.total}
                    onChange={(e) => setPedidoActual({ ...pedidoActual, total: Number(e.target.value) })}
                    required
                  />
                </CInputGroup>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="ghost" onClick={() => setModalVisible(false)}>
              Cerrar
            </CButton>
            <CButton color="primary" type="submit">
              {editando ? 'Guardar Cambios' : 'Confirmar Pedido'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  );
};

export default Pedidos;
