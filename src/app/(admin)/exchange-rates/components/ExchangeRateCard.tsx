'use client'
import React, { useMemo, useState } from 'react'
import { Badge, Button, Card, CardFooter, CardHeader, Col, Form, Row, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import Paginator from '@/components/Paginator'
import { ApiError } from '@/lib/api/http'
import { formatDateTime } from '@/lib/api/format'
import type { Country, Page } from '@/lib/api/types'

type Rate = { baseCurrency: string; quoteCurrency: string; rate: number; effectiveFrom: string; source?: string }

const SOURCE_LABELS: Record<string, string> = { MANUAL: 'Saisie manuelle' }

/** « 0,001524 » : jusqu'à 10 décimales utiles, sans zéros inutiles. */
const formatRate = (n: number): string => n.toLocaleString('fr-FR', { maximumSignificantDigits: 10 })

/**
 * Taux de change : chaque publication ajoute une ligne datée (jamais de modification), le taux appliqué à un instant
 * donné étant le dernier dont la date d'effet est passée. Une date future programme un changement.
 */
const ExchangeRateCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ baseCurrency: '', quoteCurrency: '', rate: '', effectiveFrom: '' })
  const { data, loading, error, refetch } = useFetchData<Page<Rate>>(API_ENDPOINTS.EXCHANGE_RATES, { page, size: 20, sort: 'effectiveFrom,desc' })
  const countries = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)
  const currencies = useMemo(() => [...new Set((countries.data ?? []).map((c) => c.currencyCode))].sort(), [countries.data])

  const rates = data?.content ?? []
  // Sur la page courante (la plus récente d'abord), le premier taux déjà effectif de chaque paire est le taux en vigueur.
  const now = new Date().toISOString()
  const current = useMemo(() => {
    const seen = new Set<string>()
    const ids = new Set<string>()
    for (const r of rates) {
      const pair = `${r.baseCurrency}/${r.quoteCurrency}`
      if (r.effectiveFrom <= now && !seen.has(pair)) {
        seen.add(pair)
        ids.add(`${pair}@${r.effectiveFrom}`)
      }
    }
    return ids
  }, [rates, now])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post(API_ENDPOINTS.EXCHANGE_RATES, {
        baseCurrency: form.baseCurrency,
        quoteCurrency: form.quoteCurrency,
        rate: Number(form.rate.replace(',', '.')),
        effectiveFrom: form.effectiveFrom ? new Date(form.effectiveFrom).toISOString() : undefined,
      })
      showNotification({ message: 'Taux publié', variant: 'success' })
      setForm({ ...form, rate: '', effectiveFrom: '' })
      setPage(0)
      await refetch()
    } catch (err) {
      showNotification({ message: err instanceof ApiError ? err.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const invalid = !form.baseCurrency || !form.quoteCurrency || form.baseCurrency === form.quoteCurrency || !(Number(form.rate.replace(',', '.')) > 0)

  return (
    <Card>
      <CardHeader className="border-bottom">
        <h4 className="header-title mb-0">Taux de change</h4>
        {data && <small className="text-muted">{data.totalElements} taux publié{data.totalElements > 1 ? 's' : ''}</small>}
      </CardHeader>
      <Card.Body className="border-bottom">
        <Form onSubmit={create}>
          <Row className="g-2 align-items-end">
            <Col md={2}>
              <Form.Label className="small mb-1">Devise de base</Form.Label>
              <Form.Select required value={form.baseCurrency} onChange={set('baseCurrency')}>
                <option value="">—</option>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small mb-1">Devise cotée</Form.Label>
              <Form.Select required value={form.quoteCurrency} onChange={set('quoteCurrency')}>
                <option value="">—</option>
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">
                Taux{form.baseCurrency && form.quoteCurrency ? ` (1 ${form.baseCurrency} = … ${form.quoteCurrency})` : ''}
              </Form.Label>
              <Form.Control required inputMode="decimal" value={form.rate} onChange={set('rate')} />
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">Date d'effet (vide = maintenant)</Form.Label>
              <Form.Control type="datetime-local" value={form.effectiveFrom} onChange={set('effectiveFrom')} />
            </Col>
            <Col md={2}>
              <Button type="submit" className="w-100" disabled={busy || invalid}>Publier</Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover text-nowrap mb-0 align-middle">
            <thead className="bg-light-subtle">
              <tr>
                <th>Paire</th>
                <th>Taux</th>
                <th>Taux inverse</th>
                <th>En vigueur depuis</th>
                <th>Source</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">Aucun taux publié</td></tr>
              )}
              {rates.map((r) => {
                const pair = `${r.baseCurrency}/${r.quoteCurrency}`
                const status = r.effectiveFrom > now ? { label: 'À venir', variant: 'info' } : current.has(`${pair}@${r.effectiveFrom}`) ? { label: 'En vigueur', variant: 'success' } : { label: 'Remplacé', variant: 'secondary' }
                return (
                  <tr key={`${pair}@${r.effectiveFrom}`}>
                    <td className="fw-semibold">{r.baseCurrency} → {r.quoteCurrency}</td>
                    <td>1 {r.baseCurrency} = {formatRate(r.rate)} {r.quoteCurrency}</td>
                    <td className="text-muted">1 {r.quoteCurrency} = {formatRate(1 / r.rate)} {r.baseCurrency}</td>
                    <td>{formatDateTime(r.effectiveFrom)}</td>
                    <td>{r.source ? (SOURCE_LABELS[r.source] ?? r.source) : '-'}</td>
                    <td><Badge bg={status.variant}>{status.label}</Badge></td>
                  </tr>
                )
              })}
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

export default ExchangeRateCard
