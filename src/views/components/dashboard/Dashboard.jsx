import React, { useEffect, useState } from 'react'
import { CAlert, CBadge, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'
import api from '../api/api'
import MainChart from './MainChart'

const Dashboard = () => {
  const [datosDashboard, setDatosDashboard] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarDashboard = async () => {
    try {
      setCargando(true)
      setError('')

      const respuesta = await api.get('/api/dashboard/')
      setDatosDashboard(respuesta.data)
    } catch (errorApi) {
      console.error('Error al cargar el Dashboard:', errorApi)
      console.error('Respuesta del servidor:', errorApi.response?.data)
      setError('No se pudo cargar la información del Dashboard.')
    } finally {
      setCargando(false)
    }
  }

  const formatoMoneda = (valor) =>
    Number(valor || 0).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    })

  const formatoFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleString('es-AR') : 'Sin información'

  useEffect(() => {
    cargarDashboard()
  }, [])

  const caja = datosDashboard?.caja_activa
  const ventasSemana = datosDashboard?.ventas_semana
  const ventasMes = datosDashboard?.ventas_mes
  const movimientosHoy = datosDashboard?.movimientos_hoy
  const ventasGrafico = datosDashboard?.ventas_grafico || []
  const insumosStockBajo = datosDashboard?.insumos_stock_bajo || []
  const detalleIngresos = movimientosHoy?.detalle_ingresos || []
  const detalleEgresos = movimientosHoy?.detalle_egresos || []

  return (
    <div className="container-fluid">
      <h2 className="mb-4">El Cuartel Delivery</h2>

      {cargando && (
        <div className="text-center p-4">
          <CSpinner color="primary" />
          <div className="mt-2">Cargando información...</div>
        </div>
      )}

      {error && <CAlert color="danger">{error}</CAlert>}

      {!cargando && !error && (
        <>
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-primary text-white">
                <CCardBody>
                  <div className="text-white-50">Caja activa</div>

                  <div className="fs-5 fw-semibold">
                    {caja ? `Caja #${caja.id_cajas}` : 'Sin caja abierta'}
                  </div>

                  <CBadge color={caja?.estado ? 'success' : 'secondary'}>
                    {caja?.estado ? 'Abierta' : 'Cerrada'}
                  </CBadge>
                  {caja && (
                    <div className="mt-2">
                      <div className="small text-white-50">Saldo actual</div>
                      <div className="fw-semibold">{formatoMoneda(caja.saldo_actual)}</div>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-warning text-dark">
                <CCardBody>
                  <div className="text-dark">Usuario que abrió</div>

                  <div className="fs-5 fw-semibold">
                    {caja?.usuario_detalle?.usuario || 'Sin usuario'}
                  </div>

                  <div className="small text-dark">{formatoFecha(caja?.fecha_hora_apertura)}</div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-success text-white">
                <CCardBody>
                  <div className="text-white-50">Ventas de la semana</div>

                  <div className="fs-5 fw-semibold">{formatoMoneda(ventasSemana?.total)}</div>

                  <div className="small text-white-50">
                    {ventasSemana?.cantidad || 0} operaciones
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-danger text-white">
                <CCardBody>
                  <div className="text-white-50">Ventas del mes</div>

                  <div className="fs-5 fw-semibold">{formatoMoneda(ventasMes?.total)}</div>

                  <div className="small text-white-50">{ventasMes?.cantidad || 0} operaciones</div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol sm={6} lg={4}>
              <CCard className="mb-4">
                <CCardBody>
                  <div className="text-body-secondary">Monto de apertura</div>

                  <div className="fs-5 fw-semibold">{formatoMoneda(caja?.monto_apertura)}</div>

                  <div className="small text-body-secondary">Caja actual</div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={4}>
              <CCard className="mb-4">
                <CCardBody>
                  <div className="text-body-secondary">Ingresos del día</div>

                  <div className="fs-5 fw-semibold text-success">
                    {formatoMoneda(movimientosHoy?.ingresos)}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={4}>
              <CCard className="mb-4">
                <CCardBody>
                  <div className="text-body-secondary">Egresos del día</div>

                  <div className="fs-5 fw-semibold text-danger">
                    {formatoMoneda(movimientosHoy?.egresos)}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <CCard className="mb-4">
            <CCardHeader>Información de la caja</CCardHeader>

            <CCardBody>
              <CRow>
                <CCol md={4}>
                  <strong>Número de caja:</strong>

                  <div>{caja ? `Caja #${caja.id_cajas}` : 'Sin caja abierta'}</div>
                </CCol>

                <CCol md={4}>
                  <strong>Usuario:</strong>

                  <div>{caja?.usuario_detalle?.usuario || 'Sin usuario'}</div>
                </CCol>

                <CCol md={4}>
                  <strong>Estado:</strong>

                  <div>{caja?.estado ? 'Abierta' : 'Cerrada'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>Ventas de la semana</CCardHeader>

            <CCardBody>
              <MainChart datos={ventasGrafico} />
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>Alertas de stock</CCardHeader>

            <CCardBody>
              {insumosStockBajo.length > 0 ? (
                insumosStockBajo.map((insumo) => (
                  <div
                    key={insumo.id_insumos}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <span>{insumo.nombre}</span>

                    <CBadge color={Number(insumo.stock_actual) === 0 ? 'danger' : 'warning'}>
                      {insumo.stock_actual} {insumo.unidad}
                    </CBadge>
                  </div>
                ))
              ) : (
                <div className="text-body-secondary">No hay insumos con stock bajo.</div>
              )}
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>Resumen de movimientos de caja</CCardHeader>

            <CCardBody>
              <CRow>
                <CCol md={6}>
                  <h6 className="text-success fw-semibold">Ingresos</h6>

                  {detalleIngresos.length > 0 ? (
                    detalleIngresos.map((movimiento, index) => (
                      <div
                        key={`${movimiento.concepto}-${index}`}
                        className="d-flex justify-content-between border-bottom py-2"
                      >
                        <div>
                          <div className="fw-semibold">{movimiento.concepto}</div>

                          <small className="text-body-secondary">
                            {movimiento.cantidad} movimiento(s)
                          </small>
                        </div>

                        <strong className="text-success">{formatoMoneda(movimiento.total)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="text-body-secondary">No hay ingresos registrados.</div>
                  )}

                  <div className="d-flex justify-content-between border-top mt-3 pt-2">
                    <strong>Total de ingresos</strong>

                    <strong className="text-success">
                      {formatoMoneda(movimientosHoy?.ingresos)}
                    </strong>
                  </div>
                </CCol>

                <CCol md={6}>
                  <h6 className="text-danger fw-semibold">Egresos</h6>

                  {detalleEgresos.length > 0 ? (
                    detalleEgresos.map((movimiento, index) => (
                      <div
                        key={`${movimiento.concepto}-${index}`}
                        className="d-flex justify-content-between border-bottom py-2"
                      >
                        <div>
                          <div className="fw-semibold">{movimiento.concepto}</div>

                          <small className="text-body-secondary">
                            {movimiento.cantidad} movimiento(s)
                          </small>
                        </div>

                        <strong className="text-danger">{formatoMoneda(movimiento.total)}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="text-body-secondary">No hay egresos registrados.</div>
                  )}

                  <div className="d-flex justify-content-between border-top mt-3 pt-2">
                    <strong>Total de egresos</strong>

                    <strong className="text-danger">
                      {formatoMoneda(movimientosHoy?.egresos)}
                    </strong>
                  </div>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-between border-top mt-4 pt-3">
                <strong>Saldo total</strong>

                <strong>{formatoMoneda(movimientosHoy?.saldo)}</strong>
              </div>
            </CCardBody>
          </CCard>
        </>
      )}
    </div>
  )
}

export default Dashboard
