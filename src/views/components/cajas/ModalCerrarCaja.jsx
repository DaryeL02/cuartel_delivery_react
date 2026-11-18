import React, { useState, useEffect } from 'react';
import {
  CButton,
  CForm,
  CFormCheck,
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
    confirmar_cierre: false,
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
    setData({ confirmar_cierre: e.target.checked })
  };

  useEffect(() => {
    if (visible) {
      setData({
        confirmar_cierre: false,
      });
    }
  }, [caja, visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.confirmar_cierre) {
      notificar('advertencia', 'Confirma explícitamente el cierre de caja.')
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
      notificar('error', error.response?.data?.detail || 'No se pudo cerrar la caja. Verifica los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Cerrar Caja #{caja?.id_cajas}</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={12}>
              <p>Saldo final esperado: <strong>${Number(caja?.saldo_esperado || 0).toFixed(2)}</strong></p>
              <CFormCheck
                id="confirmar_cierre"
                label="Confirmo el cierre de la caja y el saldo final esperado."
                checked={data.confirmar_cierre}
                onChange={handleChange}
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
