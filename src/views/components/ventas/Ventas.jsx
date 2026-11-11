import React, { useState, useEffect  } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CForm,
  CFormSelect,
  CFormInput,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCart,
  cilDollar,
  cilPlus,
  cilTrash,
  cilFindInPage,
  cilPrint,
  cilWallet,
} from '@coreui/icons'
import api from '../api/api'

const Ventas = () => {

  const [cajas, setCajas] = useState([]);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [nuevoPedido, setNuevoPedido] = useState({
    cliente: '',
    direccion: '',
    detalles: [],
  });
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState({
    producto: '',
    cantidad: ''
  });
  const [productos, setProductos] = useState([]);
  const [metodos, setMetodos] = useState([]);



  const cargarCajas = async () => {
        try {
          const token = localStorage.getItem('token')
          const respuesta = await api.get('/api/cajas/?status=active', {
            headers: {
              'Authorization': `Token ${token}`
            }
        })  
          setCajas(respuesta.data)
          
        } catch (error) {
          console.error('Error al cargar cajas:', error)
        }
      }

  const cargarPedidos = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await api.get('/api/pedidos/?date=today', {
          headers: {
            'Authorization': `Token ${token}`
          }
      })  
        setPedidos(respuesta.data)
        
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
      }
    }

  const cargarProductos = async () => {
        try {
          const token = localStorage.getItem('token')
          const respuesta = await api.get('/api/productos-listado/', {
            headers: {
              'Authorization': `Token ${token}`
            }
        })  
          setProductos(respuesta.data)
          
        } catch (error) {
          console.error('Error al cargar productos:', error)
        }
      }
  const cargarMetodos = async () => {
        try {
          const token = localStorage.getItem('token')
          const respuesta = await api.get('/api/metodos/', {
            headers: {
              'Authorization': `Token ${token}`
            }
        })  
          setMetodos(respuesta.data)
          
        } catch (error) {
          console.error('Error al cargar metodos:', error)
        }
      }
  const handleCargarPedido = () => {
    if (!idSeleccionado) return; // Evita ejecutar si no hay nada seleccionado

    // Convertimos ambos a String o Number para asegurar que coincidan
    if (idSeleccionado == 0){
      console.log("Nuevo pedido")
      setPedidoSeleccionado(null)
    }
    
    const pedidoEncontrado = pedidos.find(
      (item) => String(item.id_pedidos) === String(idSeleccionado)
    );

    if (pedidoEncontrado) {
      setPedidoSeleccionado(pedidoEncontrado);
    }
    console.log(idSeleccionado)
    console.log(pedidoSeleccionado)
  };


  const handleChange = (e) => {
      const { name, value } = e.target

      if (name === 'cantidad') {
        const soloNumeros = value.replace(/\D/g, '') // Elimina todo lo que NO sea un número
        setProductoSeleccionado((prev) => ({
          ...prev,
          [name]: soloNumeros,
        }))
      }

      setProductoSeleccionado((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

  const handleAgregarProducto = () => {
    console.log(productoSeleccionado)
    setNuevoPedido((prev) => ({
      ...prev,
      detalles: [...prev.detalles, productoSeleccionado],
    }))
    setProductoSeleccionado({
    producto: '',
    cantidad: '',
  });
  }
  useEffect(() => {
        cargarCajas()
        cargarPedidos()
        cargarProductos()
        cargarMetodos()
      }, [])

  return (
    <CRow>
      {/* COLUMNA IZQUIERDA: Terminal de Venta / Caja */}
      <CCol xs={12} lg={7}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="bg-primary text-white d-flex align-items-center justify-content-between py-3">
            <strong className="d-flex align-items-center fs-5">
              <CIcon icon={cilCart} className="me-2" />
              Terminal de Venta
            </strong>

            {/* Dropdown de Caja (Relación CAJAS -> MOVIMIENTOS DE CAJA) */}
            <CDropdown variant="btn-group">
              <CDropdownToggle color="light" size="sm" className="text-primary fw-bold">
                {!!cajaSeleccionada ? 'Caja # ' + cajaSeleccionada.id_cajas + ' (Usuario # ' + cajaSeleccionada.usuario + ')': "Seleccione una caja..."}
              </CDropdownToggle>
              <CDropdownMenu placement="bottom-end">
              {cajas.map((item) => (
                    <CDropdownItem component="button" type="button" onClick={() => {console.log(item); setCajaSeleccionada(item);}}>
                      Caja # {item.id_cajas} (Usuario # {item.usuario})
                    </CDropdownItem>
                  ))}
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>

          <CCardBody>
            <CForm>
              {/* Opción 1: Cargar Pedido Finalizado desde la sección de Pedidos */}
              <div className="p-3 mb-3 bg-light border rounded">
                <label htmlFor="importarPedido" className="form-label fw-bold text-secondary">
                  <CIcon icon={cilFindInPage} className="me-1" /> Importar Pedido Completado
                </label>
                <CInputGroup>
                  <CFormSelect 
                  id="importarPedido"
                  value={idSeleccionado}
                  onChange={(e) => setIdSeleccionado(e.target.value)}
                  >
                    <option value="">-- Seleccionar pedido para facturar --</option>
                    <option value="0">-- Nuevo pedido --</option>
                      {pedidos.map((item) => (
                      <option key={item.id_pedidos} value={item.id_pedidos}>
                        Pedido #{item.id_pedidos} - Cliente: {item.cliente} (${item.precio_total})
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton type="button" color="secondary" variant="outline" onClick={handleCargarPedido}>
                    Seleccionar
                  </CButton>
                </CInputGroup>
              </div>

              {/* Opción 2: Venta Directa por Mostrador (Agregar Ítems) */}
              { !!pedidoSeleccionado ?
              <div>
              <h6 className="mt-4 mb-2 fw-bold text-dark">Detalle del Comprobante</h6>
              <CTable responsive align="middle" hover bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Producto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                    {
                      pedidoSeleccionado?.pedido_detalle?.map((item) => (
                        <CTableRow key={item.id_detalles_pedidos}>
                        <CTableDataCell>{item.producto.nombre}</CTableDataCell>
                        <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                        <CTableDataCell className="text-end">{item.producto.precio_unitario}</CTableDataCell>
                        <CTableDataCell className="text-end">{item.subtotal}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton color="danger" variant="ghost" size="sm">
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                        </CTableRow>
                      ))
                    }
                </CTableBody>
              </CTable>
              </div>
                :
                <div>
                <CRow className="g-2 mb-3">
                  <CCol md={6}>
                    <CFormSelect
                    name="producto" 
                    label="Producto Directo"
                    value={productoSeleccionado.producto}
                    onChange={handleChange}
                  >
                      {productos.map((item) => (
                      <option key={item.id_productos} value={item.id_productos}>
                        {item.nombre} (${item.precio_unitario})
                      </option>
                    ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormInput 
                    type="text"
                    name="cantidad" 
                    label="Cantidad" 
                    // defaultValue={1} 
                    min={1} 
                    value={productoSeleccionado.cantidad}
                    onChange={handleChange}
                    
                    />
                  </CCol>
                  <CCol md={3} className="d-flex align-items-end">
                    <CButton color="primary" className="w-100" onClick={handleAgregarProducto}>
                      <CIcon icon={cilPlus} /> Agregar
                    </CButton>
                  </CCol>
                </CRow>
                <CTable responsive align="middle" hover bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Producto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cant.</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Precio U.</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Subtotal</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Acción</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                    {
                      nuevoPedido?.detalles?.map((item) => (
                        <CTableRow key={item.id_detalles_pedidos}>
                        <CTableDataCell>{item.producto.nombre}</CTableDataCell>
                        <CTableDataCell className="text-center">{item.cantidad}</CTableDataCell>
                        <CTableDataCell className="text-end">{item.producto.precio_unitario}</CTableDataCell>
                        <CTableDataCell className="text-end">{item.subtotal}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton color="danger" variant="ghost" size="sm">
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                        </CTableRow>
                      ))
                    }
                </CTableBody>
              </CTable>
              </div>
              }

              {/* Selección de Método de Pago y Total (METODOS DE PAGO / VENTAS) */}
              
              <div className="p-3 border rounded bg-light mt-4">
                {!!pedidoSeleccionado == false && 
                  <CRow className="g-2 mb-3">
                <CCol md={6}>
                  <CFormInput
                    type="text"
                    label="Nombre del cliente"
                    name="cliente"
                    maxLength={50}
                    onChange={handleChange}
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="text"
                    label="Dirección"
                    name="direccion"
                    maxLength={200}
                    onChange={handleChange}
                  />
                </CCol>
                  </CRow>
                }
                
                <CRow className="align-items-center">
                  <CCol md={6}>
                    <CFormSelect id="selectMetodoPago" label="Método de Pago" className="fw-bold">
                      {metodos.map((item) => (
                      <option key={item.id_metodos} value={item.id_metodos}>
                        {item.nombre}
                      </option>
                    ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="text-end">
                    <span className="d-block text-muted small uppercase fw-bold">Total a Cobrar</span>
                    <h2 className="text-success fw-bolder mb-0">$5.800,00</h2>
                  </CCol>
                </CRow>
              </div>

              {/* Botón Principal de Confirmación */}
              <div className="d-grid gap-2 mt-4">
                <CButton color="success" size="lg" className="text-white py-3 fw-bold">
                  <CIcon icon={cilDollar} className="me-2" />
                  Procesar Venta e Imprimir Ticket
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* COLUMNA DERECHA: Historial de Ventas y Balance Rápido de Caja */}
      <CCol xs={12} lg={5}>
        {/* Resumen Caja del Turno */}
        <CCard className="mb-4 shadow-sm border-top-info border-top-3">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold">
                <CIcon icon={cilWallet} className="me-1" /> Total Recaudado (Turno Activo)
              </span>
              <CBadge color="info">Caja #1</CBadge>
            </div>
            <h3 className="text-primary fw-bold mb-0">$45.800,00</h3>
          </CCardBody>
        </CCard>

        {/* Historial de Ventas emitidas (Tabla VENTAS) */}
        <CCard className="mb-4 shadow-sm">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Últimas Ventas Registradas</strong>
            <CButton color="link" size="sm" className="text-decoration-none">Ver todas</CButton>
          </CCardHeader>
          <CCardBody>
            <CTable align="middle" responsive hover>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#ID Venta</CTableHeaderCell>
                  <CTableHeaderCell>Pago</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Total</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ticket</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow>
                  <CTableDataCell className="fw-bold">#1024</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">Efectivo</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$3.700,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm">
                      <CIcon icon={cilPrint} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="fw-bold">#1023</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="secondary">Débito</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$8.500,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm">
                      <CIcon icon={cilPrint} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableDataCell className="fw-bold">#1022</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="warning">Transferencia</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-end fw-bold">$2.100,00</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="secondary" variant="ghost" size="sm">
                      <CIcon icon={cilPrint} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Ventas
