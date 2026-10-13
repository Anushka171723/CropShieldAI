// Roles are assigned by the server. The frontend only reads them to decide which screens to show;
// the backend must still enforce authorization on every request.
export const ROLES = {
  FARMER: 'FARMER',
  EXPERT: 'EXPERT',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
}

export const ROLE_HOME = {
  FARMER: '/farmer/dashboard',
  EXPERT: '/expert/dashboard',
  OFFICER: '/officer/dashboard',
  ADMIN: '/admin/dashboard',
}

export const ROLE_BASE = {
  FARMER: '/farmer',
  EXPERT: '/expert',
  OFFICER: '/officer',
  ADMIN: '/admin',
}

export const ROLE_LABEL = {
  FARMER: 'Farmer',
  EXPERT: 'Agricultural expert',
  OFFICER: 'Agricultural officer',
  ADMIN: 'Administrator',
}

export const isKnownRole = (role) => Object.hasOwn(ROLE_HOME, role)

// After login, return to the page the user originally wanted, but only if it belongs to their own role area.
export function getPostLoginPath(role, from) {
  const base = ROLE_BASE[role]
  const target = from ? `${from.pathname}${from.search || ''}` : null
  if (target && base && (target === base || target.startsWith(`${base}/`))) return target
  return ROLE_HOME[role] || '/'
}
