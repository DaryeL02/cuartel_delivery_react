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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilOptions, cilPencil, cilTrash, cilFastfood } from '@coreui/icons'
import api from '../api/api'
import ModalFormProducto from './ModalFormProducto'
import ModalDeleteProducto from './ModalDeleteProducto'


const Productos = ({ onOpenModal }) => {
  
  const [productos, setProductos] = useState([])
  const [insumos, setInsumos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState(null)

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

  const cargarInsumos = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await api.get('/api/insumos/', {
          headers: {
            'Authorization': `Token ${token}`
          }
      })  
        setInsumos(respuesta.data)
        
      } catch (error) {
        console.error('Error al cargar insumos:', error)
      }
    }

  const getBadgeColor = (estado) => {
    return estado ? 'success' : 'danger'
  }

  useEffect(() => {
    cargarProductos()
    cargarInsumos()
  }, [])

  // Filtrar productos en tiempo real según el término ingresado
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (

    <div>
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
            <div>
              <h5 className="mb-0 text-dark fw-semibold">Catálogo de Productos</h5>
            </div>

            <div className="d-flex align-items-center gap-3" style={{ maxWidth: '450px', width: '100%' }}>
              <CFormInput
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="shadow-sm"
              />
              <CButton 
                color="primary" 
                className="d-flex align-items-center gap-2 text-nowrap"
                onClick={() => { setProductoAEditar(null); setModalOpen(true); }}
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
                    <CTableHeaderCell className="border-0" style={{ width: '30%' }}>Descripción</CTableHeaderCell>
                    <CTableHeaderCell className="text-end border-0" style={{ width: '10%' }}>Precio Unitario</CTableHeaderCell>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                
                <CTableBody>
                  {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((producto, index) => (
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

                      <CTableDataCell className="text-center">
                        <CBadge color={getBadgeColor(producto.estado)} shape="rounded-pill">
                          {producto.estado ? 'Activo' : 'Inactivo'}
                        </CBadge>
                      </CTableDataCell>
                      
                      {/* Menú de Acciones Dropdown */}
                      <CTableDataCell className="text-center">
                        <CDropdown alignment="end">
                          <CDropdownToggle color="transparent" caret={false} className="p-0 border-0 shadow-none">
                            <CIcon icon={cilOptions} className="text-muted" size="lg" />
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem 
                              onClick={() => {setProductoAEditar(producto); setModalOpen(true);}}
                              className="d-flex align-items-center gap-2"
                            >
                              <CIcon icon={cilPencil} className="text-info" />
                              Editar
                            </CDropdownItem>
                            <CDropdownItem 
                              onClick={() => {setProductoAEditar(producto); setDeleteModalOpen(true);}}
                              className="d-flex align-items-center gap-2 text-danger"
                            >
                              <CIcon icon={cilTrash} />
                              Eliminar
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center py-4 text-muted">
                      No se encontraron pruductos que coincidan con la búsqueda.
                    </CTableDataCell>
                  </CTableRow>
                )
                }
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

    <ModalFormProducto
        visible={modalOpen} 
        onClose={() => setModalOpen(false)} 
        producto={productoAEditar}
        insumos_lista={insumos}
        onSuccess={cargarProductos} // Ejecuta la recarga automática al guardar
      />
      <ModalDeleteProducto
        visible={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        producto={productoAEditar}
        onSuccess={cargarProductos} // Ejecuta la recarga automática al guardar
      />

  </div>
  )
}

export default Productos
