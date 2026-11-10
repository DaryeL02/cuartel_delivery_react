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

export default function NuevaCaja({ visible, onClose, usuarios, locales, onSuccess }) {
  
  const [data, setData] = useState({
    usuario: '',
    local: '',
    monto_apertura: '',
    estado: true,
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

  // Función para procesar y enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false)
    console.log(data)

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      
      console.log('Datos enviados:', data);

      await api.post('/api/cajas/', data, { headers })
      
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
            <CCol md={6}>
            {/* Campo: Usuario */}
                <CFormLabel htmlFor="local">Usuario del cajero</CFormLabel>
                <CFormSelect
                    name="usuario"
                    id="usuario"
                    // placeholder="Usuario del cajero"
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
          <CButton color="secondary" type="button" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="success" type="submit">
            Inicializar Apertura
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
}
