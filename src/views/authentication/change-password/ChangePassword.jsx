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
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const ChangePassword = () => {
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()

  const handlePassword = async (datos) => {
    if (datos.nueva !== datos.confirmar) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un problema! Las contraseñas no coiciden',
      })
      //es intentar y que luego pase al catch // await= es esperar la respuesta de la api
    } else {
      try {
        const respuesta = await api.post('/api/cambiar-password/', {
          password_actual: datos.actual,
          password_nueva: datos.nueva,
        })
        console.log(respuesta.data)

        await Swal.fire({
          title: 'Cambio de contraseña',
          text: 'La contraseña se actualizo',
          icon: 'success',
        }).then(() => {
          navigate('/authentication/password-changed')
        })
      } catch (error) {
        console.log(error.response?.status, error.response?.data)
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.response?.data?.error || ' No se pudo cambiar la contraseña',
        })
      }
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
                  <h1>Cambio de contraseña</h1>
                  <div className="mb-3">
                    <CFormLabel htmlFor="new-password">Contraseña Actual</CFormLabel>
                    <CFormInput
                      id="actual-password"
                      type="password"
                      placeholder="Ingresa tu contraseña actual"
                      autoComplete="actual-password"
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="new-password">Nueva contraseña</CFormLabel>
                    <CFormInput
                      id="new-password"
                      type="password"
                      placeholder="Ingresa tu nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mb-4">
                    <CFormLabel htmlFor="confirm-password">Confirma la nueva contraseña</CFormLabel>
                    <CFormInput
                      id="confirm-password"
                      type="password"
                      placeholder="Vuelve a ingresar tu nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="d-grid">
                    <CButton
                      color="primary"
                      type="submit"
                      autoComplete="new-password"
                      {...register('pasword')}>
                      Guardar Contraseña </CButton>
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

export default ChangePassword
