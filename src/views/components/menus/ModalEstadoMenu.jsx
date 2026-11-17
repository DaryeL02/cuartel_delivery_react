import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CAlert,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'

const ModalEstadoMenu = ({ visible, onClose, menu, onConfirm }) => {
  const [motivo, setMotivo] = useState('Falta de insumos')

  useEffect(() => {
    setMotivo('Falta de insumos')
  }, [visible])

  if (!menu) return null

  const estaActivo = menu.estado

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(menu, estaActivo ? motivo : 'Reposición / Habilitación comercial')
    onClose()
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {estaActivo ? 'Desactivar menú' : 'Activar menú'}
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12}>
              <p className="mb-2">
                ¿Desea {estaActivo ? 'desactivar' : 'activar'} el menú{' '}
                <strong>{menu.nombre}</strong>?
              </p>

              {estaActivo ? (
                <>
                  <CFormSelect
                    label="Motivo de desactivación (para auditoría)"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="mb-3"
                  >
                    <option value="Falta de insumos">Falta de insumos</option>
                    <option value="Cambio de temporada">Cambio de temporada</option>
                    <option value="Actualización de carta">Actualización de carta</option>
                    <option value="Otro motivo operativo">Otro motivo operativo</option>
                  </CFormSelect>

                  <CAlert color="warning" className="mb-0 py-2">
                    Al desactivar este menú, no estará disponible en la interfaz de toma de pedidos de los mozos.
                  </CAlert>
                </>
              ) : (
                <CAlert color="info" className="mb-0 py-2">
                  El menú volverá a estar visible y disponible en la interfaz de toma de pedidos.
                </CAlert>
              )}
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton
            color={estaActivo ? 'warning' : 'success'}
            className="text-white"
            type="submit"
          >
            {estaActivo ? 'Desactivar' : 'Activar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalEstadoMenu