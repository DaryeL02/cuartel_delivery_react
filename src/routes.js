import React from 'react'

const Dashboard = React.lazy(() => import('./views/components/dashboard/Dashboard'))
const Productos = React.lazy(() => import('./views/components/productos/Productos'))
const Insumos = React.lazy(() => import('./views/components/insumos/Insumos'))
const Empleados = React.lazy(() => import('./views/components/empleados/Empleados'))
const Perfil = React.lazy(() => import('./views/components/perfil/Perfil'))
const Pedidos = React.lazy(() => import('./views/components/pedidos/Pedidos'))
const Menus = React.lazy(() => import('./views/components/menus/Menus'))
const Cajas = React.lazy(() => import('./views/components/cajas/Cajas.jsx'))
const Ventas = React.lazy(() => import('./views/components/ventas/Ventas.jsx'))
const Proveedores = React.lazy(() => import('./views/components/proveedores/Proveedores'))
const Compras = React.lazy(() => import('./views/components/compras/Compras'))
const Bebidas = React.lazy(() => import('./views/components/bebidas/Bebidas'))
const HistorialPedidos = React.lazy(() => import('./views/components/pedidos/HistorialPedidos'))

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/insumos', name: 'Insumos', element: Insumos },
  { path: '/productos', name: 'Productos', element: Productos },
  { path: '/empleados', name: 'Empleados', element: Empleados },
  { path: '/pedidos', name: 'Pedidos', element: Pedidos },
  { path: '/menus', name: 'Menus', element: Menus },
  { path: '/cajas', name: 'Cajas', element: Cajas },
  { path: '/perfil', name: 'Perfil', element: Perfil },
  { path: '/ventas', name: 'Ventas', element: Ventas },
  { path: '/proveedores', name: 'Proveedores', element: Proveedores },
  { path: '/compras', name: 'Compras', element: Compras },
  { path: '/bebidas', name: 'Bebidas', element: Bebidas },
  { path: '/historial-pedidos', name: 'Historial de Pedidos', element: HistorialPedidos },
]

export default routes
