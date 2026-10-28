import React, { useEffect, useState } from 'react'
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
  CBadge,
  CAvatar,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem,
  CFormInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilOptions, cilPencil, cilTrash } from '@coreui/icons'
import api from '../api/api'


const Empleados = ({ onOpenModal }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [empleados, setEmpleados] = useState([])
  // const [visibleModal, setVisibleModal] = useState(false)
  // const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)
  
  const cargarEmpleados = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/empleados/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    })  
      setEmpleados(respuesta.data)
    } catch (error) {
      console.error('Error al cargar empleados:', error)
    }
  }
  
  const getBadgeColor = (estado) => {
    return estado ? 'success' : 'danger'
  }

  useEffect(() => {
    cargarEmpleados()
  }, [])

  // Filtrar empleados en tiempo real según el término ingresado
  const empleadosFiltrados = empleados.filter((empleado) =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center bg-white py-3">
            <div>
              <h5 className="mb-0 text-dark fw-semibold">Gestión de Empleados</h5>
            </div>
            
            {/* Contenedor flex para alinear el buscador y el botón a la derecha */}
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
                Agregar empleado
              </CButton>
            </div>
          </CCardHeader>
          
          <CCardBody className="px-0 py-0">
            <div className="table-responsive">
              <CTable align="middle" className="mb-0 border-0" hover responsive>
                <CTableHead className="text-nowrap bg-light text-muted fw-bold">
                  <CTableRow>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>#</CTableHeaderCell>
                    <CTableHeaderCell className="border-0" style={{ width: '20%' }}>Empleado</CTableHeaderCell>
                    <CTableHeaderCell className="border-0" style={{ width: '15%' }}>DNI</CTableHeaderCell>
                    <CTableHeaderCell className="border-0" style={{ width: '10%' }}>Teléfono</CTableHeaderCell>
                    <CTableHeaderCell className="border-0" style={{ width: '30%' }}>Domicilio</CTableHeaderCell>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Estado</CTableHeaderCell>
                    <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                
                <CTableBody>
                  {empleadosFiltrados.length > 0 ? (
                    empleadosFiltrados.map((empleado) => (
                      <CTableRow key={empleado.id_empleados}>
                        <CTableDataCell className="text-center text-muted fw-medium">
                          {empleado.id_empleados}
                        </CTableDataCell>
                        
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-3">
                            <CAvatar color="light" text={empleado.nombre.charAt(0)} className="fw-semibold text-primary" />
                            <div>
                              <div className="fw-semibold text-dark">{empleado.nombre} {empleado.apellido}</div>
                              {/* <div className="small text-muted">{empleado.rol || 'Personal'}</div> */}
                            </div>
                          </div>
                        </CTableDataCell>
                        
                        <CTableDataCell className="text-nowrap text-secondary">
                          {empleado.dni}
                        </CTableDataCell>

                        <CTableDataCell className="text-nowrap text-secondary">
                          {empleado.telefono}
                        </CTableDataCell>
                        
                        <CTableDataCell className="text-secondary text-truncate" style={{ maxWidth: '200px' }}>
                          {empleado.domicilio}
                        </CTableDataCell>
                        
                        <CTableDataCell className="text-center">
                          <CBadge color={getBadgeColor(empleado.estado)} shape="rounded-pill">
                            {empleado.estado ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                        
                        <CTableDataCell className="text-center">
                          <CDropdown alignment="end">
                            <CDropdownToggle color="transparent" caret={false} className="p-0 border-0 shadow-none">
                              <CIcon icon={cilOptions} className="text-muted" size="lg" />
                            </CDropdownToggle>
                            <CDropdownMenu>
                              <CDropdownItem 
                                onClick={() => console.log('Editar ID:', empleados.id)}
                                className="d-flex align-items-center gap-2"
                              >
                                <CIcon icon={cilPencil} className="text-info" />
                                Editar
                              </CDropdownItem>
                              <CDropdownItem 
                                onClick={() => console.log('Eliminar ID:', empleados.id)}
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
                        No se encontraron empleados que coincidan con la búsqueda.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
          
          <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-top">
            <span className="small text-muted">
              Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
            </span>
            <CPagination className="mb-0" aria-label="Navegación de empleados">
              <CPaginationItem disabled>Anterior</CPaginationItem>
              <CPaginationItem active>1</CPaginationItem>
              <CPaginationItem disabled={empleadosFiltrados.length <= 4}>Siguiente</CPaginationItem>
            </CPagination>
          </div>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Empleados
