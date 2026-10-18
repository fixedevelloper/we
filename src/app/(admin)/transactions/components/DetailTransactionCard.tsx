'use client'
import React, { useState } from 'react'
import { Badge, Button, Card, Col, ListGroup, Row, Table } from 'react-bootstrap'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import TransactionReceiptModal from '../TransactionReceipt'
import Spinner from '@/components/Spinner'
import { ApiError } from '@/lib/api/http'
import {
  ACTOR_LABELS,
  ATTEMPT_OUTCOME_LABELS,
  formatDateTime,
  formatMoney,
  ID_TYPE_LABELS,
  partyName,
  TRANSFER_KIND_LABELS,
  TRANSFER_STATUS_LABELS,
} from '@/lib/api/format'
import type { Country } from '@/lib/api/types'

type ReferenceValue = { code: string; label: string }

const DetailTransactionCard: React.FC<{ transactionId: string }> = ({ transactionId }) => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const { data: t, loading, error, refetch } = useFetchData<any>(`${API_ENDPOINTS.TRANSFERS}/${transactionId}`)
  const [showReceipt, setShowReceipt] = useState(false)
  const [busy, setBusy] = useState(false)

  // Libellés lisibles à la place des codes (pays, relation, motif, origine des fonds) ; en cas d'échec on garde les codes.
  const pair = `${t?.sender?.kind === 'BUSINESS' ? 'B' : 'P'}2${t?.beneficiary?.kind === 'BUSINESS' ? 'B' : 'P'}`
  const ready = Boolean(t)
  const countries = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES, {}, ready)
  const purposes = useFetchData<ReferenceValue[]>(API_ENDPOINTS.PURPOSES, { partyTypePair: pair }, ready)
  const sources = useFetchData<ReferenceValue[]>(API_ENDPOINTS.SOURCES_OF_FUNDS, { partyTypePair: pair }, ready)
  const relationships = useFetchData<ReferenceValue[]>(API_ENDPOINTS.RELATIONSHIPS, { partyTypePair: pair }, ready)
  const countryName = (code?: string) => (code ? (countries.data?.find((c) => c.code === code)?.name ?? code) : '-')
  const labelOf = (list: ReferenceValue[] | null, code?: string) => (code ? (list?.find((r) => r.code === code)?.label ?? code) : '-')

  if (loading && !t) {
    return (
      <div className="text-center my-5">
        <Spinner type="border" color="primary" />
        <p className="mt-3 small">Chargement du transfert...</p>
      </div>
    )
  }
  if (!t) return <p className="text-center text-muted mt-4">{error?.message ?? 'Aucun transfert trouvé.'}</p>

  const act = async (label: string, call: () => Promise<unknown>) => {
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

  const refund = () => {
    const reason = window.prompt("Motif du remboursement (obligatoire). Le client est recrédité UNE seule fois :")?.trim()
    if (reason) act('Transfert remboursé', () => api.post(`${API_ENDPOINTS.TRANSFERS}/${transactionId}/refund`, { reason }))
  }
  const sync = () => act('Statut relu chez le fournisseur', () => api.post(`${API_ENDPOINTS.TRANSFERS}/${transactionId}/sync`, {}))

  const status = TRANSFER_STATUS_LABELS[t.status]
  const dest = t.destination

  return (
    <div className="transaction-detail">
      <Card className="mb-3 border-0 shadow-sm text-center py-3">
        <h5 className="fw-bold mb-1 text-primary">{formatMoney(t.totalDebit)}</h5>
        <p className="small text-muted mb-1">
          {t.reference} · {formatDateTime(t.createdAt)}
        </p>
        <div>
          <Badge bg={status?.variant ?? 'secondary'} className="text-uppercase small mb-2">
            {status?.label ?? t.status}
          </Badge>
        </div>
        {t.failureReason && <p className="small text-danger mb-2">{t.failureReason}</p>}
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <button className="btn btn-primary" onClick={() => setShowReceipt(true)}>
            Voir le reçu
          </button>
          {['PROCESSING', 'PAYOUT_PENDING'].includes(t.status) && (
            <Button variant="outline-secondary" disabled={busy} onClick={sync}>
              Relire le statut chez Wace
            </Button>
          )}
          {t.status === 'FAILED' && (
            <Button variant="outline-danger" disabled={busy} onClick={refund}>
              Rembourser le client
            </Button>
          )}
        </div>
      </Card>

      <Row className="g-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light fw-bold small py-2">Expéditeur</Card.Header>
            <ListGroup variant="flush" className="small">
              <ListGroup.Item><strong>Nom :</strong> {partyName(t.sender)}</ListGroup.Item>
              <ListGroup.Item><strong>Pays :</strong> {countryName(t.sender?.countryCode)}</ListGroup.Item>
              <ListGroup.Item><strong>Ville :</strong> {t.sender?.city || '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Pièce :</strong> {ID_TYPE_LABELS[t.sender?.idDocument?.type] ?? t.sender?.idDocument?.type ?? '-'} {t.sender?.idDocument?.numberMasked || ''}</ListGroup.Item>
              <ListGroup.Item><strong>Client :</strong> {t.customer?.displayName || '-'}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light fw-bold small py-2">Bénéficiaire</Card.Header>
            <ListGroup variant="flush" className="small">
              <ListGroup.Item><strong>Nom :</strong> {partyName(t.beneficiary)}</ListGroup.Item>
              <ListGroup.Item><strong>Pays :</strong> {countryName(dest?.countryCode)}</ListGroup.Item>
              <ListGroup.Item><strong>Téléphone :</strong> {t.beneficiary?.phone || '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Banque / opérateur :</strong> {dest?.bank?.name ?? dest?.mobileOperator?.name ?? '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Compte :</strong> {dest?.accountNumberMasked || '-'}</ListGroup.Item>
              <ListGroup.Item><strong>Relation :</strong> {labelOf(relationships.data, t.relationshipCode)}</ListGroup.Item>
              <ListGroup.Item><strong>Motif :</strong> {labelOf(purposes.data, t.purposeCode)}</ListGroup.Item>
              <ListGroup.Item><strong>Origine des fonds :</strong> {labelOf(sources.data, t.sourceOfFundsCode)}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light fw-bold small py-2">Montants</Card.Header>
            <ListGroup variant="flush" className="small">
              <ListGroup.Item><strong>Type :</strong> {TRANSFER_KIND_LABELS[t.kind] ?? t.kind}</ListGroup.Item>
              <ListGroup.Item><strong>Envoyé :</strong> {formatMoney(t.sourceAmount)}</ListGroup.Item>
              <ListGroup.Item><strong>Frais :</strong> {formatMoney(t.fee)}</ListGroup.Item>
              <ListGroup.Item><strong>Total débité :</strong> {formatMoney(t.totalDebit)}</ListGroup.Item>
              <ListGroup.Item><strong>Reçu par le bénéficiaire :</strong> {formatMoney(t.destinationAmount)} {t.fxRate ? `(taux ${t.fxRate})` : ''}</ListGroup.Item>
              <ListGroup.Item><strong>Référence Wace :</strong> {t.providerReference || '-'}</ListGroup.Item>
              {t.completedAt && <ListGroup.Item><strong>Terminé le :</strong> {formatDateTime(t.completedAt)}</ListGroup.Item>}
              <ListGroup.Item><strong>Commentaire :</strong> {t.comment || '-'}</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light fw-bold small py-2">Historique</Card.Header>
            <Table className="mb-0 small">
              <tbody>
                {(t.history ?? []).map((h: any, i: number) => (
                  <tr key={i}>
                    <td>{formatDateTime(h.occurredAt)}</td>
                    <td>
                      {h.from ? `${TRANSFER_STATUS_LABELS[h.from]?.label ?? h.from} → ` : ''}
                      {TRANSFER_STATUS_LABELS[h.to]?.label ?? h.to}
                    </td>
                    <td>{ACTOR_LABELS[h.actor] ?? h.actor}</td>
                    <td className="text-muted">{h.reason || ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        {(t.attempts ?? []).length > 0 && (
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light fw-bold small py-2">Créations d&apos;ordre chez le fournisseur</Card.Header>
              <Table className="mb-0 small">
                <tbody>
                  {t.attempts.map((a: any) => (
                    <tr key={a.attemptNo}>
                      <td>#{a.attemptNo}</td>
                      <td>
                        <Badge bg={ATTEMPT_OUTCOME_LABELS[a.outcome]?.variant ?? 'secondary'}>
                          {ATTEMPT_OUTCOME_LABELS[a.outcome]?.label ?? a.outcome}
                        </Badge>
                      </td>
                      <td>{a.providerStatus || '-'}</td>
                      <td>{formatDateTime(a.startedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        )}
      </Row>

      <TransactionReceiptModal transaction={t} show={showReceipt} onClose={() => setShowReceipt(false)} />
    </div>
  )
}

export default DetailTransactionCard
