import React, { useState, useEffect } from 'react';
import {
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CFormText,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { toast } from 'react-toastify';
import api from '../api/api';

export default function NuevaCaja({ visible, onClose, locales, cajasAbiertas = [], onSuccess }) {
  const [data, setData] = useState({
    local: '',
    monto_apertura: '',
    estado: true,
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [cargandoSugerencia, setCargandoSugerencia] = useState(false);
  const [cierreAnterior, setCierreAnterior] = useState(null);

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
    if (visible) {
      setData({
        local: '',
        monto_apertura: '',
        estado: true,
        password: '',
      });
      setCierreAnterior(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !data.local) {
      setCierreAnterior(null);
      return undefined;
    }

    let activo = true;
    setCierreAnterior(null);
    setCargandoSugerencia(true);
    api.get('/api/cajas/', {
      params: { local: data.local },
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    }).then(({ data: cajas }) => {
      if (!activo) return;
      const lista = Array.isArray(cajas) ? cajas : cajas?.results || [];
      const ultimaCaja = lista[0];
      const montoSugerido =
        ultimaCaja?.efectivo_real ??
        ultimaCaja?.efectivo_esperado ??
        ultimaCaja?.monto_cierre;
      const cierreNumerico = montoSugerido == null ? null : Number(montoSugerido);
      setCierreAnterior(Number.isFinite(cierreNumerico) ? cierreNumerico : null);
      if (montoSugerido !== null && montoSugerido !== undefined) {
        setData((actual) => ({
          ...actual,
          monto_apertura: Number(montoSugerido).toFixed(2),
        }));
      }
    }).catch((error) => {
      if (!activo) return;
      console.error('Error al consultar el saldo de la caja anterior:', error);
      notificar('error', error.response?.data?.detail || 'No se pudo calcular el monto inicial sugerido.');
    }).finally(() => {
      if (activo) setCargandoSugerencia(false);
    });

    return () => { activo = false };
  }, [data.local, visible]);

  const diferenciaApertura =
    cierreAnterior !== null && data.monto_apertura !== ''
      ? Number(data.monto_apertura) - cierreAnterior
      : null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [id]: value,
      ...(id === 'local' ? { monto_apertura: '' } : {}),
    }));
    if (id === 'local') setCierreAnterior(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.local) {
      notificar('advertencia', 'Selecciona un local o sucursal.');
      return;
    }
    if (data.monto_apertura === '' || Number(data.monto_apertura) < 0) {
      notificar('advertencia', 'Ingresa un monto inicial válido igual o mayor a 0.');
      return;
    }
    if (!data.password) {
      notificar('advertencia', 'Ingresa tu contraseña para confirmar la apertura.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };

      await api.post('/api/cajas/', data, { headers });

      notificar('exito', 'Caja abierta correctamente.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      const mensaje =
        error.response?.data?.detail ||
        error.response?.data?.password ||
        'No se pudo abrir la caja. Verifica los datos e intenta nuevamente.';
      notificar(error.response?.status === 409 ? 'advertencia' : 'error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Abrir Nueva Caja</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            {/* Campo: Local (Select) */}
            <CCol md={12}>
              <CFormLabel htmlFor="local">
                Local / Sucursal <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                id="local"
                name="local"
                value={data.local}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar local...</option>
                {locales.map((item) => (
                  <option
                    key={item.id_locales}
                    value={item.id_locales}
                    disabled={cajasAbiertas.some((caja) => String(caja.local) === String(item.id_locales))}
                  >
                    {item.nombre}
                    {cajasAbiertas.some((caja) => String(caja.local) === String(item.id_locales))
                      ? ' (ya tiene una caja abierta)'
                      : ''}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Campo: Monto de Apertura */}
            <CCol md={12}>
              <CFormLabel htmlFor="monto_apertura">
                Asignar Monto Inicial en Efectivo <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="number"
                id="monto_apertura"
                placeholder={cargandoSugerencia ? 'Calculando...' : '0.00'}
                step="0.01"
                min="0"
                value={data.monto_apertura}
                onChange={handleChange}
                required
              />
              {diferenciaApertura !== null && Number.isFinite(diferenciaApertura) ? (
                <CFormText className={diferenciaApertura < 0 ? 'text-danger' : 'text-success'}>
                  {diferenciaApertura > 0
                    ? `Agregado: +${diferenciaApertura.toFixed(2)}`
                    : diferenciaApertura < 0
                      ? `Restado: -${Math.abs(diferenciaApertura).toFixed(2)}`
                      : 'Sin variación: $0.00'}
                </CFormText>
              ) : (
                <CFormText>
                  {cierreAnterior === null && data.local && !cargandoSugerencia
                    ? 'No hay un cierre anterior para comparar.'
                    : 'El monto sugerido corresponde al efectivo contado al cierre de la última caja de este local.'}
                </CFormText>
              )}
            </CCol>
            <CCol md={12}>
              <CFormLabel htmlFor="password">
                Contraseña para validar tu identidad <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña actual"
                autoComplete="current-password"
                value={data.password}
                onChange={handleChange}
                required
              />
              <CFormText>
                Necesitamos confirmar tu identidad antes de abrir la caja.
              </CFormText>
            </CCol>
          </CRow>
          <small className="text-body-secondary d-block mt-3">
            <span className="text-danger">*</span> Campos obligatorios
          </small>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit" disabled={loading}>
            {loading ? 'Abriendo...' : 'Inicializar Apertura'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
}
