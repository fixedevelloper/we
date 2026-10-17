import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { apiBlob, apiFetch, type Params } from '@/lib/api/http'

/** Appels de modification (POST/PUT/PATCH/DELETE) avec le jeton de la session. */
export function useApi() {
  const { data: session } = useSession()
  const token = session?.accessToken
  return useMemo(
    () => ({
      get: <T,>(path: string, params?: Params) => apiFetch<T>(path, { token, params }),
      post: <T,>(path: string, body?: unknown, idempotencyKey?: string) =>
        apiFetch<T>(path, { method: 'POST', token, body, idempotencyKey }),
      put: <T,>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PUT', token, body }),
      patch: <T,>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', token, body }),
      delete: <T,>(path: string) => apiFetch<T>(path, { method: 'DELETE', token }),
      blob: (path: string) => apiBlob(path, token ?? ''),
      token,
    }),
    [token],
  )
}
