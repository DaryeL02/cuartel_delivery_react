import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { CCol, CForm, CFormCheck, CFormInput, CFormSelect } from '@coreui/react'
import api from '../api/api'
import Swal from 'sweetalert2'

export const Modal_test = ({ onGuardado }) => {
  const [visible, setVisible] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const guardarProducto = async (datos) => {
    try {
      await api.post(
        '/api/productos/',
        {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio_unitario: datos.precio_unitario,
        },
        { headers: { Authorization: 'Token  ' + localStorage.getItem('token') } },
      )
      setVisible(false)
      reset()
      onGuardado?.()
      Swal.fire({
        icon: 'success',
        title: 'Producto guardado',
      })
    } catch (error) {
      console.log(error.response?.status, error.response?.data)
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar el producto',
      })
    }
  }
  return (
    <>
      <CButton color="primary" onClick={() => setVisible(!visible)}>
        Agregar producto
      </CButton>
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Agregar producto</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm className="row g-3">
            <CCol md={12}>
              <CFormInput id="inputNombre" label="Nombre" {...register('nombre')} />
            </CCol>
            <CCol md={12}>
              <CFormInput id="inputDescripcion" label="Descripción" {...register('descripcion')} />
            </CCol>
            <CCol md={8}>
              <CFormInput type="number" step="0.01" id="inputStockactual" label="Stock Actual" placeholder="23.00" />
            </CCol>
            <CCol md={4}>
              <CFormInput id="inputPrecio" label="Precio unitario" placeholder='1500' step="0.01" {...register('precio_unitario')}/>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Cerrar
          </CButton>
          <CButton color="primary" onClick={handleSubmit(guardarProducto)}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
export default Modal_test
