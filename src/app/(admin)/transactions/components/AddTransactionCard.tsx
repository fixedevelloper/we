'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import debounce from 'lodash.debounce'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Spinner from '@/components/Spinner'
import { ApiError, newIdempotencyKey } from '@/lib/api/http'
import { formatMoney, partyName } from '@/lib/api/format'
import type { Destination, Money, Page, Party } from '@/lib/api/types'

type CustomerRow = { id: string; displayName: string; kycStatus: string; status: string }
type ReferenceValue = { code: string; label: string }
type Quote = {
  sourceAmount: Money
  fee: Money
  feePercent?: number
  totalDebit: Money
  destinationAmount?: Money
  fxRate?: number
  availableBalance?: Money
  sufficientFunds: boolean
}

const pairOf = (sender?: Party, beneficiary?: Party) =>
  `${sender?.kind === 'BUSINESS' ? 'B' : 'P'}2${beneficiary?.kind === 'BUSINESS' ? 'B' : 'P'}`

/**
 * Saisie d'un transfert par le personnel pour un client. Les expéditeurs, bénéficiaires et destinations sont ceux que
 * le client a enregistrés (le back-office ne les crée pas). Le serveur calcule frais, taux et total : le total affiché est
 * renvoyé en `expectedTotalDebit` et le transfert est refusé si un barème a changé entre-temps.
 */
