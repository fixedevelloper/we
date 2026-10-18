'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useMemo, useState } from 'react'
import { Badge, Button, Card, CardHeader, Table } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCountryNames } from '@/hooks/useCountryNames'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import { ApiError } from '@/lib/api/http'
import type { Country } from '@/lib/api/types'
import API_ENDPOINTS from '../../../../(other)/api/Constant'

type Item = { id: number; name: string; shortCode?: string; supportsPayout?: boolean; supportsPayin?: boolean }

/** Opérateurs mobiles d'un pays (le segment d'URL est le code ISO du pays). */
const Page: React.FC = () => {
  const countryName = useCountryNames()
  const [search, setSearch] = useState('')
  const code = (useParams()?.id as string)?.toUpperCase()
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [syncing, setSyncing] = useState(false)
  const { data, loading, error, refetch } = useFetchData<Item[]>(`${API_ENDPOINTS.COUNTRIES}/${code}/mobile-operators`, {}, Boolean(code))
  const countries = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)
  const canReceive = countries.data?.find((c) => c.code === code)?.canReceive

  /** L'import (permission REFERENCE_WRITE) crée les opérateurs proposés par Wace et renseigne leur code payeur ; il ne supprime rien. */
  const sync = async () => {
    if (!window.confirm(`Importer depuis Wace les opérateurs mobiles de ${countryName(code)} ?`)) return
    setSyncing(true)
    try {
      const r = await api.post<{ operators?: number; payerCodes?: number; warnings?: string[] }>(`${API_ENDPOINTS.REFERENCE_SYNC}?countryCode=${code}`)
      showNotification({
        message: `${r.operators ?? 0} opérateur(s) créé(s), ${r.payerCodes ?? 0} code(s) payeur renseigné(s).${r.warnings?.length ? ` ${r.warnings.length} avertissement(s) : ${r.warnings.slice(0, 3).join(' ; ')}` : ''}`,
        variant: r.warnings?.length ? 'warning' : 'success',
      })
      await refetch()
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setSyncing(false)
    }
  }
  const items = useMemo(() => (data ?? []).filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase())), [data, search])

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Opérateurs mobiles · {countryName(code)}</h4>
          {data && <small className="text-muted">{items.length} résultat{items.length > 1 ? 's' : ''}</small>}
        </div>
        {canReceive && (
          <Button variant="outline-primary" disabled={syncing} onClick={sync}>
            <IconifyIcon icon="ri:refresh-line" className="me-1" />
            {syncing ? 'Import...' : 'Synchroniser avec Wace'}
          </Button>
        )}
        <Link href="/countries" className="btn btn-outline-secondary">
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Pays
        </Link>
        <div className="position-relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Rechercher..." />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover text-nowrap mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Nom</th><th>Code court</th><th>Versement</th><th>Encaissement</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    {search ? 'Aucun résultat' : canReceive ? 'Aucun opérateur. Lancez la synchronisation avec Wace pour les importer.' : "Aucun opérateur : ce pays ne reçoit pas de transferts."}
                  </td>
                </tr>
              )}
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td><td>{i.shortCode || '-'}</td><td><Badge bg={i.supportsPayout ? 'success' : 'secondary'}>{i.supportsPayout ? 'Oui' : 'Non'}</Badge></td><td><Badge bg={i.supportsPayin ? 'success' : 'secondary'}>{i.supportsPayin ? 'Oui' : 'Non'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export default Page
