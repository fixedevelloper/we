/**
 * Restrictions de routes par rôle, appliquées côté serveur par le middleware
 * (le masquage du menu seul ne protège rien : un utilisateur peut taper l'URL).
 *
 * Une route absente de cette liste reste accessible à tout utilisateur authentifié.
 * `roles` doit contenir les valeurs renvoyées par l'API dans `session.user.roles`
 * (comparées en minuscules ; une liste « admin,support » est découpée sur virgules/espaces).
 *
 * Exemple :
 *   { prefix: '/manage-token', roles: ['admin'] },
 *   { prefix: '/audits', roles: ['admin', 'support'] },
 */
/**
 * Rôles du personnel (valeurs de l'API : SUPPORT, ADMIN, SUPER_ADMIN, comparées en minuscules). Le détail des droits est
 * appliqué par l'API (permissions) : l'interface masque seulement ce que l'API refuserait.
 */
export const BACKOFFICE_ROLES = ['support', 'admin', 'super_admin']

/** Vrai si l'utilisateur a au moins un rôle d'administration. */
export const isBackofficeUser = (userRoles: unknown): boolean =>
  parseRoles(userRoles).some((r) => BACKOFFICE_ROLES.includes(r))

export const ROUTE_ROLES: Array<{ prefix: string; roles: string[] }> = []

export const parseRoles = (value: unknown): string[] =>
  typeof value === 'string'
    ? value.split(/[,\s]+/).map((r) => r.trim().toLowerCase()).filter(Boolean)
    : Array.isArray(value)
      ? value.map((r) => String(r).toLowerCase())
      : []

/** Vrai si la route n'est pas restreinte, ou si l'un des rôles de l'utilisateur est autorisé. */
export const isRoleAllowed = (pathname: string, userRoles: unknown): boolean => {
  const rule = ROUTE_ROLES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(prefix.endsWith('/') ? prefix : prefix + '/'),
  )
  if (!rule) return true
  const roles = parseRoles(userRoles)
  return rule.roles.some((r) => roles.includes(r.toLowerCase()))
}
