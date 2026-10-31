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

import ModalProductos from './ModalProductos'
import api from '../api/api'

const Productos = () => {
  const [productos, setProductos] = useState([])

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get('/api/productos/')
      setProductos(respuesta.data)
    } catch (error) {
      console.log(error.responae?.status, error.response?.data)
    }
  }
  useEffect(() => {
    cargarProductos()
  }, [])

  return (
    <div>
      <ModalProductos onGuardado={cargarProductos} />
      <CCard>
        <CCardBody>
          <CTable>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                <CTableHeaderCell scope="col">Descripción</CTableHeaderCell>
                <CTableHeaderCell scope="col">Precio unitario</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {productos.map((producto) => (
                <CTableRow key={producto.id_productos}>
                  <CTableHeaderCell scope="row">{producto.id_productos}</CTableHeaderCell>
                  <CTableDataCell>{producto.nombre}</CTableDataCell>
                  <CTableDataCell>{producto.descripcion}</CTableDataCell>
                  <CTableDataCell>${producto.precio_unitario}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Productos
