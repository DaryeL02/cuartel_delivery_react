/**
 * AppHeader Component
 *
 * Main application header with navigation, theme switcher, and user menu.
 * Features include:
 * - Sidebar toggle button
 * - Search button with keyboard shortcut and recent searches modal
 * - Primary navigation links
 * - Notification and action icons
 * - Theme switcher (light/dark/auto)
 * - User dropdown menu
 * - Breadcrumb navigation
 * - Sticky positioning with scroll shadow effect
 *
 * @component
 * @example
 * return (
 *   <AppHeader />
 * )
 */

import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast, cilMenu, cilMoon, cilSun } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

/**
 * AppHeader functional component
 *
 * Manages header UI including:
 * - Redux integration for sidebar state
 * - Theme management with CoreUI useColorModes hook
 * - Scroll-based shadow effect
 * - Responsive navigation
 *
 * @returns {React.ReactElement} Header component with navigation and controls
 */
const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}')
  const nombreUsuario =
    usuarioActual.empleado?.nombre ||
    usuarioActual.empleado_nombre ||
    usuarioActual.usuario ||
    'Usuario'
  const rolUsuario = usuarioActual.roles_nombres?.[0] || usuarioActual.rol_nombre || 'Sin rol'

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        
        {/* <CSearchButton
          onTrigger={() => setSearchVisible(true)}
          aria-label="Open search dialog"
          aria-controls="app-header-search-modal"
        /> */}

        
        {/* <CModal
          id="app-header-search-modal"
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
          aria-labelledby="app-header-search-modal-title"
        >
          <CModalHeader>
            <CModalTitle id="app-header-search-modal-title" className="w-100">
              <CFormInput type="search" placeholder="Search" aria-label="Search" />
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p className="text-body-secondary small mb-2">Recent searches</p>
            <CListGroup flush>
              <CListGroupItem
                as="button"
                type="button"
                className="d-flex justify-content-between align-items-center"
              >
                CoreUI components overview
                <CBadge color="secondary" shape="rounded-pill">
                  Open
                </CBadge>
              </CListGroupItem>
              <CListGroupItem
                as="button"
                type="button"
                className="d-flex justify-content-between align-items-center"
              >
                Modal dialog examples
                <CBadge color="secondary" shape="rounded-pill">
                  Open
                </CBadge>
              </CListGroupItem>
              <CListGroupItem
                as="button"
                type="button"
                className="d-flex justify-content-between align-items-center"
              >
                Sidebar navigation customization
                <CBadge color="secondary" shape="rounded-pill">
                  Open
                </CBadge>
              </CListGroupItem>
            </CListGroup>
          </CModalBody>
        </CModal>
         */}
        
        {/* Botones */}

        {/* <CHeaderNav className="ms-auto">
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav> */}

        {/* Agregué la clase para que los botones se acomoden automaticamente */}
        <CHeaderNav className="ms-auto"> 
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          <li className="nav-item d-flex align-items-center px-2 text-body-secondary text-nowrap">
            {nombreUsuario} - {rolUsuario}
          </li>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>

          {/* Dropdown para el modo oscuro y claro */}

          <CDropdown variant="nav-item" placement="bottom-end">

            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>

            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          
          </CDropdown>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      {/* <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer> */}
    </CHeader>
  )
}

export default AppHeader
