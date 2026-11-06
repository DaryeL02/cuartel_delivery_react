import React from 'react'
import api from '../../components/api/api'
import { Link, useNavigate } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import Swal from 'sweetalert2'
import { Button } from '@coreui/coreui'

const CheckEmail = () => {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('emailReset')
  const reenviarCodigo = async () => {
    //volver a pedir codigo al correo
    try {
      await api.post('/api/solicitar-reset/', { email: email })
      Swal.fire({
        title: 'Codigo reenviado!',
      })
    } catch (error) {
      console.log(error.response?.status, error.response?.data)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se pudo reenviar el codigo',
      })
    }
  }
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="mx-4 text-center">
              <CCardBody className="p-4">
                <h1>revisa tu correo electronico</h1>
                <p className="text-body-secondary">
                  Please click the link sent to
                  <span className="fw-semibold">{email}</span> ingresa en la pantalla
                </p>
                <div className="d-grid">
                  <CButton color="primary" className="w-100" onClick={() => navigate('/authentication/change-password')}>
                    Ya tengo el codigo
                  </CButton>
                </div>
                <p className="text-body-secondary mt-3 mb-0">
                Lorem ipsum, dolor sit<CButton onClick={reenviarCodigo}>Reenviar </CButton>
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
