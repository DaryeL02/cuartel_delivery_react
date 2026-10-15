import React, { useState, useEffect } from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { CCol, CForm, CFormInput, CFormSelect } from '@coreui/react'
import api from '../api/api'

// Recibimos visible, setVisible y el empleado actual por props
const ModalEmpleados = ({ visible, setVisible, empleadoActual, onGuardadoExitoso }) => {
  // Estados para los campos del formulario
  const [dni, setDni] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [domicilio, setDomicilio] = useState('')
  const [estado, setEstado] = useState(true)

  useEffect(() => {
    if (empleadoActual) {
      setDni(empleadoActual.dni || '')
      setNombre(empleadoActual.nombre || '')
      setApellido(empleadoActual.apellido || '')
      setTelefono(empleadoActual.telefono || '')
      setDomicilio(empleadoActual.domicilio || '')
    } else {
      setDni('')
      setNombre('')
      setApellido('')
      setTelefono('')
      setDomicilio('')
    }
  }, [empleadoActual])

  const handleSubmit = async () => {
    try {
      const datosEmpleado = { dni, nombre, apellido, telefono, domicilio, estado }

      if (empleadoActual) {
        await api.put(`/api/empleados/${empleadoActual.id_empleados}/`, datosEmpleado)
      } else {
        await api.post('/api/empleados/', datosEmpleado)
      }

      setVisible(false)
      if (onGuardadoExitoso) onGuardadoExitoso()
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
              label="DNI" 
              value={dni} 
              onChange={(e) => setDni(e.target.value)} 
            />
          </CCol>
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