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
  CFormText,
  CRow,
  CCol,
} from '@coreui/react'
import api from '../api/api'
import { toast } from 'react-toastify'

const ModalFormEmpleado = ({ visible, onClose, empleado, roles, locales, onSuccess }) => {
  const [data, setData] = useState({
    rol: '',
    local: '',
    usuario: '',
    email: '',
    password: '',
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

  const notificar = (tipo, mensaje) => {
    switch (tipo) {
      case 'exito':
        toast.success(mensaje)
        break
      case 'error':
        toast.error(mensaje)
        break
      case 'advertencia':
        toast.warning(mensaje)
        break
      default:
        toast(mensaje)
    }
  }

  useEffect(() => {
    setErrors({})
    if (modoEditar && empleado) {
      const rolId =
        empleado.usuario_detalle?.roles_asignados &&
        empleado.usuario_detalle?.roles_asignados.length > 0
          ? empleado.usuario_detalle.roles_asignados[0].rol_detalle?.id_roles
          : ''

      setData({
        rol: rolId || '',
        local: empleado.local_detalle?.id_locales || '',
        usuario: empleado.usuario_detalle?.usuario || '',
        email: empleado.usuario_detalle?.email || '',
        password: '',
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        dni: empleado.dni != null ? String(empleado.dni) : '',
        telefono: empleado.telefono || '',
        domicilio: empleado.domicilio || '',
        estado: empleado.estado ?? true,
      })
    } else {
      setData({
        rol: '',
        local: '',
        usuario: '',
        email: '',
        password: '',
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
    let nuevoValor = type === 'checkbox' ? checked : value

    if (name === 'usuario') {
      nuevoValor = value.replace(/\s/g, '').replace(/[^a-zA-Z0-9._-]/g, '')
    } else if (name === 'nombre' || name === 'apellido') {
      nuevoValor = value.replace(/[^a-zA-ZÀ-ÿ\s']/g, '')
    } else if (name === 'dni' || name === 'telefono') {
      nuevoValor = value.replace(/\D/g, '')
    }

    setData((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    const usuarioLimpio = data.usuario.trim()
    const emailLimpio = data.email.trim()
    const nombreLimpio = data.nombre.trim()
    const apellidoLimpio = data.apellido.trim()
    const dniLimpio = data.dni.trim()
    const telefonoLimpio = data.telefono.trim()

    if (!usuarioLimpio) {
      nuevosErrores.usuario = 'El nombre de usuario es obligatorio.'
    } else if (usuarioLimpio.length < 4) {
      nuevosErrores.usuario = 'El usuario debe tener al menos 4 caracteres.'
    } else if (!/^[a-zA-Z0-9._-]+$/.test(usuarioLimpio)) {
      nuevosErrores.usuario = 'Solo se permiten letras, números, puntos y guiones.'
    }

    if (!modoEditar && !data.password) {
      nuevosErrores.password = 'La contraseña es obligatoria para crear el usuario.'
    }

    if (!data.rol) {
      nuevosErrores.rol = 'Debes seleccionar un rol para el usuario.'
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailLimpio) {
      nuevosErrores.email = 'El correo electrónico es obligatorio.'
    } else if (!regexEmail.test(emailLimpio)) {
      nuevosErrores.email = 'Ingresa un correo electrónico válido.'
    }

    if (!data.local) {
      nuevosErrores.local = 'Debes seleccionar una sucursal.'
    }

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio.'
    } else if (nombreLimpio.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres.'
    }

    if (!apellidoLimpio) {
      nuevosErrores.apellido = 'El apellido es obligatorio.'
    } else if (apellidoLimpio.length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres.'
    }

    if (!dniLimpio) {
      nuevosErrores.dni = 'El DNI es obligatorio.'
    } else if (dniLimpio.length < 7 || dniLimpio.length > 8) {
      nuevosErrores.dni = 'El DNI debe tener entre 7 y 8 dígitos.'
    }

    if (telefonoLimpio && telefonoLimpio.length < 8) {
      nuevosErrores.telefono = 'El teléfono debe tener al menos 8 dígitos.'
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const normalizarErroresBackend = (errorData) => {
    const erroresMapeados = {}
    if (!errorData || typeof errorData !== 'object') return erroresMapeados

    Object.entries(errorData).forEach(([clave, valor]) => {
      if (clave === 'usuario_detalle' && typeof valor === 'object' && valor !== null) {
        Object.entries(valor).forEach(([subClave, subValor]) => {
          erroresMapeados[subClave] = Array.isArray(subValor) ? subValor[0] : String(subValor)
        })
      } else {
        erroresMapeados[clave] = Array.isArray(valor) ? valor[0] : String(valor)
      }
    })

    return erroresMapeados
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      notificar('advertencia', 'Por favor, corrige los campos marcados antes de guardar.')
      return
    }

    setLoading(true)

    const payload = {
      rol: data.rol,
      local: data.local,
      usuario: data.usuario.trim(),
      email: data.email.trim(),
      ...(data.password ? { password: data.password } : {}),
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      dni: data.dni.trim(),
      telefono: data.telefono.trim(),
      domicilio: data.domicilio.trim(),
      estado: data.estado,
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        const idEmpleado = empleado.id_empleados || empleado.ID_empleados
        await api.put(`/api/empleados/${idEmpleado}/`, payload, { headers })
        notificar('exito', 'Empleado actualizado con éxito.')
      } else {
        await api.post('/api/empleados/', payload, { headers })
        notificar('exito', 'Empleado registrado correctamente.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al guardar el empleado:', error)

      if (error.response && error.response.data) {
        const erroresBackend = normalizarErroresBackend(error.response.data)
        setErrors(erroresBackend)
        const mensajePrincipal =
          erroresBackend.detail ||
          erroresBackend.non_field_errors ||
          erroresBackend.dni ||
          (modoEditar
            ? 'No se pudieron guardar los cambios. Revisa los datos ingresados.'
            : 'No se pudo registrar el empleado. Revisa los datos ingresados.')
        notificar('error', mensajePrincipal)
      } else {
        notificar('error', 'Ocurrió un error inesperado de conexión con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  const rolesDisponibles = roles.filter(
    (item) => item.estado !== false || String(item.id_roles) === String(data.rol),
  )

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {modoEditar ? 'Modificar Empleado' : 'Agregar Nuevo Empleado'}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          {/* DATOS DE ACCESO Y CONFIGURACIÓN */}
          <div className="mb-3">
            <h5
              className="text-body-secondary fw-semibold border-bottom pb-2 mb-3"
              style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}
            >
              DATOS DE ACCESO Y CONFIGURACIÓN
            </h5>
          </div>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                label={
                  <span>
                    Usuario <span className="text-danger">*</span>
                  </span>
                }
                name="usuario"
                maxLength={30}
                value={data.usuario}
                onChange={handleChange}
                invalid={!!errors.usuario}
                feedbackInvalid={errors.usuario}
                placeholder="Cadete1"
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="password"
                label={
                  <span>Contraseña {!modoEditar && <span className="text-danger">*</span>}</span>
                }
                name="password"
                autoComplete="new-password"
                value={data.password}
                onChange={handleChange}
                invalid={!!errors.password}
                feedbackInvalid={errors.password}
                required={!modoEditar}
              />
              {modoEditar && (
                <CFormText>Dejar en blanco para mantener la contraseña actual</CFormText>
              )}
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label={
                  <span>
                    Rol <span className="text-danger">*</span>
                  </span>
                }
                name="rol"
                value={data.rol}
                onChange={handleChange}
                invalid={!!errors.rol}
                feedbackInvalid={errors.rol}
              >
                <option value="">Selecciona...</option>
                {rolesDisponibles.map((item) => (
                  <option key={item.id_roles} value={item.id_roles}>
                    {item.nombre}
                    {item.estado === false ? ' (Inactivo)' : ''}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <CFormInput
                type="email"
                label={
                  <span>
                    Correo electrónico <span className="text-danger">*</span>
                  </span>
                }
                name="email"
                maxLength={50}
                value={data.email}
                onChange={handleChange}
                invalid={!!errors.email}
                feedbackInvalid={errors.email}
                placeholder="correo@gmail.com"
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label={
                  <span>
                    Local <span className="text-danger">*</span>
                  </span>
                }
                name="local"
                value={data.local}
                onChange={handleChange}
                invalid={!!errors.local}
                feedbackInvalid={errors.local}
              >
                <option value="">Selecciona...</option>
                {locales.map((item) => (
                  <option key={item.id_locales} value={item.id_locales}>
                    {item.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* INFORMACIÓN PERSONAL */}
          <div className="mb-3">
            <h5
              className="text-body-secondary fw-semibold border-bottom pb-2 mb-3"
              style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}
            >
              INFORMACIÓN PERSONAL
            </h5>
          </div>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                label={
                  <span>
                    Nombre <span className="text-danger">*</span>
                  </span>
                }
                name="nombre"
                maxLength={50}
                value={data.nombre}
                onChange={handleChange}
                invalid={!!errors.nombre}
                feedbackInvalid={errors.nombre}
                placeholder="Matías"
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="text"
                label={
                  <span>
                    Apellido <span className="text-danger">*</span>
                  </span>
                }
                name="apellido"
                maxLength={50}
                value={data.apellido}
                onChange={handleChange}
                invalid={!!errors.apellido}
                feedbackInvalid={errors.apellido}
                placeholder="Velazquez"
              />
            </CCol>
          </CRow>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                inputMode="numeric"
                label={
                  <span>
                    DNI <span className="text-danger">*</span>
                  </span>
                }
                name="dni"
                maxLength={8}
                value={data.dni}
                onChange={handleChange}
                readOnly={modoEditar}
                invalid={!!errors.dni}
                feedbackInvalid={errors.dni}
                placeholder="39472367"
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                type="text"
                inputMode="numeric"
                label="Teléfono de Contacto"
                name="telefono"
                maxLength={20}
                value={data.telefono}
                onChange={handleChange}
                invalid={!!errors.telefono}
                feedbackInvalid={errors.telefono}
                placeholder="3875411270"
              />
            </CCol>
          </CRow>
          <CRow className="g-3 mb-4">
            <CCol md={12}>
              <CFormTextarea
                label="Domicilio"
                name="domicilio"
                rows={2}
                maxLength={200}
                value={data.domicilio}
                onChange={handleChange}
                invalid={!!errors.domicilio}
                feedbackInvalid={errors.domicilio}
                placeholder="Av. San Martín 260"
              />
              <div className="d-flex justify-content-end">
                <CFormText>{data.domicilio.length}/200</CFormText>
              </div>
            </CCol>
          </CRow>

          {/* ESTADO DEL USUARIO */}
          <div className="mb-2">
            <h5
              className="text-body-secondary fw-semibold border-bottom pb-2 mb-3"
              style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}
            >
              ESTADO DEL USUARIO
            </h5>
          </div>
          <CRow className="align-items-center">
            <CCol xs="auto">
              <CFormSwitch
                label={data.estado ? 'Usuario Activo' : 'Usuario Inactivo'}
                id="switchEstadoEmpleado"
                name="estado"
                checked={data.estado}
                onChange={handleChange}
                size="xl"
              />
            </CCol>
          </CRow>
          <small className="text-body-secondary d-block mt-3">
            <span className="text-danger">*</span> Campos obligatorios
          </small>
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
