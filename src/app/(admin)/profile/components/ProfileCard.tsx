'use client'
import React, { useState } from 'react'
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'
import { ROLE_LABELS } from '@/lib/api/format'
import type { UserSummary } from '@/lib/api/types'

type Me = { user: UserSummary }

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'

/** Compte de la personne connectée (`GET /me`) et changement de mot de passe (`PUT /me/password`, 10 caractères minimum). */
const ProfileCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const { data, loading, error } = useFetchData<Me>(API_ENDPOINTS.ME)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [busy, setBusy] = useState(false)

  if (loading && !data) return <p className="p-3">Chargement...</p>
  if (error || !data) return <p className="p-3 text-danger">❌ {error?.message ?? 'Profil indisponible'}</p>
  const u = data.user

  const mismatch = form.confirm !== '' && form.confirm !== form.newPassword
  const valid = form.currentPassword !== '' && form.newPassword.length >= 10 && form.newPassword === form.confirm

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.put(`${API_ENDPOINTS.ME}/password`, { currentPassword: form.currentPassword, newPassword: form.newPassword })
      showNotification({ message: 'Mot de passe modifié', variant: 'success' })
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      showNotification({ message: err instanceof ApiError ? err.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <Row>
      <Col lg={5}>
        <Card>
          <Card.Body className="text-center">
            <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80, fontSize: 28 }}>
              {initials(u.displayName)}
            </div>
            <h4 className="mb-1">{u.displayName}</h4>
            <p className="text-muted mb-2">{u.email}</p>
            <div className="mb-3">
              {u.roles.map((r) => <Badge key={r} bg="primary" className="me-1">{ROLE_LABELS[r] ?? r}</Badge>)}
            </div>
            <div className="text-start border-top pt-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Double authentification</span>
                {u.mfaEnabled ? <Badge bg="success">Activée</Badge> : <Badge bg="warning">À activer</Badge>}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={7}>
        <Card>
          <Card.Header>
            <h4 className="header-title mb-0">Changer mon mot de passe</h4>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={changePassword}>
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe actuel</Form.Label>
                <Form.Control type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nouveau mot de passe</Form.Label>
                <Form.Control type="password" autoComplete="new-password" minLength={10} maxLength={128} value={form.newPassword} onChange={set('newPassword')} />
                <Form.Text className="text-muted">10 caractères minimum.</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                <Form.Control type="password" autoComplete="new-password" isInvalid={mismatch} value={form.confirm} onChange={set('confirm')} />
                <Form.Control.Feedback type="invalid">Les mots de passe ne correspondent pas.</Form.Control.Feedback>
              </Form.Group>
              <Button type="submit" disabled={busy || !valid}>Modifier le mot de passe</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default ProfileCard
