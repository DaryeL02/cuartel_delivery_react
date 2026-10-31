import React from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CRow } from '@coreui/react'
import { Navigate } from 'react-router-dom'
import Swal from 'sweetalert2'
const PasswordChanged = () => {

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4 text-center">
              <CCardBody className="p-4">
                <h1>Cambiar contraseña</h1>
                <CForm  >
                  <p className="text-body-secondary">
                    Your password has been successfully changed. You can now log in with your new
                    password.
                  </p>
                  <div className="d-grid">
                    <Link to="/authentication/login">
                      <CButton type="submit" color="primary" className="w-100">
                        Back to Login
                      </CButton>
                    </Link>
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

export default PasswordChanged
