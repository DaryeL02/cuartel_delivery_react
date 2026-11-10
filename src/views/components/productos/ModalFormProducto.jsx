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
  CFormSwitch
} from '@coreui/react'
import api from '../api/api'

const ModalFormProducto = ({ visible, onClose, producto, insumos_lista, onSuccess }) => {
  // Inicializar el formulario según los atributos de la base de datos
    const [data, setData] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    estado: true,
    insumos: []
    })

  const [loading, setLoading] = useState(false)
  const modoEditar = !!producto // Si viene un objeto producto, es modo modificación

  // Efecto para cargar los datos del producto si estamos editando
    useEffect(() => {
    if (modoEditar && producto) {
        setData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_unitario: producto.precio_unitario || 0,
        estado: producto.estado || true,
        insumos: producto.insumos_asociados 
        ? producto.insumos_asociados.map(item => item.insumo.id_insumos) 
        : []
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

  // Manejo de cambios específico para la selección de múltiples insumos
  const handleInsumoCheck = (idInsumo) => {
    setData((prev) => {
      const yaSeleccionado = prev.insumos.includes(idInsumo)
      const nuevosInsumos = yaSeleccionado
        ? prev.insumos.filter((id) => id !== idInsumo) // Quitar si ya estaba
        : [...prev.insumos, idInsumo] // Agregar si no estaba

      return {
        ...prev,
        insumos: nuevosInsumos
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

     // 1. Estructuramos el payload formateando la lista de insumos
    const payload = {
      ...data,
      insumos: data.insumos.map(id => ({ id_insumos: id }))
    }

    console.log(payload)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        // Petición de Modificación (PUT)
        const idProducto = producto.id_productos
        await api.put(`/api/productos/${idProducto}/`, payload, { headers })
      } else {
        // Petición de Alta (POST)
        await api.post('/api/productos/', payload, { headers })
      }

      onSuccess() // Callback para recargar la tabla principal
      onClose() // Cerrar el modal
    } catch (error) {
      console.error('Error al guardar el producto:', error)
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
      <CForm onSubmit={handleSubmit}>
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
                required
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
                required
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

            {/* Selección de Insumos Asociados (Muchos a Muchos) */}
            <CCol md={12}>
              <label className="form-label fw-medium text-secondary">Insumos del Producto</label>
              <div 
                className="border rounded p-3 bg-light" 
                style={{ maxHeight: '180px', overflowY: 'auto' }}
              >
                {insumos_lista.length === 0 ? (
                  <p className="text-muted small mb-0">No hay insumos disponibles para asociar.</p>
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
              <small className="text-muted mt-1 d-block">
                Selecciona todos los insumos necesarios para la elaboración de este producto.
              </small>
            </CCol>
          </CRow>
          <CRow className="align-items-center">
            <CCol xs="auto">
              <CFormSwitch
                label={data.estado ? "Producto Activo" : "Producto Inactivo"}
                id="switchEstadoProducto"
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
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Registrar Producto'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormProducto
