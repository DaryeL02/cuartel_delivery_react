import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

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
    Number(valor || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })

  const formatoFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleString('es-AR') : 'Sin información'

  useEffect(() => {
    cargarDashboard()
  }, [])

  const caja = datosDashboard?.caja_activa
  const ventasHoy = datosDashboard?.ventas_hoy
  const ventasMes = datosDashboard?.ventas_mes
  const movimientosHoy = datosDashboard?.movimientos_hoy

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
              <CCard className="mb-4 bg-primary text-white ">
                <CCardBody>
                  <div className="text-body-secondary">Caja activa</div>
                  <div className="fs-5 fw-semibold">
                    {caja ? `Caja #${caja.id_cajas}` : 'Sin caja abierta'}
                  </div>
                  <CBadge color={caja?.estado ? 'success' : 'secondary'}>
                    {caja?.estado ? 'Abierta' : 'Cerrada'}
                  </CBadge>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-warning text-white">
                <CCardBody>
                  <div className="text-body-secondary">Usuario que abrió</div>
                  <div className="fs-5 fw-semibold">
                    {caja?.usuario_detalle?.usuario || 'Sin usuario'}
                  </div>
                  <div className="small text-black">{formatoFecha(caja?.fecha_hora_apertura)}</div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-success text-black">
                <CCardBody>
                  <div className="text-body-secondary">Ventas del día</div>
                  <div className="fs-5 fw-semibold text-white">
                    {formatoMoneda(ventasHoy?.total)}
                  </div>
                  <div className="small text-body-secondary">
                    {ventasHoy?.cantidad || 0} operaciones
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={6} lg={3}>
              <CCard className="mb-4 bg-danger text-white">
                <CCardBody>
                  <div className="text-body-secondary">Ventas del mes</div>
                  <div className="fs-5 fw-semibold text-white">
                    {formatoMoneda(ventasMes?.total)}
                  </div>
                  <div className="small text-body-secondary">
                    {ventasMes?.cantidad || 0} operaciones
                  </div>
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
                  <div className="fs-5 fw-semibold text-white">
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
              <MainChart />
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>Alertas de stock</CCardHeader>
            <CCardBody>
              {datosDashboard?.insumos_stock_bajo?.length > 0 ? (
                datosDashboard.insumos_stock_bajo.map((insumo) => (
                  <div
                    key={insumo.id_insumos}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <span>{insumo.nombre}</span>
                    <CBadge color={Number(insumo.stock_actual) === 0 ? 'danger' : 'warning'}>
                      {insumo.stock_actual} disponibles
                    </CBadge>
                  </div>
                ))
              ) : (
                <div className="text-body-secondary">No hay insumos con stock bajo.</div>
              )}
            </CCardBody>
          </CCard>
          <CCard className="mb-4">
            <CCardHeader>Movimientos de caja</CCardHeader>
            <CCardBody>
              {caja?.movimientos_asociados?.length > 0 ? (
                caja.movimientos_asociados.map((movimiento) => (
                  <div
                    key={movimiento.id_movimientos}
                    className="d-flex justify-content-between border-bottom py-2"
                  >
                    <div>
                      <strong>{movimiento.concepto}</strong>
                      <div className="small text-body-secondary">{movimiento.tipo_movimiento}</div>
                    </div>

                    <strong
                      className={
                        movimiento.tipo_movimiento === 'Ingreso' ? 'text-success' : 'text-danger'
                      }
                    >
                      {formatoMoneda(movimiento.monto)}
                    </strong>
                  </div>
                ))
              ) : (
                <div className="text-body-secondary">No hay movimientos registrados.</div>
              )}
            </CCardBody>
          </CCard>
        </>
      )}
    </div>
  )
}

export default Dashboard
