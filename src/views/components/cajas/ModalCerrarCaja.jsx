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
  CModalFooter
} from '@coreui/react';
import api from '../api/api';

export default function CerrarCaja({ visible, onClose, caja, onSuccess }) {
  
  const [data, setData] = useState({
    caja: '',
    monto_cierre: '',
    estado: false,
  });

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  useEffect(() => {
    if (!!caja){
        setData((prev) => ({
        ...prev,
        caja: caja,
      }))
    }

  }, [caja, visible])


  
  // Función para procesar y enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false)
    console.log(data)

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      
      console.log('Datos enviados:', data);


      await api.put(`/api/cajas/${caja}/`, data, { headers })
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data)
      } else {
        alert('Ocurrió un error inesperado de conexión con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  };



  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Abrir Nueva Caja</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
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
          <CButton color="secondary" type="button" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit">
            Cerrar Caja
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
}
