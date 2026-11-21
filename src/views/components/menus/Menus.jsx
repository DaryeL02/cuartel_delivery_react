import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFastfood, cilPlus, cilTrash } from '@coreui/icons'
import api from '../api/api'

const emptyForm = {
  nombre: '',
  estado: true,
  fecha_hora_inicio: '',
  fecha_hora_fin: '',
  detalles: [],
}

const formatDateForInput = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

const formatDateForApi = (value) => (value ? new Date(value).toISOString() : null)

const loadAllMenus = async () => {
  const menus = []
  let url = '/api/menus/'

  while (url) {
    const response = await api.get(url)
    const data = response.data

    if (Array.isArray(data)) {
      menus.push(...data)
      break
    }

    if (!Array.isArray(data?.results)) {
      throw new Error('La respuesta de menús tiene un formato inesperado.')
    }

    menus.push(...data.results)
    url = data.next
  }

  return menus
}

const getErrorMessage = (error) => {
  if (error.response?.status === 403) {
    return 'Solo un administrador puede agregar, modificar o eliminar menús.'
  }

  const data = error.response?.data
  if (!data)
    return 'No se pudo completar la operación. Verifica tu conexión e inténtalo nuevamente.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail

  return Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(' ') : String(messages)
      return `${field}: ${text}`
    })
    .join(' ')
}

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  })

