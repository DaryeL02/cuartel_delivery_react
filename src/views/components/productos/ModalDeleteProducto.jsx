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
import { toast } from 'react-toastify'
import api from '../api/api'

const ModalDeleteProducto = ({ visible, onClose, producto, onSuccess }) => {
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
    if (!producto) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      await api.delete(`/api/productos/${producto.id_productos}/`, { headers })

      notificar('exito', 'Producto eliminado con éxito.')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      notificar('error', 'No se pudo eliminar el producto. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">Eliminar producto</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <p>
              ¿Desea eliminar el producto <strong>{producto?.nombre}</strong>?
            </p>
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

export default ModalDeleteProducto
