import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CButton,
  CAvatar,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilOptions, cilPencil, cilTrash, cilFastfood } from '@coreui/icons'
import api from '../api/api'


const Productos = ({ onOpenModal }) => {
  
  const [productos, setProductos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')


  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/productos/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    })  
      setProductos(respuesta.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  // Filtrar productos en tiempo real según el término ingresado
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
            <div>
              <h5 className="mb-0 text-dark fw-semibold">Catálogo de Productos</h5>
              <small className="text-muted">Administra el menú, descripciones y precios de la sandwichería</small>
            </div>

            <div className="d-flex align-items-center gap-3" style={{ maxWidth: '450px', width: '100%' }}>
              <CFormInput
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm"
              />
              <CButton 
                color="primary" 
                className="d-flex align-items-center gap-2 text-nowrap"
                onClick={onOpenModal}
              >
                <CIcon icon={cilPlus} />
                Agregar producto
              </CButton>
            </div>       

          </CCardHeader>
          
          <CCardBody className="px-0 py-0">
            <div className="table-responsive">
              <CTable align="middle" className="mb-0 border-0" hover responsive>
                <CTableHead className="text-nowrap bg-light text-muted fw-bold">
                  <CTableRow>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>N°</CTableHeaderCell>
                    <CTableHeaderCell className="border-0" style={{ width: '35%' }}>Producto</CTableHeaderCell>
                    <CTableHeaderCell className="border-0" style={{ width: '40%' }}>Descripción</CTableHeaderCell>
                    <CTableHeaderCell className="text-end border-0" style={{ width: '10%' }}>Precio Unitario</CTableHeaderCell>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                
                <CTableBody>
                  {productosFiltrados.map((producto, index) => (
                    <CTableRow key={producto.id_productos}>
                      {/* N° Autogenerado basado en su posición en la lista (+1) */}
                      <CTableDataCell className="text-center text-muted fw-medium">
                        {index + 1}
                      </CTableDataCell>
                      
                      {/* Icono Gastronómico + Nombre */}
                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-3">
                          <CAvatar color="primary" className="bg-opacity-10 text-primary fw-semibold">
                            <CIcon icon={cilFastfood} size="sm" />
                          </CAvatar>
                          <div className="fw-semibold text-dark">{producto.nombre}</div>
                        </div>
                      </CTableDataCell>
                      
                      {/* Descripción truncada dinámicamente con estilos CSS para no romper la tabla */}
                      <CTableDataCell>
                        <div 
                          className="text-secondary text-truncate" 
                          style={{ maxWidth: '350px' }}
                          title={producto.descripcion} // Muestra el texto completo al pasar el mouse
                        >
                          {producto.descripcion}
                        </div>
                      </CTableDataCell>
                      
                      {/* Precio Unitario Resaltado a la derecha */}
                      <CTableDataCell className="text-end fw-semibold text-dark text-nowrap">
                        ${producto.precio_unitario}
                      </CTableDataCell>
                      
                      {/* Menú de Acciones Dropdown */}
                      <CTableDataCell className="text-center">
                        <CDropdown alignment="end">
                          <CDropdownToggle color="transparent" caret={false} className="p-0 border-0 shadow-none">
                            <CIcon icon={cilOptions} className="text-muted" size="lg" />
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem 
                              onClick={() => console.log('Editar Producto ID:', producto.id_productos)}
                              className="d-flex align-items-center gap-2"
                            >
                              <CIcon icon={cilPencil} className="text-info" />
                              Editar
                            </CDropdownItem>
                            <CDropdownItem 
                              onClick={() => console.log('Eliminar Producto ID:', producto.id_productos)}
                              className="d-flex align-items-center gap-2 text-danger"
                            >
                              <CIcon icon={cilTrash} />
                              Eliminar
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
          
          {/* Footer de la tarjeta con contador y paginación */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-top">
            <span className="small text-muted">Mostrando {productosFiltrados.length} productos</span>
            <CPagination className="mb-0" aria-label="Navegación de productos">
              <CPaginationItem disabled>Anterior</CPaginationItem>
              <CPaginationItem active>1</CPaginationItem>
              <CPaginationItem>2</CPaginationItem>
              <CPaginationItem>Siguiente</CPaginationItem>
            </CPagination>
          </div>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Productos
