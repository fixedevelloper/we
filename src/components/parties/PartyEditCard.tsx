'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Spinner from '@/components/Spinner'
import { ApiError } from '@/lib/api/http'
import { ID_TYPE_LABELS } from '@/lib/api/format'
import type { Country, Destination, Party } from '@/lib/api/types'

type AdminParty = Party & { customer?: { id?: string; displayName?: string }; destinations?: Destination[] }

type Form = {
  kind: 'INDIVIDUAL' | 'BUSINESS'
  firstName: string
  lastName: string
  businessName: string
  businessType: string
  businessRegisteredOn: string
  birthDate: string
  nationality: string
  occupation: string
  gender: string
  civility: string
  addressLine: string
  city: string
  countryCode: string
  phone: string
  email: string
  idDocumentType: string
  idDocumentNumber: string
  idDocumentExpiresOn: string
  pep: boolean
}

const fromParty = (p: AdminParty): Form => ({
  kind: p.kind,
  firstName: p.firstName ?? '',
  lastName: p.lastName ?? '',
  businessName: p.businessName ?? '',
  businessType: p.businessType ?? '',
  businessRegisteredOn: p.businessRegisteredOn ?? '',
  birthDate: p.birthDate ?? '',
  nationality: p.nationality ?? '',
  occupation: p.occupation ?? '',
  gender: p.gender ?? '',
  civility: p.civility ?? '',
  addressLine: p.addressLine ?? '',
  city: p.city ?? '',
  countryCode: p.countryCode ?? '',
  phone: p.phone ?? '',
  email: p.email ?? '',
  idDocumentType: p.idDocument?.type ?? '',
  idDocumentNumber: '', // jamais relu en clair : vide = inchangé
  idDocumentExpiresOn: p.idDocument?.expiresOn ?? '',
  pep: Boolean(p.pep),
})

/** Corps de PUT : les champs vides sont omis (l'API les traite comme absents). */
const toInput = (f: Form) => {
  const body: Record<string, unknown> = { kind: f.kind, pep: f.pep }
  Object.entries(f).forEach(([k, v]) => {
    if (k !== 'kind' && k !== 'pep' && typeof v === 'string' && v.trim() !== '') body[k] = v.trim()
  })
  return body
}

/** Consultation et modification d'un expéditeur ou d'un bénéficiaire (permission CUSTOMER_WRITE côté API). */
const PartyEditCard: React.FC<{ partyId: string }> = ({ partyId }) => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const { data, loading, refetch } = useFetchData<AdminParty>(`${API_ENDPOINTS.PARTIES}/${partyId}`)
  const countries = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)
  const [form, setForm] = useState<Form | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (data) setForm(fromParty(data))
  }, [data])

  if ((loading && !data) || !form) {
    return (
      <div className="text-center my-5">
        <Spinner type="border" color="primary" />
      </div>
    )
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.put(`${API_ENDPOINTS.PARTIES}/${partyId}`, toInput(form))
      showNotification({ message: 'Fiche enregistrée', variant: 'success' })
      await refetch()
    } catch (err) {
      showNotification({ message: err instanceof ApiError ? err.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  const business = form.kind === 'BUSINESS'
  const field = (label: string, k: keyof Form, type = 'text') => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control type={type} value={form[k] as string} onChange={set(k)} />
    </Form.Group>
  )

  return (
    <Form onSubmit={save}>
      {data?.customer?.displayName && (
        <p className="text-muted">
          {data.role === 'SENDER' ? 'Expéditeur' : 'Bénéficiaire'} du client <strong>{data.customer.displayName}</strong>
        </p>
      )}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select value={form.kind} onChange={set('kind')}>
              <option value="INDIVIDUAL">Particulier</option>
              <option value="BUSINESS">Entreprise</option>
            </Form.Select>
          </Form.Group>
          <Row>
            <Col md={6}>
              {business ? field('Raison sociale', 'businessName') : field('Prénom', 'firstName')}
              {field('Téléphone (+indicatif)', 'phone')}
              {field('Adresse', 'addressLine')}
              {field('Ville', 'city')}
              <Form.Group className="mb-3">
                <Form.Label>Pays</Form.Label>
                <Form.Select value={form.countryCode} onChange={set('countryCode')}>
                  <option value="">—</option>
                  {(countries.data ?? []).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {!business && (
                <Form.Group className="mb-3">
                  <Form.Label>Sexe</Form.Label>
                  <Form.Select value={form.gender} onChange={set('gender')}>
                    <option value="">—</option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                    <option value="OTHER">Autre</option>
                  </Form.Select>
                </Form.Group>
              )}
            </Col>
            <Col md={6}>
              {business ? field("Type d'entreprise", 'businessType') : field('Nom', 'lastName')}
              {field('E-mail', 'email', 'email')}
              {business ? field("Date de création", 'businessRegisteredOn', 'date') : field('Date de naissance', 'birthDate', 'date')}
              <Form.Group className="mb-3">
                <Form.Label>Nationalité</Form.Label>
                <Form.Select value={form.nationality} onChange={set('nationality')}>
                  <option value="">—</option>
                  {(countries.data ?? []).map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              {field('Profession', 'occupation')}
              {field('Civilité', 'civility')}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light fw-bold small py-2">Pièce d'identité</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Type de pièce</Form.Label>
                <Form.Select value={form.idDocumentType} onChange={set('idDocumentType')}>
                  <option value="">—</option>
                  {[...new Set([...(form.idDocumentType ? [form.idDocumentType] : []), 'PP', 'CNI'])].map((t) => (
                    <option key={t} value={t}>{ID_TYPE_LABELS[t] ?? t}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Numéro {data?.idDocument?.numberMasked ? `(actuel : ${data.idDocument.numberMasked})` : ''}</Form.Label>
                <Form.Control value={form.idDocumentNumber} onChange={set('idDocumentNumber')} placeholder="Laisser vide pour ne pas changer" />
              </Form.Group>
            </Col>
            <Col md={4}>{field("Date d'expiration", 'idDocumentExpiresOn', 'date')}</Col>
          </Row>
          <Form.Check
            type="checkbox"
            id="pep"
            label="Personne politiquement exposée (exigé par Wace pour l'expéditeur)"
            checked={form.pep}
            onChange={(e) => setForm({ ...form, pep: e.target.checked })}
          />
        </Card.Body>
      </Card>

      {(data?.destinations ?? []).length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-light fw-bold small py-2">Destinations de paiement</Card.Header>
          <Table className="mb-0 small">
            <tbody>
              {data!.destinations!.map((d) => (
                <tr key={d.id}>
                  <td>{d.kind === 'BANK_ACCOUNT' ? 'Compte bancaire' : 'Mobile money'}</td>
                  <td>{d.bank?.name ?? d.mobileOperator?.name ?? '-'}</td>
                  <td>{d.accountNumberMasked}</td>
                  <td>{countries.data?.find((c) => c.code === d.countryCode)?.name ?? d.countryCode}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <div className="text-center mt-4">
        <Button type="submit" variant="primary" disabled={busy}>
          <IconifyIcon icon="ri:edit-2-line" className="me-1" />
          Enregistrer
        </Button>
      </div>
    </Form>
  )
}

export default PartyEditCard
