import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import api from '../../../api/axios'
//import {useForm} from 'react-router-dom'
//import {useNavigate} from 'react-router-dom' 

const Ventas = () => {
  const [productos, setProductos] = useState()
  const [carrito, SetCarrito] = useState()
  const [metodoPago, setMetodoPago] = useState()
  const [caja, setCaja] = useState()
  const [error, setError] = useState()

const { register, handleSubmit, forState: {errors},}= useForm()
//Agrega productos
const agreProducto =()=>{
  SetCarrito ((actual)=>[
    ...actual,
  {
    id_productos: productos.id_productos,
    nombre: productos.nombre,
    precio_unitario: Number(producto.precio_unitario),
    cantidad: 1,
    subtotal: Number (producto.precio_unitario),
  }
  ])

}
}
return (
    <CCard className="mb-4">
    <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
        <h4 className="mb-1">Ingresos de caja</h4>
        <small className="text-body-secondary">
            Historial de ingresos registrados
        </small>
        </div>

        <CBadge color="success">
        {ingresos.length} movimientos
        </CBadge>
    </CCardHeader>

    <CCardBody>
        <CCard color="light" className="mb-4">
        <CCardBody>
            <small className="text-body-secondary">TOTAL DE INGRESOS</small>
            <h2 className="text-success mb-0">
            {formatoMoneda(totalIngresos)}
            </h2>
        </CCardBody>
        </CCard>

        <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Historial</h5>
        <CButton
            color="success"
            disabled={!idCaja}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}> Registrar ingreso extraordinario </CButton>
        </div>

        {mostrarFormulario && (
        <CCard className="mb-4">
            <CCardBody>
            <h5>Nuevo ingreso</h5>

            <form onSubmit={registrarIngreso}>
                <CRow>
                <CCol md={6} className="mb-3">
                    <CFormLabel>Concepto</CFormLabel>
                    <CFormInput
                    value={concepto}
                    onChange={e => setConcepto(e.target.value)}
                    placeholder="Ej. Ingreso extraordinario"
                    />
                </CCol>
        
                <CCol md={6} className="mb-3">
                    <CFormLabel>Monto</CFormLabel>
                    <CFormInput
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder="Ingrese el monto"
                    />
                </CCol>
                <CCol xs={12}>
                    <CButton type="submit" color="success">
                    Guardar ingreso
                    </CButton>

                    <CButton
                    type="button"
                    color="secondary"
                    variant="outline"
                    className="ms-2"
                    onClick={() => setMostrarFormulario(false)}
                    > Cancelar</CButton>
                </CCol>
                </CRow>
            </form>
            </CCardBody>
        </CCard>
        )}

        {!idCaja && (
        <p className="text-center text-body-secondary">
            No hay una caja abierta para registrar o consultar ingresos.
        </p>
        )}

        <CTable bordered hover responsive align="middle">
        <CTableHead>
            <CTableRow>
            <CTableHeaderCell>Fecha</CTableHeaderCell>
            <CTableHeaderCell>Concepto</CTableHeaderCell>
            <CTableHeaderCell>Monto</CTableHeaderCell>
            <CTableHeaderCell>Tipo</CTableHeaderCell>
            </CTableRow>
        </CTableHead>

        <CTableBody>
            {ingresos.length > 0 ? (
            ingresos.map(ingreso => (
                <CTableRow key={ingreso.id_movimientos}>
                <CTableDataCell>
                    {new Date(ingreso.fecha_hora_creacion).toLocaleString('es-AR')}
                </CTableDataCell>

                <CTableDataCell>{ingreso.concepto}</CTableDataCell>

                <CTableDataCell>
                    {formatoMoneda(ingreso.monto)}
                </CTableDataCell>

                <CTableDataCell>
                    <CBadge color="success">Ingreso</CBadge>
                </CTableDataCell>
                </CTableRow>
            ))
            ) : (
            <CTableRow>
                <CTableDataCell colSpan={4} className="text-center">
                No hay ingresos registrados.
                </CTableDataCell>
            </CTableRow>
            )}
        </CTableBody>
        </CTable>
    </CCardBody>
    </CCard>
  )
}

export default IngresosCaja
