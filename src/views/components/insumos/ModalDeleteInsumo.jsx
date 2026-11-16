import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
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
      notificar('error', 'No se pudo eliminar el insumo. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          Eliminar insumo
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <p>¿Desea eliminar el insumo?</p>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={'primary'} type="submit" disabled={loading}>
            {loading ? 'Aceptar...' : 'Aceptar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalDeleteInsumo
