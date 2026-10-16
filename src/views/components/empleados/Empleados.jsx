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
  CPagination,
  CPaginationItem,
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
      console.error('Error al cargar empleados:', error)
    }
  }

  useEffect(() => {
    cargarEmpleados()
  }, [])

  const handleAgregar = () => {
    setEmpleadoSeleccionado(null)
    setVisibleModal(true)
  }

  const handleEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado)
    setVisibleModal(true)
  }

  return (
    <div>
      <div className="mb-3">
        <CButton color="primary" onClick={handleAgregar}>
          Agregar empleado
        </CButton>
      </div>

      <ModalEmpleados
        visible={visibleModal}
        setVisible={setVisibleModal}
        empleadoActual={empleadoSeleccionado}
        onGuardadoExitoso={cargarEmpleados}
      />

      <CCard>
        <CCardBody>
          <CTable bordered>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                <CTableHeaderCell scope="col">Apellido</CTableHeaderCell>
                <CTableHeaderCell scope="col">Teléfono</CTableHeaderCell>
                <CTableHeaderCell scope="col">Domicilio</CTableHeaderCell>
                <CTableHeaderCell scope="col"></CTableHeaderCell>
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
                  <CTableDataCell style={{ textAlign: 'center' }}>
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
      <CPagination className="justify-content-center" aria-label="Page navigation example">
        <CPaginationItem disabled>Previous</CPaginationItem>
        <CPaginationItem>1</CPaginationItem>
        <CPaginationItem>2</CPaginationItem>
        <CPaginationItem>3</CPaginationItem>
        <CPaginationItem>Next</CPaginationItem>
      </CPagination>
    </div>
  )
}

export default Empleados
