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
  CPagination,
  CPaginationItem,
  CFormInput,
  CBadge,
  CPlaceholder,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilFastfood } from '@coreui/icons'
import { toast } from 'react-toastify'
import api from '../api/api'
import ModalFormProducto from './ModalFormProducto'
import ModalDeleteProducto from './ModalDeleteProducto'

const PAGE_SIZE = 10
const ROW_HEIGHT = '61px'

const Productos = ({ onOpenModal }) => {
  const [productos, setProductos] = useState([])
  const [insumos, setInsumos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [busquedaDebounced, setBusquedaDebounced] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState(null)

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
      setBusquedaDebounced(busqueda)
      setPaginaActual(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [busqueda])

  const cargarProductos = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/productos/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          page: paginaActual,
          page_size: PAGE_SIZE,
          ...(busquedaDebounced.trim() ? { search: busquedaDebounced.trim() } : {}),
        },
      })

      if (Array.isArray(respuesta.data)) {
        const filtrados = busquedaDebounced.trim()
          ? respuesta.data.filter((producto) =>
              producto.nombre.toLowerCase().includes(busquedaDebounced.trim().toLowerCase())
            )
          : respuesta.data
        const inicio = (paginaActual - 1) * PAGE_SIZE
        setTotalRegistros(filtrados.length)
        setProductos(filtrados.slice(inicio, inicio + PAGE_SIZE))
      } else {
        setProductos(respuesta.data.results || [])
        setTotalRegistros(respuesta.data.count ?? 0)
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
      notificar('error', 'No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }, [paginaActual, busquedaDebounced])

  const cargarInsumos = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/insumos/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      setInsumos(Array.isArray(respuesta.data) ? respuesta.data : respuesta.data.results || [])
    } catch (error) {
      console.error('Error al cargar insumos:', error)
      notificar('error', 'No se pudieron cargar los insumos.')
    }
  }

  const getBadgeColor = (estado) => {
    return estado ? 'success' : 'danger'
  }

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  useEffect(() => {
    cargarInsumos()
  }, [])

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE))
  const filasVacias = Math.max(0, PAGE_SIZE - productos.length)

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center bg-body py-3">
              <div>
                <h5 className="mb-0 text-body fw-semibold">Catálogo de Productos</h5>
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
                    setProductoAEditar(null)
                    setModalOpen(true)
                  }}
                >
                  <CIcon icon={cilPlus} />
                  Agregar producto
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody className="px-0 py-0">
              <div className="table-responsive" style={{ minHeight: '655px' }}>
                <CTable align="middle" className="mb-0 border-0" hover responsive>
                  <CTableHead className="table-theme-header text-nowrap fw-bold">
                    <CTableRow>
                      <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>
                        N°
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '35%' }}>
                        Producto
                      </CTableHeaderCell>
                      <CTableHeaderCell className="border-0" style={{ width: '30%' }}>
                        Descripción
                      </CTableHeaderCell>
                      <CTableHeaderCell className="text-end border-0" style={{ width: '10%' }}>
                        Precio Unitario
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
                                  <CPlaceholder xs={7} />
                                </CPlaceholder>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={10} />
                            </CPlaceholder>
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            <CPlaceholder animation="glow">
                              <CPlaceholder xs={6} />
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
                    ) : productos.length > 0 ? (
                      <>
                        {productos.map((producto, index) => (
                          <CTableRow key={producto.id_productos} style={{ height: ROW_HEIGHT }}>
                            <CTableDataCell className="text-center text-body-secondary fw-medium">
                              {(paginaActual - 1) * PAGE_SIZE + index + 1}
                            </CTableDataCell>

                            <CTableDataCell>
                              <div className="d-flex align-items-center gap-3">
                                <CAvatar
                                  color="primary"
                                  className="bg-opacity-10 text-primary fw-semibold"
                                >
                                  <CIcon icon={cilFastfood} size="sm" />
                                </CAvatar>
                                <div className="fw-semibold text-body">{producto.nombre}</div>
                              </div>
                            </CTableDataCell>

                            <CTableDataCell>
                              <div
                                className="text-body-secondary text-truncate"
                                style={{ maxWidth: '350px' }}
                                title={producto.descripcion}
                              >
                                {producto.descripcion}
                              </div>
                            </CTableDataCell>

                            <CTableDataCell className="text-end fw-semibold text-body text-nowrap">
                              ${producto.precio_unitario}
                            </CTableDataCell>

                            <CTableDataCell className="text-center">
                              <CBadge color={getBadgeColor(producto.estado)} shape="rounded-pill">
                                {producto.estado ? 'Activo' : 'Inactivo'}
                              </CBadge>
                            </CTableDataCell>

                            <CTableDataCell className="text-center text-nowrap">
                              <CButton
                                size="sm"
                                color="info"
                                variant="outline"
                                className="me-2"
                                onClick={() => {
                                  setProductoAEditar(producto)
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
                                  setProductoAEditar(producto)
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
                            <CTableDataCell colSpan="6" className="border-bottom-0" />
                          </CTableRow>
                        ))}
                      </>
                    ) : (
                      <>
                        <CTableRow style={{ height: ROW_HEIGHT }}>
                          <CTableDataCell colSpan="6" className="text-center text-body-secondary">
                            No se encontraron productos que coincidan con la búsqueda.
                          </CTableDataCell>
                        </CTableRow>
                        {Array.from({ length: PAGE_SIZE - 1 }).map((_, idx) => (
                          <CTableRow
                            key={`empty-search-${idx}`}
                            style={{ height: ROW_HEIGHT, pointerEvents: 'none' }}
                          >
                            <CTableDataCell colSpan="6" className="border-bottom-0" />
                          </CTableRow>
                        ))}
                      </>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>

            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-body border-top">
              <span className="small text-body-secondary">
                {loading
                  ? 'Cargando productos...'
                  : `Mostrando ${productos.length} de ${totalRegistros} productos`}
              </span>
              <CPagination className="mb-0" aria-label="Navegación de productos">
                <CPaginationItem
                  disabled={loading || paginaActual === 1}
                  style={{ cursor: loading || paginaActual === 1 ? 'default' : 'pointer' }}
                  onClick={() => paginaActual > 1 && setPaginaActual((prev) => prev - 1)}
                >
                  Anterior
                </CPaginationItem>
                {Array.from({ length: totalPaginas }).map((_, idx) => {
                  const numeroPagina = idx + 1
                  return (
                    <CPaginationItem
                      key={numeroPagina}
                      active={paginaActual === numeroPagina}
                      disabled={loading}
                      style={{ cursor: loading ? 'default' : 'pointer' }}
                      onClick={() => setPaginaActual(numeroPagina)}
                    >
                      {numeroPagina}
                    </CPaginationItem>
                  )
                })}
                <CPaginationItem
                  disabled={loading || paginaActual >= totalPaginas}
                  style={{
                    cursor: loading || paginaActual >= totalPaginas ? 'default' : 'pointer',
                  }}
                  onClick={() => paginaActual < totalPaginas && setPaginaActual((prev) => prev + 1)}
                >
                  Siguiente
                </CPaginationItem>
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
        onSuccess={cargarProductos}
      />
      <ModalDeleteProducto
        visible={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        producto={productoAEditar}
        onSuccess={cargarProductos}
      />
    </div>
  )
}

export default Productos
