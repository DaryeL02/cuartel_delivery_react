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
    }
  }, [visible]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
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
                placeholder="0.00"
                step="0.01"
                min="0"
                value={data.monto_apertura}
                onChange={handleChange}
                required
              />
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
