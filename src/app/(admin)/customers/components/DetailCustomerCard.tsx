'use client'
import React, { useState } from 'react'
import { Badge, Button, Card, Col, Form, ListGroup, Row, Table } from 'react-bootstrap'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Spinner from '@/components/Spinner'
import { ApiError, newIdempotencyKey } from '@/lib/api/http'
import { formatDate, formatDateTime, formatMoney, KYC_STATUS_LABELS } from '@/lib/api/format'
import type { Money } from '@/lib/api/types'

type AdminCustomer = {
  id: string
  kind: 'INDIVIDUAL' | 'BUSINESS'
  firstName?: string
  lastName?: string
  businessName?: string
  businessType?: string
  birthDate?: string
  nationality?: string
  occupation?: string
  addressLine?: string
  city?: string
  countryCode?: string
  phone?: string
  email?: string
  kycStatus: string
  status: string
  createdAt?: string
  balance?: Money
  transferCount?: number
  photoUrl?: string
}

type Wallet = { id: string; currency: string; balance: string; status: string }

type KycDocument = {
  id: string
  documentType: string
  side?: string
  status: string
  expiresOn?: string
  uploadedAt: string
  rejectionReason?: string
  downloadUrl?: string
}

const DOCUMENT_LABELS: Record<string, string> = {
  PASSPORT: 'Passeport',
  NATIONAL_ID: "Carte d'identité",
  RESIDENCE_PERMIT: 'Titre de séjour',
  DRIVING_LICENSE: 'Permis de conduire',
  PROOF_OF_ADDRESS: 'Justificatif de domicile',
  SELFIE: 'Selfie',
  BUSINESS_REGISTRATION: "Immatriculation de l'entreprise",
}

