import React, { useState, useEffect } from 'react';
import {
  CButton,
  CForm,
  CFormInput,
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

export default function CerrarCaja({ visible, onClose, caja, onSuccess }) {
  const [data, setData] = useState({
    caja: '',
    monto_cierre: '',
    estado: false,
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  useEffect(() => {
    if (visible) {
      setData({
        caja: caja || '',
        monto_cierre: '',
        estado: false,
      });
    }
  }, [caja, visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.monto_cierre === '' || Number(data.monto_cierre) < 0) {
      notificar('advertencia', 'Ingresa un monto de cierre válido igual o mayor a 0.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };

      await api.patch(`/api/cajas/${caja}/`, data, { headers });

      notificar('exito', `Caja #${caja} cerrada correctamente.`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al cerrar la caja:', error);
      notificar('error', 'No se pudo cerrar la caja. Verifica los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Cerrar Caja #{caja}</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            {/* Campo: Monto de Cierre */}
            <CCol md={12}>
              <CFormLabel htmlFor="monto_cierre">Asignar Monto Final en Efectivo</CFormLabel>
              <CFormInput
                type="number"
                id="monto_cierre"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={data.monto_cierre}
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
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
}
