import {useCallback, useEffect, useMemo, useState} from 'react'
import {useSession} from "next-auth/react";
import {HeadersInit} from "undici-types";

/*export const useFetchData = <DataType>(fn: () => Promise<DataType>) => {
  const [data, setData] = useState<DataType>()
  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await fn()
      setData(fetchedData)
    }
    fetchData()
  }, [])

  return data
}*/
// 🔹 Hook générique

export function useFetchData<DataType>(
    endpoint: string,
    queryParams: Record<string, any> = {},
    options: RequestInit = {}
) {
  const { data: session } = useSession();
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 🔹 Memoize pour éviter la recréation d'objet à chaque render
  const memoizedQueryParams = useMemo(() => queryParams, [JSON.stringify(queryParams)]);
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const url = new URL(endpoint);
      Object.entries(memoizedQueryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "")
          url.searchParams.append(key, String(value));
      });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...memoizedOptions.headers,
      };

      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }

      const res = await fetch(url.toString(), { ...memoizedOptions, headers });

      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, memoizedQueryParams, memoizedOptions, session?.accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
