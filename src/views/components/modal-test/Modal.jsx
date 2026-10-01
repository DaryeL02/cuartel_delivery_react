import React, { useState } from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import { CCol, CForm, CFormCheck, CFormInput, CFormSelect } from '@coreui/react'

export const Modal_test = () => {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <CButton color="primary" onClick={() => setVisible(!visible)}>
        Agregar insumo
      </CButton>
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
            <CModalTitle id="LiveDemoExampleLabel">Agregar insumo</CModalTitle>
        </CModalHeader>
        <CModalBody>
            <CForm className="row g-3">
                <CCol md={12}>
                    <CFormInput id="inputNombre" label="Nombre" />
                </CCol>
                <CCol md={12}>
                    <CFormInput id="inputDescripcion" label="Descripción" />
                </CCol>
                <CCol md={8} >
                    <CFormInput type="number" step="0.01" id="inputStockactual" label="Stock Actual" placeholder="23.00" />
                </CCol>
                <CCol md={4} >
                    <CFormSelect id="autoSizingSelect" label="Unidad">
                        <option>Unidad de medida...</option>
                        <option value="1">gr</option>
                        <option value="2">l</option>
                        <option value="3">kg</option>
                    </CFormSelect> 
                </CCol>
            </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Cerrar
          </CButton>
          <CButton color="primary">
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
export default Modal_test