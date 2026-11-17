import React, { useState } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CFormSelect
} from '@coreui/react';

// Datos estáticos basados en los requerimientos del proyecto "El Cuartel Delivery"
const initialPendingOrders = [
  { id: '1024', cliente: 'Matías Velazquez', productos: '1x Sándwich de Milanesa Completo, 1x Papas Fritas', total: 8500 },
  { id: '1025', cliente: 'Daniel Colque', productos: '2x Lomito Especial', total: 14000 },
  { id: '1026', cliente: 'Karen Zalazar', productos: '1x Hamburguesa de la Casa, 1x Gaseosa 500ml', total: 7200 }
];

const initialSalesHistory = [
  { id: 'V-501', pedidoId: '1021', cliente: 'Eduardo Flores', total: 9500, metodoPago: 'Efectivo', hora: '21:15' },
  { id: 'V-502', pedidoId: '1022', cliente: 'Brisa Cardozo', total: 6800, metodoPago: 'Transferencia', hora: '21:30' },
  { id: 'V-503', pedidoId: '1023', cliente: 'Martín Ramos', total: 12500, metodoPago: 'Tarjeta', hora: '21:45' }
];

export default function Menus() {
  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);
  const [salesHistory, setSalesHistory] = useState(initialSalesHistory);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState({});

  const handlePaymentMethodChange = (orderId, value) => {
    setSelectedPaymentMethods(prev => ({ ...prev, [orderId]: value }));
  };

  // Lógica operativa del Proceso N°3 (Gestionar Ventas) del documento
  const handleConfirmSale = (order) => {
    const metodoPago = selectedPaymentMethods[order.id];
    if (!metodoPago) {
      alert('Por favor, seleccione un método de pago antes de confirmar la venta.');
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSale = {
      id: `V-${salesHistory.length + 501}`,
      pedidoId: order.id,
      cliente: order.cliente,
      total: order.total,
      metodoPago: metodoPago,
      hora: currentTime
    };

    setSalesHistory([newSale, ...salesHistory]);
    setPendingOrders(pendingOrders.filter(item => item.id !== order.id));
    
    const updatedMethods = { ...selectedPaymentMethods };
    delete updatedMethods[order.id];
    setSelectedPaymentMethods(updatedMethods);
  };

  const totalSalesAmount = salesHistory.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="fade-in">
      {/* Indicadores numéricos superiores basados en CoreUI widgets */}
      <CRow className="mb-4">
        <CCol xs={12} sm={6} lg={4}>
          <CCard className="text-white bg-dark">
            <CCardBody className="pb-3 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-4 fw-semibold">${totalSalesAmount.toLocaleString('es-AR')}</div>
                <div>Total Recaudado (Ventas del Día)</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={6} lg={4}>
          <CCard className="text-white bg-warning">
            <CCardBody className="pb-3 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-4 fw-semibold">{pendingOrders.length}</div>
                <div>Pedidos Entregados por Facturar</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} sm={6} lg={4}>
          <CCard className="text-white bg-success">
            <CCardBody className="pb-3 d-flex justify-content-between align-items-start">
              <div>
                <div className="fs-4 fw-semibold">{salesHistory.length}</div>
                <div>Ventas Registradas Hoy</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        {/* Panel Principal Izquierdo: Control de comandas entregadas por cobrar */}
        <CCol xs={12} lg={7} className="mb-4">
          <CCard className="h-100">
            <CCardHeader className="bg-light fw-bold text-uppercase">
              📥 Pedidos Entregados Pendientes de Cobro
            </CCardHeader>
            <CCardBody>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No hay pedidos pendientes de facturación en este momento.
                </div>
              ) : (
                <CTable align="middle" responsive hover>
                  <CTableHead className="bg-light">
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '10%' }}>Pedido</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '40%' }}>Detalle / Cliente</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '25%' }}>Método de Pago</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '25%' }} className="text-end">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {pendingOrders.map((order) => (
                      <CTableRow key={order.id}>
                        <CTableDataCell><span className="fw-semibold">#{order.id}</span></CTableDataCell>
                        <CTableDataCell>
                          <div className="small text-muted mb-1">{order.cliente}</div>
                          <div className="fw-normal">{order.productos}</div>
                          <div className="mt-1 fw-bold text-success">${order.total.toLocaleString('es-AR')}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormSelect 
                            size="sm"
                            value={selectedPaymentMethods[order.id] || ''}
                            onChange={(e) => handlePaymentMethodChange(order.id, e.target.value)}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                          </CFormSelect>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          <CButton color="success" size="sm" className="text-white" onClick={() => handleConfirmSale(order)}>
                            Confirmar Venta
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Panel Secundario Derecho: Historial de auditoría rápida de ventas del día */}
        <CCol xs={12} lg={5} className="mb-4">
          <CCard className="h-100">
            <CCardHeader className="bg-light fw-bold text-uppercase">
              📋 Historial de Ventas del Turno
            </CCardHeader>
            <CCardBody>
              {salesHistory.length === 0 ? (
                <div className="text-center py-4 text-muted">Aún no se han registrado transacciones.</div>
              ) : (
                <CTable align="middle" responsive hover>
                  <CTableHead className="bg-light">
                    <CTableRow>
                      <CTableHeaderCell>Comprobante</CTableHeaderCell>
                      <CTableHeaderCell>Cliente / Hora</CTableHeaderCell>
                      <CTableHeaderCell>Pago</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Monto</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {salesHistory.map((sale) => (
                      <CTableRow key={sale.id}>
                        <CTableDataCell>
                          <div className="fw-semibold text-primary">{sale.id}</div>
                          <div className="small text-muted">Pedido #{sale.pedidoId}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>{sale.cliente}</div>
                          <div className="small text-muted">{sale.hora} hs</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={sale.metodoPago === 'Efectivo' ? 'success' : sale.metodoPago === 'Transferencia' ? 'info' : 'primary'}>
                            {sale.metodoPago}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-bold text-dark">${sale.total.toLocaleString('es-AR')}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
}
