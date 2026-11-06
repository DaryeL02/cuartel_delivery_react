import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
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
import { apple } from 'src/assets/brand/apple'
import { google } from 'src/assets/brand/google'
import { logo } from 'src/assets/brand/logo'
import { eye } from 'src/assets/icons/eye'
import api from '../../components/api/api'
import { toast } from 'react-toastify'



const Login = () => {

const [usuario, setUsuario] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('') // Estado para manejar mensajes de error
const [loading, setLoading] = useState(false) // Estado para deshabilitar el botón mientras carga
const [usuarioError, setUsuarioError] = useState('')
const [passwordError, setPasswordError] = useState('')

const navigate = useNavigate();
const notify = (login) => (login ? toast("Bienvenido/a") : toast("Datos incorrectos"));

const handleSubmit = async (e) => {
    e.preventDefault();
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
      return
    }
    setLoading(true)
    console.log('Datos enviados:', { usuario, password });
    
    try {const response = await api.post('/api/login/', {
        usuario: usuario,
        password: password,
      })
    if (response.data && response.data.token) {
      
      localStorage.setItem('token', response.data.token)
      notify(true)
      
      
      navigate('/dashboard')
    } else {
      setError('No se recibió un token válido del servidor.')
      
    }
  }catch (error) {
    console.error('Error al logearte', error)
    notify(false)

    setUsuarioError('Ingresa un usuario válido')
    setPasswordError('Contraseña incorrecta')
  }finally{
    setLoading(false)
  }
};

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <div className="d-flex flex-column gap-4">
              <div className="text-center">
                <CIcon icon={logo} height={48} />
              </div>
              <CCard className="p-4">
                <CCardBody className="d-flex flex-column gap-4">

                  {error && <CAlert color="danger">{error}</CAlert>}

                  <h2 className="h5 text-center mb-0">Accede a tu cuenta</h2>
                  
                  <CForm 
                  className="row gy-3"
                  onSubmit={handleSubmit}
                  noValidate
                  >
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
                          type="password"
                          placeholder="Introduce tu contraseña"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          invalid={!!passwordError}
                        />
                        <CInputGroupText>
                          <CTooltip content="Show password">
                            <CButton
                              type="button"
                              color="link"
                              className="p-0 link-secondary"
                              aria-label="Show password"
                            >
                              <CIcon icon={eye} size="sm" />
                            </CButton>
                          </CTooltip>
                        </CInputGroupText>
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