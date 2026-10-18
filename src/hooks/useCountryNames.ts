import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import type { Country } from '@/lib/api/types'

/** « CM » → « Cameroun » une fois la liste des pays chargée ; le code lui-même d'ici là (ou si le pays est inconnu). */
export function useCountryNames() {
  const { data } = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)
  return (code?: string | null): string => (code ? (data?.find((c) => c.code === code)?.name ?? code) : '-')
}
