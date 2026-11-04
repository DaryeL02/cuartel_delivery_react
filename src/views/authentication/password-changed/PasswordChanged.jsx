import React from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'

const PasswordChanged = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4 text-center">
              <CCardBody className="p-4">
                <h1>Contraseña actualizada</h1>
                <p className="text-body-secondary">
                  La contraseña se cambió correctamente. Ya podés iniciar sesión con la nueva.
                </p>
                <div className="d-grid">
                  <Link to="/authentication/login">
                    <CButton color="primary" className="w-100">
                      Volver al inicio de sesión
                    </CButton>
                  </Link>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default PasswordChanged
