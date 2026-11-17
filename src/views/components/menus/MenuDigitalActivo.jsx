import React from 'react'
import { CAlert, CRow, CCol, CCard, CCardBody, CBadge } from '@coreui/react'

const MenuDigitalActivo = ({ menus }) => {
  const menusActivos = menus.filter((m) => m.estado)

  return (
    <>
      <CAlert color="info" className="py-2 mb-4">
        Vista previa del <strong>Menú Digital Actualizado</strong>: muestra únicamente los ítems con estado <strong>Activo</strong> visibles en la interfaz de toma de pedidos.
      </CAlert>

      <CRow className="g-3">
        {menusActivos.map((item) => (
          <CCol md={6} lg={4} key={item.id_menu}>
            <CCard className="h-100 shadow-sm border-start border-4 border-success">
              <CCardBody className="d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex gap-1">
                      <CBadge color="secondary">{item.categoria}</CBadge>
                      {item.es_combo && <CBadge color="info">Combo</CBadge>}
                    </div>
                    <span className="fw-bold text-success fs-5">
                      ${Number(item.precio).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <h6 className="fw-bold text-body">{item.nombre}</h6>
                  <p className="small text-body-secondary mb-0">{item.descripcion}</p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </>
  )
}

export default MenuDigitalActivo