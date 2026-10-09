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

import Modal_test from './ModalInsumos'

const TablaInsumos = () => {
    const [insumos, setInsumos] = useState([])

useEffect(() => {
  const cargarInsumos = async () => {

      const respuesta = await fetch('http://localhost:8000/api/insumos/')
      const datos = await respuesta.json()
      setInsumos(datos)

  }

  cargarInsumos()
  
}, [])

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
