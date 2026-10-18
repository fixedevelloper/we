'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useMemo, useState } from 'react'
import { Button, Card, CardHeader, Form, Table } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCountryNames } from '@/hooks/useCountryNames'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import { ApiError } from '@/lib/api/http'
import API_ENDPOINTS from '../../../../(other)/api/Constant'

type Item = { id: number; name: string; shortCode?: string; supportsPayout?: boolean; supportsPayin?: boolean }

/** Villes d'un pays (le segment d'URL est le code ISO du pays). */
const Page: React.FC = () => {
  const countryName = useCountryNames()
  const [search, setSearch] = useState('')
  const code = (useParams()?.id as string)?.toUpperCase()
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const { data, loading, error, refetch } = useFetchData<Item[]>(`${API_ENDPOINTS.COUNTRIES}/${code}/cities`, {}, Boolean(code))

  /** Wace ne fournit pas les villes : elles se saisissent ici (permission REFERENCE_WRITE). */
  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post(`${API_ENDPOINTS.ADMIN_COUNTRIES}/${code}/cities`, { name: name.trim() })
      showNotification({ message: `Ville « ${name.trim()} » ajoutée`, variant: 'success' })
      setName('')
      await refetch()
    } catch (err) {
      showNotification({ message: err instanceof ApiError ? err.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }
  const items = useMemo(() => (data ?? []).filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase())), [data, search])

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Villes · {countryName(code)}</h4>
          {data && <small className="text-muted">{items.length} résultat{items.length > 1 ? 's' : ''}</small>}
        </div>
        <Link href="/countries" className="btn btn-outline-secondary">
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />
          Pays
        </Link>
        <div className="position-relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Rechercher..." />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>
      <Card.Body className="border-bottom py-2">
        <Form onSubmit={add} className="d-flex gap-2">
          <Form.Control required maxLength={120} placeholder="Nom de la ville à ajouter" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" disabled={busy || !name.trim()} className="text-nowrap">Ajouter</Button>
        </Form>
      </Card.Body>
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
                  <td colSpan={1} className="text-center text-muted">Aucun résultat</td>
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
