'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useMemo, useState } from 'react'
import { Badge, Button, Card, CardHeader, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Table } from 'react-bootstrap'
import Link from 'next/link'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'
import type { Country } from '@/lib/api/types'

const CountryCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const { data, loading, error } = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)

  const countries = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [data, search])

  /** Importe depuis Wace les banques, codes payeurs et libellés (permission REFERENCE_WRITE). */
  const sync = async () => {
    if (!window.confirm('Importer les banques, codes payeurs et libellés depuis Wace ?')) return
    setSyncing(true)
    try {
      const r = await api.post<{ banks?: number; payerCodes?: number; referenceValues?: number; warnings?: string[] }>(API_ENDPOINTS.REFERENCE_SYNC)
      showNotification({
        message: `Import terminé : ${r.banks ?? 0} banques, ${r.payerCodes ?? 0} codes payeurs, ${r.referenceValues ?? 0} libellés.${r.warnings?.length ? ` ${r.warnings.length} avertissement(s) : ${r.warnings.slice(0, 3).join(' ; ')}` : ''}`,
        variant: r.warnings?.length ? 'warning' : 'success',
      })
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Pays</h4>
        </div>
        <Button variant="outline-primary" disabled={syncing} onClick={sync}>
          <IconifyIcon icon="ri:refresh-line" className="me-1" />
          Importer depuis Wace
        </Button>
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
                <th>Code</th>
                <th>Nom</th>
                <th>Devise</th>
                <th>Indicatif</th>
                <th>Envoi / réception</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.code}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.currencyCode}</td>
                  <td>{c.callingCode || '-'}</td>
                  <td>
                    {c.canSend && <Badge bg="info" className="me-1">Envoi</Badge>}
                    {c.canReceive && <Badge bg="success">Réception</Badge>}
                  </td>
                  <td className="pe-3 text-center">
                    <Dropdown>
                      <DropdownToggle className="btn btn-secondary btn-sm" />
                      <DropdownMenu>
                        <DropdownItem as={Link} href={`/countries/cities/${c.code}`}>Villes</DropdownItem>
                        <DropdownItem as={Link} href={`/countries/banks/${c.code}`}>Banques</DropdownItem>
                        <DropdownItem as={Link} href={`/countries/operators/${c.code}`}>Opérateurs mobiles</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export default CountryCard
