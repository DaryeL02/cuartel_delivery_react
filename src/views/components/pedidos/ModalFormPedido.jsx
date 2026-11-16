import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFastfood, cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import api from '../api/api'
import { toast } from 'react-toastify'

const ModalFormPedido = ({ visible, onClose, pedido, productos, cajas, onSuccess }) => {
  const modoEditar = !!pedido

  const [data, setData] = useState({
    empleado: '',
    cliente: '',
    direccion: '',
    estado: 'En proceso',
    detalles: [],
  })

  const [productoSeleccionado, setProductoSeleccionado] = useState({
    producto: '',
    cantidad: '',
  })

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

  useEffect(() => {
    if (!visible) return

    if (modoEditar && pedido) {
      setData({
        empleado: pedido.empleado || '',
        cliente: pedido.cliente || '',
        direccion: pedido.direccion || '',
        estado: pedido.estado || 'En proceso',
        detalles: (pedido.pedido_detalle || []).map((det) => ({
          id_temporal: det.id_detalles_pedidos || Date.now() + Math.random(),
          producto: det.producto,
          cantidad: Number(det.cantidad),
          subtotal: Number(det.subtotal),
        })),
      })
    } else {
      const cajaConEmpleado = cajas.find((c) => c.empleado_detalle?.id_empleados)
      setData({
        empleado: cajaConEmpleado ? cajaConEmpleado.empleado_detalle.id_empleados : '',
        cliente: '',
        direccion: '',
        estado: 'En proceso',
        detalles: [],
      })
    }

    setProductoSeleccionado({ producto: '', cantidad: '' })
  }, [pedido, visible, modoEditar, cajas])

  const formatearMoneda = (valor) => {
    return Number(valor || 0).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProductoChange = (e) => {
    const { name, value } = e.target
    if (name === 'cantidad') {
      const soloNumeros = value.replace(/\D/g, '')
      setProductoSeleccionado((prev) => ({ ...prev, cantidad: soloNumeros }))
      return
    }
    setProductoSeleccionado((prev) => ({ ...prev, [name]: value }))
  }

  const handleAgregarProducto = () => {
    if (
      !productoSeleccionado.producto ||
      !productoSeleccionado.cantidad ||
      Number(productoSeleccionado.cantidad) <= 0
    ) {
      notificar('advertencia', 'Selecciona un producto y una cantidad mayor a 0.')
      return
    }

    const productoCompleto = productos.find(
      (p) => String(p.id_productos) === String(productoSeleccionado.producto)
    )
    if (!productoCompleto) return

    const cantidadNum = Number(productoSeleccionado.cantidad)
    const precioUnitario = Number(productoCompleto.precio_unitario)
    const subtotal = cantidadNum * precioUnitario

    const nuevoDetalle = {
      id_temporal: Date.now() + Math.random(),
      producto: {
        id_productos: productoCompleto.id_productos,
        nombre: productoCompleto.nombre,
        precio_unitario: precioUnitario,
      },
      cantidad: cantidadNum,
      subtotal: subtotal,
    }

    setData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle],
    }))
    setProductoSeleccionado({ producto: '', cantidad: '' })
  }

  const handleEliminarProducto = (idTemporal) => {
    setData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((item) => item.id_temporal !== idTemporal),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!modoEditar && !data.empleado) {
      notificar('advertencia', 'Selecciona un empleado/caja responsable.')
      return
    }
    if (!data.cliente.trim()) {
      notificar('advertencia', 'Ingresa el nombre del cliente.')
      return
    }
    if (data.detalles.length === 0) {
      notificar(
        'advertencia',
        modoEditar
          ? 'El pedido debe tener al menos un producto.'
          : 'Agrega al menos un producto al pedido.'
      )
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Token ${token}` }

    const detallesPayload = data.detalles.map((item) => ({
      id_productos: Number(item.producto.id_productos),
      cantidad: Number(item.cantidad),
    }))

    try {
      if (modoEditar) {
        const payloadActualizacion = {
          cliente: data.cliente,
          direccion: data.direccion,
          estado: data.estado,
          detalles: detallesPayload,
        }
        await api.patch(`/api/pedidos/${pedido.id_pedidos}/`, payloadActualizacion, { headers })
        notificar('exito', 'Pedido actualizado con éxito.')
      } else {
        const payloadNuevo = {
          empleado: Number(data.empleado),
          cliente: data.cliente,
          direccion: data.direccion,
          estado: 'En proceso',
          detalles: detallesPayload,
        }
        await api.post('/api/pedidos/', payloadNuevo, { headers })
        notificar('exito', 'Pedido creado correctamente.')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(
        modoEditar ? 'Error al actualizar pedido:' : 'Error al crear pedido:',
        error.response?.data || error
      )
      notificar(
        'error',
        modoEditar
          ? 'Error al modificar el pedido. Por favor, intenta nuevamente.'
          : 'Error al guardar el pedido. Por favor, intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  const totalPedido = data.detalles.reduce((acc, item) => acc + Number(item.subtotal), 0)

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader className={modoEditar ? 'bg-body-secondary' : ''}>
        <CModalTitle className="fw-bold">
          {modoEditar ? (
            <>
              <CIcon icon={cilPencil} className="me-2 text-info" />
              Modificar Pedido #{pedido?.id_pedidos}
            </>
          ) : (
            <>
              <CIcon icon={cilFastfood} className="me-2" />
              Crear Nuevo Pedido (Comanda)
            </>
          )}
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {/* DATOS DE CABECERA DEL PEDIDO */}
          <div className={modoEditar ? 'p-3 bg-body-secondary rounded mb-3 border' : 'mb-3'}>
            <CRow className="g-3">
              {!modoEditar && (
                <CCol md={4}>
                  <CFormSelect
                    label="Empleado / Caja Activa"
                    name="empleado"
                    value={data.empleado}
                    onChange={handleChange}
                  >
                    <option value="">-- Seleccione empleado --</option>
                    {cajas
                      .filter((c) => c.empleado_detalle)
                      .map((caja) => (
                        <option key={caja.id_cajas} value={caja.empleado_detalle.id_empleados}>
                          {caja.empleado_detalle.nombre} {caja.empleado_detalle.apellido} (Caja #
                          {caja.id_cajas})
                        </option>
                      ))}
                  </CFormSelect>
                </CCol>
              )}

              <CCol md={4}>
                <CFormInput
                  label={modoEditar ? 'Cliente' : 'Nombre del Cliente'}
                  name="cliente"
                  placeholder="Ej: Juan Pérez"
                  value={data.cliente}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={4}>
                <CFormInput
                  label={modoEditar ? 'Ubicación / Dirección' : 'Dirección / Mesa'}
                  name="direccion"
                  placeholder="Ej: Mesa 2 o Av. San Martín 1234"
                  value={data.direccion}
                  onChange={handleChange}
                />
              </CCol>

              {modoEditar && (
                <CCol md={4}>
                  <CFormSelect
                    label="Estado del Pedido"
                    name="estado"
                    value={data.estado}
                    onChange={handleChange}
                  >
                    <option value="En proceso">En proceso</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </CFormSelect>
                </CCol>
              )}
            </CRow>
          </div>

          {!modoEditar && <hr className="my-3" />}
          <h6 className="fw-bold text-body-secondary mb-3">Agregar Productos al Pedido</h6>

          {/* SELECTOR DE PRODUCTOS */}
          <CRow className="g-2 align-items-end mb-3">
            <CCol md={7}>
              <CFormSelect
                label="Seleccionar Producto"
                name="producto"
                value={productoSeleccionado.producto}
                onChange={handleProductoChange}
              >
                <option value="">-- Seleccione un producto --</option>
                {productos.map((item) => (
                  <option key={item.id_productos} value={item.id_productos}>
                    {item.nombre} (${formatearMoneda(item.precio_unitario)})
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="text"
                label="Cantidad"
                placeholder="Cantidad"
                name="cantidad"
                value={productoSeleccionado.cantidad}
                onChange={handleProductoChange}
              />
            </CCol>
            <CCol md={2}>
              <CButton
                type="button"
                color="primary"
                className="w-100"
                onClick={handleAgregarProducto}
              >
                <CIcon icon={cilPlus} />
              </CButton>
            </CCol>
          </CRow>

          {/* TABLA DE ÍTEMS DEL PEDIDO */}
          {modoEditar && <h6 className="fw-bold mb-2">Ítems del Pedido</h6>}
          <CTable small={!modoEditar} responsive align="middle" hover bordered className="mt-2">
            <CTableHead className="table-theme-header">
              <CTableRow>
                <CTableHeaderCell>Producto</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Cantidad</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.detalles.map((item) => (
                <CTableRow key={item.id_temporal}>
                  <CTableDataCell>{item.producto?.nombre}</CTableDataCell>
                  <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    ${formatearMoneda(item.producto?.precio_unitario)}
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">
                    ${formatearMoneda(item.subtotal)}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      type="button"
                      color="danger"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminarProducto(item.id_temporal)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* TOTAL DEL PEDIDO */}
          <div className="d-flex justify-content-end align-items-center mt-3 p-2 bg-body-secondary rounded">
            <span className="me-3 text-body-secondary fw-bold">
              {modoEditar ? 'Total Actualizado del Pedido:' : 'Total del Pedido:'}
            </span>
            <h4 className={`${modoEditar ? 'text-primary' : 'text-success'} mb-0 fw-bold`}>
              ${formatearMoneda(totalPedido)}
            </h4>
          </div>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </CButton>
          <CButton
            type="submit"
            color={modoEditar ? 'success' : 'primary'}
            className={modoEditar ? 'text-white' : ''}
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : modoEditar
              ? 'Guardar Cambios'
              : 'Guardar y Generar Pedido'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalFormPedido
