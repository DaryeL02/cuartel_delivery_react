import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
  CFormFeedback,
} from '@coreui/react'
import api from '../api/api'

const ModalFormEmpleado = ({ visible, onClose, empleado, roles, locales, onSuccess }) => {

    const [data, setData] = useState({
    rol: '',
    local: '',
    usuario: '',
    email: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    domicilio: '',
    estado: true,
    })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const modoEditar = !!empleado 


    useEffect(() => {
    
    if (modoEditar && empleado) {

        const RolId = empleado.usuario_detalle?.roles_asignados && empleado.usuario_detalle?.roles_asignados.length > 0
        ? empleado.usuario_detalle?.roles_asignados[0].rol_detalle?.id_roles
        : '';

        setData({
        rol: RolId,
        local: empleado.local_detalle?.id_locales || '',
        usuario: empleado.usuario_detalle?.usuario|| '',
        nombre: empleado.nombre || '',
        email: empleado.usuario_detalle?.email || '',
        apellido: empleado.apellido || '',
        dni: empleado.dni || '',
        telefono: empleado.telefono || '',
        domicilio: empleado.domicilio || '',
        estado: empleado.estado || false,
        })
    } else {
        setData({
          rol: '',
          local: '',
          usuario: '',
          email: '',
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          domicilio: '',
          estado: true,
        })
    }
    }, [empleado, visible, modoEditar])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'dni' || name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '') // Elimina todo lo que NO sea un número
      
      setData((prev) => ({
        ...prev,
        [name]: soloNumeros,
      }))

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }))
      }
      return // Detiene la ejecución aquí para el DNI
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }

    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(false)
    console.log(data)
    
    if (data.dni.trim().length !== 8) {
      setErrors({ dni: 'El DNI debe tener al menos 6 digitos.' })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        const idEmpleado = empleado.id_empleados || empleado.ID_empleados
        await api.put(`/api/empleados/${idEmpleado}/`, data, { headers })
      } else {
        await api.post('/api/empleados/', data, { headers })
      }

      onSuccess() 
      onClose()
    } catch (error) {

      console.error('Error al guardar el empleado:', error)
      
      if (error.response && error.response.data) {
        setErrors(error.response.data)
      } else {
        alert('Ocurrió un error inesperado de conexión con el servidor.')
      }


    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {modoEditar ? 'Modificar Empleado' : 'Agregar Nuevo Empleado'}
        </CModalTitle>
      </CModalHeader>
      
      <CForm onSubmit={handleSubmit}>
        
        <CModalBody>

          {/* DATOS DE ACCESO Y CONFIGURACIÓN */}
          <div className="mb-4">
            <h5 className="text-secondary fw-semibold border-bottom pb-2 mb-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              DATOS DE ACCESO Y CONFIGURACIÓN
            </h5>
            
          </div>
          <CRow className="g-3 mb-3">
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Usuario"
                  name="usuario"
                  maxLength={30}
                  value={data.usuario}
                  onChange={handleChange}
                  required
                  placeholder="Cadete1"
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="Rol"
                  name="rol"
                  value={data.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">{modoEditar ? empleado.usuario_detalle?.roles_asignados ? empleado.usuario_detalle?.roles_asignados[0].rol_detalle?.nombre : "No hay rol asignado" : "Selecciona..."}</option>
                  {roles.map((item) => (
                    <option key={item.id_roles} value={item.id_roles}>
                      {item.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

          </CRow>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
                <CFormInput
                  type="email"
                  label="Correo electrónico"
                  name="email"
                  maxLength={50}
                  value={data.email}
                  onChange={handleChange}
                  required
                  placeholder="correo@gmail.com"
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="Local"
                  name="local"
                  value={data.local}
                  onChange={handleChange}
                  required
                >
                  <option value="">{modoEditar ? empleado.local_detalle.nombre : "Selecciona..."}</option>
                  {locales.map((item) => (
                    <option key={item.id_locales} value={item.id_locales}>
                      {item.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

          </CRow>

          {/* INFORMACIÓN PERSONAL */}
          <div className="mb-4">
            <h5 className="text-secondary fw-semibold border-bottom pb-2 mb-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              INFORMACIÓN PERSONAL
            </h5>
          </div>   
          <CRow className="g-3 mb-2">
            <CCol md={6}>
              <CFormInput
                type="text"
                label="Nombre"
                name="nombre"
                maxLength={50}
                value={data.nombre}
                onChange={handleChange}
                required
                placeholder="Matías"
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="text"
                label="Apellido"
                name="apellido"
                maxLength={50}
                value={data.apellido}
                onChange={handleChange}
                required
                placeholder="Velazquez"
              />
            </CCol>

          </CRow>       
          <CRow className="g-3 mb-2">
            <CCol md={6}>
              <CFormInput
                type="text"
                label="DNI"
                name="dni"
                maxLength={8}
                value={data.dni}
                onChange={handleChange}
                placeholder="39472367"
                invalid={!!errors.dni} 
              />
              {errors.dni && <CFormFeedback invalid>{errors.dni}</CFormFeedback>}
            </CCol>

            {/* Telefono */}
            <CCol md={6}>
              <CFormInput
                label="Teléfono de Contacto"
                name="telefono"
                // rows={2}
                maxLength={20}
                value={data.telefono}
                onChange={handleChange}
                placeholder="3875411270"
              />
            </CCol>
          </CRow>
          <CRow className="g-3 mb-3">
            <CCol md={12}>
              <CFormTextarea
                label="Domicilio"
                name="domicilio"
                // rows={2}
                maxLength={200}
                value={data.domicilio}
                onChange={handleChange}
                placeholder="Av. San Martín 260"
              />
            </CCol>

          </CRow> 
          
          {/* ESTADO DEL USUARIO */}
          <div className="mb-2">

            <h5 className="text-secondary fw-semibold border-bottom pb-2 mb-3" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              ESTADO DEL USUARIO
            </h5>      

          </div>
          <CRow className="align-items-center">
              <CCol xs="auto">
                <CFormSwitch
                  label={data.estado ? "Usuario Activo" : "Usuario Inactivo"}
                  id="switchEstadoEmpleado"
                  name="estado"
                  checked={data.estado}
                  onChange={handleChange}
                  size="xl" // Hace que el switch se vea un poco más grande y claro
                />
              </CCol>
          </CRow>

        </CModalBody>
        
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={modoEditar ? 'info' : 'primary'} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Registrar Empleado'}
          </CButton>
        </CModalFooter>

      </CForm>
    </CModal>
  )
}

export default ModalFormEmpleado
