import React, { useState } from 'react'
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
import api from '../api/api'
import { toast } from 'react-toastify'

const ModalDeleteInsumo = ({ visible, onClose, insumo, onSuccess }) => {
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!insumo) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      await api.delete(`/api/insumos/${insumo.id_insumos}/`, { headers })

      notificar('exito', 'Insumo eliminado con éxito.')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al eliminar el insumo:', error)
      const mensajeError =
        error.response?.status === 400 || error.response?.status === 409
          ? 'No se puede eliminar el insumo porque está asociado a productos o compras registradas.'
          : error.response?.data?.detail || 'No se pudo eliminar el insumo. Intenta nuevamente.'
      notificar('error', mensajeError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">Eliminar insumo</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <p className="mb-2">
              ¿Desea eliminar el insumo <strong>{insumo?.nombre}</strong>?
            </p>
            <CAlert color="warning" className="mb-0 py-2">
              Esta acción no se puede deshacer. Si el insumo está vinculado a productos o compras, el sistema impedirá su eliminación.
            </CAlert>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color="danger" className="text-white" type="submit" disabled={loading}>
            {loading ? 'Eliminando...' : 'Aceptar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalDeleteInsumo
