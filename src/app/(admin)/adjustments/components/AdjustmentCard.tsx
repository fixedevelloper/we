'use client'
import React, { useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Badge, Button, Card, CardFooter, CardHeader, Form, Table } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import Paginator from '@/components/Paginator'
import { ApiError } from '@/lib/api/http'
import { ADJUSTMENT_STATUS_LABELS, formatDateTime, formatMoney } from '@/lib/api/format'
import type { Money, Page } from '@/lib/api/types'

type Adjustment = {
  id: string
  customer?: { id?: string; displayName?: string }
  direction: 'CREDIT' | 'DEBIT'
  amount: Money
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedBy: string
  decidedBy?: string
  decidedAt?: string
  createdAt: string
}

/**
 * Un ajustement de solde est demandé par un administrateur (fiche client) et doit être approuvé par un AUTRE : l'API
 * refuse que la même personne demande et approuve.
 */
const AdjustmentCard: React.FC = () => {
  const api = useApi()
  const { data: session } = useSession()
  const { showNotification } = useNotificationContext()
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(search), 500)
    handler()
    return () => handler.cancel()
  }, [search])
  useEffect(() => setPage(0), [debouncedSearch, status])

  const { data, loading, error, refetch } = useFetchData<Page<Adjustment>>(API_ENDPOINTS.BALANCE_ADJUSTMENTS, {
    page,
    size: 10,
    search: debouncedSearch,
    status,
    sort: 'createdAt,desc',
  })

  const decide = async (a: Adjustment, approve: boolean) => {
    let body: Record<string, string> = {}
    if (approve) {
      if (!window.confirm(`Approuver ce ${a.direction === 'CREDIT' ? 'crédit' : 'débit'} de ${formatMoney(a.amount)} ?`)) return
    } else {
      const reason = window.prompt('Motif du refus (obligatoire) :')?.trim()
      if (!reason) return
      body = { reason }
    }
    setBusy(true)
    try {
      await api.post(`${API_ENDPOINTS.BALANCE_ADJUSTMENTS}/${a.id}/${approve ? 'approve' : 'reject'}`, body)
      showNotification({ message: approve ? 'Ajustement approuvé' : 'Ajustement refusé', variant: 'success' })
      await refetch()
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const items = data?.content ?? []
  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Ajustements de solde</h4>
          {data && (
            <p className="text-muted mb-0 small">
              {data.totalElements.toLocaleString('fr-FR')} ajustement{data.totalElements > 1 ? 's' : ''}
              {(debouncedSearch || status) && ' correspondant aux filtres'}
            </p>
          )}
        </div>
        <Form.Select style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(ADJUSTMENT_STATUS_LABELS).map(([code, s]) => (
            <option key={code} value={code}>
              {s.label}
            </option>
          ))}
        </Form.Select>
        <div className="position-relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Client, motif..." />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Sens</th>
                <th>Montant</th>
                <th>Motif</th>
                <th>Demandé par</th>
                <th>Statut</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    Aucun ajustement.
                  </td>
                </tr>
              )}
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="text-nowrap">{formatDateTime(a.createdAt)}</td>
                  <td>{a.customer?.displayName || '-'}</td>
                  <td>{a.direction === 'CREDIT' ? 'Crédit' : 'Débit'}</td>
                  <td className="text-nowrap">
                    <span className={a.direction === 'CREDIT' ? 'text-success' : 'text-danger'}>
                      {a.direction === 'CREDIT' ? '+' : '−'} {formatMoney(a.amount)}
                    </span>
                  </td>
                  <td>{a.reason}</td>
                  <td className="small">{a.requestedBy}</td>
                  <td>
                    <Badge bg={ADJUSTMENT_STATUS_LABELS[a.status]?.variant ?? 'secondary'}>{ADJUSTMENT_STATUS_LABELS[a.status]?.label ?? a.status}</Badge>
                    {a.decidedBy && (
                      <div className="small text-muted">
                        par {a.decidedBy}
                        {a.decidedAt && ` le ${formatDateTime(a.decidedAt)}`}
                      </div>
                    )}
                  </td>
                  <td className="text-end text-nowrap">
                    {a.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" className="me-1" disabled={busy || a.requestedBy === session?.user?.email} title={a.requestedBy === session?.user?.email ? 'Vous ne pouvez pas approuver votre propre demande' : ''} onClick={() => decide(a, true)}>
                          Approuver
                        </Button>
                        <Button size="sm" variant="danger" disabled={busy} onClick={() => decide(a, false)}>
                          Refuser
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      <CardFooter>
        <Paginator page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
      </CardFooter>
    </Card>
  )
}

export default AdjustmentCard
