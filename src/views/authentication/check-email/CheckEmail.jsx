import React from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import { useLocation } from 'react-router-dom'


const CheckEmail = () => {

  const { state } = useLocation()
  const email = state?.email

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4 text-center">
              <CCardBody className="p-4">
                <h1>Revisa tu correo electrónico</h1>
                <p className="text-body-secondary">
                  Haz clic en el enlace enviado a <span className="fw-semibold">{email || 'tu correo electrónico'}</span>{' '}
                  para verificar tu cuenta. ¡Gracias!
                </p>
                <div className="d-grid">
                  <Link to="/">
                    <CButton color="primary" className="w-100">
                      Volver al inicio
                    </CButton>
                  </Link>
                </div>
                <p className="text-body-secondary mt-3 mb-0">
                  ¿No recibiste el correo electrónico? <Link to="/authentication/login">Reenviar</Link>
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default CheckEmail
