import React, { useState, useEffect } from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { CCol, CForm, CFormInput, CFormSelect } from '@coreui/react'
import api from '../api/api'

// Recibimos visible, setVisible y el empleado actual por props
const ModalEmpleados = ({ visible, setVisible, empleadoActual, onGuardadoExitoso }) => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [domicilio, setDomicilio] = useState('')

  // Cada vez que cambie 'empleadoActual', rellenamos el formulario o lo limpiamos
  useEffect(() => {
    if (empleadoActual) {
      setNombre(empleadoActual.nombre || '')
      setApellido(empleadoActual.apellido || '')
      setTelefono(empleadoActual.telefono || '')
      setDomicilio(empleadoActual.domicilio || '')
    } else {
      setNombre('')
      setApellido('')
      setTelefono('')
      setDomicilio('')
    }
  }, [empleadoActual])

  const handleSubmit = async () => {
    try {
      const datosEmpleado = { nombre, apellido, telefono, domicilio }

      if (empleadoActual) {
        // Lógica para EDITAR (PUT o PATCH)
        await api.put(`/api/empleados/${empleadoActual.id_empleados}/`, datosEmpleado)
      } else {
        // Lógica para CREAR (POST)
        await api.post('/api/empleados/', datosEmpleado)
      }

      setVisible(false)
      if (onGuardadoExitoso) onGuardadoExitoso() // Para refrescar la tabla en el componente padre
    } catch (error) {
      console.error("Error al guardar empleado:", error)
    }
  }

  return (
    <CModal
      visible={visible}
      onClose={() => setVisible(false)}
      aria-labelledby="ModalEmpleadosLabel"
    >
      <CModalHeader>
        <CModalTitle id="ModalEmpleadosLabel">
          {empleadoActual ? 'Editar Empleado' : 'Agregar Empleado'}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm className="row g-3">
          <CCol md={12}>
            <CFormInput 
              label="Nombre" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
            />
          </CCol>
          <CCol md={12}>
            <CFormInput 
              label="Apellido" 
              value={apellido} 
              onChange={(e) => setApellido(e.target.value)} 
            />
          </CCol>
          <CCol md={12}>
            <CFormInput 
              label="Teléfono" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)} 
            />
          </CCol>
          <CCol md={12}>
            <CFormInput 
              label="Domicilio" 
              value={domicilio} 
              onChange={(e) => setDomicilio(e.target.value)} 
            />
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Cerrar
        </CButton>
        <CButton color="primary" onClick={handleSubmit}>
          {empleadoActual ? 'Actualizar' : 'Guardar'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalEmpleados