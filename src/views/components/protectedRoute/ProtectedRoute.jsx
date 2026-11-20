import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasFullAccess, isOperationalUser, readCurrentUser } from '../../../utils/roles'

const ProtectedRoute = () => {
  const token = localStorage.getItem('token')
  const location = useLocation()
  const usuarioActual = readCurrentUser()

  if (!token) {
    return <Navigate to="/authentication/login" replace />
  }

  if (hasFullAccess(usuarioActual)) {
    return <Outlet />
  }

  if (isOperationalUser(usuarioActual)) {
    const rutaPedidosPermitida =
      location.pathname === '/pedidos' ||
      location.pathname.startsWith('/pedidos/') ||
      location.pathname === '/historial-pedidos'
    return rutaPedidosPermitida ? <Outlet /> : <Navigate to="/pedidos" replace />
  }

  return <Navigate to="/authentication/login" replace />
}

export default ProtectedRoute
