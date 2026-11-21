import React from 'react'

const MenuDesglose = ({ menu }) => {
  if (!menu) return null

  const componentes = menu.detalles || menu.detalle_menu || []

  return (
    <div className="small text-body-secondary mt-1">
      <span className="fw-semibold">Incluye:</span>
      {componentes.length ? (
        <ul className="mb-0 ps-3">
          {componentes.map((componente, index) => {
            const articulo =
              componente.producto_data ||
              componente.bebida_data ||
              componente.producto ||
              componente.bebida
            const nombre =
              articulo?.nombre ||
              `${componente.bebida || componente.bebida_data ? 'Bebida' : 'Producto'}`

            return (
              <li key={componente.id_detalles_menus || `${nombre}-${index}`}>
                {componente.cantidad} × {nombre}
              </li>
            )
          })}
        </ul>
      ) : (
        <span className="ms-1">Sin artículos disponibles.</span>
      )}
    </div>
  )
}

export default MenuDesglose
