import React, { useEffect, useMemo, useState } from 'react'
import {
  CButton,
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
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
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { toast } from 'react-toastify'
import api from '../api/api'
import { cargarResultadosPaginados } from '../api/paginacion'

const nuevaLinea = () => ({
  tipo: 'insumo',
  articulo: '',
  cantidad: 1,
  precio_unitario: '',
  unidad: '',
})
const listaDesde = (data) => (Array.isArray(data) ? data : data?.results || [])
const fechaLocalActual = () => {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`
}

const Compras = () => {
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [metodos, setMetodos] = useState([])
  const [insumos, setInsumos] = useState([])
  const [bebidas, setBebidas] = useState([])
  const [proveedor, setProveedor] = useState('')
  const [metodo, setMetodo] = useState('')
  const [lineas, setLineas] = useState([nuevaLinea()])
  const [cajas, setCajas] = useState([])
  const [historialVisible, setHistorialVisible] = useState(false)
  const [historialCompras, setHistorialCompras] = useState([])
  const [historialCargando, setHistorialCargando] = useState(false)
  const [fechaDesdeHistorial, setFechaDesdeHistorial] = useState('')
  const [fechaHastaHistorial, setFechaHastaHistorial] = useState('')
  const [proveedorHistorial, setProveedorHistorial] = useState('')
  const [cajaHistorial, setCajaHistorial] = useState('')
  const [paginaHistorial, setPaginaHistorial] = useState(1)
  const [totalPaginasHistorial, setTotalPaginasHistorial] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargarListas = async () => {
    try {
      const hoy = fechaLocalActual()
      const [comprasDia, proveedoresR, metodosR, insumosR, bebidasR, cajasR] = await Promise.all([
        cargarResultadosPaginados('/api/compras/', {
          params: { fecha_desde: hoy, fecha_hasta: hoy },
        }),
        api.get('/api/proveedores/'),
        api.get('/api/metodos/'),
        api.get('/api/insumos/'),
        api.get('/api/bebidas/'),
        api.get('/api/cajas/'),
      ])
      setCompras(comprasDia)
      setProveedores(listaDesde(proveedoresR.data))
      setMetodos(listaDesde(metodosR.data))
      setInsumos(listaDesde(insumosR.data))
      setBebidas(listaDesde(bebidasR.data))
      setCajas(listaDesde(cajasR.data))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudieron cargar los datos de compras.')
    }
  }
  useEffect(() => {
    cargarListas()
  }, [])

  const cargarHistorial = async (pagina = 1) => {
    setHistorialCargando(true)
    try {
      const { data } = await api.get('/api/compras/', {
        params: {
          page: pagina,
          fecha_desde: fechaDesdeHistorial || undefined,
          fecha_hasta: fechaHastaHistorial || undefined,
          proveedor: proveedorHistorial || undefined,
          id_cajas: cajaHistorial || undefined,
        },
      })
      setHistorialCompras(listaDesde(data))
      setPaginaHistorial(pagina)
      setTotalPaginasHistorial(
        Array.isArray(data) ? 1 : Math.max(1, Math.ceil((data.count || 0) / 20)),
      )
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No se pudo cargar el historial de compras.')
    } finally {
      setHistorialCargando(false)
    }
  }

  const abrirHistorial = () => {
    setHistorialVisible(true)
    cargarHistorial(1)
  }

  const filtrarHistorial = () => {
    const hoy = fechaLocalActual()
    if (
      (fechaDesdeHistorial && fechaDesdeHistorial > hoy) ||
      (fechaHastaHistorial && fechaHastaHistorial > hoy)
    ) {
      toast.warning('No puedes seleccionar fechas futuras.')
      return
    }
    if (fechaDesdeHistorial && fechaHastaHistorial && fechaDesdeHistorial > fechaHastaHistorial) {
      toast.warning('La fecha "Desde" no puede ser mayor que la fecha "Hasta".')
      return
    }
    cargarHistorial(1)
  }

  const total = useMemo(
    () =>
      lineas.reduce(
        (suma, item) => suma + Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
        0,
      ),
    [lineas],
  )
  const cajaAbierta = useMemo(
    () =>
      cajas
        .filter((caja) => caja.estado && !caja.fecha_hora_cierre)
        .sort((a, b) => a.id_cajas - b.id_cajas)[0],
    [cajas],
  )

  const actualizarLinea = (index, cambios) => {
    setLineas((actuales) =>
      actuales.map((linea, i) => (i === index ? { ...linea, ...cambios } : linea)),
    )
  }

  const elegirArticulo = (index, seleccion) => {
    if (!seleccion) {
      actualizarLinea(index, { articulo: '', precio_unitario: '', unidad: '' })
      return
    }

    const [tipo, idArticulo] = seleccion.split(':')
    const linea = lineas[index]
    const item = (tipo === 'insumo' ? insumos : bebidas).find(
      (registro) =>
        String(registro[tipo === 'insumo' ? 'id_insumos' : 'id_bebidas']) === idArticulo,
    )
    actualizarLinea(index, {
      tipo,
      articulo: idArticulo,
      unidad: item?.unidad || '',
      precio_unitario:
        tipo === 'bebida' ? String(item?.precio_unitario || '') : linea.precio_unitario,
    })
  }

  const registrarCompra = async (event) => {
    event.preventDefault()
    if (!cajaAbierta) {
      toast.warning('Debes tener una caja abierta para registrar una compra.')
      return
    }
    if (total > Number(cajaAbierta.saldo_actual || 0)) {
      toast.warning('El total de la compra supera el saldo disponible en caja.')
      return
    }
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
            {!cajaAbierta ? (
              <CAlert color="warning">Abre una caja antes de registrar una compra.</CAlert>
            ) : total > Number(cajaAbierta.saldo_actual || 0) ? (
              <CAlert color="danger">
                Saldo insuficiente en caja. Disponible: $
                {Number(cajaAbierta.saldo_actual || 0).toFixed(2)}.
              </CAlert>
            ) : null}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <CFormSelect
                  label={<span>Proveedor <span className="text-danger">*</span></span>}
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
                  label={<span>Método de pago <span className="text-danger">*</span></span>}
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
            <div className="mb-3">
              <CButton
                type="button"
                color="info"
                variant="outline"
                onClick={() => setLineas((actuales) => [...actuales, nuevaLinea()])}
              >
                Agregar insumo o bebida
              </CButton>
            </div>
            {lineas.map((item, index) => {
              return (
                <div className="row g-2 align-items-end mb-3" key={index}>
                  <div className="col-md-6">
                    <CFormSelect
                      label={<span>Insumo o bebida <span className="text-danger">*</span></span>}
                      value={item.articulo ? `${item.tipo}:${item.articulo}` : ''}
                      onChange={(e) => elegirArticulo(index, e.target.value)}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <optgroup label="Insumos">
                        {insumos.map((registro) => (
                          <option key={registro.id_insumos} value={`insumo:${registro.id_insumos}`}>
                            {registro.nombre}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Bebidas">
                        {bebidas.map((registro) => (
                          <option key={registro.id_bebidas} value={`bebida:${registro.id_bebidas}`}>
                            {registro.nombre}
                          </option>
                        ))}
                      </optgroup>
                    </CFormSelect>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">
                      Cantidad <span className="text-danger">*</span>
                    </label>
                    <CInputGroup>
                      <CFormInput
                        type="number"
                        min="1"
                        step="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarLinea(index, { cantidad: e.target.value })}
                        required
                      />
                      <CInputGroupText>{item.unidad || '-'}</CInputGroupText>
                    </CInputGroup>
                  </div>
                  <div className="col-md-2">
                    <CFormInput
                      label={<span>Precio unitario <span className="text-danger">*</span></span>}
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
            <small className="text-body-secondary">
              <span className="text-danger">*</span> Campos obligatorios
            </small>
            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <div className="fs-5 fw-bold">Total: ${total.toFixed(2)}</div>
              <CButton
                type="submit"
                color="primary"
                disabled={
                  guardando || !cajaAbierta || total > Number(cajaAbierta.saldo_actual || 0)
                }
              >
                {guardando ? 'Registrando...' : 'Registrar compra'}
              </CButton>
            </div>
          </form>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center gap-2">
          <strong>Compras de hoy</strong>
          <CButton color="primary" onClick={abrirHistorial}>
            Historial Completo
          </CButton>
        </CCardHeader>
        <CCardBody>
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
            <p className="text-center text-body-secondary mb-0">
              No hay compras registradas hoy.
            </p>
          )}
        </CCardBody>
      </CCard>

      <CModal
        visible={historialVisible}
        onClose={() => setHistorialVisible(false)}
        size="xl"
      >
        <CModalHeader>
          <CModalTitle>Historial Completo de Compras</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-3">
              <CFormInput
                label="Desde"
                type="date"
                max={fechaHastaHistorial || fechaLocalActual()}
                value={fechaDesdeHistorial}
                onChange={(e) => setFechaDesdeHistorial(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <CFormInput
                label="Hasta"
                type="date"
                min={fechaDesdeHistorial || undefined}
                max={fechaLocalActual()}
                value={fechaHastaHistorial}
                onChange={(e) => setFechaHastaHistorial(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <CFormSelect
                label="Caja"
                value={cajaHistorial}
                onChange={(e) => setCajaHistorial(e.target.value)}
              >
                <option value="">Todas</option>
                {cajas.map((item) => (
                  <option key={item.id_cajas} value={item.id_cajas}>
                    Caja #{item.id_cajas}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="col-md-2">
              <CFormSelect
                label="Proveedor"
                value={proveedorHistorial}
                onChange={(e) => setProveedorHistorial(e.target.value)}
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
              <CButton color="secondary" className="w-100" onClick={filtrarHistorial}>
                Filtrar
              </CButton>
            </div>
          </div>
          {historialCargando ? (
            <p className="text-center text-body-secondary">Cargando compras...</p>
          ) : (
            <>
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
                  {historialCompras.map((item) => (
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
              {!historialCompras.length && (
                <p className="text-center text-body-secondary mb-0">
                  No hay compras para mostrar.
                </p>
              )}
              {totalPaginasHistorial > 1 && (
                <CPagination aria-label="Paginación del historial de compras">
                  <CPaginationItem
                    disabled={paginaHistorial <= 1}
                    onClick={(event) => {
                      event.preventDefault()
                      cargarHistorial(paginaHistorial - 1)
                    }}
                  >
                    Anterior
                  </CPaginationItem>
                  <CPaginationItem active>
                    {paginaHistorial} / {totalPaginasHistorial}
                  </CPaginationItem>
                  <CPaginationItem
                    disabled={paginaHistorial >= totalPaginasHistorial}
                    onClick={(event) => {
                      event.preventDefault()
                      cargarHistorial(paginaHistorial + 1)
                    }}
                  >
                    Siguiente
                  </CPaginationItem>
                </CPagination>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setHistorialVisible(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

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
