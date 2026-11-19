import React, { useEffect, useState } from 'react'
import { CAlert } from '@coreui/react'
import api from '../api/api'
import CompraFormModal from './components/CompraFormModal'
import ComprasTable from './components/ComprasTable'
import EliminarCompraModal from './components/EliminarCompraModal'
import { getErrorMessage, loadAll } from './utils/compras'

const Compras = () => {
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [insumos, setInsumos] = useState([])
  const [metodosPago, setMetodosPago] = useState([])
  const [proveedoresInsumos, setProveedoresInsumos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [compraToDelete, setCompraToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const [loadedCompras, loadedProveedores, loadedInsumos, loadedMetodos, loadedRelaciones] =
        await Promise.all([
          loadAll('/api/compras/'),
          loadAll('/api/proveedores/'),
          loadAll('/api/insumos/'),
          loadAll('/api/metodos-pago/'),
          loadAll('/api/proveedores-insumos/'),
        ])

      setCompras(loadedCompras)
      setProveedores(loadedProveedores)
      setInsumos(loadedInsumos)
      setMetodosPago(loadedMetodos.filter((metodo) => metodo.estado))
      setProveedoresInsumos(loadedRelaciones)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openForm = () => {
    setFormError('')
    setFormVisible(true)
  }

  const handleCreate = async (payload, validationError) => {
    if (!payload) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError('')
    try {
      await api.post('/api/compras/', payload)
      setFormVisible(false)
      setNotice('Compra registrada correctamente. El stock de los insumos fue actualizado.')
      await loadData()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!compraToDelete) return

    setSaving(true)
    setErrorMessage('')
    try {
      await api.delete(`/api/compras/${compraToDelete.id_compras}/`)
      setCompraToDelete(null)
      setNotice('Compra eliminada y stock revertido correctamente.')
      await loadData()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {errorMessage && (
        <CAlert color="danger" dismissible onClose={() => setErrorMessage('')}>
          {errorMessage}
        </CAlert>
      )}
      {notice && (
        <CAlert color="success" dismissible onClose={() => setNotice('')}>
          {notice}
        </CAlert>
      )}

      <ComprasTable
        compras={compras}
        loading={loading}
        saving={saving}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreate={openForm}
        onDelete={setCompraToDelete}
        canCreate={metodosPago.length > 0}
      />
      <CompraFormModal
        visible={formVisible}
        saving={saving}
        formError={formError}
        proveedores={proveedores}
        insumos={insumos}
        metodosPago={metodosPago}
        proveedoresInsumos={proveedoresInsumos}
        onClose={() => setFormVisible(false)}
        onSubmit={handleCreate}
      />
      <EliminarCompraModal
        compra={compraToDelete}
        saving={saving}
        onClose={() => setCompraToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default Compras
