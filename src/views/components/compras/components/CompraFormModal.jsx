import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCart, cilPlus, cilTrash } from '@coreui/icons'
import { formatCurrency } from '../utils/compras'

const emptyForm = {
  proveedor: '',
  monto_efectivo: '0.00',
  monto_transferencia: '0.00',
  detalles: [],
}

const CompraFormModal = ({
  visible,
  saving,
  formError,
  proveedores,
  insumos,
  proveedoresInsumos,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (visible) setFormData(emptyForm)
  }, [visible])

  const availableInsumos = useMemo(() => {
    if (!formData.proveedor) return insumos

    const suppliedIds = new Set(
      proveedoresInsumos
        .filter((relation) => String(relation.proveedor) === String(formData.proveedor))
        .map((relation) => String(relation.insumo)),
    )
    return insumos.filter((insumo) => suppliedIds.has(String(insumo.id_insumos)))
  }, [formData.proveedor, insumos, proveedoresInsumos])

  const toCents = (value) => Math.round(Number(Number(value).toFixed(2)) * 100)
  const totalCents = formData.detalles.reduce(
    (sum, detail) =>
      sum + (Number.isFinite(Number(detail.subtotal)) ? toCents(detail.subtotal) : 0),
    0,
  )
  const total = totalCents / 100

  const handleSubmit = (event) => {
    event.preventDefault()

    if (formData.detalles.length === 0) {
      onSubmit(null, 'Agrega al menos un insumo a la compra.')
      return
    }
    if (formData.detalles.some((detail) => !detail.insumo)) {
      onSubmit(null, 'Selecciona un insumo para cada detalle.')
      return
    }
    if (
      formData.detalles.some(
        (detail) =>
          detail.subtotal === '' ||
          !Number.isFinite(Number(detail.subtotal)) ||
          Number(detail.subtotal) < 0,
      )
    ) {
      onSubmit(null, 'Ingresa un subtotal válido para cada detalle.')
      return
    }
    if (
      formData.detalles.some(
        (detail) => !Number.isFinite(Number(detail.cantidad)) || Number(detail.cantidad) <= 0,
      )
    ) {
      onSubmit(null, 'La cantidad debe ser mayor que cero.')
      return
    }

    const insumoIds = formData.detalles.map((detail) => String(detail.insumo))
    if (new Set(insumoIds).size !== insumoIds.length) {
      onSubmit(null, 'No puedes repetir un insumo en la misma compra.')
      return
    }

    const paymentAmounts = [formData.monto_efectivo, formData.monto_transferencia]
    if (
      paymentAmounts.some(
        (amount) => amount === '' || !Number.isFinite(Number(amount)) || Number(amount) < 0,
      )
    ) {
      onSubmit(null, 'Ingresa montos de pago válidos y no negativos.')
      return
    }
    if (paymentAmounts.reduce((sum, amount) => sum + toCents(amount), 0) > totalCents) {
      onSubmit(null, 'La suma de efectivo y transferencia no puede superar el total de la compra.')
      return
    }

    onSubmit({
      proveedor: formData.proveedor ? Number(formData.proveedor) : null,
      monto_efectivo: Number(formData.monto_efectivo).toFixed(2),
      monto_transferencia: Number(formData.monto_transferencia).toFixed(2),
      detalles: formData.detalles.map((detail) => ({
        insumo: Number(detail.insumo),
        cantidad: Number(detail.cantidad),
        subtotal: Number(detail.subtotal).toFixed(2),
      })),
    })
  }

  const handleProveedorChange = (event) => {
    setFormData((current) => ({
      ...current,
      proveedor: event.target.value,
      detalles: [],
    }))
  }

  const updateDetail = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      detalles: current.detalles.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: value } : detail,
      ),
    }))
  }

  const addDetail = () => {
    setFormData((current) => ({
      ...current,
      detalles: [...current.detalles, { insumo: '', cantidad: 1, subtotal: '' }],
    }))
  }

  const removeDetail = (index) => {
    setFormData((current) => ({
      ...current,
      detalles: current.detalles.filter((_, detailIndex) => detailIndex !== index),
    }))
  }

  return (
    <CModal visible={visible} onClose={() => !saving && onClose()} size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>
          <CIcon icon={cilCart} className="me-2" />
          Registrar compra
        </CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {formError && <CAlert color="danger">{formError}</CAlert>}
          <CRow className="g-3">
            <CCol md={6}>
              <CFormSelect
                label="Proveedor (opcional)"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleProveedorChange}
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id_proveedores} value={proveedor.id_proveedores}>
                    {proveedor.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Pago en efectivo"
                name="monto_efectivo"
                type="number"
                min={0}
                step="0.01"
                value={formData.monto_efectivo}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, monto_efectivo: event.target.value }))
                }
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Pago por transferencia"
                name="monto_transferencia"
                type="number"
                min={0}
                step="0.01"
                value={formData.monto_transferencia}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    monto_transferencia: event.target.value,
                  }))
                }
                required
              />
            </CCol>

            <CCol xs={12}>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Insumos comprados</h6>
                <CButton
                  type="button"
                  color="primary"
                  variant="outline"
                  size="sm"
                  onClick={addDetail}
                  disabled={!availableInsumos.length}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Agregar insumo
                </CButton>
              </div>
              {!formData.proveedor ? (
                <p className="mt-2 small text-body-secondary">
                  Sin proveedor puedes seleccionar cualquier insumo.
                </p>
              ) : availableInsumos.length === 0 ? (
                <p className="mt-2 small text-body-secondary">
                  Este proveedor no tiene insumos asociados.
                </p>
              ) : formData.detalles.length === 0 ? (
                <p className="mt-2 small text-body-secondary">
                  Agrega los insumos incluidos en la compra.
                </p>
              ) : (
                <div className="mt-3 d-flex flex-column gap-2">
                  {formData.detalles.map((detail, index) => {
                    const usedIds = formData.detalles
                      .filter((_, detailIndex) => detailIndex !== index)
                      .map((item) => String(item.insumo))

                    return (
                      <CRow className="g-2 align-items-end" key={`detalle-${index}`}>
                        <CCol md={5}>
                          <CFormSelect
                            label={index === 0 ? 'Insumo' : undefined}
                            value={detail.insumo}
                            onChange={(event) => updateDetail(index, 'insumo', event.target.value)}
                            required
                          >
                            <option value="">Selecciona un insumo...</option>
                            {availableInsumos
                              .filter(
                                (insumo) =>
                                  !usedIds.includes(String(insumo.id_insumos)) ||
                                  String(insumo.id_insumos) === String(detail.insumo),
                              )
                              .map((insumo) => (
                                <option key={insumo.id_insumos} value={insumo.id_insumos}>
                                  {insumo.nombre} ({insumo.unidad})
                                </option>
                              ))}
                          </CFormSelect>
                        </CCol>
                        <CCol xs={4} md={2}>
                          <CFormInput
                            label={index === 0 ? 'Cantidad' : undefined}
                            type="number"
                            min={1}
                            step={1}
                            value={detail.cantidad}
                            onChange={(event) =>
                              updateDetail(index, 'cantidad', event.target.value)
                            }
                            required
                          />
                        </CCol>
                        <CCol xs={5} md={4}>
                          <CFormInput
                            label={index === 0 ? 'Subtotal' : undefined}
                            type="number"
                            min={0}
                            step="0.01"
                            value={detail.subtotal}
                            onChange={(event) =>
                              updateDetail(index, 'subtotal', event.target.value)
                            }
                            required
                          />
                        </CCol>
                        <CCol xs={3} md={1}>
                          <CButton
                            type="button"
                            color="danger"
                            variant="outline"
                            className="w-100"
                            aria-label="Quitar insumo de la compra"
                            onClick={() => removeDetail(index)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CCol>
                      </CRow>
                    )
                  })}
                </div>
              )}
            </CCol>
            <CCol xs={12} className="text-end">
              <span className="text-body-secondary me-2">Total de la compra</span>
              <strong className="fs-5">{formatCurrency(total)}</strong>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton
            type="button"
            color="secondary"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </CButton>
          <CButton color="primary" type="submit" disabled={saving || !formData.detalles.length}>
            {saving ? 'Guardando...' : 'Registrar compra'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default CompraFormModal
