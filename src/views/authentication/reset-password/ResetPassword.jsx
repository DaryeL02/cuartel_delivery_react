import React from 'react'
import api from '../../components/api/api'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
//import { useState } from 'react'
import { useForm } from 'react-hook-form'

const ResetPassword = () => {
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()
  const handlePassword = async (datos) => {
    //es intentar y que luego pase al catch // await= es esperar la respuesta de la api
    try {
      const respuesta = await api.post('/api/ResetPassword/', {
        password_actual: datos.actual,
        password_nueva: datos.nueva,
      })
      console.log(respuesta.data)

      await Swal.fire({
        title: 'Cambio de contraseña',
        text: 'La contraseña se actualizo',
        icon: 'success',
      }).then(() => {
        navigate('/authentication/login')
      })
      navigate('/authentication/login')
    } catch (error) {
      console.log(error)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.error || ' No se pudo cambiar la contraseña',
      })
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit(handlePassword)} className="row g-3">
                  <h1>Cambiar Contraseña</h1>
                  <p className="text-body-secondary"> Ingresa tus datos y tu nueva contraseña</p>
                  <div className="mb-4">
                    <CFormLabel htmlFor="actual">Contraseña actual</CFormLabel>
                    <CFormInput
                      id="actual"
                      type="password"
                      autoComplete="current-password"
                      {...register('actual')}
                    />
                  </div>
                  <div className="mb-4">
                    <CFormLabel htmlFor="password">Nueva Contraseña</CFormLabel>
                    <CFormInput
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register('nueva')}/>
                  </div>
                  <div className="d-grid">
                    <CButton
                      color="primary"
                      type="submit"
                      autoComplete="new-password"
                      {...register('pasword')}>
                      Guardar Contraseña
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ResetPassword
