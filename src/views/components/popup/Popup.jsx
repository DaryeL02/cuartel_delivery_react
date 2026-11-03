import React, { useState, useRef } from 'react';
import { 
  CButton, 
  CToast, 
  CToastHeader, 
  CToastBody, 
  CToaster 
} from '@coreui/react';

export default function LoginNotification() {
  const [toast, setToast] = useState(null);
  const toasterRef = useRef();

  // Función que genera el pop-up temporal
  const showLoginSuccessToast = () => {
    const successToast = (
      <CToast 
        color="success" 
        className="text-white" 
        autohide={true} 
        delay={3000} // Duración de 3 segundos (3000ms)
      >
        <CToastHeader closeButton>
          <svg
            className="rounded me-2"
            width="20"
            height="20"
            xmlns="http://w3.org"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
            role="img"
          >
            <rect width="100%" height="100%" fill="#fff" />
          </svg>
          <strong className="me-auto text-dark">Sistema</strong>
        </CToastHeader>
        <CToastBody>¡Login exitoso! Bienvenido de vuelta.</CToastBody>
      </CToast>
    );
    
    setToast(successToast);
  };

  return (
    <div className="p-4">
      {/* Botón que simula la acción de Login */}
      <CButton color="primary" onClick={showLoginSuccessToast}>
        Iniciar Sesión
      </CButton>

      {/* Contenedor posicionado en la esquina superior derecha */}
      <CToaster 
        ref={toasterRef} 
        push={toast} 
        placement="top-end" // "top-end" lo ubica arriba a la derecha
      />
    </div>
  );
}
