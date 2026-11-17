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
  CFormText,
  CFormSwitch,
  CRow,
  CCol,
} from '@coreui/react'
import { toast } from 'react-toastify'

const ModalAgregarMenu = ({ visible, onClose, onAdd }) => {
  const [data, setData] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    descripcion: '',
    es_combo: false,
    estado: true,
  })
  const [errores, setErrores] = useState({})

  const categorias = ['Sándwiches', 'Combos', 'Promociones', 'Bebidas']

  useEffect(() => {
    if (visible) {
      setErrores({})
      setData({
        nombre: '',
        categoria: '',
        precio: '',
        descripcion: '',
        es_combo: false,
        estado: true,
      })
    }
  }, [visible])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!data.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del menú es obligatorio.'
    } else if (data.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'Debe tener al menos 3 caracteres.'
    }

    if (!data.categoria) {
      nuevosErrores.categoria = 'Selecciona una categoría.'
    }

    const precioNum = Number(data.precio)
    if (data.precio === '' || isNaN(precioNum) || precioNum <= 0) {
      nuevosErrores.precio = 'Ingresa un precio válido mayor a 0.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validarFormulario()) {
      toast.warning('Por favor, corrige los campos marcados antes de guardar.')
      return
    }

    onAdd({
      id_menu: Date.now(),
      nombre: data.nombre.trim(),
      categoria: data.categoria,
      descripcion: data.descripcion.trim(),
      precio: Number(data.precio),
      es_combo: data.es_combo,
      estado: data.estado,
    })
    onClose()
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">Agregar Nuevo Menú</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit} noValidate>
        <CModalBody>
          <CRow className="g-3">
            <CCol md={8}>
              <CFormInput
                type="text"
                label="Nombre del Menú o Producto"
                name="nombre"
                maxLength={60}
                value={data.nombre}
                onChange={handleChange}
                invalid={!!errores.nombre}
                feedbackInvalid={errores.nombre}
                placeholder="Ej. Lomito Completo El Cuartel"
              />
            </CCol>

            <CCol md={4}>
              <CFormSelect
                label="Categoría"
                name="categoria"
                value={data.categoria}
                onChange={handleChange}
                invalid={!!errores.categoria}
                feedbackInvalid={errores.categoria}
              >
                <option value="">Selecciona...</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={8}>
              <CFormTextarea
                label="Descripción / Ingredientes"
                name="descripcion"
                rows={2}
                maxLength={200}
                value={data.descripcion}
                onChange={handleChange}
                placeholder="Detalle los ingredientes o qué incluye la promoción..."
              />
              <CFormText className="d-flex justify-content-end">
                {data.descripcion.length}/200
              </CFormText>
            </CCol>

            <CCol md={4}>
              <CFormInput
                type="number"
                label="Precio de Venta ($)"
                name="precio"
                value={data.precio}
                onChange={handleChange}
                invalid={!!errores.precio}
                feedbackInvalid={errores.precio}
                placeholder="0.00"
              />
            </CCol>

            <CCol md={6}>
              <CFormSwitch
                id="add-switch-combo"
                name="es_combo"
                label="Marcar como Combo o Promoción Especial"
                checked={data.es_combo}
                onChange={handleChange}
              />
            </CCol>

            <CCol md={6}>
              <CFormSwitch
                id="add-switch-estado"
                name="estado"
                label="Disponible para la venta (Activo)"
                checked={data.estado}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose}>
            Cancelar
          </CButton>
          <CButton color="primary" type="submit">
            Registrar Menú
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalAgregarMenu