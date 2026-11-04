import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CAlert,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import api from '../../components/api/api'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')
  const hasResetToken = Boolean(uid && token)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('danger')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (hasResetToken && newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      if (hasResetToken) {
        await api.post('/api/password-reset/confirm/', {
          uid,
          token,
          new_password: newPassword,
        })
        navigate('/authentication/password-changed')
      } else {
        const response = await api.post('/api/password-reset/', { email })
        setMessage(response.data.detail)
        setMessageType('success')
      }
    } catch (error) {
      const data = error.response?.data
      const validationMessage = Array.isArray(data?.new_password)
        ? data.new_password.join(' ')
        : ''
      setMessage(
        validationMessage || data?.detail || 'No se pudo procesar la solicitud. Intenta nuevamente.',
      )
      setMessageType('danger')
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
                  <h1>Restablecer contraseña</h1>
                  <p className="text-body-secondary">
                    {hasResetToken
                      ? 'Elegí una contraseña nueva para tu cuenta.'
                      : 'Ingresá el correo asociado a tu cuenta y te enviaremos un enlace para crear una nueva contraseña.'}
                  </p>
                  {message && <CAlert color={messageType}>{message}</CAlert>}
                  {hasResetToken ? (
                    <>
                      <div className="mb-3">
                        <CFormLabel htmlFor="new-password">Nueva contraseña</CFormLabel>
                        <CFormInput
                          id="new-password"
                          type="password"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          minLength={8}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <CFormLabel htmlFor="confirm-password">Confirmar contraseña</CFormLabel>
                        <CFormInput
                          id="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          minLength={8}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mb-4">
                      <CFormLabel htmlFor="email">Correo electrónico</CFormLabel>
                      <CFormInput
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="d-grid">
                    <CButton color="primary" type="submit" disabled={loading}>
                      {loading
                        ? 'Procesando...'
                        : hasResetToken
                          ? 'Guardar contraseña nueva'
                          : 'Enviar enlace de recuperación'}
                    </CButton>
                  </div>
                  <div className="mt-3 text-center">
                    <Link to="/authentication/login">Volver al inicio de sesión</Link>
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
