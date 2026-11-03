import React, { useState } from 'react'
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

export default function Menus() {
  // Estado que mapea la unión real del DER: EMPLEADOS + USUARIOS + LOCALES (solo nombre)
  const [employeeData, setEmployeeData] = useState({
    // TABLA: EMPLEADOS
    id_empleados: 12,
    id_locales: 2,
    dni: 38475920,
    nombre: 'Juan Carlos',
    apellido: 'Gómez',
    telefono: '+54 387 4123456',
    domicilio: 'Av. Belgrano 1240, Salta',
    estado: true, // BOOLEAN
    fecha_hora_creacion_emp: '2025-03-15 08:30:00',

    // TABLA: USUARIOS (Relación 1 a 1 / Extensión de la entidad)
    id_usuarios: 45,
    usuario: 'jgomez_cajero',
    password: '••••••••••••', // Enmascarado por seguridad de interfaz
    fecha_hora_modificacion_usr: '2026-08-20 14:15:00',
    fecha_hora_creacion_usr: '2025-03-15 08:45:00',

    // TABLA: LOCALES (Solamente el Nombre solicitado)
    local_nombre: 'Sucursal Centro - El Cuartel del Sandwich'
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEmployeeData({ ...employeeData, [name]: value })
  }

  const handleSave = () => {
    setIsEditing(false)
    alert('Datos del empleado y credenciales actualizados en el sistema.')
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
      <CRow className="justify-content-center">
        <CCol xs={12} lg={10}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-dark text-white py-3 fw-semibold d-flex justify-content-between align-items-center">
              <span>Ficha Técnica y Credenciales del Empleado</span>
              <CBadge color={employeeData.estado ? 'success' : 'danger'} shape="rounded-pill">
                {employeeData.estado ? 'EMPLEADO ACTIVO' : 'INACTIVO'}
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-4">
              
              {/* Header de Identidad Operativa */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <CAvatar color="primary" text="white" size="xl" className="fw-bold">
                  {employeeData.nombre.charAt(0)}{employeeData.apellido.charAt(0)}
                </CAvatar>
                <div>
                  <h3 className="mb-1 fw-bold text-dark">{employeeData.nombre} {employeeData.apellido}</h3>
                  <p className="text-primary mb-1 fw-semibold">
                    🏪 {employeeData.local_nombre}
                  </p>
                  <small className="text-muted d-block">
                    ID Empleado: {employeeData.id_empleados} | DNI: {employeeData.dni} | Alta Sistema: {employeeData.fecha_hora_creacion_emp}
                  </small>
                </div>
              </div>

              <CRow>
                {/* COLUMNA IZQUIERDA: DATOS PERSONALES (TABLA EMPLEADOS) */}
                <CCol md={6} className="border-end-md-custom mb-4 mb-md-0">
                  <h5 className="text-primary fw-bold mb-3">Datos del Personal</h5>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nombre (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="nombre"
                      value={employeeData.nombre}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Apellido (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="apellido"
                      value={employeeData.apellido}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">DNI (INT - No Editable)</label>
                    <CFormInput
                      type="number"
                      value={employeeData.dni}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Teléfono (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="telefono"
                      value={employeeData.telefono}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Domicilio (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="domicilio"
                      value={employeeData.domicilio}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                    />
                  </div>
                </CCol>

                {/* COLUMNA DERECHA: CREDENCIALES DE ACCESO (TABLA USUARIOS) */}
                <CCol md={6}>
                  <h5 className="text-danger fw-bold mb-3">Seguridad y Cuenta de Usuario</h5>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">ID Usuario (PK INT)</label>
                    <CFormInput
                      type="text"
                      value={employeeData.id_usuarios}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nombre de Usuario (VARCHAR)</label>
                    <CFormInput
                      type="text"
                      name="usuario"
                      value={employeeData.usuario}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Contraseña (VARCHAR)</label>
                    <CFormInput
                      type="password"
                      name="password"
                      value={employeeData.password}
                      disabled={!isEditing}
                      onChange={handleInputChange}
                      placeholder="Nueva contraseña"
                    />
                  </div>

                  <div className="p-3 bg-light rounded border mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Creación de Cuenta:</span>
                      <span className="small fw-medium text-dark">{employeeData.fecha_hora_creacion_usr}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Última Modificación:</span>
                      <span className="small fw-medium text-dark">{employeeData.fecha_hora_modificacion_usr}</span>
                    </div>
                  </div>
                </CCol>
              </CRow>

              {/* Botones de Control de la Ficha */}
              <div className="d-flex justify-content-end gap-2 pt-3 mt-4 border-top">
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
              </div>

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}
