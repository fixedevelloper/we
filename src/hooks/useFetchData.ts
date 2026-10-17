import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ApiError, apiFetch, type Params } from '@/lib/api/http'

/**
 * Lecture d'une ressource de l'API Spring (corps JSON direct, erreurs problem+json).
 * `refetch(params)` relit avec d'autres paramètres ; `error` est une `ApiError`.
 * La première lecture attend le jeton de session (sans jeton l'API répondrait 401).
 */
export function useFetchData<DataType>(endpoint: string, initialParams: Params = {}, enabled = true) {
  const { data: session, status } = useSession()
  const token = session?.accessToken
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const lastCall = useRef(0)

  const fetchData = useCallback(
    async (params: Params = initialParams) => {
      if (!token) return
      const call = ++lastCall.current
      try {
        setLoading(true)
        setError(null)
        const result = await apiFetch<DataType>(endpoint, { token, params })
        if (call === lastCall.current) setData(result) // une réponse plus ancienne ne remplace pas la plus récente
      } catch (err) {
        if (call === lastCall.current) setError(err as Error)
      } finally {
        if (call === lastCall.current) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, JSON.stringify(initialParams), token],
  )

  // Relit à chaque changement d'adresse, de paramètres ou de jeton : les appelants n'ont pas à appeler refetch pour cela.
  const paramsKey = JSON.stringify(initialParams)
  useEffect(() => {
    if (enabled && status === 'authenticated') fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, status, token, endpoint, paramsKey])

  return { data, loading, error, refetch: fetchData }
}
