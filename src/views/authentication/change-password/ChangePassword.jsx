import React , { useState} from 'react'
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
import { useParams } from 'react-router-dom'
import api from '../../components/api/api'
import { useNavigate } from 'react-router-dom'


const ChangePassword = () => {

  const { uid, token } = useParams()

  const [data, setData] = useState({
    new_password: "",
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

      await api.post(`/api/password-reset-confirm/${uid}/${token}/`, data)

      navigate('/authentication/login')
        
    } catch (error) {
      console.error('Error al enviar nueva contraseña', error)
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
                  <h1>Cambio de contraseña</h1>
                  <div className="mb-3">
                    <CFormLabel htmlFor="new-password">Nueva contraseña</CFormLabel>
                    <CFormInput
                      id="new-password"
                      name="new_password"
                      type="password"
                      placeholder="Ingresa tu nueva contraseña"
                      autoComplete="new-password"
                      maxLength={50}
                      value={data.new_password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <CFormLabel htmlFor="confirm-password">Confirma la nueva contraseña</CFormLabel>
                    <CFormInput
                      id="confirm-password"
                      name="confirm_password"
                      type="password"
                      placeholder="Vuelve a ingresar tu nueva contraseña"
                      autoComplete="new-password"
                      maxLength={50}
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

export default ChangePassword
