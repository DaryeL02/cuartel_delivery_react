import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import api from '../../components/api/api'

const ResetPassword = () => {

  const [data, setData] = useState({
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      console.log(data)
      try {
  
        await api.post(`/api/password-reset/`, data)
        navigate('/authentication/check-email', {
          state: { email: data.email },
          })

      } catch (error) {
        console.error('Error al enviar correo', error)
      } finally {
        setLoading(false)
      }
    }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Cambiar Contraseña</h1>
                  <p className="text-body-secondary">
                    Introduce tu dirección de correo electrónico y te enviaremos instrucciones sobre cómo restablecer tu contraseña.
                  </p>
                  <div className="mb-4">
                    <CFormLabel htmlFor="email">Correo electrónico</CFormLabel>
                    <CFormInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      maxLength={50}
                      value={data.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="d-grid">
                    <CButton color="primary" type="submit" disabled={loading}>
                      {loading ? 'Enviando...' : 'Enviar'}
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
