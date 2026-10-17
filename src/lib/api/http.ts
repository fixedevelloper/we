/**
 * Client HTTP du back-office pour l'API Spring (contrat `wtc-spring/api/openapi.yaml`).
 * - base unique `/api` ; jeton Bearer ;
 * - erreurs `application/problem+json` -> `ApiError` (se brancher sur `code`) ;
 * - corps JSON direct (plus d'enveloppe `{status, data}`).
 */
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
export const API_BASE = `${API_ORIGIN.replace(/\/+$/, '')}/api`

export type FieldError = { field: string; code?: string; message: string }

/** Erreur applicative renvoyée par l'API (RFC 9457). */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly title: string
  readonly fieldErrors: FieldError[]

  constructor(status: number, code: string, title: string, detail?: string, fieldErrors: FieldError[] = []) {
    super(detail || title)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.title = title
    this.fieldErrors = fieldErrors
  }

  /** Message lisible, avec le détail des champs invalides. */
  get fullMessage(): string {
    if (!this.fieldErrors.length) return this.message
    return `${this.message} (${this.fieldErrors.map((f) => `${f.field} : ${f.message}`).join(' ; ')})`
  }
}

export type Params = Record<string, string | number | boolean | null | undefined>

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  token?: string | null
  params?: Params
  body?: unknown
  /** En-tête Idempotency-Key des opérations d'argent (UUID, un par intention de l'utilisateur). */
  idempotencyKey?: string
  signal?: AbortSignal
}

export const buildUrl = (path: string, params?: Params): string => {
  // Un chemin complet (API_ENDPOINTS) est utilisé tel quel ; un chemin relatif part de la base `/api`.
  const url = new URL(/^https?:\/\//.test(path) ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`)
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  })
  return url.toString()
}

const toApiError = async (res: Response): Promise<ApiError> => {
  let body: any = null
  try {
    body = await res.json()
  } catch {
    // corps vide ou non JSON
  }
  const errors: FieldError[] = Array.isArray(body?.errors)
    ? body.errors.map((e: any) => ({ field: String(e.field ?? ''), code: e.code, message: String(e.message ?? e.code ?? '') }))
    : []
  return new ApiError(
    res.status,
    body?.code ?? (res.status === 401 ? 'UNAUTHENTICATED' : 'HTTP_' + res.status),
    body?.title ?? res.statusText ?? 'Erreur',
    body?.detail,
    errors,
  )
}

/** Appelle l'API ; renvoie le JSON, ou `undefined` pour une réponse sans contenu (204). */
export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey
  const res = await fetch(buildUrl(path, options.params), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
    cache: 'no-store',
  })
  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Télécharge un fichier binaire (reçu PDF, document KYC) avec le jeton. */
export async function apiBlob(path: string, token: string): Promise<Blob> {
  const res = await fetch(buildUrl(path), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!res.ok) throw await toApiError(res)
  return res.blob()
}

/** UUID v4 pour Idempotency-Key. */
export const newIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })
