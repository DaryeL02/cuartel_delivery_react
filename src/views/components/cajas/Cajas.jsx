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
  CFormInput,
  CFormSelect,
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
  const [historialVisible, setHistorialVisible] = useState(false);
  const [historialCajas, setHistorialCajas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [fechaDesdeHistorial, setFechaDesdeHistorial] = useState('');
  const [fechaHastaHistorial, setFechaHastaHistorial] = useState('');
  const [locales, setLocales] = useState([]);
  const [cajaACerrar, setCajaACerrar] = useState(null);
  const [cajaHistorial, setCajaHistorial] = useState(null);
  const [volverAlHistorial, setVolverAlHistorial] = useState(false);
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);
  const [movimientoVisible, setMovimientoVisible] = useState(false);
  const [cajaMovimiento, setCajaMovimiento] = useState(null);
  const [movimiento, setMovimiento] = useState({
    tipo_movimiento: 'Ingreso',
    concepto: '',
    monto: '',
  });
  const [guardandoMovimiento, setGuardandoMovimiento] = useState(false);
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

  const cargarHistorial = async (filtros = {}) => {
    setCargandoHistorial(true);
    try {
      const respuesta = await api.get('/api/cajas/', {
        params: {
          fecha_desde: fechaDesdeHistorial || undefined,
          fecha_hasta: fechaHastaHistorial || undefined,
          ...filtros,
        },
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      setHistorialCajas(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || []);
    } catch (error) {
      console.error('Error al cargar el historial de cajas:', error);
      notificar('error', error.response?.data?.detail || 'No se pudo cargar el historial de cajas.');
    } finally {
      setCargandoHistorial(false);
    }
  };

  const filtrarHistorial = () => {
    if (
      fechaDesdeHistorial &&
      fechaHastaHistorial &&
      fechaDesdeHistorial > fechaHastaHistorial
    ) {
      notificar('advertencia', 'La fecha "Desde" no puede ser mayor que la fecha "Hasta".');
      return;
    }
    cargarHistorial();
  };

  const abrirHistorial = () => {
    setHistorialVisible(true);
    cargarHistorial();
  };

  const verMovimientos = async (caja, desdeHistorial = false) => {
    setHistorialVisible(false);
    setVolverAlHistorial(desdeHistorial);
    setMovimientosCaja([]);
    setCargandoMovimientos(true);
    try {
      const headers = { Authorization: `Token ${localStorage.getItem('token')}` };
      const [respuestaCaja, respuestaMovimientos] = await Promise.all([
        api.get(`/api/cajas/${caja.id_cajas}/`, { headers }),
        api.get('/api/movimientos-caja/', {
          params: { caja: caja.id_cajas },
          headers,
        }),
      ]);
      setCajaHistorial(respuestaCaja.data);
      setMovimientosCaja(
        Array.isArray(respuestaMovimientos.data)
          ? respuestaMovimientos.data
          : respuestaMovimientos.data.results || [],
      );
    } catch (error) {
      console.error('Error al cargar los movimientos de caja:', error);
      notificar('error', error.response?.data?.detail || 'No se pudieron cargar los movimientos.');
      setCajaHistorial(null);
      if (desdeHistorial) {
        setHistorialVisible(true);
        setVolverAlHistorial(false);
      }
    } finally {
      setCargandoMovimientos(false);
    }
  };

  const cerrarDetallesCaja = () => {
    setCajaHistorial(null);
    if (volverAlHistorial) {
      setHistorialVisible(true);
      setVolverAlHistorial(false);
    }
  };

  const abrirMovimiento = (caja) => {
    setCajaMovimiento(caja);
    setMovimiento({ tipo_movimiento: 'Ingreso', concepto: '', monto: '' });
    setMovimientoVisible(true);
  };

  const registrarMovimiento = async (event) => {
    event.preventDefault();
    if (!cajaMovimiento) return;

    setGuardandoMovimiento(true);
    try {
      await api.post('/api/movimientos-caja/', {
        caja: cajaMovimiento.id_cajas,
        ...movimiento,
      });
      notificar('exito', 'Movimiento registrado correctamente.');
      setMovimientoVisible(false);
      setCajaMovimiento(null);
      await cargarCajas();
    } catch (error) {
      console.error('Error al registrar un movimiento de caja:', error);
      const datosError = error.response?.data;
      const detalleError =
        datosError?.detail ||
        (datosError && typeof datosError === 'object'
          ? Object.values(datosError).flat()[0]
          : null);
      notificar(
        'error',
        detalleError || 'No se pudo registrar el movimiento.',
      );
    } finally {
      setGuardandoMovimiento(false);
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
        <div className="d-flex gap-2">
          <CButton color="info" variant="outline" onClick={abrirHistorial}>
            Historial
          </CButton>
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
          const cajaAbierta = itemCaja.estado && !itemCaja.fecha_hora_cierre;
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
                      ${Number(itemCaja.saldo_actual || 0).toFixed(2)}
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
                        {itemCaja.es_mia && (
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => abrirMovimiento(itemCaja)}
                          >
                            + Movimiento
                          </CButton>
                        )}
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
      <CModal
        visible={movimientoVisible}
        onClose={() => {
          if (!guardandoMovimiento) setMovimientoVisible(false);
        }}
      >
        <CModalHeader>
          <CModalTitle>Registrar movimiento de caja</CModalTitle>
        </CModalHeader>
        <form id="form-movimiento-caja" onSubmit={registrarMovimiento}>
          <CModalBody>
            <p className="text-body-secondary">
              Caja #{cajaMovimiento?.id_cajas}
            </p>
            <CFormSelect
              className="mb-3"
              label="Tipo de movimiento"
              value={movimiento.tipo_movimiento}
              onChange={(event) =>
                setMovimiento((actual) => ({
                  ...actual,
                  tipo_movimiento: event.target.value,
                }))
              }
              required
            >
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </CFormSelect>
            <CFormInput
              className="mb-3"
              label="Concepto"
              value={movimiento.concepto}
              maxLength={50}
              onChange={(event) =>
                setMovimiento((actual) => ({ ...actual, concepto: event.target.value }))
              }
              required
            />
            <CFormInput
              label="Monto"
              type="number"
              min="0.01"
              step="0.01"
              value={movimiento.monto}
              onChange={(event) =>
                setMovimiento((actual) => ({ ...actual, monto: event.target.value }))
              }
              required
            />
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              type="button"
              onClick={() => setMovimientoVisible(false)}
              disabled={guardandoMovimiento}
            >
              Cancelar
            </CButton>
            <CButton
              color="primary"
              type="submit"
              form="form-movimiento-caja"
              disabled={guardandoMovimiento}
            >
              {guardandoMovimiento ? 'Guardando...' : 'Registrar movimiento'}
            </CButton>
          </CModalFooter>
        </form>
      </CModal>
      <CModal
        visible={historialVisible}
        onClose={() => setHistorialVisible(false)}
        size="xl"
      >
        <CModalHeader>
          <CModalTitle>Historial de Cajas</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-4">
              <CFormInput
                type="date"
                label="Fecha de apertura desde"
                value={fechaDesdeHistorial}
                onChange={(event) => setFechaDesdeHistorial(event.target.value)}
              />
            </div>
            <div className="col-md-4">
              <CFormInput
                type="date"
                label="Fecha de apertura hasta"
                value={fechaHastaHistorial}
                onChange={(event) => setFechaHastaHistorial(event.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <CButton color="primary" onClick={filtrarHistorial} disabled={cargandoHistorial}>
                Filtrar
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                disabled={cargandoHistorial}
                onClick={() => {
                  setFechaDesdeHistorial('');
                  setFechaHastaHistorial('');
                  cargarHistorial({ fecha_desde: undefined, fecha_hasta: undefined });
                }}
              >
                Limpiar
              </CButton>
            </div>
          </div>
          {cargandoHistorial ? (
            <p className="text-center text-body-secondary">Cargando historial...</p>
          ) : historialCajas.length ? (
            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Caja</CTableHeaderCell>
                  <CTableHeaderCell>Apertura</CTableHeaderCell>
                  <CTableHeaderCell>Cierre</CTableHeaderCell>
                  <CTableHeaderCell>Responsable</CTableHeaderCell>
                  <CTableHeaderCell>Local</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Monto cierre</CTableHeaderCell>
                  <CTableHeaderCell>Detalle</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {historialCajas.map((item) => {
                  const abierta = item.estado || !item.fecha_hora_cierre;
                  return (
                    <CTableRow key={item.id_cajas}>
                      <CTableDataCell>#{item.id_cajas}</CTableDataCell>
                      <CTableDataCell>
                        {item.fecha_hora_apertura
                          ? new Date(item.fecha_hora_apertura).toLocaleString()
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.fecha_hora_cierre
                          ? new Date(item.fecha_hora_cierre).toLocaleString()
                          : 'Abierta'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.empleado_detalle
                          ? `${item.empleado_detalle.nombre} ${item.empleado_detalle.apellido}`
                          : item.usuario_nombre || '-'}
                      </CTableDataCell>
                      <CTableDataCell>{item.local_nombre || item.local || '-'}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={abierta ? 'success' : 'secondary'}>
                          {abierta ? 'Abierta' : 'Cerrada'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        {item.monto_cierre == null
                          ? '-'
                          : `$${Number(item.monto_cierre).toFixed(2)}`}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          onClick={() => verMovimientos(item, true)}
                        >
                          Detalles
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          ) : (
            <p className="text-center text-body-secondary mb-0">
              No hay cajas registradas para el rango seleccionado.
            </p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setHistorialVisible(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={!!cajaHistorial} onClose={cerrarDetallesCaja} size="xl">
        <CModalHeader>
          <CModalTitle>Detalles de Caja #{cajaHistorial?.id_cajas}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {cargandoMovimientos ? (
            <p className="text-center text-body-secondary mb-0">Cargando movimientos...</p>
          ) : (
            <>
              <CRow className="g-3 mb-4">
                <CCol md={3}>
                  <strong>Responsable:</strong>
                  <br />
                  {cajaHistorial?.empleado_detalle
                    ? `${cajaHistorial.empleado_detalle.nombre} ${cajaHistorial.empleado_detalle.apellido}`
                    : cajaHistorial?.usuario_nombre || '-'}
                </CCol>
                <CCol md={3}>
                  <strong>Local:</strong>
                  <br />
                  {cajaHistorial?.local_nombre || cajaHistorial?.local || '-'}
                </CCol>
                <CCol md={3}>
                  <strong>Apertura:</strong>
                  <br />${Number(cajaHistorial?.monto_apertura || 0).toFixed(2)}
                </CCol>
                <CCol md={3}>
                  <strong>Fecha de apertura:</strong>
                  <br />
                  {cajaHistorial?.fecha_hora_apertura
                    ? new Date(cajaHistorial.fecha_hora_apertura).toLocaleString()
                    : '-'}
                </CCol>
                <CCol md={3}>
                  <strong>Estado:</strong>
                  <br />
                  {cajaHistorial?.estado && !cajaHistorial?.fecha_hora_cierre
                    ? 'Abierta'
                    : 'Cerrada'}
                </CCol>
                <CCol md={3}>
                  <strong>Total de cierre:</strong>
                  <br />
                  {cajaHistorial?.monto_cierre == null
                    ? '-'
                    : `$${Number(cajaHistorial.monto_cierre).toFixed(2)}`}
                </CCol>
                <CCol md={3}>
                  <strong>Efectivo esperado:</strong>
                  <br />
                  {cajaHistorial?.efectivo_esperado == null
                    ? '-'
                    : `$${Number(cajaHistorial.efectivo_esperado).toFixed(2)}`}
                </CCol>
                <CCol md={3}>
                  <strong>Efectivo real:</strong>
                  <br />
                  {cajaHistorial?.efectivo_real == null
                    ? '-'
                    : `$${Number(cajaHistorial.efectivo_real).toFixed(2)}`}
                </CCol>
                <CCol md={3}>
                  <strong>Digital esperado:</strong>
                  <br />
                  {cajaHistorial?.digital_esperado == null
                    ? '-'
                    : `$${Number(cajaHistorial.digital_esperado).toFixed(2)}`}
                </CCol>
                <CCol md={3}>
                  <strong>Digital real:</strong>
                  <br />
                  {cajaHistorial?.digital_real == null
                    ? '-'
                    : `$${Number(cajaHistorial.digital_real).toFixed(2)}`}
                </CCol>
                <CCol md={3}>
                  <strong>Diferencia total:</strong>
                  <br />
                  {cajaHistorial?.diferencia_total == null
                    ? '-'
                    : `$${Number(cajaHistorial.diferencia_total).toFixed(2)}`}
                </CCol>
                <CCol md={3}>
                  <strong>Fecha de cierre:</strong>
                  <br />
                  {cajaHistorial?.fecha_hora_cierre
                    ? new Date(cajaHistorial.fecha_hora_cierre).toLocaleString()
                    : 'Abierta'}
                </CCol>
                {cajaHistorial?.observaciones_cierre && (
                  <CCol md={12}>
                    <strong>Observaciones del cierre:</strong>
                    <br />
                    {cajaHistorial.observaciones_cierre}
                  </CCol>
                )}
              </CRow>
              <h6>Movimientos asociados</h6>
              {movimientosCaja.length ? (
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
                <p className="text-center text-body-secondary mb-0">
                  No hay movimientos registrados.
                </p>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cerrarDetallesCaja}>
            {volverAlHistorial ? 'Volver al historial' : 'Cerrar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
