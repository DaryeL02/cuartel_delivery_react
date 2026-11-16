import React, { useState, useEffect } from 'react';
import {
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
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

export default function NuevaCaja({ visible, onClose, usuarios, locales, onSuccess }) {
  const [data, setData] = useState({
    usuario: '',
    local: '',
    monto_apertura: '',
    estado: true,
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
        usuario: '',
        local: '',
        monto_apertura: '',
        estado: true,
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

    if (!data.usuario) {
      notificar('advertencia', 'Selecciona un usuario para el cajero.');
      return;
    }
    if (!data.local) {
      notificar('advertencia', 'Selecciona un local o sucursal.');
      return;
    }
    if (data.monto_apertura === '' || Number(data.monto_apertura) < 0) {
      notificar('advertencia', 'Ingresa un monto inicial válido igual o mayor a 0.');
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
      notificar('error', 'No se pudo abrir la caja. Verifica los datos e intenta nuevamente.');
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
            {/* Campo: Usuario */}
            <CCol md={6}>
              <CFormLabel htmlFor="usuario">Usuario del cajero</CFormLabel>
              <CFormSelect
                name="usuario"
                id="usuario"
                value={data.usuario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar usuario...</option>
                {usuarios.map((item) => (
                  <option key={item.id_usuarios} value={item.id_usuarios}>
                    {item.usuario}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Campo: Local (Select) */}
            <CCol md={6}>
              <CFormLabel htmlFor="local">Local / Sucursal</CFormLabel>
              <CFormSelect
                id="local"
                name="local"
                value={data.local}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar local...</option>
                {locales.map((item) => (
                  <option key={item.id_locales} value={item.id_locales}>
                    {item.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Campo: Monto de Apertura */}
            <CCol md={12}>
              <CFormLabel htmlFor="monto_apertura">Asignar Monto Inicial en Efectivo</CFormLabel>
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
          </CRow>
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
