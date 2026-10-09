import React from 'react'
import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import ModalEmpleados from './ModalEmpleados'
import api from '../api/api'

const Empleados = () => {
    const [empleados, setEmpleados] = useState([])
    // const [cargando, setCargando] = useState(true)
    // const [error, setError] = useState('')

useEffect(() => {
  const cargarEmpleados = async () => {
    // try {
      const respuesta = await fetch(api, '/api/empleados/')
      

      // if (!respuesta.ok) {
      //   throw new Error(`Error del servidor: ${respuesta.status}`)
      // }
      const datos = await respuesta.json()
      setEmpleados(datos)
    // } catch (error) {
    //   setError(error.message)
    // } finally {
    //   setCargando(false)
    // }
  }

  cargarEmpleados()
  
}, [])

  // if (cargando) return <p>Cargando empleados...</p>
  // if (error) return <p>Error al cargar empleados: {error}</p>

  return (
    <div>
      <ModalEmpleados/>
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
