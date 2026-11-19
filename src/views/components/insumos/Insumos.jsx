import React, { useState, useEffect, useCallback } from 'react'
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
  CPagination,
  CPaginationItem,
  CFormInput,
  CPlaceholder,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilLayers } from '@coreui/icons'
import api from '../api/api'
import { toast } from 'react-toastify'
import ModalFormInsumo from './ModalFormInsumo'
import ModalDeleteInsumo from './ModalDeleteInsumo'

const PAGE_SIZE = 10
const ROW_HEIGHT = '54px'

const Insumos = ({ onOpenModal }) => {
  const [insumos, setInsumos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [insumoAEditar, setInsumoAEditar] = useState(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda)
      setPaginaActual(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [busqueda])

  const cargarInsumos = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = {
        page: paginaActual,
        page_size: PAGE_SIZE,
      }
      if (debouncedBusqueda.trim()) {
        params.search = debouncedBusqueda.trim()
      }

      const respuesta = await api.get('/api/insumos/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params,
      })

      if (Array.isArray(respuesta.data)) {
        const filtrados = debouncedBusqueda.trim()
          ? respuesta.data.filter((insumo) =>
              insumo.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase())
            )
          : respuesta.data
        setTotalRegistros(filtrados.length)
        const inicio = (paginaActual - 1) * PAGE_SIZE
        setInsumos(filtrados.slice(inicio, inicio + PAGE_SIZE))
      } else {
        setInsumos(respuesta.data.results || [])
        setTotalRegistros(respuesta.data.count || 0)
      }
    } catch (error) {
      console.error('Error al cargar insumos:', error)
      notificar('error', 'No se pudieron cargar los insumos.')
    } finally {
      setLoading(false)
    }
  }, [paginaActual, debouncedBusqueda])

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/categorias/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      setCategorias(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      notificar('error', 'No se pudieron cargar las categorías.')
    }
  }

  const cargarProveedores = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/proveedores/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      setProveedores(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      notificar('error', 'No se pudieron cargar los proveedores.')
    }
  }

  useEffect(() => {
    cargarInsumos()
  }, [cargarInsumos])

  useEffect(() => {
    cargarCategorias()
    cargarProveedores()
  }, [])

  const getStockBadgeColor = (stockActual, stockMinimo) => {
    const actual = Number(stockActual)
    const minimo = Number(stockMinimo)
    if (actual <= 0) return 'danger'
    if (actual <= minimo) return 'warning'
    return 'success'
  }

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE))
  const filasVacias = Math.max(0, PAGE_SIZE - insumos.length)

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-body py-3">
              <div>
                <h5 className="mb-0 text-body fw-semibold">Control de Insumos</h5>
              </div>
              <div
                className="d-flex align-items-center gap-3"
                style={{ maxWidth: '450px', width: '100%' }}
              >
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
                  onClick={() => {
                    setInsumoAEditar(null)
                    setModalOpen(true)
                  }}
                >
                  <CIcon icon={cilPlus} />
                  Agregar insumo
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody className="px-0 py-0">
              <div className="table-responsive" style={{ minHeight: '585px' }}>
                <CTable align="middle" className="mb-0 border-0" hover responsive>
                  <CTableHead className="table-theme-header text-nowrap fw-bold">
                    <CTableRow>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>
                        N°
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '25%' }}>
                        Insumo
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-end border-0" style={{ width: '15%' }}>
                        Stock Actual
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-end border-0" style={{ width: '15%' }}>
                        Stock mínimo
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '15%' }}>
                        Unidad
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '15%' }}>
                        Categoría
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '10%' }}>
                        Acciones
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {loading ? (
                      Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <CTableRow key={index} style={{ height: ROW_HEIGHT }}>
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
                                <CPlaceholder animation="glow">
                                  <CPlaceholder xs={8} />
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
                              <CPlaceholder xs={8} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={8} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={6} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={6} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={4} />
                            </CPlaceholder>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : insumos.length > 0 ? (
                      <>
                        {insumos.map((insumo, index) => (
                          <CTableRow key={insumo.id_insumos} style={{ height: ROW_HEIGHT }}>
                            <CTableDataCell className="text-center text-body-secondary fw-medium">
                              {(paginaActual - 1) * PAGE_SIZE + index + 1}
                            </CTableDataCell>

                            <CTableDataCell>
                              <div className="d-flex align-items-center gap-3">
                                <CAvatar
                                  color="warning"
                                  className="bg-opacity-10 text-warning fw-semibold"
                                >
                                  <CIcon icon={cilLayers} size="sm" />
                                </CAvatar>
                                <div className="fw-semibold text-body">{insumo.nombre}</div>
                              </div>
                            </CTableDataCell>

                            <CTableDataCell className="text-end fw-semibold text-nowrap">
                              <CBadge
                                color={getStockBadgeColor(insumo.stock_actual, insumo.stock_minimo)}
                                shape="rounded-pill"
                              >
                                {insumo.stock_actual}
                              </CBadge>
                            </CTableDataCell>

                            <CTableDataCell className="text-end fw-semibold text-body text-nowrap">
                              {insumo.stock_minimo}
                            </CTableDataCell>

                            <CTableDataCell className="text-body-secondary">{insumo.unidad}</CTableDataCell>
                            <CTableDataCell className="text-body-secondary">{insumo.categoria_detalle?.nombre}</CTableDataCell>

                            <CTableDataCell className="text-center text-nowrap">
                              <CButton
                                size="sm"
                                color="info"
                                variant="outline"
                                className="me-2"
                                onClick={() => {
                                  setInsumoAEditar(insumo)
                                  setModalOpen(true)
                                }}
                              >
                                Editar
                              </CButton>
                              <CButton
                                size="sm"
                                color="danger"
                                variant="outline"
                                onClick={() => {
                                  setInsumoAEditar(insumo)
                                  setDeleteModalOpen(true)
                                }}
                              >
                                Eliminar
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                        {Array.from({ length: filasVacias }).map((_, idx) => (
                          <CTableRow
                            key={`empty-${idx}`}
                            style={{ height: ROW_HEIGHT, pointerEvents: 'none' }}
                          >
                            <CTableDataCell colSpan="7" className="border-bottom-0" />
                          </CTableRow>
                        ))}
                      </>
                    ) : (
                      <CTableRow style={{ height: `calc(${ROW_HEIGHT} * ${PAGE_SIZE})` }}>
                        <CTableDataCell colSpan="7" className="text-center align-middle text-body-secondary">
                          No se encontraron insumos que coincidan con la búsqueda.
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
                  ? 'Cargando insumos...'
                  : `Mostrando ${insumos.length} de ${totalRegistros} insumos registrados`}
              </span>
              <CPagination className="mb-0" aria-label="Navegación de insumos">
                <CPaginationItem
                  disabled={loading || paginaActual === 1}
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                  style={{ cursor: loading || paginaActual === 1 ? 'default' : 'pointer' }}
                >
                  Anterior
                </CPaginationItem>
                {Array.from({ length: totalPaginas }).map((_, index) => {
                  const numPagina = index + 1
                  return (
                    <CPaginationItem
                      key={numPagina}
                      active={paginaActual === numPagina}
                      disabled={loading}
                      onClick={() => setPaginaActual(numPagina)}
                      style={{ cursor: loading ? 'default' : 'pointer' }}
                    >
                      {numPagina}
                    </CPaginationItem>
                  )
                })}
                <CPaginationItem
                  disabled={loading || paginaActual >= totalPaginas}
                  onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
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

      <ModalFormInsumo
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        insumo={insumoAEditar}
        categorias={categorias}
        proveedores={proveedores}
        onProveedorCreado={(proveedor) =>
          setProveedores((actuales) => [...actuales, proveedor])
        }
        onSuccess={cargarInsumos}
      />
      <ModalDeleteInsumo
        visible={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        insumo={insumoAEditar}
        onSuccess={cargarInsumos}
      />
    </div>
  )
}

export default Insumos
