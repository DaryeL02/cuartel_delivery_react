import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react'

export default function CashierMenuAdmin() {
  // Estado simulado para la tabla MENUS
  const [menus, setMenus] = useState([
    { id_menus: 1, nombre: 'Menú Ejecutivo Almuerzo', estado: true, fecha_hora_inicio: '2026-10-28 12:00', fecha_hora_fin: '2026-10-28 15:00' },
    { id_menus: 2, nombre: 'Promo Sandwiches Fin de Semana', estado: false, fecha_hora_inicio: '2026-10-31 20:00', fecha_hora_fin: '2026-11-01 23:59' }
  ])

  // Estado para el menú seleccionado y visualización de DETALLES DE MENU + PRODUCTOS
  const [selectedMenu, setSelectedMenu] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  // Productos asignados al menú ejecutivo (ID 1) resolviendo la relación con DETALLES DE MENU
  const [menuDetails, setMenuDetails] = useState([
    { id_detalles_menus: 10, id_productos: 501, nombre: 'Sandwich de Milanesa Completo', precio_unitario: 6500, cantidad: 1, descuento: 10, estado: true },
    { id_detalles_menus: 11, id_productos: 502, nombre: 'Lomito con Papas Fritas', precio_unitario: 8000, cantidad: 1, descuento: 0, estado: true },
    { id_detalles_menus: 12, id_productos: 503, nombre: 'Gaseosa 500ml', precio_unitario: 1800, cantidad: 2, descuento: 0, estado: true }
  ])

  // Alternar estado de un menú (Activo/Inactivo)
  const handleToggleMenuStatus = (id) => {
    setMenus(menus.map(m => m.id_menus === id ? { ...m, estado: !m.estado } : m))
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
      {/* Encabezado Principal */}
      <CRow className="mb-4 align-items-center">
        <CCol>
          <h2 className="fw-bold text-dark">Panel de Control: Gestión de Menús</h2>
          <p className="text-muted mb-0">Módulo de Administración para Cajero - Lomitería & Sandwichería</p>
        </CCol>
        <CCol xs="auto">
          <CButton color="primary" className="px-4 shadow-sm" onClick={() => setModalOpen(true)}>
            + Crear Nuevo Menú
          </CButton>
        </CCol>
      </CRow>

      <CRow>
        {/* Tabla Central: MENUS */}
        <CCol xs={12} lg={8} className="mb-4">
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-dark text-white fw-semibold py-3">
              Lista de Menús Programados
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nombre del Menú</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Inicio</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Fin</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {menus.map((menu) => (
                    <CTableRow 
                      key={menu.id_menus} 
                      active={selectedMenu === menu.id_menus}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedMenu(menu.id_menus)}
                    >
                      <CTableDataCell className="fw-semibold">{menu.id_menus}</CTableDataCell>
                      <CTableDataCell className="fw-medium">{menu.nombre}</CTableDataCell>
                      <CTableDataCell className="small text-muted">{menu.fecha_hora_inicio}</CTableDataCell>
                      <CTableDataCell className="small text-muted">{menu.fecha_hora_fin}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CFormSwitch 
                          id={`switch-${menu.id_menus}`}
                          checked={menu.estado} 
                          onChange={() => handleToggleMenuStatus(menu.id_menus)}
                          onClick={(e) => e.stopPropagation()} // Evita activar selección de fila
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton 
                          color="info" 
                          size="sm" 
                          variant="outline"
                          className="me-2"
                          onClick={(e) => { e.stopPropagation(); setSelectedMenu(menu.id_menus); }}
                        >
                          Ver Ítems
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Detalle Lateral: DETALLES DE MENU vinculados al menú seleccionado */}
        <CCol xs={12} lg={4}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-primary text-white fw-semibold py-3 d-flex justify-content-between align-items-center">
              <span>Productos en Menú #{selectedMenu}</span>
              <CBadge color="light" text="primary" shape="rounded-pill">
                {menuDetails.length} artículos
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-3">
              <p className="text-muted small mb-3">
                Listado detallado de productos vinculados, incluyendo precios y ofertas.
              </p>
              
              {menuDetails.map((item) => (
                <div key={item.id_detalles_menus} className="p-3 mb-2 border rounded bg-white shadow-xs">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1 fw-bold text-dark">{item.nombre}</h6>
                      <small className="text-muted d-block">ID Prod: {item.id_productos}</small>
                      <small className="text-muted">Cant. permitida por combo: {item.cantidad}</small>
                    </div>
                    <span className="text-primary fw-bold">${item.precio_unitario.toLocaleString('es-AR')}</span>
                  </div>
                  
                  <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                    <div>
                      {item.descuento > 0 ? (
                        <CBadge color="danger">-{item.descuento}% desc.</CBadge>
                      ) : (
                        <span className="text-muted small">Sin descuento</span>
                      )}
                    </div>
                    <CButton color="link" className="text-danger p-0 small text-decoration-none">
                      Quitar
                    </CButton>
                  </div>
                </div>
              ))}

              <CButton color="outline-primary" size="sm" className="w-100 mt-2 py-2">
                + Agregar Producto a este Menú
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal para simular la inserción en la tabla MENUS */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>Registrar Nuevo Menú</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Nombre del Menú (VARCHAR)</label>
            <CFormInput type="text" placeholder="Ej: Combo Familiar Nocturno" />
          </div>
          <CRow>
            <CCol md={6} className="mb-3">
              <label className="form-label text-muted small fw-bold">Fecha/Hora Inicio</label>
              <CFormInput type="datetime-local" />
            </CCol>
            <CCol md={6} className="mb-3">
              <label className="form-label text-muted small fw-bold">Fecha/Hora Fin</label>
              <CFormInput type="datetime-local" />
            </CCol>
          </CRow>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Estado Inicial</label>
            <CFormSelect>
              <option value="true">Activo (Visible en caja)</option>
              <option value="false">Inactivo (Borrador)</option>
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={() => setModalOpen(false)}>
            Guardar Menú
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
