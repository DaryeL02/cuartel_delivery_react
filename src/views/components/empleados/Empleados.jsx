import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import ModalEmpleados from './ModalEmpleados'
import api from '../api/api'

const Empleados = () => {
  const [empleados, setEmpleados] = useState([])
  const [visibleModal, setVisibleModal] = useState(false)
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

  const cargarEmpleados = async () => {
    try {
      const respuesta = await api.get('/api/empleados/')
      setEmpleados(respuesta.data)
    } catch (error) {
      console.error("Error al cargar empleados:", error)
    }
  }

  useEffect(() => {
    cargarEmpleados()
  }, [])

  // Función para abrir el modal vacío (Crear)
  const handleAgregar = () => {
    setEmpleadoSeleccionado(null) // null indica que es un nuevo registro
    setVisibleModal(true)
  }

  // Función para abrir el modal con datos (Editar)
  const handleEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado) // pasamos el empleado a editar
    setVisibleModal(true)
  }

  return (
    <div>
      {/* Botón para agregar arriba de la tabla */}
      <div className="mb-3">
        <CButton color="primary" onClick={handleAgregar}>
          Agregar empleado
        </CButton>
      </div>

      {/* Instancia única del modal reutilizable */}
      <ModalEmpleados 
        visible={visibleModal}
        setVisible={setVisibleModal}
        empleadoActual={empleadoSeleccionado}
        onGuardadoExitoso={cargarEmpleados} // Refresca la tabla automáticamente al guardar
      />

      <CCard>
        <CCardBody>
          <CTable>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                <CTableHeaderCell scope="col">Apellido</CTableHeaderCell>
                <CTableHeaderCell scope="col">Teléfono</CTableHeaderCell>
                <CTableHeaderCell scope="col">Domicilio</CTableHeaderCell>
                <CTableHeaderCell scope="col">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {empleados.map((empleado) => (
                <CTableRow key={empleado.id_empleados}>
                  <CTableHeaderCell scope="row">{empleado.id_empleados}</CTableHeaderCell>
                  <CTableDataCell>{empleado.nombre}</CTableDataCell>
                  <CTableDataCell>{empleado.apellido}</CTableDataCell>
                  <CTableDataCell>{empleado.telefono}</CTableDataCell>
                  <CTableDataCell>{empleado.domicilio}</CTableDataCell>
                  <CTableDataCell>
                    <CIcon 
                      icon={cilSettings} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleEditar(empleado)} 
                    />
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>      
    </div>
  )
}

export default Empleados