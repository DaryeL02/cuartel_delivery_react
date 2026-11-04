import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

import api from '../../views/components/api/api'

import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

const AppHeaderDropdown = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      // 1. Si tu backend invalida tokens, haz la petición aquí:
      // await api.post('/logout')

      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // 3. Remueve el token de los headers por defecto
      // setAuthToken(null)

      // 4. Limpia el estado global de Redux de CoreUI
      // Tu template usa una acción genérica 'set'. Reseteamos valores si guardabas datos de auth ahí.
      dispatch({ type: 'set', user: null, isAuthenticated: false }) 

      // 5. Redirecciona al flujo público (Login)
      navigate('/authentication/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleNavigate = () => {
    navigate('/perfil')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem onClick={handleNavigate} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" onClick={handleNavigate} />
          Perfil
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Configuración
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Pagos
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilFile} className="me-2" />
          Proyectos
          <CBadge color="primary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem 
          component="button" 
          onClick={handleLogout}
          className="me-2 text-danger"
        >
          <CIcon icon={cilAccountLogout} className="me-2 text-danger" />
          Cerrar Sesión
        </CDropdownItem>

      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
