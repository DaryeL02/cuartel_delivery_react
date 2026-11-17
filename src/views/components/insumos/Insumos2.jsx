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
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilOptions, cilPencil, cilTrash, cilLayers } from '@coreui/icons'
import api from '../api/api'
import ModalFormInsumo from './ModalFormInsumo'
import ModalDeleteInsumo from './ModalDeleteInsumo'

const Insumos = ({ onOpenModal }) => {
  
  const [insumos, setInsumos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [insumoAEditar, setInsumoAEditar] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  
  // Estados nuevos para controlar la paginación de 10 registros
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  const cargarCategorias = async () => {
  try {
    const token = localStorage.getItem('token')
    const respuesta = await api.get('/api/categorias/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    }) 
    setCategorias(respuesta.data)
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    }
  }

  const cargarProveedores = async () => {
  try {
    const token = localStorage.getItem('token')
    const respuesta = await api.get('/api/proveedores/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    }) 
    setProveedores(respuesta.data)
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    }
  }

  useEffect(() => {
    cargarInsumos()
    cargarCategorias()
    cargarProveedores()
  }, [])

  // Reiniciar a la página 1 cada vez que el usuario escribe en el buscador
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const insumosFiltrados = insumos.filter((insumo) =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Lógica de Paginación matemática
  const totalPages = Math.ceil(insumosFiltrados.length / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  
  // Segmento exacto de hasta 10 insumos que se van a mostrar en la página actual
  const insumosPaginados = insumosFiltrados.slice(indexOfFirstItem, indexOfLastItem)

  // Cálculo de filas vacías necesarias para rellenar el espacio en blanco y mantener la simetría visual
  const totalFilasMostradas = insumosPaginados.length
  const filasFaltantes = itemsPerPage - totalFilasMostradas

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
              <div>
                <h5 className="mb-0 text-dark fw-semibold">Control de Insumos</h5>
              </div>
              <div className="d-flex align-items-center gap-3" style={{ maxWidth: '450px', width: '100%' }}>
                <CFormInput
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="shadow-sm"
                />
                <CButton 
                  color="primary" 
                  className="d-flex align-items-center gap-2 text-nowrap"
                  onClick={() => { setInsumoAEditar(null); setModalOpen(true); }}
                >
                  <CIcon icon={cilPlus} />
                  Agregar insumo
                </CButton>
              </div>  
            </CCardHeader>
            
            <CCardBody className="px-0 py-0">
              <div className="table-responsive">
                <CTable align="middle" className="mb-0 border-0" hover responsive>
                  <CTableHead className="text-nowrap bg-light text-muted fw-bold">
                    <CTableRow>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>N°</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '25%' }}>Insumo</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '30%' }}>Descripción</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '10%' }}>Categoria</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '10%' }}>Proveedor</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '5%' }}>Stock Actual</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '5%' }}>Stock mínimo</CTableHeaderCell>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  
                  <CTableBody>
                    {insumosFiltrados.length > 0 ? (
                      <>
                        {/* Renderizado de las filas con datos reales correspondientes a la página */}
                        {insumosPaginados.map((insumo, index) => (
                          <CTableRow key={insumo.id_insumos} style={{ height: '57px' }}>
                            {/* N° correlativo continuo basado en la paginación */}
                            <CTableDataCell className="text-center text-muted fw-medium">
                              {indexOfFirstItem + index + 1}
                            </CTableDataCell>
                            
                            <CTableDataCell>
                              <div className="d-flex align-items-center gap-3">
                                <CAvatar color="warning" className="bg-opacity-10 text-warning fw-semibold">
                                  <CIcon icon={cilLayers} size="sm" />
                                </CAvatar>
                                <div className="fw-semibold text-dark">{insumo.nombre}</div>
                              </div>
                            </CTableDataCell>
                            
                            <CTableDataCell>
                              <div 
                                className="text-secondary text-truncate" 
                                style={{ maxWidth: '380px' }}
                                title={insumo.descripcion}
                              >
                                {insumo.descripcion}
                              </div>
                            </CTableDataCell>
                            
                            <CTableDataCell className="text-secondary text-truncate">
                              {insumo.categoria_detalle.nombre}
                            </CTableDataCell>

                            <CTableDataCell className="text-secondary text-truncate">
                              {insumo.proveedores_asociados && insumo.proveedores_asociados.length > 0 ? (
                                insumo.proveedores_asociados.map((item) => (
                                  <div key={item.id_proveedores_insumos}>
                                    {item.proveedor?.nombre || 'Proveedor sin nombre'}
                                  </div>
                                ))
                              ) : (
                                <span>Sin proveedor asignado</span>
                              )}
                            </CTableDataCell>

                            <CTableDataCell className="text-end fw-semibold text-dark text-nowrap">
                              {insumo.stock_actual}
                            </CTableDataCell>

                            <CTableDataCell className="text-end fw-semibold text-dark text-nowrap">
                              {insumo.stock_minimo}
                            </CTableDataCell>
                            
                            <CTableDataCell className="text-center">
                              <CDropdown alignment="end">
                                <CDropdownToggle color="transparent" caret={false} className="p-0 border-0 shadow-none">
                                  <CIcon icon={cilOptions} className="text-muted" size="lg" />
                                </CDropdownToggle>
                                <CDropdownMenu>
                                  <CDropdownItem 
                                    onClick={() => {setInsumoAEditar(insumo); setModalOpen(true);}}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <CIcon icon={cilPencil} className="text-info" />
                                    Editar
                                  </CDropdownItem>
                                  <CDropdownItem 
                                    onClick={() => {setInsumoAEditar(insumo); setDeleteModalOpen(true);}}  
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

                        {/* Generación de zonas o filas blancas restantes para rellenar la altura de la estructura fija */}
                        {filasFaltantes > 0 && Array.from({ length: filasFaltantes }).map((_, i) => (
                          <CTableRow key={`empty-${i}`} style={{ height: '57px' }}>
                            <CTableDataCell colSpan="8" className="border-0">&nbsp;</CTableDataCell>
                          </CTableRow>
                        ))}
                      </>
                    ) : (
                      // Si no hay ningún resultado que coincida en absoluto con el filtro
                      <>
                        <CTableRow>
                          <CTableDataCell colSpan="8" className="text-center py-4 text-muted" style={{ height: '57px' }}>
                            No se encontraron insumos que coincidan con la búsqueda.
                          </CTableDataCell>
                        </CTableRow>
                        {/* Incluso vacío se rellenan las 9 filas sobrantes visuales */}
                        {Array.from({ length: itemsPerPage - 1 }).map((_, i) => (
                          <CTableRow key={`empty-search-${i}`} style={{ height: '57px' }}>
                            <CTableDataCell colSpan="8" className="border-0">&nbsp;</CTableDataCell>
                          </CTableRow>
                        ))}
                      </>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
            
            {/* Footer de Paginación totalmente dinámico */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-top">
              <span className="small text-muted">
                Mostrando {Math.min(indexOfFirstItem + 1, insumosFiltrados.length)} al {Math.min(indexOfLastItem, insumosFiltrados.length)} de {insumosFiltrados.length} insumos registrados
              </span>
              <CPagination className="mb-0" aria-label="Navegación de insumos">
                <CPaginationItem 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                >
                  Anterior
                </CPaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <CPaginationItem
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    style={{ cursor: 'pointer' }}
                  >
                    {index + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                >
                  Siguiente
                </CPaginationItem>
              </CPagination>
            </div>
          </CCard>
        </CCol>
      </CRow>

      <ModalFormInsumo 
        visible={modalOpen} 
        onClose={() => setModalOpen(false)} 
        insumo={insumoAEditar}
        categorias={categorias}
        proveedores={proveedores}
        onSuccess={cargarInsumos}
      />
    </div>
  )
}

export default Insumos
