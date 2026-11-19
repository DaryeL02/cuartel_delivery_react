import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

const EliminarCompraModal = ({ compra, saving, onClose, onConfirm }) => (
  <CModal visible={Boolean(compra)} onClose={() => !saving && onClose()}>
    <CModalHeader>
      <CModalTitle>Eliminar compra</CModalTitle>
    </CModalHeader>
    <CModalBody>
      ¿Eliminar la compra <strong>#{compra?.id_compras}</strong>? El backend revertirá las
      cantidades al stock de los insumos.
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="ghost" onClick={onClose} disabled={saving}>
        Cancelar
      </CButton>
      <CButton color="danger" onClick={onConfirm} disabled={saving}>
        {saving ? 'Eliminando...' : 'Eliminar compra'}
      </CButton>
    </CModalFooter>
  </CModal>
)

export default EliminarCompraModal
