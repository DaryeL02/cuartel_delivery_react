import React, { useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
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

const nuevaLinea = () => ({ tipo: 'insumo', articulo: '', cantidad: 1, precio_unitario: '' })
const listaDesde = (data) => (Array.isArray(data) ? data : data?.results || [])

const Compras = () => {
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [metodos, setMetodos] = useState([])
  const [insumos, setInsumos] = useState([])
  const [bebidas, setBebidas] = useState([])
  const [proveedor, setProveedor] = useState('')
  const [metodo, setMetodo] = useState('')
  const [lineas, setLineas] = useState([nuevaLinea()])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargarListas = async () => {
    try {
      const [comprasR, proveedoresR, metodosR, insumosR, bebidasR] = await Promise.all([
        api.get('/api/compras/'),
        api.get('/api/proveedores/'),
        api.get('/api/metodos/'),
        api.get('/api/insumos/'),
        api.get('/api/bebidas/'),
      ])
      setCompras(listaDesde(comprasR.data))
      setProveedores(listaDesde(proveedoresR.data))
      setMetodos(listaDesde(metodosR.data))
      setInsumos(listaDesde(insumosR.data))
      setBebidas(listaDesde(bebidasR.data))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudieron cargar los datos de compras.')
    }
  }
  useEffect(() => {
    cargarListas()
  }, [])

  const total = useMemo(
    () =>
      lineas.reduce(
        (suma, item) => suma + Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
        0,
      ),
    [lineas],
  )

  const actualizarLinea = (index, cambios) => {
    setLineas((actuales) =>
      actuales.map((linea, i) => (i === index ? { ...linea, ...cambios } : linea)),
    )
  }

  const elegirArticulo = (index, idArticulo) => {
    const linea = lineas[index]
    const item = (linea.tipo === 'insumo' ? insumos : bebidas).find(
      (registro) =>
        String(registro[linea.tipo === 'insumo' ? 'id_insumos' : 'id_bebidas']) ===
        String(idArticulo),
    )
    actualizarLinea(index, {
      articulo: idArticulo,
      precio_unitario:
        linea.tipo === 'bebida' ? String(item?.precio_unitario || '') : linea.precio_unitario,
    })
  }

  const registrarCompra = async (event) => {
    event.preventDefault()
    if (
      !proveedor ||
      !metodo ||
      !lineas.length ||
      lineas.some(
        (item) => !item.articulo || Number(item.cantidad) <= 0 || Number(item.precio_unitario) <= 0,
      )
    ) {
      toast.warning('Completa proveedor, método de pago y los datos de cada ítem.')
      return
    }
    setGuardando(true)
    try {
      const detalles = lineas.map((item) => ({
        [item.tipo]: Number(item.articulo),
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario).toFixed(2),
      }))
      await api.post('/api/compras/', {
        proveedor: Number(proveedor),
        metodo: Number(metodo),
        detalles,
      })
      toast.success('Compra registrada y stock actualizado.')
      setProveedor('')
      setMetodo('')
      setLineas([nuevaLinea()])
      await cargarListas()
    } catch (error) {
      const mensaje =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'No se pudo registrar la compra.'
      toast.error(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const buscarCompras = async () => {
    try {
      const { data } = await api.get('/api/compras/', {
        params: {
          proveedor: filtroProveedor || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
        },
      })
      setCompras(listaDesde(data))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo filtrar el historial.')
    }
  }

  const nombreDetalle = (item) =>
    item.insumo?.nombre || item.bebida?.nombre || `Bebida #${item.bebida}`

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Nueva Compra</strong>
        </CCardHeader>
        <CCardBody>
          <form onSubmit={registrarCompra}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <CFormSelect
                  label="Proveedor"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  required
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map((item) => (
                    <option key={item.id_proveedores} value={item.id_proveedores}>
                      {item.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="col-md-6">
                <CFormSelect
                  label="Método de pago"
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  required
                >
                  <option value="">Seleccionar método...</option>
                  {metodos.map((item) => (
                    <option key={item.id_metodos} value={item.id_metodos}>
                      {item.nombre}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            </div>
            {lineas.map((item, index) => {
              const articulos = item.tipo === 'insumo' ? insumos : bebidas
              const idCampo = item.tipo === 'insumo' ? 'id_insumos' : 'id_bebidas'
              return (
                <div className="row g-2 align-items-end mb-3" key={index}>
                  <div className="col-md-2">
                    <CFormSelect
                      label="Tipo"
                      value={item.tipo}
                      onChange={(e) =>
                        actualizarLinea(index, {
                          tipo: e.target.value,
                          articulo: '',
                          precio_unitario: '',
                        })
                      }
                    >
                      <option value="insumo">Insumo</option>
                      <option value="bebida">Bebida</option>
                    </CFormSelect>
                  </div>
                  <div className="col-md-4">
                    <CFormSelect
                      label="Artículo"
                      value={item.articulo}
                      onChange={(e) => elegirArticulo(index, e.target.value)}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {articulos.map((registro) => (
                        <option key={registro[idCampo]} value={registro[idCampo]}>
                          {registro.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                  <div className="col-md-2">
                    <CFormInput
                      label="Cantidad"
                      type="number"
                      min="1"
                      step="1"
                      value={item.cantidad}
                      onChange={(e) => actualizarLinea(index, { cantidad: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <CFormInput
                      label="Precio unitario"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.precio_unitario}
                      onChange={(e) => actualizarLinea(index, { precio_unitario: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-2 d-flex gap-2">
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={() =>
                        setLineas((actuales) => actuales.filter((_, i) => i !== index))
                      }
                      disabled={lineas.length === 1}
                    >
                      Quitar
                    </CButton>
                  </div>
                </div>
              )
            })}
            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <CButton
                type="button"
                color="info"
                variant="outline"
                onClick={() => setLineas((actuales) => [...actuales, nuevaLinea()])}
              >
                Agregar ítem
              </CButton>
              <div className="fs-5 fw-bold">Total: ${total.toFixed(2)}</div>
              <CButton type="submit" color="primary" disabled={guardando}>
                {guardando ? 'Registrando...' : 'Registrar compra'}
              </CButton>
            </div>
          </form>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <strong>Historial de Compras</strong>
        </CCardHeader>
        <CCardBody>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-3">
              <CFormInput
                label="Desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <CFormInput
                label="Hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <CFormSelect
                label="Proveedor"
                value={filtroProveedor}
                onChange={(e) => setFiltroProveedor(e.target.value)}
              >
                <option value="">Todos</option>
                {proveedores.map((item) => (
                  <option key={item.id_proveedores} value={item.id_proveedores}>
                    {item.nombre}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="col-md-2">
              <CButton color="secondary" onClick={buscarCompras}>
                Filtrar
              </CButton>
            </div>
          </div>
          <CTable responsive hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Compra</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Proveedor</CTableHeaderCell>
                <CTableHeaderCell>Método</CTableHeaderCell>
                <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                <CTableHeaderCell>Detalle</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {compras.map((item) => (
                <CTableRow key={item.id_compras}>
                  <CTableDataCell>#{item.id_compras}</CTableDataCell>
                  <CTableDataCell>
                    {item.fecha_hora_creacion
                      ? new Date(item.fecha_hora_creacion).toLocaleString()
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell>{item.proveedor_detalle?.nombre || '-'}</CTableDataCell>
                  <CTableDataCell>{item.metodo_detalle || '-'}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    ${Number(item.precio_total || 0).toFixed(2)}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      variant="outline"
                      onClick={() => setDetalle(item)}
                    >
                      Ver detalle
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          {!compras.length && (
            <p className="text-center text-body-secondary mb-0">No hay compras registradas.</p>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={!!detalle} onClose={() => setDetalle(null)}>
        <CModalHeader>
          <CModalTitle>Detalle de compra #{detalle?.id_compras}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Proveedor: <strong>{detalle?.proveedor_detalle?.nombre || '-'}</strong>
          </p>
          <CTable responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Artículo</CTableHeaderCell>
                <CTableHeaderCell>Cantidad</CTableHeaderCell>
                <CTableHeaderCell>Subtotal</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(detalle?.detalle_compra || []).map((item) => (
                <CTableRow key={item.id_detalles_compras}>
                  <CTableDataCell>{nombreDetalle(item)}</CTableDataCell>
                  <CTableDataCell>{item.cantidad}</CTableDataCell>
                  <CTableDataCell>${Number(item.subtotal).toFixed(2)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div className="text-end fw-bold">
            Total: ${Number(detalle?.precio_total || 0).toFixed(2)}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDetalle(null)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Compras
