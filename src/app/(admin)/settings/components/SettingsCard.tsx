'use client'
import React, { useState } from 'react'
import { Button, Card, CardHeader, Form, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError } from '@/lib/api/http'
import { formatDateTime } from '@/lib/api/format'

type Setting = { key: string; value: unknown; updatedAt?: string }
type Requirement = { platform: 'ANDROID' | 'WEB'; minimumVersion: string }

/** Les paramètres connus de l'API (elle refuse toute autre clé) : libellé, aide et type de saisie. */
const META: Record<string, { label: string; help: string; type: 'boolean' | 'amount' | 'currency' | 'requirements' }> = {
  'transfer.enforce_fee_schedule': {
    label: 'Appliquer la grille tarifaire',
    help: "Si activé, un transfert est refusé quand aucune tranche de frais ne couvre son montant.",
    type: 'boolean',
  },
  'transfer.max_amount_per_transfer': {
    label: 'Plafond par transfert',
    help: 'Montant maximal d\'un transfert (strictement positif).',
    type: 'amount',
  },
  'wallet.default_currency': {
    label: 'Devise par défaut des portefeuilles',
    help: 'Code ISO à trois lettres (XAF, EUR…).',
    type: 'currency',
  },
  'client.requirements': {
    label: 'Versions minimales des applications',
    help: "Version en dessous de laquelle une application est invitée à se mettre à jour.",
    type: 'requirements',
  },
}
const PLATFORM_LABELS = { ANDROID: 'Android', WEB: 'Web' } as const

/** Édition d'un paramètre : la valeur est validée par l'API (type et plage), qui renvoie un message précis. */
const SettingRow: React.FC<{ setting: Setting; onSaved: () => void }> = ({ setting, onSaved }) => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const meta = META[setting.key]
  const [value, setValue] = useState<unknown>(setting.value)
  const [busy, setBusy] = useState(false)
  const dirty = JSON.stringify(value) !== JSON.stringify(setting.value)

  const save = async () => {
    setBusy(true)
    try {
      await api.put(`${API_ENDPOINTS.SETTINGS}/${setting.key}`, { value })
      showNotification({ message: 'Paramètre enregistré', variant: 'success' })
      onSaved()
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  let input: React.ReactNode
  switch (meta?.type) {
    case 'boolean':
      input = <Form.Check type="switch" id={setting.key} label={value ? 'Activé' : 'Désactivé'} checked={Boolean(value)} onChange={(e) => setValue(e.target.checked)} />
      break
    case 'amount':
      input = (
        <Form.Control
          style={{ maxWidth: 220 }}
          inputMode="decimal"
          value={String(value ?? '')}
          onChange={(e) => {
            const raw = e.target.value.replace(',', '.')
            setValue(raw === '' || Number.isNaN(Number(raw)) ? raw : Number(raw))
          }}
        />
      )
      break
    case 'currency':
      input = <Form.Control style={{ maxWidth: 120 }} maxLength={3} value={String(value ?? '')} onChange={(e) => setValue(e.target.value.toUpperCase())} />
      break
    case 'requirements':
      input = (
        <div className="d-flex flex-column gap-2">
          {(value as Requirement[]).map((r, i) => (
            <div key={r.platform} className="d-flex align-items-center gap-2">
              <span style={{ width: 70 }}>{PLATFORM_LABELS[r.platform] ?? r.platform}</span>
              <Form.Control
                style={{ maxWidth: 140 }}
                placeholder="1.0.0"
                value={r.minimumVersion}
                onChange={(e) => setValue((value as Requirement[]).map((x, j) => (j === i ? { ...x, minimumVersion: e.target.value.trim() } : x)))}
              />
            </div>
          ))}
        </div>
      )
      break
    default:
      input = <code>{JSON.stringify(setting.value)}</code>
  }

  return (
    <tr>
      <td style={{ width: '32%' }}>
        <div className="fw-semibold">{meta?.label ?? setting.key}</div>
        <small className="text-muted">{meta?.help ?? setting.key}</small>
      </td>
      <td>{input}</td>
      <td className="text-muted small text-nowrap">{formatDateTime(setting.updatedAt)}</td>
      <td className="text-end">
        {meta && (
          <Button size="sm" disabled={!dirty || busy} onClick={save}>
            Enregistrer
          </Button>
        )}
      </td>
    </tr>
  )
}

/** Paramètres de la plateforme (permission REFERENCE_WRITE). Chaque modification est tracée dans le journal d'audit. */
const SettingsCard: React.FC = () => {
  const { data, loading, error, refetch } = useFetchData<Setting[]>(API_ENDPOINTS.SETTINGS)
  // Les paramètres connus d'abord, dans l'ordre de META ; les autres ensuite, en lecture seule.
  const order = Object.keys(META)
  const settings = [...(data ?? [])].sort((a, b) => (order.indexOf(a.key) + 1 || 99) - (order.indexOf(b.key) + 1 || 99) || a.key.localeCompare(b.key))

  return (
    <Card>
      <CardHeader className="border-bottom">
        <h4 className="header-title mb-0">Paramètres de la plateforme</h4>
      </CardHeader>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="mb-0 align-middle">
            <thead className="bg-light-subtle">
              <tr>
                <th>Paramètre</th>
                <th>Valeur</th>
                <th>Modifié le</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {settings.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted py-4">Aucun paramètre</td></tr>
              )}
              {settings.map((s) => (
                <SettingRow key={`${s.key}@${s.updatedAt}`} setting={s} onSaved={refetch} />
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Card>
  )
}

export default SettingsCard
