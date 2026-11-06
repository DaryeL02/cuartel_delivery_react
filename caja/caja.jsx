
import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CFormTextarea,
  CBadge,
} from '@coreui/react'

const AperturaCierreCaja = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false)
  const [local, setLocal] = useState('')
  const [montoInicial, setMontoInicial] = useState('')
  const [efectivoContado, setEfectivoContado] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const formatoMoneda = (valor) =>
    Number(valor).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    })

  const abrirCaja = () => {
    if (!local || montoInicial === '' || Number(montoInicial) < 0) {
      alert('Completá el local y el monto inicial.')
      return
    }

    setCajaAbierta(true)
  }

  const cerrarCaja = () => {
    if (efectivoContado === '' || Number(efectivoContado) < 0) {
      alert('Ingresá el efectivo contado.')
      return
    }

    alert('Caja cerrada correctamente.')

    setCajaAbierta(false)
    setLocal('')
    setMontoInicial('')
    setEfectivoContado('')
    setObservaciones('')
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1">Apertura y cierre de caja</h4>
          <p className="text-body-secondary">Control y administración de efectivo </p>
        </div>

        <CBadge color={cajaAbierta ? 'success' : 'secondary'}>
          {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
        </CBadge>
      </CCardHeader>

      <CCardBody>
        {!cajaAbierta ? (
          <>
            <h5 className="mb-3">Apertura de caja</h5>

            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Local</CFormLabel>
                <CFormSelect value={local} onChange={e => setLocal(e.target.value)}>
                  <option value="">Seleccionar local</option>
                </CFormSelect>
              </CCol>

              <CCol md={6} className="mb-3">
                <CFormLabel>Monto inicial de efectivo</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={montoInicial}
                  onChange={e => setMontoInicial(e.target.value)}
                  placeholder="Ingrese el monto inicial"
                />
              </CCol>

              <CCol xs={12}>
                <CButton color="success" onClick={abrirCaja}>
                  Abrir caja
                </CButton>
              </CCol>
            </CRow>
          </>
        ) : (
          <>
            <h5 className="mb-3">Información de la caja</h5>

            <CCard className="mb-3">
              <CCardBody>
                <CRow>
                  <CCol md={6} className="mb-3">
                    <small className="text-body-secondary">Local</small>
                    <h6>{local}</h6>
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <small className="text-body-secondary">Fecha de apertura</small>
                    <h6>{new Date().toLocaleString('es-AR')}</h6>
                  </CCol>
                  <CCol md={6}>
                    <small className="text-body-secondary">Monto inicial</small>
                    <h6>{formatoMoneda(montoInicial)}</h6>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            <hr />
            <h5 className="mb-3">Arqueo y cierre de caja</h5>
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel>Monto inicial</CFormLabel>
                <CFormInput
                  value={formatoMoneda(montoInicial)}
                  disabled
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel>Efectivo contado físicamente</CFormLabel>
                <CFormInput
                  type="number"
                  min="0"
                  value={efectivoContado}
                  onChange={e => setEfectivoContado(e.target.value)}
                  placeholder="Ingrese el efectivo contado"
                />
              </CCol>
              <CCol xs={12} className="mb-3">
                <CFormLabel>Observaciones del cierre</CFormLabel>
                <CFormTextarea
                  rows={3}
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Ingrese alguna observación..."
                />
              </CCol>
              <CCol xs={12}>
                <CButton color="danger" onClick={cerrarCaja}>
                  Cerrar caja
                </CButton>
              </CCol>
            </CRow>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AperturaCierreCaja
