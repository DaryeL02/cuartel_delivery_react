import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownHeader,
} from '@coreui/react'
import { cilUser, cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

import api from '../../views/components/api/api'

import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleLogout = async () => {
    try {
      await api.post('/api/logout/')

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: 'set', user: null, isAuthenticated: false })
      navigate('/authentication/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      if (error.response?.status === 409) {
        toast.warning(error.response.data.detail)
      } else {
        toast.error('No se pudo cerrar la sesión.')
      }
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
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Configuración
        </CDropdownHeader>
        <CDropdownItem onClick={handleNavigate} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Perfil
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
