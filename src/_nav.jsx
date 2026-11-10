import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilCash,
  cilBasket,
  cilFastfood,
  cilMenu,
  cilLemon,
  cilCart,
  cilPeople,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
    {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavTitle,
    name: 'Producción',
  },
  {
    component: CNavItem,
    name: 'Ventas',
    to: '/ventas',
    icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Pedidos',
    to: '/pedidos',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavTitle,
    name: 'Administración',
  },
  {
    component: CNavItem,
    name: 'Productos',
    to: '/productos',
    icon: <CIcon icon={cilFastfood} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Menús',
    to: '/menus',
    icon: <CIcon icon={cilMenu} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Insumos',
    to: '/insumos',
    icon: <CIcon icon={cilLemon} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Cajas',
    to: '/cajas',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Empleados',
    to: '/empleados',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
]

export default _nav
