import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
} from '@coreui/react'
import api from '../api/api'

const Perfil = () => {
  const [perfil, setPerfil] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacionPassword, setConfirmacionPassword] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let activo = true
    api
      .get('/api/empleados/me/')
      .then(({ data }) => {
        if (!activo) return
        setPerfil(data)
        setEmail(data.email || '')
      })
      .catch((requestError) => {
        if (!activo) return
        console.error('Error al cargar el perfil:', requestError)
        setError(
          requestError.response?.data?.detail ||
            requestError.response?.data?.error ||
            'No se pudo cargar el perfil.',
        )
      })
    return () => {
      activo = false
    }
  }, [])

  const guardarPerfil = async (event) => {
    event.preventDefault()
    setError('')
    if (password && password !== confirmacionPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setGuardando(true)
    try {
      const payload = { email }
      if (password) payload.password = password
      const { data } = await api.patch('/api/empleados/me/', payload)
      setPerfil(data)
      setEmail(data.email || '')
      setPassword('')
      setConfirmacionPassword('')
    } catch (requestError) {
      console.error('Error al actualizar el perfil:', requestError)
      const responseData = requestError.response?.data
      setError(
        responseData?.email?.[0] ||
          responseData?.password?.[0] ||
          responseData?.detail ||
          'No se pudo actualizar el perfil.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const empleado = perfil?.empleado
  const iniciales = `${empleado?.nombre?.[0] || ''}${empleado?.apellido?.[0] || ''}` || 'U'

  return (
    <div className="p-4 bg-body-tertiary" style={{ minHeight: '100vh' }}>
      <CRow className="justify-content-center">
        <CCol xs={12} lg={9}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-dark text-white py-3 fw-semibold">
              Perfil de usuario
            </CCardHeader>
            <CCardBody className="p-4">
              {error && <CAlert color="danger">{error}</CAlert>}
              {!perfil ? (
                <p className="text-center text-body-secondary mb-0">Cargando perfil...</p>
              ) : (
                <>
                  {empleado && (
                    <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                      <CAvatar color="primary" textColor="white" size="xl" className="fw-bold">
                        {iniciales}
                      </CAvatar>
                      <div>
                        <h3 className="mb-1 fw-bold">
                          {empleado.nombre} {empleado.apellido}
                        </h3>
                        <div className="text-body-secondary">
                          {empleado.local_detalle?.nombre || 'Sin local asignado'}
                        </div>
                      </div>
                    </div>
                  )}
                  <CForm onSubmit={guardarPerfil}>
                    <CRow className="g-3">
                      {empleado && (
                        <>
                          <CCol md={6}>
                            <CFormInput label="Nombre" value={empleado.nombre || ''} disabled />
                          </CCol>
                          <CCol md={6}>
                            <CFormInput label="Apellido" value={empleado.apellido || ''} disabled />
                          </CCol>
                          <CCol md={6}>
                            <CFormInput label="DNI" value={empleado.dni || ''} disabled />
                          </CCol>
                          <CCol md={6}>
                            <CFormInput label="Teléfono" value={empleado.telefono || ''} disabled />
                          </CCol>
                          <CCol xs={12}>
                            <CFormInput
                              label="Domicilio"
                              value={empleado.domicilio || ''}
                              disabled
                            />
                          </CCol>
                        </>
                      )}
                      <CCol xs={12}>
                        <CFormInput
                          label="Correo electrónico"
                          type="email"
                          autoComplete="email"
                          maxLength={50}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormInput
                          label="Nueva contraseña (opcional)"
                          type="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Dejar en blanco para mantener la actual"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormInput
                          label="Confirmar nueva contraseña"
                          type="password"
                          autoComplete="new-password"
                          value={confirmacionPassword}
                          onChange={(event) => setConfirmacionPassword(event.target.value)}
                          disabled={!password}
                        />
                      </CCol>
                    </CRow>
                    <div className="d-flex justify-content-end mt-4">
                      <CButton type="submit" color="primary" disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                      </CButton>
                    </div>
                  </CForm>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Perfil
