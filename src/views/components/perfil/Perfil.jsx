import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CButton,
  CAvatar,
  CBadge
} from '@coreui/react'
import api from '../api/api'

export default function Perfil() {

  const [empleado, setEmpleado] = useState(null)
  // const [isEditing, setIsEditing] = useState(false)
  const [sinDatos, setSinDatos] = useState(null)


  const cargarEmpleado = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/empleados/me/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    })  
      setEmpleado(respuesta.data)
    } catch (error) {
      console.error('Error al cargar empleado:', error)
      setSinDatos(true)
    }
  }

  // const handleInputChange = (e) => {
  // const { name, value } = e.target
  // setEmpleado({ ...empleado, [name]: value })
  // }

  // const handleSave = () => {
  //   setIsEditing(false)
  //   alert('Datos del empleado y credenciales actualizados en el sistema.')
  // }

  useEffect(() => {
    cargarEmpleado()
  }, [])


  return (
    <div className="p-4" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
      {empleado 
      ?
      <CRow className="justify-content-center">
        <CCol xs={12} lg={10}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-dark text-white py-3 fw-semibold d-flex justify-content-between align-items-center">
              <span>Ficha Técnica y Credenciales del Empleado</span>
              <CBadge color={empleado.estado ? 'success' : 'danger'} shape="rounded-pill">
                {empleado.estado ? 'EMPLEADO ACTIVO' : 'INACTIVO'}
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-4">
              
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <CAvatar color="primary" text="white" size="xl" className="fw-bold">
                  {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                </CAvatar>
                <div>
                  <h3 className="mb-1 fw-bold text-dark">{empleado.nombre} {empleado.apellido}</h3>
                  <p className="text-primary mb-1 fw-semibold">
                    🏪 {empleado.local_detalle.nombre}
                  </p>
                  <small className="text-muted d-block">
                    ID Empleado: {empleado.id_empleados} | DNI: {empleado.dni}
                  </small>
                </div>
              </div>

              <CRow>
                <CCol md={6} className="border-end-md-custom mb-4 mb-md-0">
                  <h5 className="text-primary fw-bold mb-3">Datos del Personal</h5>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nombre (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="nombre"
                      value={empleado.nombre}
                      // disabled={!isEditing}
                      // onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Apellido (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="apellido"
                      value={empleado.apellido}
                      // disabled={!isEditing}
                      // onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">DNI (INT - No Editable)</label>
                    <CFormInput
                      type="number"
                      value={empleado.dni}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Teléfono (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="telefono"
                      value={empleado.telefono}
                      // disabled={!isEditing}
                      // onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Domicilio (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="domicilio"
                      value={empleado.domicilio}
                      // disabled={!isEditing}
                      // onChange={handleInputChange}
                    />
                  </div>
                </CCol>

                <CCol md={6}>
                  <h5 className="text-danger fw-bold mb-3">Seguridad y Cuenta de Usuario</h5>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">ID Usuario (PK INT)</label>
                    <CFormInput
                      type="text"
                      value={empleado.usuario_detalle.id_usuarios}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nombre de Usuario (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="usuario"
                      value={empleado.usuario_detalle.usuario}
                      // disabled={!isEditing}
                      // onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Contraseña (VARCHAR)</label>
                    <CFormInput
                      type="password"
                      name="password"
                      value={empleado.password}
                      // disabled={!isEditing}
                      // onChange={handleInputChange}
                      placeholder="Nueva contraseña"
                    />
                  </div>

                  {/* <div className="p-3 bg-light rounded border mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Creación de Cuenta:</span>
                      <span className="small fw-medium text-dark">{empleado.fecha_hora_creacion_usr}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Última Modificación:</span>
                      <span className="small fw-medium text-dark">{empleado.fecha_hora_modificacion_usr}</span>
                    </div>
                  </div> */}
                </CCol>
              </CRow>

              {/* <div className="d-flex justify-content-end gap-2 pt-3 mt-4 border-top">
                {isEditing ? (
                  <>
                    <CButton color="secondary" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </CButton>
                    <CButton color="success" className="text-white fw-medium" onClick={handleSave}>
                      Guardar Cambios (Update)
                    </CButton>
                  </>
                ) : (
                  <CButton color="primary" className="px-4" onClick={() => setIsEditing(true)}>
                    Editar Perfil
                  </CButton>
                )}
              </div> */}

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      : sinDatos
      ?
      <div className="p-4 text-center" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
        <p className="text-muted fw-bold">No hay empleado asignado a esta cuenta</p>
      </div>
      :
      <div className="p-4 text-center" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
        <p className="text-muted fw-bold">Cargando datos del empleado...</p>
      </div>
    }
    </div>
  )
}
