# CoreUI Free React Admin Template - Guía de Desarrollo

Una guía exhaustiva para desarrolladores que trabajan con el CoreUI Free React Admin Template. Esta guía cubre la configuración, los flujos de trabajo de desarrollo, los patrones comunes y las mejores prácticas.

## Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Primeros Pasos](#primeros-pasos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujo de Trabajo de Desarrollo](#flujo-de-trabajo-de-desarrollo)
- [Creación de Componentes](#creación-de-componentes)
- [Añadir Nuevas Páginas](#añadir-nuevas-páginas)
- [Trabajar con Rutas](#trabajar-con-rutas)
- [Gestión de Estado](#gestión-de-estado)
- [Estilizar Componentes](#estilizar-componentes)
- [Trabajar con Formularios](#trabajar-con-formularios)
- [Visualización de Datos](#visualización-de-datos)
- [Calidad del Código](#calidad-del-código)
- [Pruebas](#pruebas)
- [Construcción y Despliegue](#construcción-y-despliegue)
- [Resolución de Problemas](#resolución-de-problemas)
- [Mejores Prácticas](#mejores-prácticas)

## Prerrequisitos

### Software Requerido

- **Node.js**: Versión 16 o superior (se recomienda 18+)
- **npm**: Versión 7+ o **yarn**: Versión 1.22+
- **Git**: Para el control de versiones

### Herramientas Recomendadas

- **Visual Studio Code** con las siguientes extensiones:
  - ESLint
  - Prettier
  - ES7+ React/Redux/React-Native snippets
  - Auto Import
  - GitLens
- Extensión de navegador **React Developer Tools**
- Extensión de navegador **Redux DevTools**

### Conocimientos Requeridos

- Características de JavaScript ES6+ (funciones flecha, desestructuración, módulos)
- Fundamentos de React (componentes, hooks, props, estado)
- HTML5 y CSS3
- Conceptos básicos de Sass/SCSS
- Control de versiones con Git

## Primeros Pasos

### Instalación

1. **Clonar el repositorio** (o descargar el código fuente):
```bash
git clone https://github.com/coreui/coreui-free-react-admin-template.git
cd coreui-free-react-admin-template
```

2. **Instalar las dependencias**:
```bash
npm install
# o
yarn install
```

3. **Iniciar el servidor de desarrollo**:
```bash
npm start
# o
yarn start
```

4. **Abrir el navegador** en [http://localhost:3000](http://localhost:3000)

El servidor de desarrollo incluye:
- Reemplazo de Módulos en Caliente (HMR - Hot Module Replacement) para actualizaciones instantáneas
- Refresco automático del navegador al cambiar archivos
- Superposición de errores para fallos en tiempo de compilación y ejecución

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo en el puerto 3000 |
| `npm run build` | Construye el paquete de producción optimizado |
| `npm run serve` | Previsualiza la construcción de producción localmente |
| `npm run lint` | Ejecuta ESLint para comprobar la calidad del código |

## Estructura del Proyecto

### Organización del Código Fuente

**IMPORTANTE**: Edita siempre los archivos fuente en `src/`, nunca modifiques los archivos compilados en `build/`.

```
src/
├── assets/          # Activos estáticos (imágenes, logotipos)
├── components/      # Componentes de IU reutilizables
├── layout/          # Componentes contenedores de diseño (Layout wrappers)
├── views/           # Componentes de página/ruta
├── scss/            # Estilos globales y temas
├── App.jsx          # Componente raíz con enrutamiento
├── index.jsx        # Punto de entrada de la aplicación
├── routes.js        # Definiciones de rutas
├── _nav.jsx         # Configuración del menú de navegación
└── store.js         # Configuración de la tienda Redux (store)
```

### Archivos Clave

- **`App.jsx`**: Componente principal de la aplicación, configuración de enrutamiento e inicialización del tema
- **`index.jsx`**: Renderizado de ReactDOM, configuración del Provider y conexión de la tienda (store)
- **`routes.js`**: Matriz de configuraciones de rutas para las rutas protegidas
- **`_nav.jsx`**: Estructura del menú de navegación para la barra lateral (sidebar)
- **`store.js`**: Tienda Redux con el estado global (tema, sidebar)

## Flujo de Trabajo de Desarrollo

### Proceso de Desarrollo Diario

1. **Iniciar el servidor de desarrollo**: `npm start`
2. **Realizar cambios** en los archivos fuente dentro de `src/`
3. **Visualizar los cambios** instantáneamente en el navegador (HMR)
4. **Revisar la consola** en busca de errores o advertencias
5. **Ejecutar el linter** antes de hacer un commit: `npm run lint`
6. **Probar en ambos temas** (claro y oscuro)
7. **Confirmar los cambios (commit)** utilizando mensajes de commits convencionales

### Reemplazo de Módulos en Caliente (HMR)

Vite proporciona retroalimentación instantánea:
- **Cambios en JavaScript/JSX**: El componente se actualiza sin recargar la página
- **Cambios en CSS/SCSS**: Los estilos se actualizan sin recargar la página
- **Cambios de configuración**: Requieren reiniciar el servidor

### Características del Servidor de Desarrollo

**Puerto**: 3000 (configurable en `vite.config.mjs`)

**Características**:
- Arranque en frío rápido (~500ms)
- HMR instantáneo (<50ms)
- Superposición de errores con trazas de la pila (stack traces)
- Acceso a la red para pruebas en dispositivos móviles

**Acceso desde el móvil**:
```bash
# Encuentra tu IP local
# Windows: ipconfig
# Mac/Linux: ifconfig

# Accede desde el dispositivo móvil:
http://192.168.1.X:3000
```

## Creación de Componentes

### Estructura de un Componente

**Componentes funcionales con Hooks**:

```javascript
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

/**
 * El componente UserCard muestra información del usuario en un formato de tarjeta
 * @param {Object} props - Props del componente
 * @param {string} props.name - Nombre completo del usuario
 * @param {string} props.email - Correo electrónico del usuario
 * @param {string} [props.avatar] - URL opcional del avatar
 */
const UserCard = ({ name, email, avatar }) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Lógica del ciclo de vida del componente
    console.log('UserCard montado')

    return () => {
      // Lógica de limpieza (cleanup)
      console.log('UserCard desmontado')
    }
  }, [])

  return (
    <CCard>
      <CCardHeader>{name}</CCardHeader>
      <CCardBody>
        {avatar && <img src={avatar} alt={name} />}
        <p>{email}</p>
      </CCardBody>
    </CCard>
  )
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  avatar: PropTypes.string,
}

UserCard.defaultProps = {
  avatar: null,
}

export default UserCard
```

### Mejores Prácticas para Componentes

1. **Mantener los componentes enfocados**: Una sola responsabilidad por componente
2. **Usar PropTypes**: Validar todas las props para la verificación de tipos en tiempo de ejecución
3. **Proporcionar props por defecto**: Definir valores predeterminados sensatos
4. **Añadir comentarios JSDoc**: Documentar el propósito del componente y sus props
5. **Extraer la lógica**: Utilizar hooks personalizados para la lógica reutilizable
6. **Nombrar de manera significativa**: Nombres de componentes claros y descriptivos

### Hooks Personalizados

Extrae la lógica reutilizable en hooks personalizados:

```javascript
import { useState, useEffect } from 'react'

/**
 * Hook personalizado para obtener datos de una API
 * @param {string} url - URL del endpoint de la API
 * @returns {Object} { data, loading, error }
 */
const useFetch = (url) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(url)
        const json = await response.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

export default useFetch
```

**Uso**:
```javascript
const MyComponent = () => {
  const { data, loading, error } = useFetch('/api/users')

  if (loading) return <CSpinner />
  if (error) return <div>Error: {error}</div>

  return <div>{JSON.stringify(data)}</div>
}
```

## Añadir Nuevas Páginas

### Proceso Paso a Paso

**1. Crear el componente de la página** en `src/views/[feature]/`:

```javascript
// src/views/products/Products.js
import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'

const Products = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Products</strong>
          </CCardHeader>
          <CCardBody>
            {/* Tu contenido aquí */}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Products
```

**2. Añadir la ruta a `src/routes.js`**:

```javascript
import React from 'react'

const Products = React.lazy(() => import('./views/products/Products'))

const routes = [
  // ... rutas existentes
  { path: '/products', name: 'Products', element: Products },
]

export default routes
```

**3. Añadir el elemento de navegación a `src/_nav.jsx`** (opcional):

```javascript
import { cilBasket } from '@coreui/icons'

export default [
  // ... elementos existentes
  {
    component: CNavItem,
    name: 'Products',
    to: '/products',
    icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
  },
]
```

**4. Probar la página**:
- Navega a `http://localhost:3000/#/products`
- Comprueba que la navegación se resalta correctamente
- Verifica que las migas de pan (breadcrumb) se muestren adecuadamente

### Plantillas de Página

**Página de Lista (List Page)**:
```javascript
const ListPage = () => {
  const [items, setItems] = useState([])

  useEffect(() => {
    // Obtener elementos
  }, [])

  return (
    <CCard>
      <CCardHeader>Items</CCardHeader>
      <CCardBody>
        <CTable>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.map(item => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>{item.status}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}
```

**Página de Detalle (Detail Page)**:
```javascript
const DetailPage = () => {
  const { id } = useParams()
  const [item, setItem] = useState(null)

  useEffect(() => {
    // Obtener elemento por id
  }, [id])

  if (!item) return <CSpinner />

  return (
    <CCard>
      <CCardHeader>{item.name}</CCardHeader>
      <CCardBody>
        <p>{item.description}</p>
      </CCardBody>
    </CCard>
  )
}
```

## Trabajar con Rutas

### Configuración de Rutas

Las rutas se definen en `src/routes.js`:

```javascript
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: Users, exact: true },
  { path: '/users/:id', name: 'User Details', element: UserDetail },
]
```

### Rutas Dinámicas

**With URL parameters (Con parámetros de URL)**:

```javascript
// Definición de la ruta
{ path: '/products/:id', name: 'Product Detail', element: ProductDetail }

// Uso en el componente
import { useParams } from 'react-router-dom'

const ProductDetail = () => {
  const { id } = useParams()

  return <div>Product ID: {id}</div>
}
```

### Navegación Programática

**Utilizando el hook useNavigate**:

```javascript
import { useNavigate } from 'react-router-dom'

const MyComponent = () => {
  const navigate = useNavigate()

  const goToProducts = () => {
    navigate('/products')
  }

  const goBack = () => {
    navigate(-1) // Regresar una página
  }

  return (
    <>
      <CButton onClick={goToProducts}>View Products</CButton>
      <CButton onClick={goBack}>Go Back</CButton>
    </>
  )
}
```

### Rutas Protegidas

Añade la lógica de autenticación en `DefaultLayout.js`:

```javascript
const DefaultLayout = () => {
  const isAuthenticated = useSelector((state) => state.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div>
      {/* Contenido del diseño */}
    </div>
  )
}
```

## Gestión de Estado

### Usando Redux

**Lectura del estado** con useSelector:

```javascript
import { useSelector } from 'react-redux'

const MyComponent = () => {
  const theme = useSelector((state) => state.theme)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return <div>Theme: {theme}</div>
}
```

**Actualización del estado** con useDispatch:

```javascript
import { useDispatch } from 'react-redux'

const MyComponent = () => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch({ type: 'set', theme: 'dark' })
  }

  return <CButton onClick={handleClick}>Dark Mode</CButton>
}
```

### Estado Local del Componentes

**useState para estados simples**:

```javascript
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
const [formData, setFormData] = useState({ name: '', email: '' })
```

**useReducer para estados complejos**:

```javascript
const initialState = { count: 0, step: 1 }

const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    default:
      return state
  }
}

const Counter = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <>
      <p>Count: {state.count}</p>
      <CButton onClick={() => dispatch({ type: 'increment' })}>+</CButton>
      <CButton onClick={() => dispatch({ type: 'decrement' })}>-</CButton>
    </>
  )
}
```

## Estilizar Componentes

### Uso de los Componentes CoreUI

**Usa SIEMPRE los componentes de CoreUI React** de `@coreui/react`:

```javascript
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'

const MyComponent = () => (
  <CRow>
    <CCol md={6}>
      <CCard>
        <CCardHeader>Card Title</CCardHeader>
        <CCardBody>
          <CButton color="primary">Click Me</CButton>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
)
```

### Utilidades de Bootstrap

Usa las clases de utilidad de Bootstrap para un estilizado rápido:

```javascript
<CCard className="mb-4 shadow-sm">
  <CCardBody className="p-4 d-flex justify-content-between align-items-center">
    <span className="text-muted">Left</span>
    <span className="fw-bold">Right</span>
  </CCardBody>
</CCard>
```

**Utilidades comunes**:
- Espaciado: `m-3`, `mt-2`, `mb-4`, `p-3`, `px-4`, `py-2`
- Despliegue (Display): `d-flex`, `d-none`, `d-block`, `d-inline`
- Flexbox: `justify-content-between`, `align-items-center`
- Texto: `text-center`, `text-muted`, `fw-bold`, `fs-5`

### Estilos Personalizados

**SCSS a nivel de componente**:

```javascript
// MyComponent.js
import './MyComponent.scss'

const MyComponent = () => (
  <div className="my-component">
    <h1 className="my-component__title">Title</h1>
  </div>
)
```

```scss
// MyComponent.scss
.my-component {
  padding: 1rem;
  background-color: var(--cui-light);

  &__title {
    color: var(--cui-primary);
    font-size: 1.5rem;
  }
}
```

### Propiedades Personalizadas de CSS

Usa las variables CSS de CoreUI para la gestión de temas:

```javascript
<div style={{
  backgroundColor: 'var(--cui-primary)',
  color: 'var(--cui-white)',
  padding: 'var(--cui-spacer-3)',
}}>
  Styled with CSS variables
</div>
```

**Variables comunes**:
- Colores: `--cui-primary`, `--cui-secondary`, `--cui-success`, `--cui-danger`
- Fondo: `--cui-body-bg`, `--cui-light`, `--cui-dark`
- Texto: `--cui-body-color`, `--cui-text-muted`
- Espaciado: desde `--cui-spacer-1` hasta `--cui-spacer-5`

### Estilizado Condicional

Usa la utilidad `classnames`:

```javascript
import classNames from 'classnames'

const MyComponent = ({ isActive, isPrimary }) => {
  const buttonClass = classNames('btn', {
    'btn-primary': isPrimary,
    'btn-secondary': !isPrimary,
    'active': isActive,
  })

  return <button className={buttonClass}>Button</button>
}
```

## Trabajar con Formularios

### Ejemplo de Componente de Formulario

```javascript
import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
} from '@coreui/react'

const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [validated, setValidated] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (form.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }

    // Enviar datos del formulario
    console.log('Form data:', formData)
  }

  return (
    <CCard>
      <CCardHeader>Contact Form</CCardHeader>
      <CCardBody>
        <CForm
          className="row g-3"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CCol md={6}>
            <CFormLabel htmlFor="name">Name</CFormLabel>
            <CFormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel htmlFor="email">Email</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol xs={12}>
            <CFormLabel htmlFor="message">Message</CFormLabel>
            <CFormTextarea
              id="message"
              name="message"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol xs={12}>
            <CButton color="primary" type="submit">
              Submit
            </CButton>
          </CCol>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default MyForm
```

### Validación de Formularios

**Validación HTML5**:
```javascript
<CFormInput
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
/>
```

**Validación personalizada**:
```javascript
const [errors, setErrors] = useState({})

const validate = () => {
  const newErrors = {}

  if (!formData.name) {
    newErrors.name = 'Name is required'
  }

  if (!formData.email.includes('@')) {
    newErrors.email = 'Invalid email address'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = (e) => {
  e.preventDefault()

  if (validate()) {
    // Enviar formulario
  }
}
```

## Visualización de Datos

### Uso de Chart.js con CoreUI

```javascript
import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'

const Dashboard = () => {
  return (
    <CCard>
      <CCardHeader>Sales Overview</CCardHeader>
      <CCardBody>
        <CChartLine
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
              {
                label: 'Sales 2024',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderColor: 'rgba(220, 53, 69, 1)',
                data: [40, 20, 12, 39, 10, 40, 39],
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
              },
            },
          }}
          style={{ height: '300px' }}
        />
      </CCardBody>
    </CCard>
  )
}
```

### Tipos de Gráficos

CoreUI proporciona contenedores (wrappers) de React para Chart.js:

- `CChartLine` - Gráficos de líneas
- `CChartBar` - Gráficos de barras
- `CChartDoughnut` - Gráficos de dona (doughnut)
- `CChartPie` - Gráficos circulares (pie)
- `CChartPolarArea` - Gráficos de área polar
- `CChartRadar` - Gráficos de radar

## Calidad del Código

### Configuración de ESLint

El proyecto utiliza ESLint con plugins de React y Prettier:

```bash
# Comprobar problemas
npm run lint

# Corregir problemas automáticamente (cuando sea posible)
npm run lint -- --fix
```

### Pautas de Estilo de Código

**JavaScript**:
- Sin puntos y comas (enforcado por Prettier)
- Comillas simples para cadenas de texto (strings)
- Indentación de 2 espacios
- Preferencia por funciones flecha
- Desestructuración siempre que sea posible

**React**:
- Únicamente componentes funcionales
- Hooks en el nivel superior
- PropTypes para todos los componentes
- Nombres de componentes significativos

**Nomenclatura de archivos**:
- PascalCase para componentes: `UserCard.js`
- camelCase para utilidades: `dateHelper.js`
- kebab-case para estilos: `user-card.scss`

### Comprobaciones Previas al Commit (Pre-commit Checks)

**Recomendado**: Configurar hooks de pre-commit con Husky:

```bash
npm install --save-dev husky lint-staged

# Añadir a package.json
{
  "lint-staged": {
    "src/**/*.{js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## Pruebas

### Lista de Verificación para Pruebas Manuales

Antes de confirmar (commit) los cambios:

- [ ] Probar en ambos temas: claro y oscuro
- [ ] Probar el diseño responsivo (móvil, tableta, escritorio)
- [ ] Revisar la consola del navegador en busca de errores
- [ ] Verificar que todos los enlaces y la navegación funcionen
- [ ] Probar la validación y el envío de formularios
- [ ] Comprobar la accesibilidad (navegación por teclado, lectores de pantalla)

### Pruebas en Navegadores

Probar en navegadores modernos:
- Chrome (última versión)
- Firefox (última versión)
- Safari (última versión)
- Edge (última versión)

### Pruebas de Responsividad

Probar en las resoluciones y puntos de ruptura comunes:
- Móvil: 375px, 414px
- Tableta: 768px, 1024px
- Escritorio: 1366px, 1920px

**Consejo**: Usa la barra de herramientas de dispositivos de Chrome DevTools (Cmd/Ctrl + Shift + M)

## Construcción y Despliegue

### Construcción para Producción

Crea una construcción de producción optimizada:

```bash
npm run build
```

El resultado se genera en el directorio `build/`:
- Paquetes de JavaScript minificados
- CSS extraído y minificado
- Activos optimizados
- Mapas de fuentes (source maps)

### Análisis de la Construcción

Comprobar el tamaño del paquete:

```bash
npm run build

# La salida muestra:
# - Tamaño total del paquete
# - Tamaños de los fragmentos (chunks) individuales
# - Tamaños de los activos
```

### Previsualizar la Construcción de Producción

Prueba la construcción de producción de forma local:

```bash
npm run serve
```

Abre un servidor de previsualización en `http://localhost:4173`

### Plataformas de Despliegue

**Alojamiento estático** (se construye como archivos estáticos):

1. **Netlify**:
   - Conecta el repositorio de GitHub
   - Comando de construcción: `npm run build`
   - Directorio de publicación: `build`

2. **Vercel**:
   - Importa el repositorio de Git
   - Ajuste preestablecido de framework: Vite
   - Comando de construcción: `npm run build`

3. **GitHub Pages**:
   - Construye localmente: `npm run build`
   - Sube la carpeta `build/` a la rama `gh-pages`

4. **AWS S3 + CloudFront**:
   - Sube el contenido de `build/` a un bucket de S3
   - Configura una distribución de CloudFront

### Variables de Entorno

Crea un archivo `.env` (no incluido en los commits de Git):

```bash
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

**Uso en el código**:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

**IMPORTANTE**: Solo las variables que tienen el prefijo `VITE_` se exponen a la aplicación.

## Resolución de Problemas

### Problemas Comunes

**Problema**: El puerto 3000 ya está en uso

**Solución**:
```bash
# Matar el proceso en el puerto 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambia el puerto en vite.config.mjs
```

---

**Problema**: Errores de módulo no encontrado ("Module not found")

**Solución**:
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

**Problema**: Los estilos no se actualizan

**Solución**:
- Limpiar la caché del navegador
- Refresco forzado (Cmd/Ctrl + Shift + R)
- Reiniciar el servidor de desarrollo

---

**Problema**: HMR no funciona

**Solución**:
- Comprobar que el archivo esté guardado
- Reiniciar el servidor de desarrollo
- Comprobar si hay errores de sintaxis en la consola

---

**Problema**: La construcción falla con un error de memoria

**Solución**:
```bash
# Aumentar el límite de memoria de Node
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Consejos de Depuración

**React DevTools**:
- Inspeccionar la jerarquía de componentes
- Ver props y estado
- Realizar perfiles de renderizado de componentes (profiling)

**Redux DevTools**:
- Inspeccionar el estado de Redux
- Depuración con viajes en el tiempo (time-travel debugging)
- Historial de acciones

**Registro en consola**:
```javascript
console.log('Variable:', variable)
console.table(arrayOfObjects)
console.error('Error:', error)
```

**Límites de errores en React (Error boundaries)**:
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}
```

## Mejores Prácticas

### Rendimiento

1. **Carga perezosa de rutas (Lazy load)**: Usa React.lazy() para la división de código (code splitting)
2. **Memorizar cálculos costosos**: Usa useMemo()
3. **Optimizar renderizados**: Usa React.memo() para componentes puros
4. **Virtualizar listas largas**: Usa librerías como react-window
5. **Optimizar imágenes**: Usa el formato WebP y carga perezosa (lazy loading)

### Accesibilidad

1. **HTML Semántico**: Usa una jerarquía de encabezados adecuada (h1-h6)
2. **Etiquetas ARIA**: Añade aria-label para los botones con iconos
3. **Navegación por teclado**: Asegúrate de que todos los elementos interactivos sean accesibles mediante el teclado
4. **Contraste de color**: Cumplir con los estándares WCAG AA (4.5:1 para texto)
5. **Etiquetas de formulario**: Asocia todos los inputs de formulario con sus respectivas etiquetas (labels)

### Seguridad

1. **Validar entradas**: Sanitiza las entradas del usuario antes de renderizarlas
2. **Usar HTTPS**: Sirve siempre a través de HTTPS en entornos de producción
3. **Política de Seguridad de Contenido (CSP)**: Configura las cabeceras CSP
4. **Auditorías de dependencias**: Ejecuta `npm audit` regularmente
5. **Variables de entorno**: Nunca expongas ni subas secretos a Git

### Organización del Código

1. **Responsabilidad Única**: Un componente hace una sola cosa bien
2. **Principio DRY**: Don't Repeat Yourself (No te repitas) - extrae el código reutilizable
3. **Nomenclatura consistente**: Sigue las convenciones de nombres en todo el proyecto
4. **Organización de archivos**: Agrupa los archivos que estén relacionados entre sí
5. **Documentación**: Añade comentarios en las lógicas complejas y utiliza JSDoc

### Flujo de Trabajo en Git

**Mensajes de commit** (Commits Convencionales):
```
feat: add user profile page
fix: resolve navigation bug on mobile
docs: update README with deployment instructions
style: format code with Prettier
refactor: extract form validation logic
test: add tests for UserCard component
chore: update dependencies
```

**Nomenclatura de ramas (Branches)**:
```
feature/user-profile
fix/navigation-bug
refactor/form-validation
docs/deployment-guide
```

---

Esta guía cubre los flujos de trabajo y patrones esenciales para desarrollar con el CoreUI Free React Admin Template. Para dudas adicionales, consulta la [Documentación de CoreUI React](https://coreui.io/react/docs/) o la [Documentación de React](https://react.dev/).

¡Feliz programación! 🚀