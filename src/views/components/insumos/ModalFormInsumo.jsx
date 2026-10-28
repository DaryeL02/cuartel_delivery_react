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
  CRow,
  CCol,
} from '@coreui/react'
import api from '../api/api'

const ModalFormInsumo = ({ visible, onClose, insumo, categorias, proveedores, onSuccess }) => {

  // Inicializar el formulario según los atributos de la base de datos
    const [formData, setFormData] = useState({
    categoria: '',
    proveedor: '',
    nombre: '',
    descripcion: '',
    unidad: '',
    stock_actual: 0,
    stock_minimo: 0,
    })

  const [loading, setLoading] = useState(false)
  const isEditMode = !!insumo // Si viene un objeto insumo, es modo modificación

  // Efecto para cargar los datos del insumo si estamos editando
    useEffect(() => {
    
    if (isEditMode && insumo) {

        const ProveedorId = insumo.proveedores_asociados && insumo.proveedores_asociados.length > 0
        ? insumo.proveedores_asociados[0].proveedor?.id_proveedores
        : '';

        setFormData({
        categoria: insumo.categoria_detalle?.id_categorias || '',
        proveedor: ProveedorId,
        nombre: insumo.nombre || '',
        descripcion: insumo.descripcion || '',
        unidad: insumo.unidad || '',
        stock_actual: insumo.stock_actual || 0,
        stock_minimo: insumo.stock_minimo || 0,
        })
    } else {
        setFormData({
        categoria: 0,
        proveedor: 0,
        nombre: '',
        descripcion: '',
        unidad: '',
        stock_actual: 0,
        stock_minimo: 0,
        })
    }
    }, [insumo, visible, isEditMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(false)
    console.log(formData)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (isEditMode) {
        // Petición de Modificación (PUT)
        const idInsumo = insumo.id_insumos || insumo.ID_insumos
        await api.put(`/api/insumos/${idInsumo}/`, formData, { headers })
      } else {
        // Petición de Alta (POST)
        await api.post('/api/insumos/', formData, { headers })
      }

      onSuccess() // Callback para recargar la tabla principal
      onClose() // Cerrar el modal
    } catch (error) {
      console.error('Error al guardar el insumo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {isEditMode ? 'Modificar Insumo' : 'Agregar Nuevo Insumo'}
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          <CRow className="g-3">
            {/* Nombre del Insumo */}
            <CCol md={8}>
              <CFormInput
                type="text"
                label="Nombre del Insumo"
                name="nombre"
                maxLength={50}
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. Harina 000"
              />
            </CCol>

            {/* Categoría (Relación FK con la tabla CATEGORIAS) */}
            <CCol md={4}>
              <CFormSelect
                label="Categoría"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">{isEditMode ? insumo.categoria_detalle.nombre : "Selecciona..."}</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categorias} value={cat.id_categorias}>
                    {cat.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Descripción */}
            <CCol md={8}>
              <CFormTextarea
                label="Descripción"
                name="descripcion"
                rows={2}
                maxLength={200}
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles específicos del insumo..."
              />
            </CCol>

            <CCol md={4}>
              <CFormSelect
                label="Proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona...</option>
                {proveedores.map((pro) => (
                  <option key={pro.id_proveedores} value={pro.id_proveedores}>
                    {pro.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Unidad de Medida */}
            <CCol md={4}>
              <CFormInput
                type="text"
                label="Unidad de Medida"
                name="unidad"
                maxLength={10}
                value={formData.unidad}
                onChange={handleChange}
                required
                placeholder="Ej. Kg, Litros, Unidades"
              />
            </CCol>

            {/* Stock Actual */}
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Stock Actual"
                name="stock_actual"
                min={0}
                value={formData.stock_actual}
                onChange={handleChange}
                required
              />
            </CCol>

            {/* Stock Mínimo */}
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Stock Mínimo"
                name="stock_minimo"
                min={0}
                value={formData.stock_minimo}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton color={isEditMode ? 'info' : 'primary'} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Registrar Insumo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormInsumo
