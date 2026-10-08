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

import ModalProductos from './ModalProductos'

const Productos = () => {
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

useEffect(() => {
  const cargarProductos = async () => {
    try {
      const respuesta = await fetch('http://localhost:8000/api/productos/')

      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }
      const datos = await respuesta.json()
      setProductos(datos)
    } catch (error) {
      setError(error.message)
    } finally {
      setCargando(false)
    }
  }

  cargarProductos()
  
}, [])

  if (cargando) return <p>Cargando productos...</p>
  if (error) return <p>Error al cargar productos: {error}</p>

  return (
    <div>
      <ModalProductos/>
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
