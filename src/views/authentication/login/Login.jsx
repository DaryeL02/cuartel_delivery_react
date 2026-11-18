import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CTooltip,
  CAlert,
  CFormFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
// import { logo } from 'src/assets/brand/logo'
import miLogo from '../../../assets/brand/logo-cuartel.svg'
import { eye } from 'src/assets/icons/eye'
import api from '../../components/api/api'
import { toast } from 'react-toastify'

const Login = () => {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usuarioError, setUsuarioError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navigate = useNavigate()

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
    setError('')
    setUsuarioError('')
    setPasswordError('')

    let formularioValido = true
    if (!usuario.trim()) {
      setUsuarioError('Ingresa un usuario válido')
      formularioValido = false
    }
    if (!password.trim()) {
      setPasswordError('La contraseña no puede estar vacía')
      formularioValido = false
    }

    if (!formularioValido) {
      notificar('advertencia', 'Por favor, completa todos los campos obligatorios.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/api/login/', {
        usuario: usuario,
        password: password,
      })

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        notificar('exito', 'Bienvenido/a')
        navigate('/dashboard')
      } else {
        const msgError = 'No se recibió un token válido del servidor.'
        setError(msgError)
        notificar('error', msgError)
      }
    } catch (error) {
      console.error('Error al logearte', error)
      notificar('error', 'Datos incorrectos. Verifica tu usuario y contraseña.')

      setUsuarioError('Ingresa un usuario válido')
      setPasswordError('Contraseña incorrecta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <div className="d-flex flex-column gap-4">
              <div className="text-center">
                <img 
                  className="sidebar-brand-full" 
                  src={miLogo} 
                  style={{ height: '80px', width: 'auto', maxWidth: '100%' }} 
                  alt="El Cuartel Gestión" 
                />
              </div>
              <CCard className="p-4">
                <CCardBody className="d-flex flex-column gap-4">
                  {error && <CAlert color="danger">{error}</CAlert>}

                  <h2 className="h5 text-center mb-0">Accede a tu cuenta</h2>

                  <CForm className="row gy-3" onSubmit={handleSubmit} noValidate>
                    <CCol xs={12}>
                      <CFormLabel htmlFor="text">Usuario</CFormLabel>
                      <CFormInput
                        id="text"
                        type="text"
                        placeholder="Introduce tu usuario"
                        autoComplete="current-usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        invalid={!!usuarioError}
                      />

                      {usuarioError && (
                        <CFormFeedback invalid>{usuarioError}</CFormFeedback>
                      )}
                    </CCol>

                    <CCol xs={12}>
                      <div className="d-flex justify-content-between">
                        <CFormLabel htmlFor="password">Contraseña</CFormLabel>
                        <Link to="/authentication/reset-password">¿Olvidaste tu contraseña?</Link>
                      </div>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          id="password"
                          type={mostrarPassword ? 'text' : 'password'}
                          placeholder="Introduce tu contraseña"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          invalid={!!passwordError}
                        />
                        <CTooltip content={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                          <CInputGroupText
                            role="button"
                            tabIndex={0}
                            style={{ cursor: 'pointer' }}
                            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setMostrarPassword(!mostrarPassword)
                              }
                            }}
                          >
                            <CIcon icon={eye} size="sm" />
                          </CInputGroupText>
                        </CTooltip>
                        {passwordError && (
                          <CFormFeedback invalid>{passwordError}</CFormFeedback>
                        )}
                      </CInputGroup>
                    </CCol>

                    <CCol xs={12}>
                      <CButton
                        color="primary"
                        type="submit"
                        className="w-100"
                        disabled={loading}
                      >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                      </CButton>
                    </CCol>
                  </CForm>
                </CCardBody>
              </CCard>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
