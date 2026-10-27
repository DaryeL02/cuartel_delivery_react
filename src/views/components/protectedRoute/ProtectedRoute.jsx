import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  const token = localStorage.getItem('token')

  // Si no existe el token, lo redirige al login de CoreUI
  if (!token) {
    return <Navigate to="/authentication/login" replace />
  }

  // Si existe el token, renderiza las subrutas internas
  return <Outlet />
}

export default ProtectedRoute
