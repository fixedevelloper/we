'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import debounce from 'lodash.debounce'
import { Badge, Button, Card, CardFooter, CardHeader, Form, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import React, { useEffect, useState } from 'react'
import Paginator from '@/components/Paginator'
import { ApiError } from '@/lib/api/http'
import { formatDateTime, formatMoney } from '@/lib/api/format'
import type { Money, Page } from '@/lib/api/types'

type TopUp = {
  id: string
  reference: string
  method: 'WACE_MOBILE_MONEY' | 'MANUAL_PROOF'
  amount: Money
  status: string
  failureReason?: string
  createdAt: string
  completedAt?: string
  customer?: { id?: string; displayName?: string }
  proofDownloadUrl?: string
}

const VARIANTS: Record<string, string> = { PENDING: 'warning', PROCESSING: 'info', COMPLETED: 'success', FAILED: 'danger', CANCELLED: 'secondary', REJECTED: 'danger' }

/** Recharges des portefeuilles : le personnel examine les preuves de paiement manuelles (approbation = crédit du portefeuille). */
const RechargesCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(search), 500)
    handler()
    return () => handler.cancel()
  }, [search])
  useEffect(() => setPage(0), [debouncedSearch, status])

  const { data, loading, error, refetch } = useFetchData<Page<TopUp>>(API_ENDPOINTS.TOP_UPS, { page, size: 10, search: debouncedSearch, status, sort: 'createdAt,desc' })

  const decide = async (t: TopUp, approve: boolean) => {
    let body: Record<string, string> = {}
    if (approve) {
      if (!window.confirm(`Approuver la recharge ${t.reference} (${formatMoney(t.amount)}) ? Le portefeuille du client sera crédité.`)) return
    } else {
      const reason = window.prompt('Motif du refus (obligatoire) :')?.trim()
      if (!reason) return
      body = { reason }
    }
    setBusy(true)
    try {
      await api.post(`${API_ENDPOINTS.TOP_UPS}/${t.id}/${approve ? 'approve' : 'reject'}`, body)
      showNotification({ message: approve ? 'Recharge approuvée' : 'Recharge refusée', variant: 'success' })
      await refetch()
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const topUps = data?.content ?? []

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Recharges</h4>
        </div>
        <Form.Select style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.keys(VARIANTS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Form.Select>
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
                <th>Référence</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {topUps.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    Aucune recharge.
                  </td>
                </tr>
              )}
              {topUps.map((t) => (
                <tr key={t.id}>
                  <td>{t.reference}</td>
                  <td>{formatDateTime(t.createdAt)}</td>
                  <td>{t.method === 'MANUAL_PROOF' ? 'Preuve de paiement' : 'Mobile money (Wace)'}</td>
                  <td>{t.customer?.displayName || '-'}</td>
                  <td>{formatMoney(t.amount)}</td>
                  <td>
                    <Badge bg={VARIANTS[t.status] ?? 'secondary'}>{t.status}</Badge>
                    {t.failureReason && <div className="small text-muted">{t.failureReason}</div>}
                  </td>
                  <td className="text-end">
                    {t.proofDownloadUrl && (
                      <a href={t.proofDownloadUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary me-1">
                        Preuve
                      </a>
                    )}
                    {t.method === 'MANUAL_PROOF' && t.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" className="me-1" disabled={busy} onClick={() => decide(t, true)}>
                          Approuver
                        </Button>
                        <Button size="sm" variant="danger" disabled={busy} onClick={() => decide(t, false)}>
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

export default RechargesCard
