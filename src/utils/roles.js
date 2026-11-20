const FULL_ACCESS_ROLES = new Set(['administrador', 'dueno'])
const OPERATIONAL_ROLES = new Set(['mozo', 'cadete', 'ayudante de cocina', 'planchero'])

const normalizeRole = (role) =>
  String(role || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase()

export const getUserRoles = (user) => {
  const roles = [
    ...(Array.isArray(user?.roles_nombres) ? user.roles_nombres : []),
    user?.rol_nombre,
  ]
  return new Set(roles.filter(Boolean).map(normalizeRole))
}

export const hasFullAccess = (user) =>
  Boolean(user?.is_superuser) || [...getUserRoles(user)].some((role) => FULL_ACCESS_ROLES.has(role))

export const isOperationalUser = (user) =>
  !hasFullAccess(user) && [...getUserRoles(user)].some((role) => OPERATIONAL_ROLES.has(role))

export const readCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}
