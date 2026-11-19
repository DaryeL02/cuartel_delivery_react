import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTooltip,
  CRow,
  CCol,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { toast } from 'react-toastify';
import api from '../api/api';
import CerrarCaja from './ModalCerrarCaja';
import NuevaCaja from './ModalNuevaCaja';

export default function Cajas() {
  // --- Estado para múltiples cajas concurrentes (Colección de la tabla CAJAS) ---
  const [listaCajas, setListaCajas] = useState([]);
  const [modalNuevaCajaOpen, setModalNuevaCajaOpen] = useState(false);
  const [modalCerrarCajaOpen, setModalCerrarCajaOpen] = useState(false);
  const [locales, setLocales] = useState([]);
  const [cajaACerrar, setCajaACerrar] = useState(null);
  const [cajaHistorial, setCajaHistorial] = useState(null);
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');
  const rolesActuales = usuarioActual.roles_nombres || [usuarioActual.rol_nombre];
  const puedeAbrirCaja = rolesActuales.some((rol) =>
    ['dueño', 'dueno', 'administrador'].includes((rol || '').toLocaleLowerCase())
  );

  const notificar = (tipo, mensaje) => {
    switch (tipo) {
      case 'exito':
        toast.success(mensaje);
        break;
      case 'error':
        toast.error(mensaje);
        break;
      case 'advertencia':
        toast.warning(mensaje);
        break;
      default:
        toast(mensaje);
    }
  };

  const cargarCajas = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await api.get('/api/cajas/?date=today', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setListaCajas(respuesta.data);
    } catch (error) {
      console.error('Error al cargar cajas:', error);
      notificar('error', 'Error al cargar el listado de cajas.');
    }
  };

  const cargarLocales = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await api.get('/api/locales/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setLocales(respuesta.data);
    } catch (error) {
      console.error('Error al cargar locales:', error);
      notificar('error', 'Error al cargar los locales.');
    }
  };

  const verMovimientos = async (caja) => {
    setCajaHistorial(caja);
    setMovimientosCaja([]);
    setCargandoMovimientos(true);
    try {
      const respuesta = await api.get('/api/movimientos-caja/', {
        params: { caja: caja.id_cajas },
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      setMovimientosCaja(
        Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [],
      );
    } catch (error) {
      console.error('Error al cargar los movimientos de caja:', error);
      notificar('error', error.response?.data?.detail || 'No se pudieron cargar los movimientos.');
      setCajaHistorial(null);
    } finally {
      setCargandoMovimientos(false);
    }
  };

  useEffect(() => {
    cargarCajas();
    cargarLocales();
  }, []);

  return (
    <div className="p-3">
      {/* SECCIÓN SUPERIOR: BOTÓN SIEMPRE DISPONIBLE PARA ABRIR OTRA CAJA */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="m-0 fw-bold text-body-secondary">Cajas</h4>
        <CTooltip
          content={
            !puedeAbrirCaja
              ? 'Requiere permisos de Administrador o Dueño para abrir una caja'
              : 'Abrir una nueva caja'
          }
          placement="left"
        >
          <span className="d-inline-block" tabIndex={0}>
            <CButton
              color="success"
              onClick={() => setModalNuevaCajaOpen(true)}
              disabled={!puedeAbrirCaja}
              style={!puedeAbrirCaja ? { pointerEvents: 'none' } : undefined}
            >
              + Abrir Nueva Caja
            </CButton>
          </span>
        </CTooltip>
      </div>

      {/* RENDERIZADO DINÁMICO DE TODAS LAS CAJAS EN EL SISTEMA */}
      {listaCajas.length === 0 ? (
        <CCard className="text-center p-5 shadow-sm border-dashed">
          <CCardBody>
            <p className="text-body-secondary fs-5">No hay cajas creadas en este turno.</p>
            <CTooltip
              content={
                !puedeAbrirCaja
                  ? 'Requiere permisos de Administrador o Dueño para abrir una caja'
                  : 'Iniciar la primera apertura del turno'
              }
              placement="top"
            >
              <span className="d-inline-block" tabIndex={0}>
                <CButton
                  color="success"
                  size="lg"
                  onClick={() => setModalNuevaCajaOpen(true)}
                  disabled={!puedeAbrirCaja}
                  style={!puedeAbrirCaja ? { pointerEvents: 'none' } : undefined}
                >
                  Iniciar Primera Apertura
                </CButton>
              </span>
            </CTooltip>
          </CCardBody>
        </CCard>
      ) : (
        listaCajas.map((itemCaja) => {
          const cajaAbierta = itemCaja.estado || !itemCaja.fecha_hora_cierre;
          return (
            <CCard
              key={itemCaja.id_cajas}
              className="mb-4 shadow-sm border-start border-start-4 border-start-primary"
            >
              <CCardHeader className="d-flex justify-content-between align-items-center bg-body-secondary">
                <div>
                  <strong className="fs-5 text-body">Caja ID: #{itemCaja.id_cajas}</strong>
                  <div className="small text-body-secondary">
                    Responsable: {itemCaja.empleado_detalle
                      ? `${itemCaja.empleado_detalle.nombre} ${itemCaja.empleado_detalle.apellido}`
                      : itemCaja.usuario_nombre}
                  </div>
                </div>
                <CBadge color={cajaAbierta ? 'success' : 'secondary'} shape="rounded-pill">
                  {cajaAbierta ? 'ACTIVA / ABIERTA' : 'CERRADA'}
                </CBadge>
              </CCardHeader>

              <CCardBody>
                <CRow className="mb-3 text-center align-items-center">
                  <CCol sm={6} md={3} className="border-end">
                    <div className="text-body-secondary small uppercase fw-bold">Monto Apertura</div>
                    <div className="fs-5 fw-semibold text-body-secondary">
                      ${itemCaja.monto_apertura ? Number(itemCaja.monto_apertura).toFixed(2) : '0.00'}
                    </div>
                  </CCol>
                  <CCol sm={6} md={3} className="border-end">
                    <div className="text-body-secondary small uppercase fw-bold">Saldo en Sistema</div>
                    <div className="fs-5 fw-semibold text-primary">
                      ${Number(itemCaja.saldo_esperado || 0).toFixed(2)}
                    </div>
                  </CCol>
                  <CCol sm={6} md={3} className="border-end">
                    <div className="text-body-secondary small uppercase fw-bold">Apertura Registrada</div>
                    <div className="small fw-semibold">
                      {new Date(itemCaja.fecha_hora_apertura).toLocaleString()}
                    </div>
                  </CCol>
                  <CCol sm={6} md={3}>
                    <div className="text-body-secondary small uppercase fw-bold">Cierre Registrado</div>
                    <div className="small fw-semibold text-danger">
                      {itemCaja.fecha_hora_cierre
                        ? new Date(itemCaja.fecha_hora_cierre).toLocaleString()
                        : 'En ejecución...'}
                    </div>
                  </CCol>
                </CRow>

                {/* ACCIONES ESPECÍFICAS DE ESTA CAJA */}
                <div className="d-flex gap-2 justify-content-between align-items-center pt-2 border-top">
                  <div className="small text-body-secondary"></div>
                  <div className="d-flex gap-2">
                    {cajaAbierta ? (
                      <>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => verMovimientos(itemCaja)}
                        >
                          Ver Movimientos
                        </CButton>
                        <CButton color="primary" size="sm" disabled onClick={() => {}}>
                          + Movimiento
                        </CButton>
                        {itemCaja.es_mia ? (
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCajaACerrar(itemCaja);
                              setModalCerrarCajaOpen(true);
                            }}
                          >
                            Cerrar esta Caja
                          </CButton>
                        ) : (
                          <CButton color="danger" variant="outline" size="sm" disabled>
                            Caja asignada a otro usuario
                          </CButton>
                        )}
                      </>
                    ) : (
                      <>
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          onClick={() => verMovimientos(itemCaja)}
                        >
                          Ver Movimientos
                        </CButton>
                        <span className="text-success small fw-bold">Arqueo Finalizado con Éxito</span>
                      </>
                    )}
                  </div>
                </div>
              </CCardBody>
            </CCard>
          );
        })
      )}

      <NuevaCaja
        visible={modalNuevaCajaOpen}
        onClose={() => setModalNuevaCajaOpen(false)}
        locales={locales}
        cajasAbiertas={listaCajas.filter((item) => item.estado || !item.fecha_hora_cierre)}
        onSuccess={cargarCajas}
      />
      <CerrarCaja
        visible={modalCerrarCajaOpen}
        onClose={() => setModalCerrarCajaOpen(false)}
        caja={cajaACerrar}
        onSuccess={cargarCajas}
      />
      <CModal visible={!!cajaHistorial} onClose={() => setCajaHistorial(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Movimientos de Caja #{cajaHistorial?.id_cajas}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {cargandoMovimientos ? (
            <p className="text-center text-body-secondary mb-0">Cargando movimientos...</p>
          ) : movimientosCaja.length ? (
            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Concepto</CTableHeaderCell>
                  <CTableHeaderCell>Referencia</CTableHeaderCell>
                  <CTableHeaderCell>Responsable</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Monto</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {movimientosCaja.map((movimiento) => (
                  <CTableRow key={movimiento.id_movimientos}>
                    <CTableDataCell>
                      {new Date(movimiento.fecha_hora_creacion).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>{movimiento.tipo_movimiento}</CTableDataCell>
                    <CTableDataCell>{movimiento.concepto}</CTableDataCell>
                    <CTableDataCell>
                      {movimiento.venta_id
                        ? `Venta #${movimiento.venta_id}`
                        : movimiento.compra_id
                          ? `Compra #${movimiento.compra_id}`
                          : '-'}
                    </CTableDataCell>
                    <CTableDataCell>{movimiento.caja_usuario || '-'}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      ${Number(movimiento.monto || 0).toFixed(2)}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <p className="text-center text-body-secondary mb-0">No hay movimientos registrados.</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setCajaHistorial(null)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
