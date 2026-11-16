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
  CFormCheck,
  CRow,
  CCol,
  CFormSwitch,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const ModalFormProducto = ({ visible, onClose, producto, insumos_lista, onSuccess }) => {
  const [data, setData] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    estado: true,
    insumos: [],
  })

  const [loading, setLoading] = useState(false)
  const modoEditar = !!producto

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
    if (modoEditar && producto) {
      setData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_unitario: producto.precio_unitario || 0,
        estado: producto.estado ?? true,
        insumos: producto.insumos_asociados
          ? producto.insumos_asociados.map((item) => item.insumo.id_insumos)
          : [],
      })
    } else {
      setData({
        nombre: '',
        descripcion: '',
        precio_unitario: 0,
        estado: true,
        insumos: [],
      })
    }
  }, [producto, visible, modoEditar])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleInsumoCheck = (idInsumo) => {
    setData((prev) => {
      const yaSeleccionado = prev.insumos.includes(idInsumo)
      const nuevosInsumos = yaSeleccionado
        ? prev.insumos.filter((id) => id !== idInsumo)
        : [...prev.insumos, idInsumo]

      return {
        ...prev,
        insumos: nuevosInsumos,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!data.nombre.trim()) {
      notificar('advertencia', 'Ingresa el nombre del producto.')
      return
    }
    if (data.precio_unitario === '' || Number(data.precio_unitario) <= 0) {
      notificar('advertencia', 'Ingresa un precio unitario mayor a 0.')
      return
    }

    setLoading(true)

    const payload = {
      ...data,
      insumos: data.insumos.map((id) => ({ id_insumos: id })),
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        const idProducto = producto.id_productos
        await api.put(`/api/productos/${idProducto}/`, payload, { headers })
        notificar('exito', 'Producto actualizado con éxito.')
      } else {
        await api.post('/api/productos/', payload, { headers })
        notificar('exito', 'Producto registrado con éxito.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      notificar(
        'error',
        modoEditar
          ? 'No se pudo actualizar el producto. Por favor, intenta nuevamente.'
          : 'No se pudo registrar el producto. Por favor, intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {modoEditar ? 'Modificar Producto' : 'Agregar Nuevo Producto'}
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            {/* Nombre del Producto */}
            <CCol md={8}>
              <CFormInput
                type="text"
                label="Nombre del Producto"
                name="nombre"
                maxLength={50}
                value={data.nombre}
                onChange={handleChange}
                placeholder="Ej. Hamburguesa Completa"
              />
            </CCol>

            {/* Precio Unitario */}
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Precio Unitario ($)"
                name="precio_unitario"
                min={0}
                step="0.01"
                value={data.precio_unitario}
                onChange={handleChange}
                placeholder="0.00"
              />
            </CCol>

            {/* Descripción */}
            <CCol md={12}>
              <CFormTextarea
                label="Descripción"
                name="descripcion"
                rows={2}
                maxLength={200}
                value={data.descripcion}
                onChange={handleChange}
                placeholder="Detalles específicos del producto final..."
              />
            </CCol>

            {/* Selección de Insumos Asociados */}
            <CCol md={12}>
              <label className="form-label fw-medium text-body-secondary">Insumos del Producto</label>
              <div
                className="border rounded p-3 bg-body-secondary"
                style={{ maxHeight: '180px', overflowY: 'auto' }}
              >
                {insumos_lista.length === 0 ? (
                  <p className="text-body-secondary small mb-0">No hay insumos disponibles para asociar.</p>
                ) : (
                  <CRow>
                    {insumos_lista.map((insumo) => (
                      <CCol xs={12} sm={6} key={insumo.id_insumos} className="mb-2">
                        <CFormCheck
                          id={`insumo-${insumo.id_insumos}`}
                          label={insumo.nombre}
                          checked={data.insumos.includes(insumo.id_insumos)}
                          onChange={() => handleInsumoCheck(insumo.id_insumos)}
                        />
                      </CCol>
                    ))}
                  </CRow>
                )}
              </div>
              <small className="text-body-secondary mt-1 d-block">
                Selecciona todos los insumos necesarios para la elaboración de este producto.
              </small>
            </CCol>
          </CRow>
          <CRow className="align-items-center mt-2">
            <CCol xs="auto">
              <CFormSwitch
                label={data.estado ? 'Producto Activo' : 'Producto Inactivo'}
                id="switchEstadoProducto"
                name="estado"
                checked={data.estado}
                onChange={handleChange}
                size="xl"
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={modoEditar ? 'info' : 'primary'} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Registrar Producto'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormProducto
