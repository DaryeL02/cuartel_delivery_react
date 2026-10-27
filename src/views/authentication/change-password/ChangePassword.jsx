import React from 'react'
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

const ChangePassword = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Cambio de contraseña</h1>
                  <div className="mb-3">
                    <CFormLabel htmlFor="user">Usuario</CFormLabel>
                    <CFormInput
                      id="user"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="new-password">Nueva contraseña</CFormLabel>
                    <CFormInput
                      id="new-password"
                      type="password"
                      placeholder="Ingresa tu nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mb-4">
                    <CFormLabel htmlFor="confirm-password">Confirma la nueva contraseña</CFormLabel>
                    <CFormInput
                      id="confirm-password"
                      type="password"
                      placeholder="Vuelve a ingresar tu nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="d-grid">
                    <CButton color="primary" type="submit">
                      Set new password
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