const AddTransactionCard: React.FC = () => {
  const api = useApi()
  const router = useRouter()
  const { showNotification } = useNotificationContext()

  const [customerSearch, setCustomerSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [customer, setCustomer] = useState<CustomerRow | null>(null)
  const [senderId, setSenderId] = useState('')
  const [beneficiaryId, setBeneficiaryId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [source, setSource] = useState('')
  const [relationship, setRelationship] = useState('')
  const [comment, setComment] = useState('')
  const [funding, setFunding] = useState<'WALLET' | 'OFFLINE_RECEIPT'>('WALLET')
  const [receipt, setReceipt] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(customerSearch), 400)
    handler()
    return () => handler.cancel()
  }, [customerSearch])

  const customers = useFetchData<Page<CustomerRow>>(API_ENDPOINTS.CUSTOMERS, { size: 8, search: debouncedSearch }, !customer && debouncedSearch.length >= 2)

  const senders = useFetchData<Page<Party>>(API_ENDPOINTS.PARTIES, { role: 'SENDER', customerId: customer?.id, size: 100 }, Boolean(customer))
  const beneficiaries = useFetchData<Page<Party>>(API_ENDPOINTS.PARTIES, { role: 'BENEFICIARY', customerId: customer?.id, size: 100 }, Boolean(customer))
  const beneficiary = useFetchData<{ destinations?: Destination[] } & Party>(`${API_ENDPOINTS.PARTIES}/${beneficiaryId || 'none'}`, {}, Boolean(beneficiaryId))

  const sender = senders.data?.content.find((p) => p.id === senderId)
  const beneficiaryParty = beneficiaries.data?.content.find((p) => p.id === beneficiaryId)
  const pair = pairOf(sender, beneficiaryParty)
  const purposes = useFetchData<ReferenceValue[]>(API_ENDPOINTS.PURPOSES, { partyTypePair: pair })
  const sources = useFetchData<ReferenceValue[]>(API_ENDPOINTS.SOURCES_OF_FUNDS, { partyTypePair: pair })
  const relationships = useFetchData<ReferenceValue[]>(API_ENDPOINTS.RELATIONSHIPS, { partyTypePair: pair })

  // Un changement de bénéficiaire invalide la destination choisie.
  useEffect(() => setDestinationId(''), [beneficiaryId])

  // Devis du serveur à chaque changement de destination ou de montant (debounce).
  const quoteKey = `${customer?.id}|${destinationId}|${amount}`
  useEffect(() => {
    setQuote(null)
    setQuoteError(null)
    if (!customer || !destinationId || !/^\d{1,15}(\.\d{1,4})?$/.test(amount) || Number(amount) <= 0) return
    const handle = setTimeout(async () => {
      try {
        setQuote(await api.post<Quote>(`${API_ENDPOINTS.TRANSFERS}/quote`, { destinationId, sourceAmount: amount, customerId: customer.id }))
      } catch (e) {
        setQuoteError(e instanceof ApiError ? e.fullMessage : 'Devis impossible')
      }
    }, 500)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey, api.token])

  // Une clé d'idempotence par saisie : réutilisée si on renvoie la même demande (double clic, réseau), changée si le contenu change.
  const body = useMemo(
    () => ({
      customerId: customer?.id,
      senderId,
      beneficiaryId,
      destinationId,
      sourceAmount: amount,
      purposeCode: purpose,
      sourceOfFundsCode: source,
      relationshipCode: relationship,
      comment: comment || undefined,
      expectedTotalDebit: quote?.totalDebit.amount,
      fundingSource: funding,
      receiptReference: funding === 'OFFLINE_RECEIPT' ? receipt : undefined,
    }),
    [customer, senderId, beneficiaryId, destinationId, amount, purpose, source, relationship, comment, quote, funding, receipt],
  )
  const key = useRef(newIdempotencyKey())
  useEffect(() => {
    key.current = newIdempotencyKey()
  }, [body])

  const ready =
    customer && senderId && beneficiaryId && destinationId && quote && purpose && source && relationship && (funding === 'WALLET' ? quote.sufficientFunds : receipt.trim().length > 0)

  const submit = async () => {
    setBusy(true)
    try {
      const created = await api.post<{ id: string; reference: string }>(API_ENDPOINTS.TRANSFERS, body, key.current)
      showNotification({ message: `Transfert ${created.reference} enregistré`, variant: 'success' })
      router.push(`/transactions/${created.id}`)
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const select = (label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string }[], disabled = false) => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">— choisir —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  )

  return (
    <div>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-bold small py-2">1. Client</Card.Header>
        <Card.Body>
          {customer ? (
            <div className="d-flex align-items-center gap-3">
              <strong>{customer.displayName}</strong>
              {customer.kycStatus !== 'VERIFIED' && <span className="badge bg-warning">Identité non vérifiée : l'API refusera l'envoi</span>}
              <Button
                variant="link"
                onClick={() => {
                  setCustomer(null)
                  setSenderId('')
                  setBeneficiaryId('')
                }}
              >
                Changer
              </Button>
            </div>
          ) : (
            <>
              <Form.Control placeholder="Rechercher un client (2 lettres minimum)" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
              {(customers.data?.content ?? []).map((c) => (
                <div key={c.id} className="p-2 border-bottom" style={{ cursor: 'pointer' }} onClick={() => setCustomer(c)}>
                  {c.displayName} <span className="text-muted small">· {c.kycStatus}</span>
                </div>
              ))}
            </>
          )}
        </Card.Body>
      </Card>

      {customer && (
        <>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light fw-bold small py-2">2. Expéditeur, bénéficiaire et destination</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  {select('Expéditeur', senderId, setSenderId, (senders.data?.content ?? []).map((p) => ({ value: p.id, label: partyName(p) })))}
                </Col>
                <Col md={4}>
                  {select('Bénéficiaire', beneficiaryId, setBeneficiaryId, (beneficiaries.data?.content ?? []).map((p) => ({ value: p.id, label: partyName(p) })))}
                </Col>
                <Col md={4}>
                  {select(
                    'Destination (compte ou mobile money)',
                    destinationId,
                    setDestinationId,
                    (beneficiary.data?.destinations ?? []).map((d) => ({
                      value: d.id,
                      label: `${d.bank?.name ?? d.mobileOperator?.name ?? d.kind} · ${d.accountNumberMasked}`,
                    })),
                    !beneficiaryId,
                  )}
                </Col>
              </Row>
              {(senders.data?.content.length === 0 || beneficiaries.data?.content.length === 0) && (
                <Alert variant="info" className="mb-0">
                  Ce client n'a pas encore enregistré d'expéditeur ou de bénéficiaire : il doit le faire depuis l'application.
                </Alert>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light fw-bold small py-2">3. Montant et justification</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Montant à envoyer</Form.Label>
                    <Form.Control inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} placeholder="10000" />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  {quoteError && <Alert variant="danger" className="py-2">{quoteError}</Alert>}
                  {quote && (
                    <Alert variant={quote.sufficientFunds || funding === 'OFFLINE_RECEIPT' ? 'success' : 'warning'} className="py-2 mb-3">
                      Frais {formatMoney(quote.fee)}
                      {quote.feePercent ? ` (${quote.feePercent} %)` : ''} · <strong>Total {formatMoney(quote.totalDebit)}</strong>
                      {quote.destinationAmount && <> · Le bénéficiaire reçoit {formatMoney(quote.destinationAmount)}</>}
                      {quote.availableBalance && <> · Solde disponible {formatMoney(quote.availableBalance)}</>}
                    </Alert>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={4}>{select('Motif', purpose, setPurpose, (purposes.data ?? []).map((v) => ({ value: v.code, label: v.label })))}</Col>
                <Col md={4}>{select('Origine des fonds', source, setSource, (sources.data ?? []).map((v) => ({ value: v.code, label: v.label })))}</Col>
                <Col md={4}>{select('Lien avec le bénéficiaire', relationship, setRelationship, (relationships.data ?? []).map((v) => ({ value: v.code, label: v.label })))}</Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Commentaire</Form.Label>
                <Form.Control value={comment} onChange={(e) => setComment(e.target.value)} />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light fw-bold small py-2">4. Financement</Card.Header>
            <Card.Body>
              <Form.Check type="radio" id="f-wallet" name="funding" label="Débiter le portefeuille du client" checked={funding === 'WALLET'} onChange={() => setFunding('WALLET')} />
              <Form.Check type="radio" id="f-offline" name="funding" label="Le client a payé hors plateforme (espèces, virement) : le portefeuille est crédité puis débité" checked={funding === 'OFFLINE_RECEIPT'} onChange={() => setFunding('OFFLINE_RECEIPT')} />
              {funding === 'OFFLINE_RECEIPT' && (
                <Form.Group className="mt-3">
                  <Form.Label>Référence du justificatif de paiement (obligatoire)</Form.Label>
                  <Form.Control value={receipt} onChange={(e) => setReceipt(e.target.value)} />
                </Form.Group>
              )}
            </Card.Body>
          </Card>

          <div className="text-center">
            <Button variant="primary" disabled={!ready || busy} onClick={submit}>
              {busy ? <Spinner size="sm" color="light" className="me-2" /> : <IconifyIcon icon="ri:send-plane-line" className="me-1" />}
              Envoyer le transfert
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default AddTransactionCard
