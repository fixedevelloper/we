'use client'
import React, { useState } from 'react'
import { Badge, Button, Card, CardHeader, Col, Form, Row, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'

type Zone = { id: number; code: string; name: string; countries?: string[] }

/** Zones tarifaires : un barème de frais s'applique à chaque zone (pays regroupés). */
const ZoneCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const { data, loading, error, refetch } = useFetchData<Zone[]>(API_ENDPOINTS.PRICING_ZONES)
  const [form, setForm] = useState({ code: '', name: '', countries: '' })
  const [busy, setBusy] = useState(false)

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const countries = form.countries.split(/[\s,;]+/).map((c) => c.toUpperCase()).filter(Boolean)
      await api.post(API_ENDPOINTS.PRICING_ZONES, { code: form.code, name: form.name, countries: countries.length ? countries : undefined })
      showNotification({ message: 'Zone créée', variant: 'success' })
      setForm({ code: '', name: '', countries: '' })
      await refetch()
    } catch (err) {
      showNotification({ message: err instanceof ApiError ? err.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-bottom">
        <h4 className="header-title mb-0">Zones tarifaires</h4>
      </CardHeader>
      <Card.Body className="border-bottom">
        <Form onSubmit={create}>
          <Row className="g-2">
            <Col md={2}><Form.Control required placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Col>
            <Col md={4}><Form.Control required placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Col>
            <Col md={4}><Form.Control placeholder="Pays (codes ISO, ex. CM, CG, GA)" value={form.countries} onChange={(e) => setForm({ ...form, countries: e.target.value })} /></Col>
            <Col md={2}><Button type="submit" disabled={busy} className="w-100">Créer</Button></Col>
          </Row>
        </Form>
      </Card.Body>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Pays</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((z) => (
                <tr key={z.id}>
                  <td>{z.code}</td>
                  <td>{z.name}</td>
                  <td>{(z.countries ?? []).map((c) => <Badge key={c} bg="light" text="dark" className="me-1">{c}</Badge>)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export default ZoneCard
