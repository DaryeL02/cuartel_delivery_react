import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CAlert,
  CRow,
} from '@coreui/react'

const ModalEliminarMenu = ({ visible, onClose, menu, onDelete }) => {
  if (!menu) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onDelete(menu)
    onClose()
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">Eliminar menú</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <p className="mb-2">
              ¿Desea eliminar el menú <strong>{menu.nombre}</strong>?
            </p>
            <CAlert color="warning" className="mb-0 py-2">
              Esta acción no se puede deshacer. Si el menú está asociado a pedidos históricos, se recomienda desactivarlo en lugar de eliminarlo.
            </CAlert>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="danger" className="text-white" type="submit">
            Aceptar
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalEliminarMenu