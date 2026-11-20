/**
 * AppSidebar Component
 *
 * Collapsible navigation sidebar with branding, menu items, and toggle controls.
 *
 * Features:
 * - Redux-controlled visibility state
 * - Unfoldable/narrow mode for more screen space
 * - Brand logo with full and narrow variants
 * - Close button for mobile devices
 * - Footer with toggle button
 * - Dark color scheme
 * - Fixed positioning
 *
 * @component
 * @example
 * return (
 *   <AppSidebar />
 * )
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

// import { logo } from 'src/assets/brand/logo'
// import { sygnet } from 'src/assets/brand/sygnet'

import miLogo from '../assets/brand/logo-cuartel.svg'
import miIsotipo from '../assets/brand/isotipo-cuartel.svg'
import { Link } from 'react-router-dom'
import { hasFullAccess, isOperationalUser, readCurrentUser } from '../utils/roles'


// sidebar nav config
import navigation from '../_nav'

/**
 * AppSidebar functional component
 *
 * Manages sidebar state with Redux:
 * - sidebarShow: Controls sidebar visibility
 * - sidebarUnfoldable: Controls narrow/wide mode
 *
 * Renders navigation from _nav.js configuration file.
 * Memoized to prevent unnecessary re-renders.
 *
 * @returns {React.ReactElement} Sidebar with navigation
 */
const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const usuarioActual = readCurrentUser()
  const navigationPermitida = hasFullAccess(usuarioActual)
    ? navigation
    : isOperationalUser(usuarioActual)
      ? navigation.filter((item) => item.to === '/pedidos')
      : []

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom position-relative d-flex justify-content-center align-items-center py-2">
        <CSidebarBrand
        as={Link}
        to="/"
        className="d-flex justify-content-center align-items-center w-100 m-0"
        >
          {/* <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} /> */}
          <img 
            className="sidebar-brand-full" 
            src={miLogo} 
            style={{ height: '45px', width: 'auto', maxWidth: '100%' }} 
            alt="El Cuartel Gestión" 
          />
          {/* <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} /> */}
          <img className="sidebar-brand-narrow" src={miIsotipo} height={32} alt="Isotipo" />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigationPermitida} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
