'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useMemo, useState } from 'react'
import { Card, CardHeader, Table } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '../../../../(other)/api/Constant'

type Item = { id: number; name: string; shortCode?: string; supportsPayout?: boolean; supportsPayin?: boolean }

/** Villes d'un pays (le segment d'URL est le code ISO du pays). */
const Page: React.FC = () => {
  const [search, setSearch] = useState('')
  const code = (useParams()?.id as string)?.toUpperCase()
  const { data, loading, error } = useFetchData<Item[]>(`${API_ENDPOINTS.COUNTRIES}/${code}/cities`, {}, Boolean(code))
  const items = useMemo(() => (data ?? []).filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase())), [data, search])

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Villes · {code}</h4>
        </div>
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
                <th>Nom</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">Aucun résultat.</td>
                </tr>
              )}
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
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
