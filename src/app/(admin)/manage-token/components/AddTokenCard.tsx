'use client'
import React, { useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'
import { formatDateTime } from '@/lib/api/format'
import type { Country } from '@/lib/api/types'

/** Crée un jeton web : montant et pays pré-remplis dans le parcours WhatsApp. Le jeton n'est affiché qu'une fois. */
const AddTokenCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const countries = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)
  const [country, setCountry] = useState('')
  const [amount, setAmount] = useState('')
  const [minutes, setMinutes] = useState('60')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<{ token: string; expiresAt: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      setCreated(await api.post(API_ENDPOINTS.WEB_TOKENS, { amount, countryCode: country, validForMinutes: Number(minutes) }))
      setAmount('')
    } catch (err) {
      showNotification({ message: err instanceof ApiError ? err.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        {created && (
          <Alert variant="success">
            Jeton créé (valable jusqu'au {formatDateTime(created.expiresAt)}). <strong>Copiez-le maintenant, il ne sera plus affiché :</strong>
            <pre className="mt-2 mb-0 user-select-all">{created.token}</pre>
          </Alert>
        )}
        <Form onSubmit={submit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Pays de destination</Form.Label>
                <Form.Select required value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">—</option>
                  {(countries.data ?? []).filter((c) => c.canReceive).map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Montant</Form.Label>
                <Form.Control required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Validité (minutes, 1 à 1440)</Form.Label>
                <Form.Control type="number" min={1} max={1440} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" disabled={busy || !country || !amount}>Créer le jeton</Button>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default AddTokenCard
