import React, { useState, useEffect  } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CRow,
  CCol,
  CTable,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import api from '../api/api'
import CerrarCaja from './ModalCerrarCaja'
import NuevaCaja from './ModalNuevaCaja';

export default function Cajas() {
  // --- Estado para múltiples cajas concurrentes (Colección de la tabla CAJAS) ---
  const [listaCajas, setListaCajas] = useState([]);
  const [modalNuevaCajaOpen, setModalNuevaCajaOpen] = useState(false)
  const [modalCerrarCajaOpen, setModalCerrarCajaOpen] = useState(false)
  const [usuarios, setUsuarios] = useState([]);
  const [locales, setLocales] = useState([]);
  const [cajaACerrar, setCajaACerrar] = useState(null);
  

  // --- Estado para el historial de movimientos cruzado por FK_ID_cajas ---
  const [movimientos, setMovimientos] = useState([]);

  // --- Modales y Caja seleccionada para operar ---
  const [modalApertura, setModalApertura] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [cajaSeleccionadaId, setCajaSeleccionadaId] = useState(null);

  // --- Estados de campos de entrada de formularios ---
  const [montoAperturaInput, setMontoAperturaInput] = useState('');
  const [montoCierreInput, setMontoCierreInput] = useState('');
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    Tipo_movimiento: 'Ingreso',
    Concepto: '',
    Monto: ''
  });

  const cargarCajas = async () => {
      try {
        const token = localStorage.getItem('token')
        const respuesta = await api.get('/api/cajas/?date=today', {
          headers: {
            'Authorization': `Token ${token}`
          }
      })  
        setListaCajas(respuesta.data)
        
      } catch (error) {
        console.error('Error al cargar cajas:', error)
      }
    }

  const cargarUsuarios = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/usuarios/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    })  
      setUsuarios(respuesta.data)
      
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  const cargarLocales = async () => {
    try {
      const token = localStorage.getItem('token')
      const respuesta = await api.get('/api/locales/', {
        headers: {
          'Authorization': `Token ${token}`
        }
    })  
      setLocales(respuesta.data)
      
    } catch (error) {
      console.error('Error al cargar locales:', error)
    }
  }

  // --- Helper: Calcular el saldo teórico de una caja específica usando sus movimientos ---
  // const calcularSaldoTeorico = (cajaId, montoApertura) => {
  //   const movsDeCaja = movimientos.filter(m => m.FK_ID_cajas === cajaId);
  //   return montoApertura + movsDeCaja.reduce((acc, curr) => {
  //     return curr.Tipo_movimiento === 'Ingreso' ? acc + curr.Monto : acc - curr.Monto;
  //   }, 0);
  // };

  // --- Operación: Registrar Ingreso/Egreso en la caja activa seleccionada ---
  // const handleRegistrarMovimiento = () => {
  //   if (!nuevoMovimiento.Concepto || !nuevoMovimiento.Monto || !cajaSeleccionadaId) return;

  //   const nuevoRegistro = {
  //     PK_ID_movimientos: movimientos.length + 1,
  //     FK_ID_ventas: null,
  //     FK_ID_compras: null,
  //     FK_ID_cajas: cajaSeleccionadaId,
  //     Tipo_movimiento: nuevoMovimiento.Tipo_movimiento,
  //     Concepto: nuevoMovimiento.Concepto,
  //     Monto: parseFloat(nuevoMovimiento.Monto),
  //     Fecha_hora_creacion: new Date().toISOString()
  //   };

  //   setMovimientos([nuevoRegistro, ...movimientos]);
  //   setModalMovimiento(false);
  //   setNuevoMovimiento({ Tipo_movimiento: 'Ingreso', Concepto: '', Monto: '' });
  // };

  // --- Operación: Finalizar y Cerrar una caja específica ---
  // const handleCerrarCaja = () => {
  //   const montoC = parseFloat(montoCierreInput) || 0;
  //   const ahora = new Date().toISOString();

  //   setListaCajas(listaCajas.map(c => {
  //     if (c.ID_cajas === cajaSeleccionadaId) {
  //       return {
  //         ...c,
  //         Fecha_hora_cierre: ahora,
  //         Monto_cierre: montoC,
  //         Estado: false // Cerrada
  //       };
  //     }
  //     return c;
  //   }));

  //   setModalCierre(false);
  //   setMontoCierreInput('');
  //   setCajaSeleccionadaId(null);
  // };

  useEffect(() => {
      cargarCajas()
      cargarUsuarios()
      cargarLocales()
      if(listaCajas){
        console.log(listaCajas)
      }
    }, [])

  // Buscar la caja que se está cerrando para mostrar su saldo teórico en el modal
  const cajaEnCierre = listaCajas.find(c => c.ID_cajas === cajaSeleccionadaId);
  const saldoTeoricoEnCierre = cajaEnCierre ? calcularSaldoTeorico(cajaEnCierre.ID_cajas, cajaEnCierre.Monto_apertura) : 0;

  return (
    
    <div className="p-3">
      {/* SECCIÓN SUPERIOR: BOTÓN SIEMPRE DISPONIBLE PARA ABRIR OTRA CAJA */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="m-0 fw-bold text-secondary">Cajas</h4>
        <CButton color="success" onClick={() => {setModalNuevaCajaOpen(true);}}>
          + Abrir Nueva Caja
        </CButton>
      </div>

      {/* RENDERIZADO DINÁMICO DE TODAS LAS CAJAS EN EL SISTEMA */}
      {listaCajas.length === 0 ? (
        <CCard className="text-center p-5 shadow-sm border-dashed">
          <CCardBody>
            <p className="text-muted fs-5">No hay cajas creadas en este turno.</p>
            <CButton color="success" size="lg" onClick={() => {}}>
              Iniciar Primera Apertura
            </CButton>
          </CCardBody>
        </CCard>
      ) : (
        listaCajas.map((itemCaja) => {
          // const saldoActual = calcularSaldoTeorico(itemCaja.ID_cajas, itemCaja.Monto_apertura);
          // const movsDeEstaCaja = movimientos.filter(m => m.FK_ID_cajas === itemCaja.ID_cajas);
          const movsDeEstaCaja = 2;
          return (
            <CCard key={itemCaja.id_cajas} className="mb-4 shadow-sm border-start border-start-4 border-start-primary">
              <CCardHeader className="d-flex justify-content-between align-items-center bg-light">
                <div>
                  <strong className="fs-5 text-dark">Caja ID: #{itemCaja.id_cajas}</strong>
                  {/* <span className="ms-3 text-muted small">Local Ref: {itemCaja.FK_ID_locales}</span> */}
                </div>
                <CBadge color={itemCaja.estado ? 'success' : 'secondary'} shape="rounded-pill">
                  {itemCaja.estado ? 'ACTIVA / ABIERTA' : 'CERRADA'}
                </CBadge>
              </CCardHeader>
              
              <CCardBody>
                <CRow className="mb-3 text-center align-items-center">
                  <CCol sm={6} md={3} className="border-end">
                    <div className="text-muted small uppercase fw-bold">Monto Apertura</div>
                    <div className="fs-5 fw-semibold text-secondary">${itemCaja.monto_apertura ? Number(itemCaja.monto_apertura).toFixed(2) : "0.00"}</div>
                  </CCol>
                  <CCol sm={6} md={3} className="border-end">
                    <div className="text-muted small uppercase fw-bold">Saldo en Sistema</div>
                    {/* <div className="fs-4 fw-bold text-primary">
                      {itemCaja.Estado ? `$${saldoActual.toFixed(2)}` : `$${itemCaja.Monto_cierre.toFixed(2)}`}
                    </div> */}
                  </CCol>
                  <CCol sm={6} md={3} className="border-end">
                    <div className="text-muted small uppercase fw-bold">Apertura Registrada</div>
                    <div className="small fw-semibold">{new Date(itemCaja.fecha_hora_apertura).toLocaleString()}</div>
                  </CCol>
                  <CCol sm={6} md={3}>
                    <div className="text-muted small uppercase fw-bold">Cierre Registrado</div>
                    <div className="small fw-semibold text-danger">
                      {itemCaja.fecha_hora_cierre ? new Date(itemCaja.fecha_hora_cierre).toLocaleString() : 'En ejecución...'}
                    </div>
                  </CCol>
                </CRow>

                {/* ACCIONES ESPECÍFICAS DE ESTA CAJA */}
                <div className="d-flex gap-2 justify-content-between align-items-center pt-2 border-top">
                  <div className="small text-muted">
                    {/* {movsDeEstaCaja.length} transacciones registradas de forma puntual. */}
                  </div>
                  <div className="d-flex gap-2">
                    {itemCaja.estado ? (
                      <>
                        <CButton 
                          color="primary" 
                          size="sm"
                          disabled
                          onClick={() => {}
                            // () => {
                            // setCajaSeleccionadaId(itemCaja.ID_cajas);
                            // setModalMovimiento(true);}
                            }
                        >
                          + Movimiento
                        </CButton>
                        <CButton 
                          color="danger" 
                          variant="outline"
                          size="sm"
                          onClick={() => {setCajaACerrar(itemCaja.id_cajas); setModalCerrarCajaOpen(true);}}
                        >
                          Cerrar esta Caja
                        </CButton>
                      </>
                    ) : (
                      <span className="text-success small fw-bold">Arqueo Finalizado con Éxito</span>
                    )}
                  </div>
                </div>

                {/* SUB-TABLA DE MOVIMIENTOS INTERNA DE LA CAJA */}
                {/* {movsDeEstaCaja.length > 0 && (
                  <div className="mt-3 bg-light p-2 rounded">
                    <div className="small fw-bold mb-1 text-secondary">Últimos movimientos de la Caja #{itemCaja.ID_cajas}:</div>
                    <CTable align="middle" responsive small className="m-0 bg-white shadow-xs">
                      <CTableBody>
                        {movsDeEstaCaja.map((mov) => (
                          <CTableRow key={mov.PK_ID_movimientos}>
                            <CTableDataCell className="small">{new Date(mov.Fecha_hora_creacion).toLocaleTimeString()}</CTableDataCell>
                            <CTableDataCell className="small fw-bold">{mov.Concepto}</CTableDataCell>
                            <CTableDataCell className="small">
                              <CBadge color={mov.Tipo_movimiento === 'Ingreso' ? 'success' : 'danger'}>{mov.Tipo_movimiento}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell className={`small text-end fw-bold ${mov.Tipo_movimiento === 'Ingreso' ? 'text-success' : 'text-danger'}`}>
                              ${mov.Monto.toFixed(2)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                )} */}
              </CCardBody>
            </CCard>
          );
        })
      )}

      {/* MODAL: MOVIMIENTO INDIVIDUAL */}
      {/* <CModal visible={modalMovimiento} onClose={() => setModalMovimiento(false)}>
        <CModalHeader><CModalTitle>Registrar Transacción en Caja #{cajaSeleccionadaId}</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="tipoMovimiento">Tipo de Ajuste</CFormLabel>
              <CFormSelect
                id="tipoMovimiento"
                value={nuevoMovimiento.Tipo_movimiento}
                onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, Tipo_movimiento: e.target.value })}
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="conceptoMov">Concepto (Máx. 10 carac.)</CFormLabel>
              <CFormInput
                type="text"
                id="conceptoMov"
                maxLength={10}
                placeholder="Ej: Proveedor"
                value={nuevoMovimiento.Concepto}
                onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, Concepto: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="montoMov">Monto Transacción</CFormLabel>
              <CFormInput
                type="number"
                id="montoMov"
                placeholder="0.00"
                value={nuevoMovimiento.Monto}
                onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, Monto: e.target.value })}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalMovimiento(false)}>Cancelar</CButton>
          <CButton color="primary" onClick={handleRegistrarMovimiento}>Aplicar a Caja</CButton>
        </CModalFooter>
      </CModal> */}

      <NuevaCaja
        visible={modalNuevaCajaOpen} 
        onClose={() => setModalNuevaCajaOpen(false)} 
        usuarios={usuarios}
        locales={locales}
        onSuccess={cargarCajas}
      />
      <CerrarCaja
        visible={modalCerrarCajaOpen} 
        onClose={() => setModalCerrarCajaOpen(false)} 
        caja={cajaACerrar}
        onSuccess={cargarCajas}
      />

    </div>
  );
}
