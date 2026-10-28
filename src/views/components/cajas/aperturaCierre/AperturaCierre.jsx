import React, { useState } from 'react'
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
  CBadge,
  CButton,
  CFormInput,
  CFormSelect,
  CCallout
} from '@coreui/react'

export default function AperturaCierre() {
  // Estado que simula el registro de la sesión actual de la caja
  const [currentSession, setCurrentSession] = useState({
    id_apertura_cierre: 104,
    monto_apertura: 15000,
    monto_cierre: 0,
    monto_ventas_calculado: 48500, // Total según las órdenes registradas
    fecha_hora_apertura: '2026-10-28 08:00:00',
    fecha_hora_cierre: null,
    estado: 'Abierta', // Abierta / Cerrada
    id_empleado: 12, // Identificador del cajero de turno
    observaciones: ''
  })

  // Historial de turnos anteriores
  const [history, setHistory] = useState([
    { id_apertura_cierre: 103, monto_apertura: 15000, monto_cierre: 62300, fecha_hora_apertura: '2026-10-27 16:00:00', fecha_hora_cierre: '2026-10-27 23:45:00', estado: 'Cerrada', diferencia: 0 },
    { id_apertura_cierre: 102, monto_apertura: 12000, monto_cierre: 54100, fecha_hora_apertura: '2026-10-27 08:00:00', fecha_hora_cierre: '2026-10-27 15:45:00', estado: 'Cerrada', diferencia: -400 }
  ])

  // Estados temporales del formulario
  const [montoAperturaInput, setMontoAperturaInput] = useState('')
  const [montoCierreInput, setMontoCierreInput] = useState('')
  const [obsInput, setObsInput] = useState('')

  // Controladores de acciones
  const handleOpenRegister = () => {
    if (!montoAperturaInput || isNaN(montoAperturaInput)) return alert('Ingrese un monto inicial válido')
    
    setCurrentSession({
      id_apertura_cierre: history.length + 101,
      monto_apertura: parseFloat(montoAperturaInput),
      monto_cierre: 0,
      monto_ventas_calculado: 0,
      fecha_hora_apertura: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fecha_hora_cierre: null,
      estado: 'Abierta',
      id_empleado: 12,
      observaciones: ''
    })
  };

  const handleCloseRegister = () => {
    if (!montoCierreInput || isNaN(montoCierreInput)) return alert('Ingrese el arqueo final de caja')
    
    const finalCierre = parseFloat(montoCierreInput);
    const montoEsperado = currentSession.monto_apertura + currentSession.monto_ventas_calculado;
    const diferenciaCalculada = finalCierre - montoEsperado;

    const closedSession = {
      ...currentSession,
      monto_cierre: finalCierre,
      fecha_hora_cierre: new Date().toISOString().replace('T', ' ').substring(0, 19),
      estado: 'Cerrada',
      observaciones: obsInput,
      diferencia: diferenciaCalculada
    }

    setHistory([closedSession, ...history])
    setCurrentSession({ ...currentSession, estado: 'Inactiva' }) // Resetea a estado listo para reabrir
    setMontoCierreInput('')
    setObsInput('')
  };

  return (
    <div className="p-4" style={{ backgroundColor: '#f4f5f7', minHeight: '100vh' }}>
      {/* Encabezado */}
      <CRow className="mb-4">
        <CCol>
          <h2 className="fw-bold text-dark">Control de Caja (Apertura y Cierre)</h2>
          <p className="text-muted mb-0">Módulo operativo para el arqueo, control de efectivo y turnos de empleados.</p>
        </CCol>
      </CRow>

      <CRow>
        {/* Panel Operativo Principal (Izquierda) */}
        <CCol xs={12} lg={5} className="mb-4">
          {currentSession.estado === 'Abierta' ? (
            /* VISTA DE CIERRE DE CAJA */
            <CCard className="shadow-sm border-0 mb-4">
              <CCardHeader className="bg-danger text-white fw-semibold py-3 d-flex justify-content-between align-items-center">
                <span>Cierre de Turno Actual (Sesión #{currentSession.id_apertura_cierre})</span>
                <CBadge color="light" text="danger">Caja Activa</CBadge>
              </CCardHeader>
              <CCardBody className="p-4">
                <CCallout color="info" className="bg-white">
                  <div className="small text-muted">Apertura Iniciada:</div>
                  <div className="fw-bold">{currentSession.fecha_hora_apertura}</div>
                  <div className="mt-2 small text-muted">Fondo Inicial en Caja:</div>
                  <div className="fw-bold text-primary">${currentSession.monto_apertura.toLocaleString('es-AR')}</div>
                </CCallout>

                <div className="p-3 my-3 rounded bg-light border">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted small">Ventas calculadas por sistema:</span>
                    <span className="fw-medium">${currentSession.monto_ventas_calculado.toLocaleString('es-AR')}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between text-dark fw-bold">
                    <span>Efectivo estimado total:</span>
                    <span>${(currentSession.monto_apertura + currentSession.monto_ventas_calculado).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Arqueo Físico (Efectivo Real en Caja)</label>
                  <CFormInput 
                    type="number" 
                    placeholder="Monto final contado en caja ($)" 
                    value={montoCierreInput}
                    onChange={(e) => setMontoCierreInput(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Observaciones / Novedades</label>
                  <CFormInput 
                    type="text" 
                    placeholder="Ej: Faltante de cambio, billetes rotos, etc." 
                    value={obsInput}
                    onChange={(e) => setObsInput(e.target.value)}
                  />
                </div>

                <CButton color="danger" className="w-100 py-2 text-white fw-bold shadow-sm" onClick={handleCloseRegister}>
                  Efectuar Cierre de Caja
                </CButton>
              </CCardBody>
            </CCard>
          ) : (
            /* VISTA DE APERTURA DE CAJA */
            <CCard className="shadow-sm border-0 mb-4">
              <CCardHeader className="bg-success text-white fw-semibold py-3">
                Nueva Apertura de Caja
              </CCardHeader>
              <CCardBody className="p-4">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Cajero de Turno (id_empleado)</label>
                  <CFormSelect disabled>
                    <option value="12">Empleado #12 - Cajero de Turno Mañana</option>
                  </CFormSelect>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Monto Inicial de Apertura</label>
                  <CFormInput 
                    type="number" 
                    placeholder="Monto base para dar vuelto ($)" 
                    value={montoAperturaInput}
                    onChange={(e) => setMontoAperturaInput(e.target.value)}
                  />
                </div>

                <CButton color="success" className="w-100 py-2 text-white fw-bold shadow-sm" onClick={handleOpenRegister}>
                  Habilitar e Iniciar Turno
                </CButton>
              </CCardBody>
            </CCard>
          )}
        </CCol>

        {/* Tabla Histórica de Turnos / Auditoría (Derecha) */}
        <CCol xs={12} lg={7}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="bg-dark text-white fw-semibold py-3">
              Historial de Cierres y Auditoría de Cajas
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable align="middle" responsive hover className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell scope="col">ID Sesión</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Apertura / Cierre</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Monto Inicial</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Monto Cierre</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-end">Balance / Dif.</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {history.map((row) => (
                    <CTableRow key={row.id_apertura_cierre}>
                      <CTableDataCell className="fw-semibold">#{row.id_apertura_cierre}</CTableDataCell>
                      <CTableDataCell>
                        <div className="small fw-medium text-dark">Inició: {row.fecha_hora_apertura}</div>
                        <div className="small text-muted">Terminó: {row.fecha_hora_cierre}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-muted">${row.monto_apertura.toLocaleString('es-AR')}</CTableDataCell>
                      <CTableDataCell className="fw-medium">${row.monto_cierre.toLocaleString('es-AR')}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {row.diferencia === 0 ? (
                          <CBadge color="success">Caja Ok</CBadge>
                        ) : row.diferencia > 0 ? (
                          <CBadge color="info">Sobrante: +${row.diferencia}</CBadge>
                        ) : (
                          <CBadge color="danger">Faltante: ${row.diferencia}</CBadge>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}
