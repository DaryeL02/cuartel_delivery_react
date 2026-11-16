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
import { toast } from 'react-toastify'

const ModalFormInsumo = ({ visible, onClose, insumo, categorias, proveedores, onSuccess }) => {

  const [data, setData] = useState({
    categoria: '',
    proveedor: '',
    nombre: '',
    descripcion: '',
    unidad: '',
    stock_actual: 0,
    stock_minimo: 0,
  })

  const [loading, setLoading] = useState(false)
  const modoEditar = !!insumo

  const unidades = ['kg', 'gr', 'l', 'ml']

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
    if (modoEditar && insumo) {
      const ProveedorId =
        insumo.proveedores_asociados && insumo.proveedores_asociados.length > 0
          ? insumo.proveedores_asociados[0].proveedor?.id_proveedores
          : ''

      setData({
        categoria: insumo.categoria_detalle?.id_categorias || '',
        proveedor: ProveedorId,
        nombre: insumo.nombre || '',
        descripcion: insumo.descripcion || '',
        unidad: insumo.unidad || '',
        stock_actual: insumo.stock_actual || 0,
        stock_minimo: insumo.stock_minimo || 0,
      })
    } else {
      setData({
        categoria: '',
        proveedor: '',
        nombre: '',
        descripcion: '',
        unidad: '',
        stock_actual: 0,
        stock_minimo: 0,
      })
    }
  }, [insumo, visible, modoEditar])

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!data.nombre.trim()) {
      notificar('advertencia', 'Por favor, ingresa el nombre del insumo.')
      return
    }
    if (!data.categoria) {
      notificar('advertencia', 'Por favor, selecciona una categoría.')
      return
    }
    if (!data.proveedor) {
      notificar('advertencia', 'Por favor, selecciona un proveedor.')
      return
    }
    if (!data.unidad) {
      notificar('advertencia', 'Por favor, selecciona una unidad de medida.')
      return
    }
    if (Number(data.stock_actual) < 0 || Number(data.stock_minimo) < 0) {
      notificar('advertencia', 'Los valores de stock no pueden ser negativos.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Token ${token}` }

      if (modoEditar) {
        const idInsumo = insumo.id_insumos
        await api.put(`/api/insumos/${idInsumo}/`, data, { headers })
        notificar('exito', 'Insumo actualizado con éxito.')
      } else {
        await api.post('/api/insumos/', data, { headers })
        notificar('exito', 'Insumo registrado con éxito.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al guardar el insumo:', error)
      notificar(
        'error',
        modoEditar
          ? 'No se pudo actualizar el insumo. Intenta nuevamente.'
          : 'No se pudo registrar el insumo. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-semibold">
          {modoEditar ? 'Modificar Insumo' : 'Agregar Nuevo Insumo'}
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
                minLength={5}
                value={data.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. Harina 000"
              />
            </CCol>

            {/* Categoría */}
            <CCol md={4}>
              <CFormSelect
                label="Categoría"
                name="categoria"
                value={data.categoria}
                onChange={handleChange}
                required
              >
                <option value="">
                  {modoEditar ? insumo.categoria_detalle?.nombre : 'Selecciona...'}
                </option>
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
                minLength={0}
                value={data.descripcion}
                onChange={handleChange}
                placeholder="Detalles específicos del insumo..."
              />
            </CCol>

            <CCol md={4}>
              <CFormSelect
                label="Proveedor"
                name="proveedor"
                value={data.proveedor}
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

            <CCol md={4}>
              <CFormSelect
                label="Unidad de Medida"
                name="unidad"
                value={data.unidad}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona...</option>
                {unidades.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            {/* Stock Actual */}
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Stock Actual"
                name="stock_actual"
                min={0}
                value={data.stock_actual}
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
                value={data.stock_minimo}
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
          <CButton color={modoEditar ? 'info' : 'primary'} type="submit" disabled={loading}>
            {loading ? 'Guardando...' : modoEditar ? 'Guardar Cambios' : 'Registrar Insumo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormInsumo
