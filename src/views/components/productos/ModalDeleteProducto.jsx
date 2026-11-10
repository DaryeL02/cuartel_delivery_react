import React, { useState, useEffect } from 'react'
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

const ModalDeleteProducto = ({ visible, onClose, producto, onSuccess }) => {

  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      console.log(producto.id_productos)
      await api.delete(`/api/productos/${producto.id_productos}/` , { headers })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          Eliminar producto
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            <p>¿Desea eliminar el producto?</p>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={'primary'} type="submit" disabled={loading}>
            {loading ? 'Aceptar...' :  'Aceptar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalDeleteProducto
