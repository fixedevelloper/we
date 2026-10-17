'use client'
import React, { useState } from 'react'
import { Button, Card, CardHeader, Col, Form, Row, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'
import { formatDate } from '@/lib/api/format'

type Zone = { id: number; code: string; name: string }
type Fee = { id: number; pricingZoneId: number; currency: string; minAmount: string; maxAmount: string; percent: number; fixedFee?: string; effectiveFrom: string; effectiveTo?: string }

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Barème de frais : un pourcentage par tranche (min, max], par zone et par devise, daté. Les tranches d'une même zone ne
 * peuvent pas se chevaucher à une même date (l'API refuse). On ne modifie jamais une tranche : on la clôt (date de fin)
 * puis on en crée une nouvelle, pour que l'historique des transferts reste explicable.
 */
const GrilleTarifaireCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const zones = useFetchData<Zone[]>(API_ENDPOINTS.PRICING_ZONES)
  const fees = useFetchData<Fee[]>(API_ENDPOINTS.FEE_SCHEDULES)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ pricingZoneId: '', currency: '', minAmount: '', maxAmount: '', percent: '', fixedFee: '', effectiveFrom: today() })
  const zoneName = (id: number) => zones.data?.find((z) => z.id === id)?.name ?? `#${id}`

  const fail = (e: unknown) => showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post(API_ENDPOINTS.FEE_SCHEDULES, {
        pricingZoneId: Number(form.pricingZoneId),
        currency: form.currency.toUpperCase(),
        minAmount: form.minAmount,
        maxAmount: form.maxAmount,
        percent: Number(form.percent),
        fixedFee: form.fixedFee || undefined,
        effectiveFrom: form.effectiveFrom,
      })
      showNotification({ message: 'Tranche créée', variant: 'success' })
      await fees.refetch()
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const end = async (f: Fee) => {
    const date = window.prompt('Date de fin (AAAA-MM-JJ), strictement postérieure à la date de début :', today())
    if (!date) return
    try {
      await api.patch(`${API_ENDPOINTS.FEE_SCHEDULES}/${f.id}`, { effectiveTo: date })
      showNotification({ message: 'Tranche clôturée', variant: 'success' })
      await fees.refetch()
    } catch (err) {
      fail(err)
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <Card>
      <CardHeader className="border-bottom">
        <h4 className="header-title mb-0">Grille tarifaire</h4>
      </CardHeader>
      <Card.Body className="border-bottom">
        <Form onSubmit={create}>
          <Row className="g-2">
            <Col md={3}>
              <Form.Select required value={form.pricingZoneId} onChange={set('pricingZoneId')}>
                <option value="">Zone…</option>
                {(zones.data ?? []).map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={1}><Form.Control required placeholder="Devise" maxLength={3} value={form.currency} onChange={set('currency')} /></Col>
            <Col md={2}><Form.Control required placeholder="De (exclu)" value={form.minAmount} onChange={set('minAmount')} /></Col>
            <Col md={2}><Form.Control required placeholder="À (inclus)" value={form.maxAmount} onChange={set('maxAmount')} /></Col>
            <Col md={1}><Form.Control required placeholder="%" value={form.percent} onChange={set('percent')} /></Col>
            <Col md={1}><Form.Control placeholder="Fixe" value={form.fixedFee} onChange={set('fixedFee')} /></Col>
            <Col md={2}><Form.Control required type="date" value={form.effectiveFrom} onChange={set('effectiveFrom')} /></Col>
          </Row>
          <Button type="submit" className="mt-2" disabled={busy}>Ajouter la tranche</Button>
        </Form>
      </Card.Body>
      <div className="table-responsive">
        {fees.loading && !fees.data ? (
          <p className="p-3">Chargement...</p>
        ) : fees.error ? (
          <p className="p-3 text-danger">❌ {fees.error.message}</p>
        ) : (
          <Table className="table-hover mb-0 text-nowrap">
            <thead className="bg-light-subtle">
              <tr>
                <th>Zone</th>
                <th>Devise</th>
                <th>Tranche</th>
                <th>Frais</th>
                <th>Du</th>
                <th>Au</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {(fees.data ?? []).map((f) => (
                <tr key={f.id}>
                  <td>{zoneName(f.pricingZoneId)}</td>
                  <td>{f.currency}</td>
                  <td>{f.minAmount} → {f.maxAmount}</td>
                  <td>{f.percent} %{f.fixedFee && Number(f.fixedFee) > 0 ? ` + ${f.fixedFee}` : ''}</td>
                  <td>{formatDate(f.effectiveFrom)}</td>
                  <td>{f.effectiveTo ? formatDate(f.effectiveTo) : 'en vigueur'}</td>
                  <td className="text-end">{!f.effectiveTo && <Button size="sm" variant="outline-danger" onClick={() => end(f)}>Clôturer</Button>}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export default GrilleTarifaireCard