const DetailCustomerCard: React.FC<{ customerId: string }> = ({ customerId }) => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const customer = useFetchData<AdminCustomer>(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`)
  const wallets = useFetchData<Wallet[]>(`${API_ENDPOINTS.CUSTOMERS}/${customerId}/wallets`)
  const kyc = useFetchData<{ status: string; documents: KycDocument[] }>(`${API_ENDPOINTS.CUSTOMERS}/${customerId}/kyc`)
  const [busy, setBusy] = useState(false)
  const [adjustment, setAdjustment] = useState({ direction: 'CREDIT', amount: '', currency: '', reason: '' })

  const fail = (e: unknown) =>
    showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })

  const review = async (doc: KycDocument, decision: 'APPROVE' | 'REJECT') => {
    let reason: string | undefined
    if (decision === 'REJECT') {
      reason = window.prompt('Motif du refus (obligatoire) :')?.trim()
      if (!reason) return
    }
    setBusy(true)
    try {
      await api.post(`${API_ENDPOINTS.CUSTOMERS}/${customerId}/kyc/documents/${doc.id}/review`, { decision, reason })
      showNotification({ message: decision === 'APPROVE' ? 'Document approuvé' : 'Document refusé', variant: 'success' })
      await Promise.all([kyc.refetch(), customer.refetch()])
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  const requestAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      // Double validation : la demande est créée ici, un AUTRE administrateur l'approuve (écran « Ajustements »).
      await api.post(
        API_ENDPOINTS.BALANCE_ADJUSTMENTS,
        {
          customerId,
          direction: adjustment.direction,
          amount: adjustment.amount,
          reason: adjustment.reason,
          currency: adjustment.currency || undefined,
        },
        newIdempotencyKey(),
      )
      showNotification({ message: "Demande d'ajustement créée : elle attend la validation d'un autre administrateur.", variant: 'success' })
      setAdjustment({ direction: 'CREDIT', amount: '', currency: '', reason: '' })
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  if (customer.loading && !customer.data) {
    return (
      <div className="text-center my-5">
        <Spinner type="border" color="primary" />
        <p className="mt-3 small text-muted">Chargement des détails du client...</p>
      </div>
    )
  }
  if (!customer.data) {
    return <p className="text-center text-muted mt-4">{customer.error?.message ?? 'Aucun client trouvé.'}</p>
  }
  const c = customer.data
  const name = c.kind === 'BUSINESS' ? c.businessName : [c.firstName, c.lastName].filter(Boolean).join(' ')
  const kycState = KYC_STATUS_LABELS[c.kycStatus]

  return (
    <div className="transaction-detail">
      <Card className="mb-4 border-0 shadow-sm text-center py-4">
        {/* Le solde vient des portefeuilles (un par devise) ; la fiche client ne le porte pas. */}
        <h4 className="fw-bold mb-1 text-primary">
          {(wallets.data ?? []).length === 0
            ? wallets.loading ? '…' : '0'
            : (wallets.data ?? []).map((w) => formatMoney({ amount: w.balance, currency: w.currency })).join(' · ')}
        </h4>
        <p className="text-muted small mb-2">Solde{c.transferCount != null ? ` · ${c.transferCount} transfert(s)` : ''}</p>
        <div className="d-flex gap-2 justify-content-center">
          <Badge bg={c.status === 'ACTIVE' ? 'success' : 'danger'} className="px-3 py-2 rounded-pill">
            {c.status}
          </Badge>
          <Badge bg={kycState?.variant ?? 'secondary'} className="px-3 py-2 rounded-pill">
            Identité : {kycState?.label ?? c.kycStatus}
          </Badge>
        </div>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-bold small py-2">Informations</Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3} className="text-center">
              {c.photoUrl && <img src={c.photoUrl} alt="photo" className="rounded-circle shadow-sm mb-2" style={{ width: 100, height: 100, objectFit: 'cover' }} />}
              <p className="fw-semibold mt-2">{name || '—'}</p>
              <Badge bg="info">{c.kind === 'BUSINESS' ? 'Entreprise' : 'Particulier'}</Badge>
            </Col>
            <Col md={9}>
              <ListGroup variant="flush" className="small">
                <ListGroup.Item><strong>E-mail :</strong> {c.email || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>Téléphone :</strong> {c.phone || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>Pays :</strong> {c.countryCode || '—'} {c.city ? `· ${c.city}` : ''}</ListGroup.Item>
                <ListGroup.Item><strong>Adresse :</strong> {c.addressLine || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>Naissance :</strong> {formatDate(c.birthDate)} · {c.nationality || '—'}</ListGroup.Item>
                <ListGroup.Item><strong>Inscrit le :</strong> {formatDateTime(c.createdAt)}</ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-bold small py-2">Portefeuilles</Card.Header>
        <Table className="mb-0 small">
          <tbody>
            {(wallets.data ?? []).length === 0 && (
              <tr><td className="text-muted text-center">Aucun portefeuille</td></tr>
            )}
            {(wallets.data ?? []).map((w) => (
              <tr key={w.id}>
                <td>{w.currency}</td>
                <td>{formatMoney({ amount: w.balance, currency: w.currency })}</td>
                <td>{w.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-bold small py-2">Pièces d'identité (KYC)</Card.Header>
        {kyc.error ? (
          <Card.Body className="text-danger small">{kyc.error.message}</Card.Body>
        ) : (
          <Table className="mb-0 small align-middle">
            <tbody>
              {(kyc.data?.documents ?? []).length === 0 && (
                <tr><td className="text-muted text-center">Aucun document déposé</td></tr>
              )}
              {(kyc.data?.documents ?? []).map((d) => (
                <tr key={d.id}>
                  <td>
                    {DOCUMENT_LABELS[d.documentType] ?? d.documentType} {d.side && d.side !== 'SINGLE' ? `(${d.side === 'FRONT' ? 'recto' : 'verso'})` : ''}
                    <div className="text-muted">Déposé le {formatDateTime(d.uploadedAt)} · expire le {formatDate(d.expiresOn)}</div>
                    {d.rejectionReason && <div className="text-danger">Refusé : {d.rejectionReason}</div>}
                  </td>
                  <td><Badge bg={d.status === 'APPROVED' ? 'success' : d.status === 'PENDING' ? 'warning' : 'danger'}>{d.status}</Badge></td>
                  <td className="text-end text-nowrap">
                    {d.downloadUrl && (
                      <a href={d.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary me-1">
                        Voir
                      </a>
                    )}
                    {d.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" className="me-1" disabled={busy} onClick={() => review(d, 'APPROVE')}>Approuver</Button>
                        <Button size="sm" variant="danger" disabled={busy} onClick={() => review(d, 'REJECT')}>Refuser</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-bold small py-2">Demander un ajustement de solde (double validation)</Card.Header>
        <Card.Body>
          <Form onSubmit={requestAdjustment}>
            <Row className="g-2">
              <Col md={2}>
                <Form.Select value={adjustment.direction} onChange={(e) => setAdjustment({ ...adjustment, direction: e.target.value })}>
                  <option value="CREDIT">Crédit</option>
                  <option value="DEBIT">Débit</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Control required placeholder="Montant" pattern="\\d{1,15}(\\.\\d{1,4})?" value={adjustment.amount} onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })} />
              </Col>
              <Col md={2}>
                <Form.Control placeholder="Devise (défaut)" maxLength={3} value={adjustment.currency} onChange={(e) => setAdjustment({ ...adjustment, currency: e.target.value.toUpperCase() })} />
              </Col>
              <Col md={4}>
                <Form.Control required minLength={5} placeholder="Motif (5 caractères minimum)" value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} />
              </Col>
              <Col md={2}>
                <Button type="submit" disabled={busy} className="w-100">Demander</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div className="text-center mt-4">
        <Button variant="outline-primary" className="me-2" onClick={() => window.print()}>
          <IconifyIcon icon="ri:printer-line" className="me-1" />
          Imprimer la fiche
        </Button>
        <Button href={`/customers/${c.id}/edit`} variant="primary">
          <IconifyIcon icon="ri:edit-2-line" className="me-1" />
          Statut du compte
        </Button>
      </div>
    </div>
  )
}

export default DetailCustomerCard
