import React, { useState, useEffect } from 'react';
import {
  CBadge,
  CButton,
  CForm,
  CFormCheck,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { toast } from 'react-toastify';
import api from '../api/api';

export default function CerrarCaja({ visible, onClose, caja, onSuccess }) {
  const [data, setData] = useState({
    confirmar_cierre: false,
    efectivo_real: '',
    digital_real: '',
    observaciones_cierre: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [cargandoEsperados, setCargandoEsperados] = useState(false);
  const [esperados, setEsperados] = useState({ efectivo: 0, digital: 0 });
  const [esperadosCargados, setEsperadosCargados] = useState(false);

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

  useEffect(() => {
    if (!visible || !caja) return;

    let activo = true;
    setData({
      confirmar_cierre: false,
      efectivo_real: '',
      digital_real: '',
      observaciones_cierre: '',
      password: '',
    });
    setEsperadosCargados(false);
    setCargandoEsperados(true);

    api.get(`/api/cajas/${caja.id_cajas}/`, {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    }).then(({ data: cajaActual }) => {
      if (!activo) return;
      const efectivo = Number(cajaActual.efectivo_esperado || 0);
      const digital = Number(cajaActual.digital_esperado || 0);
      setEsperados({ efectivo, digital });
      setData((actual) => ({ ...actual, digital_real: digital.toFixed(2) }));
      setEsperadosCargados(true);
    }).catch((error) => {
      if (!activo) return;
      console.error('Error al consultar el arqueo esperado:', error);
      notificar('error', error.response?.data?.detail || 'No se pudo consultar el saldo esperado.');
    }).finally(() => {
      if (activo) setCargandoEsperados(false);
    });

    return () => { activo = false };
  }, [caja, visible]);

  const efectivoReal = Number(data.efectivo_real || 0);
  const digitalReal = Number(data.digital_real || 0);
  const diferenciaEfectivo = Number((efectivoReal - esperados.efectivo).toFixed(2));
  const diferenciaDigital = Number((digitalReal - esperados.digital).toFixed(2));
  const totalEsperado = Number((esperados.efectivo + esperados.digital).toFixed(2));
  const totalReal = Number((efectivoReal + digitalReal).toFixed(2));
  const diferenciaTotal = Number((diferenciaEfectivo + diferenciaDigital).toFixed(2));
  const observacionesValidas =
    diferenciaTotal === 0 || data.observaciones_cierre.trim().length >= 10;
  const montosRealesValidos =
    Number.isFinite(efectivoReal) &&
    efectivoReal >= 0 &&
    Number.isFinite(digitalReal);
  const puedeCerrar =
    esperadosCargados &&
    data.efectivo_real !== '' &&
    data.digital_real !== '' &&
    montosRealesValidos &&
    data.confirmar_cierre &&
    Boolean(data.password) &&
    observacionesValidas &&
    !loading;
  const moneda = (valor) => Number(valor || 0).toFixed(2);
  const textoDiferencia =
    diferenciaTotal === 0
      ? 'Caja cuadrada ($0.00)'
      : diferenciaTotal < 0
        ? `Faltante de caja: -$${moneda(Math.abs(diferenciaTotal))}`
        : `Sobrante de caja: +$${moneda(diferenciaTotal)}`;
  const colorDiferencia =
    diferenciaTotal === 0 ? 'success' : diferenciaTotal < 0 ? 'danger' : 'warning';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.confirmar_cierre) {
      notificar('advertencia', 'Confirma explícitamente el cierre de caja.')
      return;
    }
    if (!data.password) {
      notificar('advertencia', 'Ingresa tu contraseña para confirmar el cierre.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };

      await api.patch(`/api/cajas/${caja.id_cajas}/`, data, { headers });

      notificar('exito', `Caja #${caja.id_cajas} cerrada correctamente.`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al cerrar la caja:', error);
      const errores = error.response?.data;
      notificar(
        'error',
        errores?.detail ||
          errores?.efectivo_real?.[0] ||
          errores?.digital_real?.[0] ||
          errores?.observaciones_cierre?.[0] ||
          errores?.password ||
          'No se pudo cerrar la caja. Verifica los datos e intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="xl">
      <CModalHeader>
        <CModalTitle>Cerrar Caja #{caja?.id_cajas}</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          {cargandoEsperados ? (
            <p className="text-center text-body-secondary">Calculando arqueo...</p>
          ) : (
          <>
          <CRow className="g-3">
            <CCol md={12}>
              <CTable responsive bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Medio de pago</CTableHeaderCell>
                    <CTableHeaderCell>Esperado</CTableHeaderCell>
                    <CTableHeaderCell>Real</CTableHeaderCell>
                    <CTableHeaderCell>Diferencia</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableHeaderCell scope="row">Efectivo</CTableHeaderCell>
                    <CTableDataCell>${moneda(esperados.efectivo)}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        aria-label="Efectivo real contado"
                        size="lg"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.efectivo_real}
                        onChange={(e) => setData((actual) => ({
                          ...actual,
                          efectivo_real: e.target.value,
                        }))}
                        required
                      />
                    </CTableDataCell>
                    <CTableDataCell>${moneda(diferenciaEfectivo)}</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell scope="row">Transferencias / Medios digitales</CTableHeaderCell>
                    <CTableDataCell>${moneda(esperados.digital)}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        aria-label="Total real de medios digitales"
                        size="lg"
                        type="number"
                        step="0.01"
                        value={data.digital_real}
                        onChange={(e) => setData((actual) => ({
                          ...actual,
                          digital_real: e.target.value,
                        }))}
                        required
                      />
                    </CTableDataCell>
                    <CTableDataCell>${moneda(diferenciaDigital)}</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CCol>
            <CCol md={12}>
              <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                <span>Total esperado: <strong>${moneda(totalEsperado)}</strong></span>
                <span>Total real contado: <strong>${moneda(totalReal)}</strong></span>
              </div>
              <CBadge color={colorDiferencia} className="fs-6">{textoDiferencia}</CBadge>
            </CCol>
            <CCol md={12}>
              <CFormTextarea
                label={`Observaciones${diferenciaTotal !== 0 ? ' (obligatorias)' : ''}`}
                rows={3}
                maxLength={1000}
                value={data.observaciones_cierre}
                onChange={(e) => setData((actual) => ({
                  ...actual,
                  observaciones_cierre: e.target.value,
                }))}
                required={diferenciaTotal !== 0}
                minLength={diferenciaTotal !== 0 ? 10 : undefined}
                feedbackInvalid="Describe la diferencia con al menos 10 caracteres."
              />
              {diferenciaTotal !== 0 && !observacionesValidas && (
                <small className="text-danger">
                  Describe la diferencia con al menos 10 caracteres.
                </small>
              )}
            </CCol>
            <CCol md={12}>
              <CFormCheck
                id="confirmar_cierre"
                label="Confirmo el cierre de caja con los montos reales ingresados."
                checked={data.confirmar_cierre}
                onChange={(e) => setData((actual) => ({
                  ...actual,
                  confirmar_cierre: e.target.checked,
                }))}
              />
            </CCol>
            <CCol md={12}>
              <CFormInput
                label="Contraseña para confirmar el cierre"
                type="password"
                autoComplete="current-password"
                value={data.password}
                onChange={(e) => setData((actual) => ({
                  ...actual,
                  password: e.target.value,
                }))}
                required
              />
            </CCol>
          </CRow>
          </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" type="button" onClick={onClose} disabled={loading || cargandoEsperados}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={!puedeCerrar || cargandoEsperados}>
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
}
