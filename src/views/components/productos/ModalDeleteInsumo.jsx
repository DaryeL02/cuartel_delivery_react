import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react'
import api from '../api/api'

const ModalDeleteInsumo = ({ visible, onClose, insumo, onSuccess }) => {
  // Inicializar el formulario según los atributos de la base de datos
    // const [data, setData] = useState({
    // categoria: 0,
    // nombre: '',
    // descripcion: '',
    // unidad: '',
    // stock_actual: 0,
    // stock_minimo: 0,
    // })

  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      console.log(insumo.id_insumos)
      await api.delete(`/api/insumos/${insumo.id_insumos}/` , { headers })

      onSuccess() // Callback para recargar la tabla principal
      onClose() // Cerrar el modal
    } catch (error) {
      console.error('Error al eliminar el insumo:', error)
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
            {loading ? 'Aceptar...' :  'Aceptar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalDeleteInsumo
