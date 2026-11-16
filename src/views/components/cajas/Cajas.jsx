import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CBadge,
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
  const [usuarios, setUsuarios] = useState([]);
  const [locales, setLocales] = useState([]);
  const [cajaACerrar, setCajaACerrar] = useState(null);

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
      const respuesta = await api.get('/api/cajas/?date=today&status=active', {
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

  const cargarUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await api.get('/api/usuarios/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUsuarios(respuesta.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      notificar('error', 'Error al cargar los usuarios.');
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

  useEffect(() => {
    cargarCajas();
    cargarUsuarios();
    cargarLocales();
  }, []);

  return (
    <div className="p-3">
      {/* SECCIÓN SUPERIOR: BOTÓN SIEMPRE DISPONIBLE PARA ABRIR OTRA CAJA */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="m-0 fw-bold text-body-secondary">Cajas</h4>
        <CButton color="success" onClick={() => setModalNuevaCajaOpen(true)}>
          + Abrir Nueva Caja
        </CButton>
      </div>

      {/* RENDERIZADO DINÁMICO DE TODAS LAS CAJAS EN EL SISTEMA */}
      {listaCajas.length === 0 ? (
        <CCard className="text-center p-5 shadow-sm border-dashed">
          <CCardBody>
            <p className="text-body-secondary fs-5">No hay cajas creadas en este turno.</p>
            <CButton color="success" size="lg" onClick={() => setModalNuevaCajaOpen(true)}>
              Iniciar Primera Apertura
            </CButton>
          </CCardBody>
        </CCard>
      ) : (
        listaCajas.map((itemCaja) => {
          return (
            <CCard
              key={itemCaja.id_cajas}
              className="mb-4 shadow-sm border-start border-start-4 border-start-primary"
            >
              <CCardHeader className="d-flex justify-content-between align-items-center bg-body-secondary">
                <div>
                  <strong className="fs-5 text-body">Caja ID: #{itemCaja.id_cajas}</strong>
                </div>
                <CBadge color={itemCaja.estado ? 'success' : 'secondary'} shape="rounded-pill">
                  {itemCaja.estado ? 'ACTIVA / ABIERTA' : 'CERRADA'}
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
                    {itemCaja.estado ? (
                      <>
                        <CButton color="primary" size="sm" disabled onClick={() => {}}>
                          + Movimiento
                        </CButton>
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCajaACerrar(itemCaja.id_cajas);
                            setModalCerrarCajaOpen(true);
                          }}
                        >
                          Cerrar esta Caja
                        </CButton>
                      </>
                    ) : (
                      <span className="text-success small fw-bold">Arqueo Finalizado con Éxito</span>
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
        usuarios={usuarios}
        locales={locales}
        onSuccess={cargarCajas}
      />
      <CerrarCaja
        visible={modalCerrarCajaOpen}
        onClose={() => setModalCerrarCajaOpen(false)}
        caja={cajaACerrar}
        onSuccess={cargarCajas}
      />
    </div>
  );
}
