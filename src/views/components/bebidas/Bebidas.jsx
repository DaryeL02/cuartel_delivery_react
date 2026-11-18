import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const emptyBebida = {
  nombre: '',
  descripcion: '',
  estado: true,
  stock_actual: 0,
  stock_minimo: 0,
  precio_unitario: '',
  unidad: 'Unidades',
}

const Bebidas = () => {
  const [bebidas, setBebidas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [bebida, setBebida] = useState(emptyBebida)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const cargar = async () => {
    try {
      const { data } = await api.get('/api/bebidas/')
      setBebidas(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudieron cargar las bebidas.')
    }
  }
  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...bebida,
        nombre: bebida.nombre.trim(),
        precio_unitario: Number(bebida.precio_unitario).toFixed(2),
        stock_actual: Number(bebida.stock_actual),
        stock_minimo: Number(bebida.stock_minimo),
      }
      if (bebida.id_bebidas) {
        await api.put(`/api/bebidas/${bebida.id_bebidas}/`, payload)
        toast.success('Bebida actualizada.')
      } else {
        await api.post('/api/bebidas/', payload)
        toast.success('Bebida creada.')
      }
      setVisible(false)
      setBebida(emptyBebida)
      await cargar()
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.nombre?.[0] ||
          'No se pudo guardar la bebida.',
      )
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar ${item.nombre}?`)) return
    try {
      await api.delete(`/api/bebidas/${item.id_bebidas}/`)
      toast.success('Bebida eliminada.')
      await cargar()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar la bebida.')
    }
  }

  const lista = bebidas.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  )
  const campo = (name, value) => setBebida((prev) => ({ ...prev, [name]: value }))

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center gap-2">
          <strong>Gestión de Bebidas</strong>
          <div className="d-flex gap-2">
            <CFormInput
              placeholder="Buscar bebida..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <CButton
              color="primary"
              onClick={() => {
                setBebida(emptyBebida)
                setVisible(true)
              }}
            >
              Nueva bebida
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Stock</CTableHeaderCell>
                <CTableHeaderCell>Mínimo</CTableHeaderCell>
                <CTableHeaderCell>Unidad</CTableHeaderCell>
                <CTableHeaderCell>Precio</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {lista.map((item) => (
                <CTableRow key={item.id_bebidas}>
                  <CTableDataCell>{item.nombre}</CTableDataCell>
                  <CTableDataCell>{item.stock_actual}</CTableDataCell>
                  <CTableDataCell>{item.stock_minimo}</CTableDataCell>
                  <CTableDataCell>{item.unidad}</CTableDataCell>
                  <CTableDataCell>${Number(item.precio_unitario).toFixed(2)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={item.estado ? 'success' : 'secondary'}>
                      {item.estado ? 'Activa' : 'Inactiva'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-nowrap">
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      className="me-2"
                      onClick={() => {
                        setBebida(item)
                        setVisible(true)
                      }}
                    >
                      Editar
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="outline"
                      onClick={() => eliminar(item)}
                    >
                      Eliminar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {!lista.length && (
            <p className="text-center text-body-secondary mb-0">No hay bebidas registradas.</p>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{bebida.id_bebidas ? 'Editar bebida' : 'Nueva bebida'}</CModalTitle>
        </CModalHeader>
        <form onSubmit={guardar}>
          <CModalBody className="d-grid gap-3">
            <CFormInput
              label="Nombre"
              required
              maxLength={200}
              value={bebida.nombre}
              onChange={(e) => campo('nombre', e.target.value)}
            />
            <CFormTextarea
              label="Descripción"
              maxLength={200}
              value={bebida.descripcion || ''}
              onChange={(e) => campo('descripcion', e.target.value)}
            />
            <div className="row g-3">
              <div className="col">
                <CFormInput
                  label="Stock actual"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={bebida.stock_actual}
                  onChange={(e) => campo('stock_actual', e.target.value)}
                />
              </div>
              <div className="col">
                <CFormInput
                  label="Stock mínimo"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={bebida.stock_minimo}
                  onChange={(e) => campo('stock_minimo', e.target.value)}
                />
              </div>
            </div>
            <div className="row g-3">
              <div className="col">
                <CFormInput
                  label="Precio unitario"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={bebida.precio_unitario}
                  onChange={(e) => campo('precio_unitario', e.target.value)}
                />
              </div>
              <div className="col">
                <CFormSelect
                  label="Unidad"
                  value={bebida.unidad}
                  onChange={(e) => campo('unidad', e.target.value)}
                >
                  <option>Unidades</option>
                  <option>ml</option>
                  <option>l</option>
                </CFormSelect>
              </div>
            </div>
            <CFormSwitch
              label={bebida.estado ? 'Activa' : 'Inactiva'}
              checked={!!bebida.estado}
              onChange={(e) => campo('estado', e.target.checked)}
            />
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="ghost"
              type="button"
              onClick={() => setVisible(false)}
            >
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </CButton>
          </CModalFooter>
        </form>
      </CModal>
    </>
  )
}

export default Bebidas
