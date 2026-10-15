/**
 * Retourne un chemin interne sûr pour une redirection post-login.
 * Refuse les URLs absolues, protocol-relative (//host), les schémas (javascript:, https:)
 * et les backslashes, qui permettent de rediriger vers un site externe.
 */
export const safeRedirectPath = (value: string | null | undefined, fallback = '/dashboard'): string => {
  if (!value || typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(value)) return fallback

  try {
    const base = 'http://internal.invalid'
    const url = new URL(value, base)
    if (url.origin !== base) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
