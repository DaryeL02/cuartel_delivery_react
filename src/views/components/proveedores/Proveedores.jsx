import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
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
  CFormTextarea,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'

const emptyProveedor = {
  nombre: '',
  direccion: '',
  telefono: '',
  email: '',
  cuit: '',
  descripcion: '',
}

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [proveedor, setProveedor] = useState(emptyProveedor)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const cargar = async () => {
    try {
      const { data } = await api.get('/api/proveedores/')
      setProveedores(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudieron cargar los proveedores.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const guardar = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const payload = { ...proveedor, nombre: proveedor.nombre.trim() }
      if (proveedor.id_proveedores) {
        await api.put(`/api/proveedores/${proveedor.id_proveedores}/`, payload)
        toast.success('Proveedor actualizado.')
      } else {
        await api.post('/api/proveedores/', payload)
        toast.success('Proveedor creado.')
      }
      setVisible(false)
      setProveedor(emptyProveedor)
      await cargar()
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.nombre?.[0] ||
          'No se pudo guardar el proveedor.',
      )
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar al proveedor ${item.nombre}?`)) return
    try {
      await api.delete(`/api/proveedores/${item.id_proveedores}/`)
      toast.success('Proveedor eliminado.')
      await cargar()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo eliminar el proveedor.')
    }
  }

  const listado = proveedores.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  )

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Proveedores</strong>
          <div className="d-flex gap-2">
            <CFormInput
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <CButton
              color="primary"
              onClick={() => {
                setProveedor(emptyProveedor)
                setVisible(true)
              }}
            >
              Nuevo proveedor
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>CUIT</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Correo</CTableHeaderCell>
                <CTableHeaderCell>Dirección</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {listado.map((item) => (
                <CTableRow key={item.id_proveedores}>
                  <CTableDataCell>{item.nombre}</CTableDataCell>
                  <CTableDataCell>{item.cuit || '-'}</CTableDataCell>
                  <CTableDataCell>{item.telefono || '-'}</CTableDataCell>
                  <CTableDataCell>{item.email || '-'}</CTableDataCell>
                  <CTableDataCell>{item.direccion || '-'}</CTableDataCell>
                  <CTableDataCell className="text-nowrap">
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      className="me-2"
                      onClick={() => {
                        setProveedor(item)
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
          {!listado.length && (
            <p className="text-center text-body-secondary mb-0">No hay proveedores para mostrar.</p>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>
            {proveedor.id_proveedores ? 'Editar proveedor' : 'Nuevo proveedor'}
          </CModalTitle>
        </CModalHeader>
        <form onSubmit={guardar}>
          <CModalBody className="d-grid gap-3">
            <CFormInput
              label="Nombre"
              required
              maxLength={100}
              value={proveedor.nombre}
              onChange={(e) => setProveedor({ ...proveedor, nombre: e.target.value })}
            />
            <CFormInput
              label="Dirección"
              maxLength={200}
              value={proveedor.direccion || ''}
              onChange={(e) => setProveedor({ ...proveedor, direccion: e.target.value })}
            />
            <CFormInput
              label="Teléfono"
              maxLength={20}
              value={proveedor.telefono || ''}
              onChange={(e) => setProveedor({ ...proveedor, telefono: e.target.value })}
            />
            <CFormInput
              label="Correo"
              type="email"
              maxLength={30}
              value={proveedor.email || ''}
              onChange={(e) => setProveedor({ ...proveedor, email: e.target.value })}
            />
            <CFormInput
              label="CUIT"
              maxLength={30}
              value={proveedor.cuit || ''}
              onChange={(e) => setProveedor({ ...proveedor, cuit: e.target.value })}
            />
            <CFormTextarea
              label="Descripción"
              maxLength={200}
              value={proveedor.descripcion || ''}
              onChange={(e) => setProveedor({ ...proveedor, descripcion: e.target.value })}
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

export default Proveedores
