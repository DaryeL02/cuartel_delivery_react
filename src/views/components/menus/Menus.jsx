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
  CFormSelect,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilOptions,
  cilPencil,
  cilTrash,
  cilFastfood,
  cilCheckCircle,
  cilHistory,
  cilBan,
} from '@coreui/icons'
import { toast } from 'react-toastify'

import ModalAgregarMenu from './ModalAgregarMenu'
import ModalActualizarMenu from './ModalActualizarMenu'
import ModalEstadoMenu from './ModalEstadoMenu'
import ModalEliminarMenu from './ModalEliminarMenu'
import MenuDigitalActivo from './MenuDigitalActivo'
import HistorialPrecios from './HistorialPrecios'

const PAGE_SIZE = 10
const ROW_HEIGHT = '54px'

const Menus = () => {
  const [activeTab, setActiveTab] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')
  const [paginaActual, setPaginaActual] = useState(1)

  // Estados de modales separados
  const [agregarModalOpen, setAgregarModalOpen] = useState(false)
  const [actualizarModalOpen, setActualizarModalOpen] = useState(false)
  const [estadoModalOpen, setEstadoModalOpen] = useState(false)
  const [eliminarModalOpen, setEliminarModalOpen] = useState(false)
  const [menuSeleccionado, setMenuSeleccionado] = useState(null)

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

  const [menus, setMenus] = useState([
    {
      id_menu: 1,
      nombre: 'Lomito Completo El Cuartel',
      categoria: 'Sándwiches',
      descripcion: 'Pan casero, bife de lomo, jamón, queso, huevo, lechuga, tomate y papas fritas.',
      precio: 12500,
      es_combo: false,
      estado: true,
    },
    {
      id_menu: 2,
      nombre: 'Combo Cuartelero Doble',
      categoria: 'Combos',
      descripcion: '2 Sándwiches de milanesa completos + 1 Gaseosa 1.5L + Porción grande de papas.',
      precio: 22000,
      es_combo: true,
      estado: true,
    },
    {
      id_menu: 3,
      nombre: 'Sándwich de Bondiola Braseada',
      categoria: 'Sándwiches',
      descripcion: 'Bondiola desmenuzada a la cerveza negra con cebolla caramelizada y cheddar.',
      precio: 11800,
      es_combo: false,
      estado: false,
    },
    {
      id_menu: 4,
      nombre: 'Promo Mediodía: Milanesa + Lata',
      categoria: 'Promociones',
      descripcion: 'Sándwich de milanesa clásico + gaseosa en lata 354ml (Lun a Vie 12 a 15hs).',
      precio: 9500,
      es_combo: true,
      estado: true,
    },
  ])

  const [historial, setHistorial] = useState([
    {
      id_historial: 1,
      fecha_hora: '17/11/2026 14:20',
      usuario: 'admin_dueño',
      menu_nombre: 'Lomito Completo El Cuartel',
      tipo_cambio: 'Modificación de Precio',
      detalle: '$11.500 → $12.500 (+8.7%)',
    },
    {
      id_historial: 2,
      fecha_hora: '17/11/2026 11:05',
      usuario: 'admin_dueño',
      menu_nombre: 'Sándwich de Bondiola Braseada',
      tipo_cambio: 'Cambio de Estado',
      detalle: 'Activo → Inactivo (Falta de insumos)',
    },
    {
      id_historial: 3,
      fecha_hora: '15/11/2026 19:30',
      usuario: 'encargado_turno',
      menu_nombre: 'Combo Cuartelero Doble',
      tipo_cambio: 'Alta de Menú',
      detalle: 'Registrado con precio inicial $22.000',
    },
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda)
      setPaginaActual(1)
    }, 350)
    return () => clearTimeout(timers)
  }, [busqueda])

  const registrarLog = (menuNombre, tipoCambio, detalle) => {
    const ahora = new Date()
    const fechaFormateada = `${ahora.toLocaleDateString('es-AR')} ${ahora.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`

    setHistorial((prev) => [
      {
        id_historial: Date.now(),
        fecha_hora: fechaFormateada,
        usuario: 'admin_dueño',
        menu_nombre: menuNombre,
        tipo_cambio: tipoCambio,
        detalle,
      },
      ...prev,
    ])
  }

  // Handlers de acciones
  const handleAgregarMenu = (nuevoMenu) => {
    setMenus((prev) => [nuevoMenu, ...prev])
    registrarLog(
      nuevoMenu.nombre,
      nuevoMenu.es_combo ? 'Alta de Combo' : 'Alta de Menú',
      `Registrado con precio inicial $${Number(nuevoMenu.precio).toLocaleString('es-AR')}`
    )
    notificar('exito', 'Menú registrado con éxito.')
  }

  const handleActualizarMenu = (menuEditado) => {
    const anterior = menus.find((m) => m.id_menu === menuEditado.id_menu)
    setMenus((prev) =>
      prev.map((m) => (m.id_menu === menuEditado.id_menu ? menuEditado : m))
    )

    if (anterior && Number(anterior.precio) !== Number(menuEditado.precio)) {
      const diff = (((menuEditado.precio - anterior.precio) / anterior.precio) * 100).toFixed(1)
      const signo = diff > 0 ? '+' : ''
      registrarLog(
        menuEditado.nombre,
        'Modificación de Precio',
        `$${Number(anterior.precio).toLocaleString('es-AR')} → $${Number(
          menuEditado.precio
        ).toLocaleString('es-AR')} (${signo}${diff}%)`
      )
    } else {
      registrarLog(menuEditado.nombre, 'Actualización de Datos', 'Se modificó descripción o categoría')
    }

    notificar('exito', 'Menú actualizado con éxito.')
  }

  const handleEstadoMenu = (menu, motivo) => {
    const nuevoEstado = !menu.estado
    setMenus((prev) =>
      prev.map((m) => (m.id_menu === menu.id_menu ? { ...m, estado: nuevoEstado } : m))
    )

    registrarLog(
      menu.nombre,
      'Cambio de Estado',
      `${menu.estado ? 'Activo' : 'Inactivo'} → ${nuevoEstado ? 'Activo' : 'Inactivo'} (${motivo})`
    )

    if (nuevoEstado) {
      notificar('exito', `"${menu.nombre}" activado en la carta.`)
    } else {
      notificar('advertencia', `"${menu.nombre}" desactivado y ocultado de toma de pedidos.`)
    }
  }

  const handleEliminarMenu = (menu) => {
    setMenus((prev) => prev.filter((m) => m.id_menu !== menu.id_menu))
    registrarLog(menu.nombre, 'Eliminación de Menú', 'Eliminado de la carta comercial')
    notificar('exito', 'Menú eliminado con éxito.')
  }

  // Filtrado y paginación
  const menusFiltrados = menus.filter((m) => {
    const coincideNombre = m.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === 'TODAS' || m.categoria === filtroCategoria
    return coincideNombre && coincideCategoria
  })

  const totalRegistros = menusFiltrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE))
  const inicio = (paginaActual - 1) * PAGE_SIZE
  const menusPaginados = menusFiltrados.slice(inicio, inicio + PAGE_SIZE)
  const filasVacias = Math.max(0, PAGE_SIZE - menusPaginados.length)

  return (
    <div>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3 bg-body py-3">
              <div>
                <h5 className="mb-0 text-body fw-semibold">Gestión de Menús</h5>
              </div>

              {activeTab === 1 && (
                <div
                  className="d-flex align-items-center gap-2"
                  style={{ maxWidth: '620px', width: '100%' }}
                >
                  <CFormSelect
                    value={filtroCategoria}
                    onChange={(e) => {
                      setFiltroCategoria(e.target.value)
                      setPaginaActual(1)
                    }}
                    style={{ maxWidth: '180px' }}
                    className="shadow-sm"
                  >
                    <option value="TODAS">Todas las categorías</option>
                    <option value="Sándwiches">Sándwiches</option>
                    <option value="Combos">Combos</option>
                    <option value="Promociones">Promociones</option>
                    <option value="Bebidas">Bebidas</option>
                  </CFormSelect>

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
                    onClick={() => setAgregarModalOpen(true)}
                  >
                    <CIcon icon={cilPlus} />
                    Agregar menú
                  </CButton>
                </div>
              )}
            </CCardHeader>

            <div className="px-3 pt-2 bg-body border-bottom">
              <CNav variant="tabs" role="tablist" className="border-bottom-0">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 1}
                    onClick={() => setActiveTab(1)}
                    style={{ cursor: 'pointer' }}
                    className="d-flex align-items-center gap-2 fw-medium"
                  >
                    <CIcon icon={cilFastfood} />
                    Administración de Carta
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 2}
                    onClick={() => setActiveTab(2)}
                    style={{ cursor: 'pointer' }}
                    className="d-flex align-items-center gap-2 fw-medium"
                  >
                    <CIcon icon={cilCheckCircle} className="text-success" />
                    Menú Digital Activo
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 3}
                    onClick={() => setActiveTab(3)}
                    style={{ cursor: 'pointer' }}
                    className="d-flex align-items-center gap-2 fw-medium"
                  >
                    <CIcon icon={cilHistory} className="text-info" />
                    Historial y Variación de Precios
                  </CNavLink>
                </CNavItem>
              </CNav>
            </div>

            <CCardBody className="px-0 py-0">
              <CTabContent>
                {/* PESTAÑA 1: LISTADO PRINCIPAL */}
                <CTabPane visible={activeTab === 1}>
                  <div className="table-responsive" style={{ minHeight: '585px' }}>
                    <CTable align="middle" className="mb-0 border-0" hover responsive>
                      <CTableHead className="table-theme-header text-nowrap fw-bold">
                        <CTableRow>
                          <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>
                            N°
                          </CTableHeaderCell>
                          <CTableHeaderCell className="border-0" style={{ width: '25%' }}>
                            Menú / Producto
                          </CTableHeaderCell>
                          <CTableHeaderCell className="border-0" style={{ width: '32%' }}>
                            Descripción
                          </CTableHeaderCell>
                          <CTableHeaderCell className="border-0" style={{ width: '11%' }}>
                            Categoría
                          </CTableHeaderCell>
                          <CTableHeaderCell className="text-end border-0" style={{ width: '10%' }}>
                            Precio
                          </CTableHeaderCell>
                          <CTableHeaderCell className="text-center border-0" style={{ width: '9%' }}>
                            Estado
                          </CTableHeaderCell>
                          <CTableHeaderCell className="text-center border-0" style={{ width: '8%' }}>
                            Acciones
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>

                      <CTableBody>
                        {menusPaginados.length > 0 ? (
                          <>
                            {menusPaginados.map((menu, index) => (
                              <CTableRow
                                key={menu.id_menu}
                                style={{ height: ROW_HEIGHT }}
                                className={!menu.estado ? 'opacity-75' : ''}
                              >
                                <CTableDataCell className="text-center text-body-secondary fw-medium">
                                  {inicio + index + 1}
                                </CTableDataCell>

                                <CTableDataCell>
                                  <div className="d-flex align-items-center gap-3">
                                    <CAvatar
                                      color={menu.es_combo ? 'info' : 'warning'}
                                      className={`bg-opacity-10 ${
                                        menu.es_combo ? 'text-info' : 'text-warning'
                                      } fw-semibold`}
                                    >
                                      <CIcon icon={cilFastfood} size="sm" />
                                    </CAvatar>
                                    <div className="fw-semibold text-body d-flex align-items-center gap-2">
                                      {menu.nombre}
                                      {menu.es_combo && (
                                        <CBadge color="info" shape="rounded-pill">
                                          Combo
                                        </CBadge>
                                      )}
                                    </div>
                                  </div>
                                </CTableDataCell>

                                <CTableDataCell>
                                  <div
                                    className="text-body-secondary text-truncate"
                                    style={{ maxWidth: '380px' }}
                                    title={menu.descripcion}
                                  >
                                    {menu.descripcion}
                                  </div>
                                </CTableDataCell>

                                <CTableDataCell className="text-body-secondary text-truncate">
                                  {menu.categoria}
                                </CTableDataCell>

                                <CTableDataCell className="text-end fw-semibold text-body text-nowrap">
                                  ${Number(menu.precio).toLocaleString('es-AR')}
                                </CTableDataCell>

                                <CTableDataCell className="text-center text-nowrap">
                                  <CBadge
                                    color={menu.estado ? 'success' : 'danger'}
                                    shape="rounded-pill"
                                  >
                                    {menu.estado ? 'Activo' : 'Inactivo'}
                                  </CBadge>
                                </CTableDataCell>

                                <CTableDataCell className="text-center">
                                  <CDropdown alignment="end">
                                    <CDropdownToggle
                                      color="transparent"
                                      caret={false}
                                      className="p-0 border-0 shadow-none"
                                    >
                                      <CIcon
                                        icon={cilOptions}
                                        className="text-body-secondary"
                                        size="lg"
                                      />
                                    </CDropdownToggle>
                                    <CDropdownMenu>
                                      <CDropdownItem
                                        onClick={() => {
                                          setMenuSeleccionado(menu)
                                          setActualizarModalOpen(true)
                                        }}
                                        className="d-flex align-items-center gap-2"
                                      >
                                        <CIcon icon={cilPencil} className="text-info" />
                                        Editar
                                      </CDropdownItem>
                                      <CDropdownItem
                                        onClick={() => {
                                          setMenuSeleccionado(menu)
                                          setEstadoModalOpen(true)
                                        }}
                                        className={`d-flex align-items-center gap-2 ${
                                          menu.estado ? 'text-warning' : 'text-success'
                                        }`}
                                      >
                                        <CIcon
                                          icon={menu.estado ? cilBan : cilCheckCircle}
                                        />
                                        {menu.estado ? 'Desactivar' : 'Activar'}
                                      </CDropdownItem>
                                      <CDropdownItem
                                        onClick={() => {
                                          setMenuSeleccionado(menu)
                                          setEliminarModalOpen(true)
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
                            <CTableDataCell
                              colSpan="7"
                              className="text-center align-middle text-body-secondary"
                            >
                              No se encontraron menús que coincidan con la búsqueda.
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                  </div>

                  <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-body border-top">
                    <span className="small text-body-secondary">
                      Mostrando {menusPaginados.length} de {totalRegistros} menús registrados
                    </span>
                    <CPagination className="mb-0" aria-label="Navegación de menús">
                      <CPaginationItem
                        disabled={paginaActual === 1}
                        onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                        style={{ cursor: paginaActual === 1 ? 'default' : 'pointer' }}
                      >
                        Anterior
                      </CPaginationItem>
                      {Array.from({ length: totalPaginas }).map((_, index) => {
                        const numPagina = index + 1
                        return (
                          <CPaginationItem
                            key={numPagina}
                            active={paginaActual === numPagina}
                            onClick={() => setPaginaActual(numPagina)}
                            style={{ cursor: 'pointer' }}
                          >
                            {numPagina}
                          </CPaginationItem>
                        )
                      })}
                      <CPaginationItem
                        disabled={paginaActual >= totalPaginas}
                        onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                        style={{
                          cursor: paginaActual >= totalPaginas ? 'default' : 'pointer',
                        }}
                      >
                        Siguiente
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </CTabPane>

                {/* PESTAÑA 2: MENÚ DIGITAL ACTIVO */}
                <CTabPane visible={activeTab === 2}>
                  <div className="p-4">
                    <MenuDigitalActivo menus={menus} />
                  </div>
                </CTabPane>

                {/* PESTAÑA 3: HISTORIAL Y VARIACIÓN DE PRECIOS */}
                <CTabPane visible={activeTab === 3}>
                  <HistorialPrecios historial={historial} />
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modales independientes */}
      <ModalAgregarMenu
        visible={agregarModalOpen}
        onClose={() => setAgregarModalOpen(false)}
        onAdd={handleAgregarMenu}
      />

      <ModalActualizarMenu
        visible={actualizarModalOpen}
        onClose={() => setActualizarModalOpen(false)}
        menu={menuSeleccionado}
        onUpdate={handleActualizarMenu}
      />

      <ModalEstadoMenu
        visible={estadoModalOpen}
        onClose={() => setEstadoModalOpen(false)}
        menu={menuSeleccionado}
        onConfirm={handleEstadoMenu}
      />

      <ModalEliminarMenu
        visible={eliminarModalOpen}
        onClose={() => setEliminarModalOpen(false)}
        menu={menuSeleccionado}
        onDelete={handleEliminarMenu}
      />
    </div>
  )
}

export default Menus