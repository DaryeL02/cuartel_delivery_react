import React from 'react'
import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import Modal_test from './ModalInsumos'

const TablaInsumos = () => {
    const [insumos, setInsumos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

useEffect(() => {
  const cargarInsumos = async () => {
    try {
      const respuesta = await fetch('http://localhost:8000/api/insumos/')

      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }
      const datos = await respuesta.json()
      setInsumos(datos)
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  cargarInsumos()
  
}, [])

  if (cargando) return <p>Cargando insumos...</p>
  if (error) return <p>Error al cargar insumos: {error}</p>

  return (
    <div>
      <Modal_test/>
      <CCard>
        <CCardBody>
          <CTable>
            <CTableHead>
                <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Descripción</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Unidad</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Stock actual</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Stock mínimo</CTableHeaderCell>

                </CTableRow>
            </CTableHead>
            <CTableBody>
                {insumos.map((insumo) => (
                  <CTableRow key={insumo.id_insumos}>
                    <CTableHeaderCell scope="row">{insumo.id_insumos}</CTableHeaderCell>
                    <CTableDataCell>{insumo.nombre}</CTableDataCell>
                    <CTableDataCell>{insumo.descripcion}</CTableDataCell>
                    <CTableDataCell>{insumo.unidad}</CTableDataCell>
                    <CTableDataCell>{insumo.stock_actual}</CTableDataCell>
                    <CTableDataCell>{insumo.stock_minimo}</CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>      
    </div>
    
  )
}

export default TablaInsumos
