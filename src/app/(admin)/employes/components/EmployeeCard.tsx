'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import { Badge, Button, Card, CardFooter, CardHeader, Col, Form, Row, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import Paginator from '@/components/Paginator'
import { ApiError } from '@/lib/api/http'
import { formatDateTime } from '@/lib/api/format'
import type { Page, Role } from '@/lib/api/types'

type StaffUser = { id: string; email: string; displayName: string; roles: Role[]; status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'; mfaEnabled?: boolean; lastLoginAt?: string }
const STAFF_ROLES: Role[] = ['SUPPORT', 'ADMIN', 'SUPER_ADMIN']

/** Comptes du personnel (permission USER_MANAGE) : invitation par e-mail, rôles, suspension, réinitialisation de la 2FA. */
const EmployeeCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ email: '', displayName: '', role: 'SUPPORT' as Role })

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(search), 500)
    handler()
    return () => handler.cancel()
  }, [search])
  useEffect(() => setPage(0), [debouncedSearch])

  const { data, loading, error, refetch } = useFetchData<Page<StaffUser>>(API_ENDPOINTS.USERS, { page, size: 10, search: debouncedSearch })

  const run = async (label: string, call: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await call()
      showNotification({ message: label, variant: 'success' })
      await refetch()
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const invite = (e: React.FormEvent) => {
    e.preventDefault()
    run("Invitation envoyée : la personne choisit son mot de passe depuis le lien reçu par e-mail", async () => {
      await api.post(API_ENDPOINTS.USERS, { email: form.email, displayName: form.displayName, roles: [form.role] })
      setForm({ email: '', displayName: '', role: 'SUPPORT' })
    })
  }

  const users = data?.content ?? []
  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Personnel</h4>
        </div>
        <div className="position-relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Rechercher..." />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>
      <Card.Body className="border-bottom">
        <Form onSubmit={invite}>
          <Row className="g-2">
            <Col md={4}><Form.Control required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Col>
            <Col md={3}><Form.Control required placeholder="Nom affiché" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></Col>
            <Col md={3}>
              <Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}><Button type="submit" className="w-100" disabled={busy}>Inviter</Button></Col>
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
                <th>Nom</th>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>2FA</th>
                <th>Dernière connexion</th>
                <th>Statut</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.displayName}</td>
                  <td>{u.email}</td>
                  <td>
                    <Form.Select size="sm" value={u.roles[0] ?? ''} disabled={busy} onChange={(e) => run('Rôle modifié', () => api.patch(`${API_ENDPOINTS.USERS}/${u.id}`, { roles: [e.target.value] }))}>
                      {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </Form.Select>
                  </td>
                  <td>{u.mfaEnabled ? <Badge bg="success">active</Badge> : <Badge bg="warning">à activer</Badge>}</td>
                  <td>{formatDateTime(u.lastLoginAt)}</td>
                  <td><Badge bg={u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' ? 'danger' : 'secondary'}>{u.status}</Badge></td>
                  <td className="text-end">
                    {u.status !== 'PENDING_VERIFICATION' && (
                      <Button size="sm" variant="outline-secondary" className="me-1" disabled={busy} onClick={() => run(u.status === 'ACTIVE' ? 'Compte suspendu' : 'Compte réactivé', () => api.patch(`${API_ENDPOINTS.USERS}/${u.id}`, { status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }))}>
                        {u.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                      </Button>
                    )}
                    {u.mfaEnabled && (
                      <Button size="sm" variant="outline-danger" disabled={busy} onClick={() => window.confirm(`Réinitialiser la double authentification de ${u.displayName} ? Elle devra la réactiver.`) && run('2FA réinitialisée', () => api.post(`${API_ENDPOINTS.USERS}/${u.id}/mfa-reset`))}>
                        Réinitialiser la 2FA
                      </Button>
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

export default EmployeeCard
