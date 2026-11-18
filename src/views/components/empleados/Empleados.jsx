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
  CFormInput,
  CPlaceholder,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilOptions, cilPencil, cilTrash } from '@coreui/icons'
import api from '../api/api'
import ModalFormEmpleado from './ModalFormEmpleado'
import ModalDeleteEmpleado from './ModalDeleteEmpleado'
import { toast } from 'react-toastify'

const Empleados = ({ onOpenModal }) => {
  const [empleados, setEmpleados] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [locales, setLocales] = useState([])
  const [roles, setRoles] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [empleadoAEditar, setEmpleadoAEditar] = useState(null)
  const [loading, setLoading] = useState(true)

  const [paginaActual, setPaginaActual] = useState(1)
  const [totalEmpleados, setTotalEmpleados] = useState(0)
  const registrosPorPagina = 10

  const notificar = (tipo, mensaje) => {
    switch (tipo) {
      case 'exito':
        toast.success(mensaje)
        break
      case 'error':
        toast.error(mensaje)
        break
      case 'advertencia':
        toast.warning(mensaje)
        break
      default:
        toast(mensaje)
    }
  }

  const cargarEmpleados = async (pagina = paginaActual, filtroNombre = busqueda) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/empleados/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          page: pagina,
          page_size: registrosPorPagina,
          search: filtroNombre.trim() || undefined,
        },
      })

      if (Array.isArray(respuesta.data)) {
        setEmpleados(respuesta.data)
        setTotalEmpleados(respuesta.data.length)
      } else {
        setEmpleados(respuesta.data.results || [])
        setTotalEmpleados(respuesta.data.count || 0)
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error)
      notificar('error', 'No se pudo cargar el listado de empleados.')
    } finally {
      setLoading(false)
    }
  }

  const cargarLocales = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/locales/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      setLocales(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar locales:', error)
      notificar('error', 'No se pudieron cargar los locales.')
    }
  }

  const cargarRoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/roles/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      setRoles(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar roles:', error)
      notificar('error', 'No se pudieron cargar los roles.')
    }
  }

  const getBadgeColor = (estado) => {
    return estado ? 'success' : 'danger'
  }

  useEffect(() => {
    cargarLocales()
    cargarRoles()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarEmpleados(paginaActual, busqueda)
    }, 350)

    return () => clearTimeout(timer)
  }, [paginaActual, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(totalEmpleados / registrosPorPagina))
  const filasVacias = Math.max(0, registrosPorPagina - empleados.length)

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-body py-3">
              <div>
                <h5 className="mb-0 text-body fw-semibold">Gestión de Empleados</h5>
              </div>

              <div
                className="d-flex align-items-center gap-3"
                style={{ maxWidth: '450px', width: '100%' }}
              >
                <CFormInput
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value)
                    setPaginaActual(1)
                  }}
                  className="shadow-sm"
                />
                <CButton
                  color="primary"
                  className="d-flex align-items-center gap-2 text-nowrap"
                  onClick={() => {
                    setEmpleadoAEditar(null)
                    setModalOpen(true)
                  }}
                >
                  <CIcon icon={cilPlus} />
                  Agregar empleado
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody className="px-0 py-0">
              <div className="table-responsive" style={{ minHeight: '615px' }}>
                <CTable align="middle" className="mb-0 border-0" hover responsive>
                  <CTableHead className="table-theme-header text-nowrap fw-bold">
                    <CTableRow style={{ height: '48px' }}>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>
                        N°
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '20%' }}>
                        Empleado
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '15%' }}>
                        Rol
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '10%' }}>
                        Sucursal
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>
                        Estado
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>
                        Acciones
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {loading ? (
                      Array.from({ length: registrosPorPagina }).map((_, index) => (
                        <CTableRow key={index} style={{ height: '56px' }}>
                          <CTableDataCell className="text-center">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={6} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-3">
                              <CPlaceholder
                                animation="glow"
                                className="rounded-circle"
                                style={{ width: '38px', height: '38px', flexShrink: 0 }}
                              >
                                <CPlaceholder xs={12} className="h-100 rounded-circle" />
                              </CPlaceholder>
                              <div className="w-100">
                                <CPlaceholder animation="glow" className="mb-1">
                                  <CPlaceholder xs={8} />
                                </CPlaceholder>
                                <CPlaceholder animation="glow">
                                  <CPlaceholder xs={5} size="sm" />
                                </CPlaceholder>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={10} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={7} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={4} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={8} className="rounded-pill" />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={4} />
                            </CPlaceholder>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : empleados.length > 0 ? (
                      <>
                        {empleados.map((empleado, index) => {
                          const rolNombre =
                            empleado.usuario_detalle?.roles_asignados?.[0]?.rol_detalle?.nombre

                          return (
                            <CTableRow key={empleado.id_empleados} style={{ height: '56px' }}>
                              <CTableDataCell className="text-center text-body-secondary fw-medium">
                                {(paginaActual - 1) * registrosPorPagina + index + 1}
                              </CTableDataCell>

                              <CTableDataCell>
                                <div className="d-flex align-items-center gap-3">
                                  <CAvatar
                                    color="light"
                                    text={empleado.nombre ? empleado.nombre.charAt(0).toUpperCase() : '?'}
                                    className="fw-semibold text-primary"
                                  />
                                  <div>
                                    <div className="fw-semibold text-body">
                                      {empleado.nombre} {empleado.apellido}
                                    </div>
                                  </div>
                                </div>
                              </CTableDataCell>

                              <CTableDataCell className="text-body-secondary">
                                {empleado.rol_nombre || rolNombre || 'Sin rol'}
                              </CTableDataCell>

                              <CTableDataCell
                                className="text-body-secondary text-truncate"
                                style={{ maxWidth: '200px' }}
                              >
                                {empleado.local_detalle?.nombre}
                              </CTableDataCell>

                              <CTableDataCell className="text-center">
                                <CBadge color={getBadgeColor(empleado.estado)} shape="rounded-pill">
                                  {empleado.estado ? 'Activo' : 'Inactivo'}
                                </CBadge>
                              </CTableDataCell>

                              <CTableDataCell className="text-center">
                                <CDropdown alignment="end">
                                  <CDropdownToggle
                                    color="transparent"
                                    caret={false}
                                    className="p-0 border-0 shadow-none"
                                  >
                                    <CIcon icon={cilOptions} className="text-body-secondary" size="lg" />
                                  </CDropdownToggle>
                                  <CDropdownMenu>
                                    <CDropdownItem
                                      onClick={() => {
                                        setEmpleadoAEditar(empleado)
                                        setModalOpen(true)
                                      }}
                                      className="d-flex align-items-center gap-2"
                                    >
                                      <CIcon icon={cilPencil} className="text-info" />
                                      Editar
                                    </CDropdownItem>
                                    <CDropdownItem
                                      onClick={() => {
                                        setEmpleadoAEditar(empleado)
                                        setDeleteModalOpen(true)
                                      }}
                                      className="d-flex align-items-center gap-2 text-danger"
                                    >
                                      <CIcon icon={cilTrash} />
                                      Eliminar
                                    </CDropdownItem>
                                  </CDropdownMenu>
                                </CDropdown>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                        {Array.from({ length: filasVacias }).map((_, index) => (
                          <CTableRow
                            key={`empty-${index}`}
                            style={{ height: '56px', pointerEvents: 'none' }}
                          >
                            <CTableDataCell colSpan="6" className="border-0 bg-transparent" />
                          </CTableRow>
                        ))}
                      </>
                    ) : (
                      <CTableRow style={{ height: '560px' }}>
                        <CTableDataCell colSpan="6" className="text-center align-middle text-body-secondary">
                          No se encontraron empleados que coincidan con la búsqueda.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>

            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-body border-top">
              <span className="small text-body-secondary">
                {loading
                  ? 'Cargando empleados...'
                  : `Mostrando ${empleados.length} de ${totalEmpleados} empleados`}
              </span>
              <CPagination className="mb-0" aria-label="Navegación de empleados">
                <CPaginationItem
                  disabled={loading || paginaActual === 1}
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                  style={{ cursor: loading || paginaActual === 1 ? 'default' : 'pointer' }}
                >
                  Anterior
                </CPaginationItem>

                {Array.from({ length: totalPaginas }).map((_, index) => {
                  const numeroPagina = index + 1
                  return (
                    <CPaginationItem
                      key={numeroPagina}
                      active={paginaActual === numeroPagina}
                      disabled={loading}
                      onClick={() => setPaginaActual(numeroPagina)}
                      style={{ cursor: loading ? 'default' : 'pointer' }}
                    >
                      {numeroPagina}
                    </CPaginationItem>
                  )
                })}

                <CPaginationItem
                  disabled={loading || paginaActual >= totalPaginas}
                  onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                  style={{
                    cursor: loading || paginaActual >= totalPaginas ? 'default' : 'pointer',
                  }}
                >
                  Siguiente
                </CPaginationItem>
              </CPagination>
            </div>
          </CCard>
        </CCol>
      </CRow>
      <ModalFormEmpleado
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        empleado={empleadoAEditar}
        roles={roles}
        locales={locales}
        onSuccess={() => cargarEmpleados(paginaActual, busqueda)}
      />
      <ModalDeleteEmpleado
        visible={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        empleado={empleadoAEditar}
        onSuccess={() => {
          const nuevaPagina =
            empleados.length === 1 && paginaActual > 1 ? paginaActual - 1 : paginaActual
          setPaginaActual(nuevaPagina)
          cargarEmpleados(nuevaPagina, busqueda)
        }}
      />
    </div>
  )
}

export default Empleados