const Menus = () => {
  const [menus, setMenus] = useState([])
  const [productos, setProductos] = useState([])
  const [bebidas, setBebidas] = useState([])
  const [selectedMenuId, setSelectedMenuId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [deleteMenuVisible, setDeleteMenuVisible] = useState(false)
  const [deleteDetailVisible, setDeleteDetailVisible] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [menuToDelete, setMenuToDelete] = useState(null)
  const [detailToDelete, setDetailToDelete] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const selectedMenu = menus.find((menu) => menu.id_menus === selectedMenuId) || null
  const filteredMenus = useMemo(
    () =>
      menus.filter((menu) =>
        (menu.nombre || '').toLowerCase().includes(searchTerm.trim().toLowerCase()),
      ),
    [menus, searchTerm],
  )

  const loadData = async (preferredMenuId = null) => {
    setLoading(true)
    setPageError('')
    try {
      const [loadedMenus, productosResponse, bebidasResponse] = await Promise.all([
        loadAllMenus(),
        api.get('/api/productos/'),
        api.get('/api/bebidas/'),
      ])
      setMenus(loadedMenus)
      setProductos(Array.isArray(productosResponse.data) ? productosResponse.data : [])
      setBebidas(Array.isArray(bebidasResponse.data) ? bebidasResponse.data : [])
      setSelectedMenuId(
        (currentId) =>
          loadedMenus.find((menu) => String(menu.id_menus) === String(preferredMenuId))?.id_menus ??
          loadedMenus.find((menu) => String(menu.id_menus) === String(currentId))?.id_menus ??
          loadedMenus[0]?.id_menus ??
          null,
      )
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    setEditingMenu(null)
    setFormData({ ...emptyForm, detalles: [] })
    setFormError('')
    setModalVisible(true)
  }

  const openEditModal = (menu) => {
    setEditingMenu(menu)
    setFormData({
      nombre: menu.nombre || '',
      estado: Boolean(menu.estado),
      fecha_hora_inicio: formatDateForInput(menu.fecha_hora_inicio),
      fecha_hora_fin: formatDateForInput(menu.fecha_hora_fin),
      detalles: (menu.detalles || []).map((detalle) => ({
        tipo: detalle.bebida ? 'bebida' : 'producto',
        articulo: String(detalle.bebida || detalle.producto),
        cantidad: detalle.cantidad,
        descuento: detalle.descuento,
      })),
    })
    setFormError('')
    setModalVisible(true)
  }

  const handleFormChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleDetailChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      detalles: current.detalles.map((detail, detailIndex) =>
        detailIndex === index
          ? field === 'articulo'
            ? {
                ...detail,
                tipo: value ? value.split(':')[0] : 'producto',
                articulo: value ? value.split(':')[1] : '',
              }
            : { ...detail, [field]: value }
          : detail,
      ),
    }))
  }

  const addDetail = () => {
    setFormData((current) => ({
      ...current,
      detalles: [
        ...current.detalles,
        { tipo: 'producto', articulo: '', cantidad: 1, descuento: 0 },
      ],
    }))
  }

  const removeDetailFromForm = (index) => {
    setFormData((current) => ({
      ...current,
      detalles: current.detalles.filter((_, detailIndex) => detailIndex !== index),
    }))
  }

  const preparePayload = () => ({
    nombre: formData.nombre.trim(),
    estado: Boolean(formData.estado),
    fecha_hora_inicio: formatDateForApi(formData.fecha_hora_inicio),
    fecha_hora_fin: formatDateForApi(formData.fecha_hora_fin),
    detalles: formData.detalles.map((detail) => ({
      producto: detail.tipo === 'producto' ? Number(detail.articulo) : null,
      bebida: detail.tipo === 'bebida' ? Number(detail.articulo) : null,
      cantidad: Number(detail.cantidad),
      descuento: Number(detail.descuento),
    })),
  })

  const handleSaveMenu = async (event) => {
    event.preventDefault()
    setFormError('')

    if (formData.fecha_hora_inicio && formData.fecha_hora_fin) {
      if (new Date(formData.fecha_hora_fin) < new Date(formData.fecha_hora_inicio)) {
        setFormError('La fecha de fin debe ser posterior al inicio.')
        return
      }
    }

    if (formData.detalles.some((detail) => !detail.articulo)) {
      setFormError('Selecciona un producto o una bebida para cada artículo agregado.')
      return
    }

    const selectedItemIds = formData.detalles.map((detail) => `${detail.tipo}:${detail.articulo}`)
    if (new Set(selectedItemIds).size !== selectedItemIds.length) {
      setFormError('No puedes agregar el mismo artículo más de una vez al menú.')
      return
    }

    setSaving(true)
    try {
      const payload = preparePayload()
      const response = editingMenu
        ? await api.put(`/api/menus/${editingMenu.id_menus}/`, payload)
        : await api.post('/api/menus/', payload)
      setModalVisible(false)
      setNotice(editingMenu ? 'Menú actualizado correctamente.' : 'Menú creado correctamente.')
      setSearchTerm('')
      await loadData(response.data?.id_menus ?? editingMenu?.id_menus ?? null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return

    setSaving(true)
    setPageError('')
    try {
      await api.delete(`/api/menus/${menuToDelete.id_menus}/`)
      setDeleteMenuVisible(false)
      setNotice('Menú eliminado correctamente.')
      setMenuToDelete(null)
      await loadData()
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDetail = async () => {
    if (!selectedMenu || !detailToDelete) return

    setSaving(true)
    setPageError('')
    try {
      const detalles = (selectedMenu.detalles || [])
        .filter((detalle) => detalle.id_detalles_menus !== detailToDelete.id_detalles_menus)
        .map((detalle) => ({
          producto: detalle.bebida ? null : Number(detalle.producto),
          bebida: detalle.bebida ? Number(detalle.bebida) : null,
          cantidad: Number(detalle.cantidad),
          descuento: Number(detalle.descuento),
        }))
      await api.patch(`/api/menus/${selectedMenu.id_menus}/`, { detalles })
      setDeleteDetailVisible(false)
      setDetailToDelete(null)
      setNotice('Producto quitado del menú.')
      await loadData()
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {pageError && (
        <CAlert color="danger" dismissible onClose={() => setPageError('')}>
          {pageError}
        </CAlert>
      )}
      {notice && (
        <CAlert color="success" dismissible onClose={() => setNotice('')}>
          {notice}
        </CAlert>
      )}

      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-3 bg-white py-3">
          <h5 className="mb-0 text-dark fw-semibold">Catálogo de Menús</h5>
          <div
            className="d-flex flex-wrap align-items-center gap-3"
            style={{ maxWidth: '520px', width: '100%' }}
          >
            <CFormInput
              type="search"
              placeholder="Buscar por nombre..."
              aria-label="Buscar menú por nombre"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="shadow-sm"
              style={{ flex: '1 1 200px' }}
            />
            <CButton
              color="primary"
              className="d-flex align-items-center gap-2 text-nowrap"
              onClick={openCreateModal}
            >
              <CIcon icon={cilPlus} />
              Agregar menú
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody className="px-0 py-0">
          <div className="table-responsive">
            <CTable align="middle" hover responsive className="mb-0 border-0">
              <CTableHead className="text-nowrap bg-light text-muted fw-bold">
                <CTableRow>
                  <CTableHeaderCell className="text-center border-0" style={{ width: '5%' }}>
                    N°
                  </CTableHeaderCell>
                  <CTableHeaderCell className="border-0" style={{ width: '22%' }}>
                    Menú
                  </CTableHeaderCell>
                  <CTableHeaderCell className="border-0" style={{ width: '27%' }}>
                    Productos incluidos
                  </CTableHeaderCell>
                  <CTableHeaderCell className="border-0" style={{ width: '12%' }}>
                    Inicio
                  </CTableHeaderCell>
                  <CTableHeaderCell className="border-0" style={{ width: '12%' }}>
                    Fin
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center border-0" style={{ width: '8%' }}>
                    Estado
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center border-0" style={{ width: '14%' }}>
                    Acciones
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                      Cargando menús...
                    </CTableDataCell>
                  </CTableRow>
                ) : filteredMenus.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                      {searchTerm
                        ? 'No hay menús que coincidan con la búsqueda.'
                        : 'Todavía no hay menús registrados.'}
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredMenus.map((menu, index) => {
                    const productNames = (menu.detalles || [])
                      .map(
                        (detalle) =>
                          detalle.bebida_data?.nombre ||
                          detalle.producto_data?.nombre ||
                          productos.find((producto) => producto.id_productos === detalle.producto)
                            ?.nombre ||
                          bebidas.find((bebida) => bebida.id_bebidas === detalle.bebida)?.nombre,
                      )
                      .filter(Boolean)

                    return (
                      <CTableRow
                        key={menu.id_menus}
                        active={selectedMenuId === menu.id_menus}
                        onClick={() => setSelectedMenuId(menu.id_menus)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CTableDataCell className="text-center text-body-secondary fw-medium">
                          {index + 1}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center gap-3">
                            <CAvatar
                              color="primary"
                              className="bg-opacity-10 text-primary fw-semibold"
                            >
                              <CIcon icon={cilFastfood} size="sm" />
                            </CAvatar>
                            <div>
                              <div className="fw-semibold text-dark">{menu.nombre}</div>
                              <small className="text-body-secondary">Menú #{menu.id_menus}</small>
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div
                            className="text-secondary text-truncate"
                            style={{ maxWidth: '360px' }}
                            title={productNames.join(', ') || 'Sin productos agregados'}
                          >
                            {productNames.length > 0
                              ? `${productNames.length} producto${productNames.length === 1 ? '' : 's'}: ${productNames.join(', ')}`
                              : 'Sin productos agregados'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell className="text-nowrap text-secondary">
                          {menu.fecha_hora_inicio
                            ? new Date(menu.fecha_hora_inicio).toLocaleString('es-AR')
                            : 'Sin definir'}
                        </CTableDataCell>
                        <CTableDataCell className="text-nowrap text-secondary">
                          {menu.fecha_hora_fin
                            ? new Date(menu.fecha_hora_fin).toLocaleString('es-AR')
                            : 'Sin definir'}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={menu.estado ? 'success' : 'secondary'}>
                            {menu.estado ? 'Activo' : 'Inactivo'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell
                          className="text-center text-nowrap"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            className="me-2"
                            onClick={() => openEditModal(menu)}
                          >
                            Editar
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="outline"
                            onClick={() => {
                              setMenuToDelete(menu)
                              setDeleteMenuVisible(true)
                            }}
                          >
                            Eliminar
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
        <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-top">
          <span className="small text-body-secondary">
            Mostrando {filteredMenus.length} {filteredMenus.length === 1 ? 'menú' : 'menús'}
          </span>
        </div>
      </CCard>

      <CRow>
        <CCol xs={12} className="mb-4">
          <CCard className="shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>
                {selectedMenu ? `Productos del menú: ${selectedMenu.nombre}` : 'Productos del menú'}
              </strong>
              {selectedMenu && (
                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(selectedMenu)}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Agregar o modificar productos
                </CButton>
              )}
            </CCardHeader>
            <CCardBody>
              {!selectedMenu ? (
                <p className="text-body-secondary mb-0">
                  Selecciona un menú para ver y administrar sus productos.
                </p>
              ) : (selectedMenu.detalles || []).length === 0 ? (
                <p className="text-body-secondary mb-0">Este menú todavía no tiene productos.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {selectedMenu.detalles.map((detalle) => {
                    const articulo =
                      detalle.bebida_data ||
                      detalle.producto_data ||
                      productos.find((item) => item.id_productos === detalle.producto) ||
                      bebidas.find((item) => item.id_bebidas === detalle.bebida)

                    return (
                      <div
                        key={detalle.id_detalles_menus}
                        className="d-flex justify-content-between align-items-center gap-3 border-bottom pb-3"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <CAvatar
                            color="primary"
                            className="bg-opacity-10 text-primary fw-semibold"
                          >
                            <CIcon icon={cilFastfood} size="sm" />
                          </CAvatar>
                          <div>
                            <div className="fw-semibold">
                              {articulo?.nombre ||
                                `${detalle.bebida ? 'Bebida' : 'Producto'} #${detalle.bebida || detalle.producto}`}
                            </div>
                            <small className="text-body-secondary">
                              Cantidad: {detalle.cantidad}
                              {Number(detalle.descuento) > 0 &&
                                ` · Descuento: ${detalle.descuento}%`}
                              {' · '}
                              {formatCurrency(articulo?.precio_unitario)}
                            </small>
                          </div>
                        </div>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          aria-label={`Quitar ${articulo?.nombre || 'artículo'} del menú`}
                          disabled={saving}
                          onClick={() => {
                            setDetailToDelete(detalle)
                            setDeleteDetailVisible(true)
                          }}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </div>
                    )
                  })}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        visible={modalVisible}
        onClose={() => !saving && setModalVisible(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>{editingMenu ? 'Editar menú' : 'Crear menú'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSaveMenu}>
          <CModalBody>
            {formError && <CAlert color="danger">{formError}</CAlert>}
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormInput
                  label="Nombre del menú"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  maxLength={100}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Fecha y hora de inicio (opcional)"
                  type="datetime-local"
                  name="fecha_hora_inicio"
                  value={formData.fecha_hora_inicio}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Fecha y hora de fin (opcional)"
                  type="datetime-local"
                  name="fecha_hora_fin"
                  value={formData.fecha_hora_fin}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol xs={12}>
                <CFormSwitch
                  label="Menú activo"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleFormChange}
                />
              </CCol>
              <CCol xs={12}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Artículos incluidos</h6>
                  <CButton
                    type="button"
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={addDetail}
                  >
                    <CIcon icon={cilPlus} className="me-1" />
                    Agregar artículo
                  </CButton>
                </div>
                {formData.detalles.length === 0 ? (
                  <p className="small text-body-secondary mb-0">
                    No agregaste artículos. Puedes añadirlos ahora o más tarde.
                  </p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {formData.detalles.map((detail, index) => {
                      const usedItemIds = formData.detalles
                        .filter((_, detailIndex) => detailIndex !== index)
                        .map((item) => `${item.tipo}:${item.articulo}`)
                      const valorArticulo = detail.articulo
                        ? `${detail.tipo}:${detail.articulo}`
                        : ''

                      return (
                        <CRow className="g-2 align-items-end" key={`detail-${index}`}>
                          <CCol md={6}>
                            <CFormSelect
                              label={index === 0 ? 'Producto o bebida' : undefined}
                              value={valorArticulo}
                              onChange={(event) =>
                                handleDetailChange(index, 'articulo', event.target.value)
                              }
                              required
                            >
                              <option value="">Selecciona...</option>
                              <optgroup label="Productos">
                                {productos
                                  .filter(
                                    (producto) =>
                                      !usedItemIds.includes(`producto:${producto.id_productos}`) ||
                                      (detail.tipo === 'producto' &&
                                        String(producto.id_productos) === String(detail.articulo)),
                                  )
                                  .map((producto) => (
                                    <option
                                      key={`producto-${producto.id_productos}`}
                                      value={`producto:${producto.id_productos}`}
                                    >
                                      {producto.nombre}
                                      {producto.estado === false ? ' (inactivo)' : ''}
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label="Bebidas">
                                {bebidas
                                  .filter(
                                    (bebida) =>
                                      !usedItemIds.includes(`bebida:${bebida.id_bebidas}`) ||
                                      (detail.tipo === 'bebida' &&
                                        String(bebida.id_bebidas) === String(detail.articulo)),
                                  )
                                  .map((bebida) => (
                                    <option
                                      key={`bebida-${bebida.id_bebidas}`}
                                      value={`bebida:${bebida.id_bebidas}`}
                                    >
                                      {bebida.nombre}
                                      {bebida.estado === false ? ' (inactiva)' : ''}
                                    </option>
                                  ))}
                              </optgroup>
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
                                handleDetailChange(index, 'cantidad', event.target.value)
                              }
                              required
                            />
                          </CCol>
                          <CCol xs={5} md={3}>
                            <CFormInput
                              label={index === 0 ? 'Descuento (%)' : undefined}
                              type="number"
                              min={0}
                              step={1}
                              value={detail.descuento}
                              onChange={(event) =>
                                handleDetailChange(index, 'descuento', event.target.value)
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
                              aria-label="Quitar artículo"
                              onClick={() => removeDetailFromForm(index)}
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
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="ghost"
              type="button"
              onClick={() => setModalVisible(false)}
              disabled={saving}
            >
              Cancelar
            </CButton>
            <CButton color="primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingMenu ? 'Guardar cambios' : 'Crear menú'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      <CModal visible={deleteMenuVisible} onClose={() => !saving && setDeleteMenuVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar menú</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar <strong>{menuToDelete?.nombre}</strong>? También se
          quitarán sus productos asociados.
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => setDeleteMenuVisible(false)}
            disabled={saving}
          >
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteMenu} disabled={saving}>
            {saving ? 'Eliminando...' : 'Eliminar menú'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={deleteDetailVisible}
        onClose={() => !saving && setDeleteDetailVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Quitar producto</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Deseas quitar este producto del menú <strong>{selectedMenu?.nombre}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => setDeleteDetailVisible(false)}
            disabled={saving}
          >
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteDetail} disabled={saving}>
            {saving ? 'Quitando...' : 'Quitar producto'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Menus
