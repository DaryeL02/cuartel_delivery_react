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

const Insumos = ({ onOpenModal }) => {
  
  const [insumos, setInsumos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [insumoAEditar, setInsumoAEditar] = useState(null)
  const [categorias, setCategorias] = useState([])
  

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

  useEffect(() => {
    cargarInsumos()
    cargarCategorias()
  }, [])

  const insumosFiltrados = insumos.filter((insumo) =>
  insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
              <div>
                <h5 className="mb-0 text-dark fw-semibold">Control de Insumos</h5>
                <small className="text-muted">Administra las materias primas, costos base y stock de la cocina</small>
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
                      <CTableHeaderCell className="border-0" style={{ width: '25%' }}>Insumo / Materia Prima</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '40%' }}>Descripción / Unidad</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '10%' }}>Stock Actual</CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '10%' }}>Stock mínimo</CTableHeaderCell>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  
                  <CTableBody>
                    {insumosFiltrados.map((insumo, index) => (
                      <CTableRow key={insumo.id_insumos}>
                        {/* N° Autogenerado secuencial */}
                        <CTableDataCell className="text-center text-muted fw-medium">
                          {index + 1}
                        </CTableDataCell>
                        
                        {/* Icono de Inventario + Nombre */}
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-3">
                            <CAvatar color="warning" className="bg-opacity-10 text-warning fw-semibold">
                              <CIcon icon={cilLayers} size="sm" />
                            </CAvatar>
                            <div className="fw-semibold text-dark">{insumo.nombre}</div>
                          </div>
                        </CTableDataCell>
                        
                        {/* Descripción controlada con límite visual */}
                        <CTableDataCell>
                          <div 
                            className="text-secondary text-truncate" 
                            style={{ maxWidth: '380px' }}
                            title={insumo.descripcion}
                          >
                            {insumo.descripcion}
                          </div>
                        </CTableDataCell>
                        
                        {/* Precio o Costo unitario base */}
                        <CTableDataCell className="text-end fw-semibold text-dark text-nowrap">
                          {insumo.stock_actual}
                        </CTableDataCell>

                        {/* Precio o Costo unitario base */}
                        <CTableDataCell className="text-end fw-semibold text-dark text-nowrap">
                          {insumo.stock_minimo}
                        </CTableDataCell>
                        
                        {/* Menú de Acciones Dropdown */}
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
                                onClick={() => {setInsumoAEditar(insumo); setModalOpen(true);}}  
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
            
            {/* Footer de Paginación */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-top">
              <span className="small text-muted">Mostrando {insumosFiltrados.length} insumos registrados</span>
              <CPagination className="mb-0" aria-label="Navegación de insumos">
                <CPaginationItem disabled>Anterior</CPaginationItem>
                <CPaginationItem active>1</CPaginationItem>
                <CPaginationItem disabled>Siguiente</CPaginationItem>
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
        onSuccess={cargarInsumos} // Ejecuta la recarga automática al guardar
      />
    </div>

  )
}

export default Insumos
