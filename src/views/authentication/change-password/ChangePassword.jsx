import React, { useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { eye } from 'src/assets/icons/eye'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../components/api/api'
import { toast } from 'react-toastify'

const ChangePassword = () => {
  const { uid, token } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState({
    new_password: '',
    confirm_password: '',
  })

  const [mostrarNewPassword, setMostrarNewPassword] = useState(false)
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar el error del campo mientras el usuario escribe
    if (name === 'new_password') setNewPasswordError('')
    if (name === 'confirm_password') setConfirmPasswordError('')
  }

  const validarFormulario = () => {
    let esValido = true
    setErrorGeneral('')
    setNewPasswordError('')
    setConfirmPasswordError('')

    const pwd = data.new_password
    const confirmPwd = data.confirm_password

    // 1. Validar que la nueva contraseña no esté vacía
    if (!pwd.trim()) {
      setNewPasswordError('La nueva contraseña no puede estar vacía.')
      esValido = false
    } else if (pwd.length < 8) {
      // 2. Validar longitud mínima recomendada
      setNewPasswordError('La contraseña debe tener al menos 8 caracteres.')
      esValido = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      // 3. Validar complejidad (mayúscula, minúscula y número)
      setNewPasswordError(
        'Debe incluir al menos una letra mayúscula, una minúscula y un número.'
      )
      esValido = false
    }

    // 4. Validar confirmación de contraseña
    if (!confirmPwd.trim()) {
      setConfirmPasswordError('Debes confirmar tu nueva contraseña.')
      esValido = false
    } else if (pwd !== confirmPwd) {
      setConfirmPasswordError('Las contraseñas no coinciden.')
      esValido = false
    }

    return esValido
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      notificar('advertencia', 'Por favor, corrige los errores en el formulario.')
      return
    }

    setLoading(true)

    try {
      // Enviamos solo new_password al backend como en tu estructura original
      await api.post(`/api/password-reset-confirm/${uid}/${token}/`, {
        new_password: data.new_password,
      })

      notificar('exito', 'Tu contraseña ha sido actualizada correctamente.')
      navigate('/authentication/login')
    } catch (error) {
      console.error('Error al enviar nueva contraseña', error)

      // Capturar errores específicos devueltos por el backend (ej. Django REST Framework)
      const serverData = error.response?.data
      if (serverData?.new_password) {
        const msg = Array.isArray(serverData.new_password)
          ? serverData.new_password[0]
          : serverData.new_password
        setNewPasswordError(msg)
        notificar('error', msg)
      } else if (serverData?.token || serverData?.uid || serverData?.detail) {
        const msg =
          serverData.detail ||
          'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.'
        setErrorGeneral(msg)
        notificar('error', msg)
      } else {
        const msg = 'No se pudo cambiar la contraseña. Inténtalo nuevamente.'
        setErrorGeneral(msg)
        notificar('error', msg)
      }
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
                {errorGeneral && <CAlert color="danger">{errorGeneral}</CAlert>}

                <CForm onSubmit={handleSubmit} noValidate>
                  <h1 className="h4 mb-3">Cambio de contraseña</h1>

                  <div className="mb-3">
                    <CFormLabel htmlFor="new-password">Nueva contraseña</CFormLabel>
                    <CInputGroup className="has-validation">
                      <CFormInput
                        id="new-password"
                        name="new_password"
                        type={mostrarNewPassword ? 'text' : 'password'}
                        placeholder="Ingresa tu nueva contraseña"
                        autoComplete="new-password"
                        maxLength={50}
                        value={data.new_password}
                        onChange={handleChange}
                        invalid={!!newPasswordError}
                      />
                      <CTooltip
                        content={
                          mostrarNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                        }
                      >
                        <CInputGroupText
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          aria-label={
                            mostrarNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                          }
                          onClick={() => setMostrarNewPassword(!mostrarNewPassword)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setMostrarNewPassword(!mostrarNewPassword)
                            }
                          }}
                        >
                          <CIcon icon={eye} size="sm" />
                        </CInputGroupText>
                      </CTooltip>
                      {newPasswordError && (
                        <CFormFeedback invalid>{newPasswordError}</CFormFeedback>
                      )}
                    </CInputGroup>
                  </div>

                  <div className="mb-4">
                    <CFormLabel htmlFor="confirm-password">
                      Confirma la nueva contraseña
                    </CFormLabel>
                    <CInputGroup className="has-validation">
                      <CFormInput
                        id="confirm-password"
                        name="confirm_password"
                        type={mostrarConfirmPassword ? 'text' : 'password'}
                        placeholder="Vuelve a ingresar tu nueva contraseña"
                        autoComplete="new-password"
                        maxLength={50}
                        value={data.confirm_password}
                        onChange={handleChange}
                        invalid={!!confirmPasswordError}
                      />
                      <CTooltip
                        content={
                          mostrarConfirmPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                        }
                      >
                        <CInputGroupText
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          aria-label={
                            mostrarConfirmPassword
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
                          onClick={() =>
                            setMostrarConfirmPassword(!mostrarConfirmPassword)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setMostrarConfirmPassword(!mostrarConfirmPassword)
                            }
                          }}
                        >
                          <CIcon icon={eye} size="sm" />
                        </CInputGroupText>
                      </CTooltip>
                      {confirmPasswordError && (
                        <CFormFeedback invalid>{confirmPasswordError}</CFormFeedback>
                      )}
                    </CInputGroup>
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

export default ChangePassword
