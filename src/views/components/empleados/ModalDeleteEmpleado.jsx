import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CAlert,
} from '@coreui/react'
import api from '../api/api'
import { toast } from 'react-toastify'

const ModalDeleteEmpleado = ({ visible, onClose, empleado, onSuccess }) => {
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!empleado) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }
      const idEmpleado = empleado.id_empleados || empleado.ID_empleados
      await api.delete(`/api/empleados/${idEmpleado}/`, { headers })

      notificar('exito', 'Empleado eliminado con éxito.')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al eliminar el empleado:', error)
      const status = error.response?.status
      const mensajeBackend =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        (status === 400 || status === 409
          ? 'No se puede eliminar este empleado porque tiene registros o cajas asociadas. Puedes desactivarlo desde Editar.'
          : 'No se pudo eliminar el empleado. Intenta nuevamente.')
      notificar('error', mensajeBackend)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">Eliminar empleado</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <p className="mb-3">
            ¿Desea eliminar al empleado{' '}
            <strong>
              {empleado?.nombre} {empleado?.apellido}
            </strong>
            ?
          </p>
          <CAlert color="warning" className="mb-0">
            Esta acción eliminará el registro y revocará el acceso al sistema del usuario asociado.
            Si el empleado tiene historial operativo, se recomienda cambiar su estado a{' '}
            <strong>Inactivo</strong>.
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color="danger" className="text-white" type="submit" disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalDeleteEmpleado
