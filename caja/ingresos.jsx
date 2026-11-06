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
import {useForm} from 'react-router-dom'
import {useNavigate} from 'react-router-dom' 

const IngresosCaja = () => {
  const [ingresos, setIngresos] = useState([])
  const [idCaja, setIdCaja] = useState(null)
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => { cargarCaja()
  }, [0])

  const cargarCaja = async () => {
    try {
      const respuesta = await api.get('/api/cajas/?estado=true')

      if (respuesta.data.length > 0) {
        const id = respuesta.data[0].id_cajas
        setIdCaja(id)
        cargarIngresos(id)
      }
    } catch (error) {
      console.error('Error al cargar caja:', error)
    }
  }

  const cargarIngresos = async (id) => {
    try {
      const respuesta = await api.get(`/api/cajas/${id}/movimientos/`)

      setIngresos(
        respuesta.data.filter(
          movimiento => movimiento.tipo_movimiento === 'Ingreso'
        )
      )
    } catch (error) {
      console.error('Error al cargar ingresos:', error)
    }
  }

  const registrarIngreso = async (e) => {
    e.preventDefault()

    if (!concepto.trim() || !monto || Number(monto) <= 0) {
      alert('Completá el concepto y un monto válido.')
      return
    }

    try {
      await api.post(`/api/cajas/${idCaja}/movimientos/`, {
        tipo_movimiento: 'Ingreso',
        concepto: concepto,
        monto: monto,
      })

      setConcepto('')
      setMonto('')
      setMostrarFormulario(false)
      cargarIngresos(idCaja)

      alert('Ingreso registrado correctamente.')
    } catch (error) {
      console.error(error)
      alert('No se pudo registrar el ingreso.')
    }
  }

  const totalIngresos = ingresos.reduce(
    (total, ingreso) => total + Number(ingreso.monto),
    0
  )

  const formatoMoneda = (valor) =>
    Number(valor).toLocaleString('es-AR', {
    style: 'currency',
      currency: 'ARS',
    })

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
