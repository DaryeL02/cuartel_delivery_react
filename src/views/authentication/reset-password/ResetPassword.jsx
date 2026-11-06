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
import { useState } from 'react'
import { useForm } from 'react-hook-form'

const ResetPassword = () => {
  const [paso, setPaso] = useState(1)
  const [email, setEmail] = useState('')
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  // pedir codigo
  const handlePassword = async (datos) => {
    try {
      await api.post('/api/solicitar-reset/', { email: datos.email })
      setEmail(datos.email)
      setPaso(2)
      Swal.fire({
        title: 'Recuperacion exitosa!',
        text: 'se envio el codigo',
      })
    } catch (error) {
      console.log(error)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se pudo enviar el codigo',
      })
    }
  }
  const restPassword = async (datos) => {
    try {
      await api.post('/api/confirmar-reset/', {
        email: email,
        codigo: datos.codigo,
        password_nueva: datos.nueva,
      })
      Swal.fire({
        title: 'Exito!',
        icon: 'success',
      })
      navigate('/authentication/ChangePassword')
    } catch (error) {
      console.log(error.response?.status, error.response?.data)
      Swal.fire({
        icon: 'error',
        title: 'No se pudo restablecer',
        text: error.response?.data?.error || 'Intentá de nuevo',
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
                <CForm onSubmit={handleSubmit(pedirCodigo)} className="row g-3">
                  <h1>Recuperar Contraseña</h1>
                  <p className="text-body-secondary"> Ingresa tus datos y tu nueva contraseña</p>
                  <div className="mb-4">
                    <CFormLabel htmlFor="actual">Email</CFormLabel>
                    <CFormInput
                      id="e-mail"
                      type="text"
                      autoComplete="current-email"
                      {...register('email')}
                    />
                  </div>
                  <div className="d-grid">
                    <CButton color="primary" type="submit">
                      Enviar codigo
                    </CButton>
                  </div>
                  <div className="mb-4">
                    <CFormLabel htmlFor="actual">Contraseña actual</CFormLabel>
                    <CFormInput
                      id="actual"
                      type="password"
                      autoComplete="current-password"
                      {...register('email')}
                    />
                  </div>
                  <div className="mb-4">
                    <CFormLabel htmlFor="password">
                      Nueva Contraseña
                    </CFormLabel>
                    <CFormInput
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register('codigo')}
                    />
                  </div>
                  <div className="d-grid">
                    <CButton
                      color="primary"
                      type="submit"
                      autoComplete="new-password"
                      {...register('nueva')}>
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
