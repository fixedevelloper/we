'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useMemo, useState } from 'react'
import { Badge, Button, Card, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, Row, Table } from 'react-bootstrap'
import Link from 'next/link'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'
import type { Country } from '@/lib/api/types'

type SyncResult = { banks?: number; operators?: number; payerCodes?: number; referenceValues?: number; warnings?: string[] }
type Zone = { id: number; code: string; name: string }

const EMPTY = { code: '', iso3: '', name: '', currencyCode: '', callingCode: '', pricingZoneId: '', canSend: false, canReceive: true, syncAfter: true }

const syncMessage = (r: SyncResult, scope: string): { message: string; variant: 'success' | 'warning' } => ({
  message: `Import ${scope} terminé : ${r.banks ?? 0} banque(s), ${r.operators ?? 0} opérateur(s) créé(s), ${r.payerCodes ?? 0} code(s) payeur, ${r.referenceValues ?? 0} libellé(s).${
    r.warnings?.length ? ` ${r.warnings.length} avertissement(s) : ${r.warnings.slice(0, 3).join(' ; ')}` : ''
  }`,
  variant: r.warnings?.length ? 'warning' : 'success',
})

const CountryCard: React.FC = () => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const { data, loading, error, refetch } = useFetchData<Country[]>(API_ENDPOINTS.COUNTRIES)
  const zones = useFetchData<Zone[]>(API_ENDPOINTS.PRICING_ZONES)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [syncingCode, setSyncingCode] = useState<string | null>(null)

  const countries = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [data, search])

  const fail = (e: unknown) => showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })

  /** Importe depuis Wace codes payeurs, banques, opérateurs mobiles et libellés — pour un pays, ou pour tous (permission REFERENCE_WRITE). */
  const runSync = async (countryCode?: string) => {
    const r = await api.post<SyncResult>(`${API_ENDPOINTS.REFERENCE_SYNC}${countryCode ? `?countryCode=${countryCode}` : ''}`)
    showNotification(syncMessage(r, countryCode ?? 'de tous les pays'))
  }

  const sync = async (countryCode?: string) => {
    const label = countryCode ? `pour ${countries.find((c) => c.code === countryCode)?.name ?? countryCode}` : 'pour tous les pays'
    if (!window.confirm(`Importer depuis Wace les banques, opérateurs, codes payeurs et libellés ${label} ?`)) return
    setSyncing(true)
    setSyncingCode(countryCode ?? null)
    try {
      await runSync(countryCode)
    } catch (e) {
      fail(e)
    } finally {
      setSyncing(false)
      setSyncingCode(null)
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const code = form.code.trim().toUpperCase()
    try {
      await api.post(API_ENDPOINTS.ADMIN_COUNTRIES, {
        code,
        iso3: form.iso3.trim().toUpperCase(),
        name: form.name.trim(),
        currencyCode: form.currencyCode.trim().toUpperCase(),
        callingCode: form.callingCode.trim() ? (form.callingCode.trim().startsWith('+') ? form.callingCode.trim() : `+${form.callingCode.trim()}`) : undefined,
        pricingZoneId: form.pricingZoneId ? Number(form.pricingZoneId) : undefined,
        canSend: form.canSend,
        canReceive: form.canReceive,
      })
      showNotification({ message: `Pays ${form.name.trim()} ajouté`, variant: 'success' })
      const syncAfter = form.canReceive && form.syncAfter
      setForm(EMPTY)
      setAdding(false)
      await refetch()
      if (syncAfter) {
        setSyncing(true)
        setSyncingCode(code)
        try {
          await runSync(code)
        } catch (err) {
          fail(err)
        } finally {
          setSyncing(false)
          setSyncingCode(null)
        }
      }
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Pays</h4>
          {data && <small className="text-muted">{countries.length} pays</small>}
        </div>
        <Button variant="primary" onClick={() => setAdding((v) => !v)}>
          <IconifyIcon icon="ri:add-line" className="me-1" />
          Ajouter un pays
        </Button>
        <Button variant="outline-primary" disabled={syncing} onClick={() => sync()}>
          <IconifyIcon icon="ri:refresh-line" className="me-1" />
          {syncing && syncingCode === null ? 'Import...' : 'Importer depuis Wace'}
        </Button>
        <div className="position-relative">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Rechercher..." />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>

      {adding && (
        <Card.Body className="border-bottom">
          <Form onSubmit={create}>
            <Row className="g-2">
              <Col md={2}><Form.Label className="small mb-1">Code ISO (2 lettres)</Form.Label><Form.Control required maxLength={2} pattern="[A-Za-z]{2}" placeholder="GA" value={form.code} onChange={set('code')} /></Col>
              <Col md={2}><Form.Label className="small mb-1">Code ISO3</Form.Label><Form.Control required maxLength={3} pattern="[A-Za-z]{3}" placeholder="GAB" value={form.iso3} onChange={set('iso3')} /></Col>
              <Col md={4}><Form.Label className="small mb-1">Nom</Form.Label><Form.Control required placeholder="Gabon" value={form.name} onChange={set('name')} /></Col>
              <Col md={2}><Form.Label className="small mb-1">Devise</Form.Label><Form.Control required maxLength={3} pattern="[A-Za-z]{3}" placeholder="XAF" value={form.currencyCode} onChange={set('currencyCode')} /></Col>
              <Col md={2}><Form.Label className="small mb-1">Indicatif</Form.Label><Form.Control placeholder="+241" value={form.callingCode} onChange={set('callingCode')} /></Col>
              <Col md={4}>
                <Form.Label className="small mb-1">Zone tarifaire (frais)</Form.Label>
                <Form.Select value={form.pricingZoneId} onChange={set('pricingZoneId')}>
                  <option value="">Aucune pour l'instant</option>
                  {(zones.data ?? []).map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={8} className="d-flex flex-wrap align-items-end gap-4 pb-1">
                <Form.Check type="switch" id="c-send" label="Envoi depuis ce pays" checked={form.canSend} onChange={set('canSend')} />
                <Form.Check type="switch" id="c-receive" label="Réception dans ce pays" checked={form.canReceive} onChange={set('canReceive')} />
                {form.canReceive && <Form.Check type="switch" id="c-sync" label="Importer depuis Wace après l'ajout" checked={form.syncAfter} onChange={set('syncAfter')} />}
              </Col>
            </Row>
            <div className="mt-3 d-flex gap-2">
              <Button type="submit" disabled={busy}>{busy ? 'Ajout...' : 'Ajouter'}</Button>
              <Button variant="light" onClick={() => { setAdding(false); setForm(EMPTY) }}>Annuler</Button>
            </div>
          </Form>
        </Card.Body>
      )}

      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover text-nowrap mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Nom</th>
                <th>Code</th>
                <th>Devise</th>
                <th>Indicatif</th>
                <th>Envoi / réception</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {countries.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">Aucun pays</td></tr>
              )}
              {countries.map((c) => (
                <tr key={c.code}>
                  <td>{c.flagUrl && <img src={c.flagUrl} alt="" width={24} height={16} className="me-2 rounded-1" style={{ objectFit: 'cover' }} />}{c.name}</td>
                  <td>{c.code}</td>
                  <td>{c.currencyCode}</td>
                  <td>{c.callingCode ? (c.callingCode.startsWith('+') ? c.callingCode : `+${c.callingCode}`) : '-'}</td>
                  <td>
                    {c.canSend && <Badge bg="info" className="me-1">Envoi</Badge>}
                    {c.canReceive && <Badge bg="success">Réception</Badge>}
                    {!c.canSend && !c.canReceive && <span className="text-muted">-</span>}
                  </td>
                  <td className="pe-3 text-center">
                    <Dropdown>
                      <DropdownToggle className="btn btn-secondary btn-sm" />
                      <DropdownMenu>
                        {c.canReceive && (
                          <DropdownItem disabled={syncing} onClick={() => sync(c.code)}>
                            {syncingCode === c.code ? 'Import en cours...' : 'Synchroniser avec Wace'}
                          </DropdownItem>
                        )}
                        <DropdownItem as={Link} href={`/countries/cities/${c.code}`}>Villes</DropdownItem>
                        <DropdownItem as={Link} href={`/countries/banks/${c.code}`}>Banques</DropdownItem>
                        <DropdownItem as={Link} href={`/countries/operators/${c.code}`}>Opérateurs mobiles</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export default CountryCard
