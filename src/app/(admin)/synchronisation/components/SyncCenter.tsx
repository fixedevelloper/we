'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, ProgressBar, Row, Table } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import { ApiError, apiFetch } from '@/lib/api/http'
import { formatDateTime } from '@/lib/api/format'

type CountryStep = { code: string; status: 'PENDING' | 'RUNNING' | 'OK' | 'PARTIAL' | 'FAILED'; banks: number; operators: number; payerCodes: number; warnings: string[] }
type Job = {
  id: string
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  country?: string
  startedAt: string
  finishedAt?: string
  totalSteps: number
  doneSteps: number
  current: string
  countries: CountryStep[]
  labels: 'PENDING' | 'RUNNING' | 'OK' | 'PARTIAL'
  referenceValues: number
  banks: number
  operators: number
  payerCodes: number
  warnings: string[]
  error?: string
}
type Overview = {
  provider: { name: string; host?: string; configured: boolean }
  countries: { code: string; name: string; currency: string; bankPayerCode: boolean; banks: number; operators: number; operatorsWithoutPayerCode: number }[]
  referenceValues: number
  lastSync?: { at: string; actor?: string }
}

const STEP_STYLE: Record<CountryStep['status'], { icon: string; variant: string; label: string }> = {
  PENDING: { icon: 'ri:time-line', variant: 'secondary', label: 'En attente' },
  RUNNING: { icon: 'ri:loader-4-line', variant: 'primary', label: 'En cours' },
  OK: { icon: 'ri:checkbox-circle-fill', variant: 'success', label: 'Terminé' },
  PARTIAL: { icon: 'ri:error-warning-fill', variant: 'warning', label: 'Avec avertissements' },
  FAILED: { icon: 'ri:close-circle-fill', variant: 'danger', label: 'Échec' },
}
const JOB_STYLE: Record<Job['status'], { variant: string; label: string }> = {
  RUNNING: { variant: 'primary', label: 'En cours' },
  SUCCEEDED: { variant: 'success', label: 'Terminé' },
  FAILED: { variant: 'danger', label: 'Échec' },
}

const duration = (from: string, to?: string, now = Date.now()): string => {
  const s = Math.max(0, Math.round(((to ? new Date(to).getTime() : now) - new Date(from).getTime()) / 1000))
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`
}

const Tile: React.FC<{ icon: string; value: number; label: string; variant: string }> = ({ icon, value, label, variant }) => (
  <div className="d-flex align-items-center gap-3 p-3 rounded-3 border h-100">
    <span className={`avatar-sm rounded-circle d-flex align-items-center justify-content-center bg-${variant}-subtle text-${variant} fs-20`}>
      <IconifyIcon icon={icon} />
    </span>
    <div>
      <div className="fs-22 fw-bold lh-1">{value.toLocaleString('fr-FR')}</div>
      <small className="text-muted">{label}</small>
    </div>
  </div>
)

/**
 * Import des référentiels Wace en arrière-plan : lancement, avancement en direct (interrogation toutes les secondes),
 * couverture par pays et historique des imports récents (conservés en mémoire côté API).
 */
const SyncCenter: React.FC = () => {
  const { data: session } = useSession()
  const token = session?.accessToken
  const { showNotification } = useNotificationContext()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [history, setHistory] = useState<Job[]>([])
  const [job, setJob] = useState<Job | null>(null)
  const [scope, setScope] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  const fail = (e: unknown) => showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })

  const loadOverview = useCallback(async () => {
    if (!token) return
    try {
      setOverview(await apiFetch<Overview>(API_ENDPOINTS.SYNC_OVERVIEW, { token }))
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de joindre l'API.")
    }
  }, [token])

  const loadHistory = useCallback(
    async (attach = false) => {
      if (!token) return
      try {
        const jobs = await apiFetch<Job[]>(API_ENDPOINTS.SYNC_JOBS, { token })
        setHistory(jobs)
        if (attach && jobs[0]) setJob((current) => current ?? jobs[0])
      } catch {
        // l'erreur de chargement principale est déjà affichée par loadOverview
      }
    },
    [token],
  )

  useEffect(() => {
    loadOverview()
    loadHistory(true)
  }, [loadOverview, loadHistory])

  // Interrogation tant qu'un import tourne ; à la fin, la couverture et l'historique sont relus.
  const running = job?.status === 'RUNNING'
  const jobId = job?.id
  useEffect(() => {
    if (!running || !token || !jobId) return
    const timer = setInterval(async () => {
      setNow(Date.now())
      try {
        const next = await apiFetch<Job>(`${API_ENDPOINTS.SYNC_JOBS}/${jobId}`, { token })
        setJob(next)
        if (next.status !== 'RUNNING') {
          loadOverview()
          loadHistory()
          showNotification({
            message: next.status === 'SUCCEEDED' ? 'Synchronisation terminée' : `Synchronisation en échec : ${next.error ?? 'erreur inconnue'}`,
            variant: next.status === 'SUCCEEDED' ? (next.warnings.length ? 'warning' : 'success') : 'danger',
          })
        }
      } catch {
        // une erreur réseau ponctuelle ne coupe pas le suivi : la prochaine interrogation réessaie
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [running, token, jobId, loadOverview, loadHistory, showNotification])

  const start = async (country?: string) => {
    if (!token) return
    setStarting(true)
    try {
      const started = await apiFetch<Job>(API_ENDPOINTS.SYNC_JOBS, { method: 'POST', token, body: country ? { countryCode: country } : {} })
      setJob(started)
      setNow(Date.now())
    } catch (e) {
      fail(e)
      if (e instanceof ApiError && e.status === 409) loadHistory(true)
    } finally {
      setStarting(false)
    }
  }

  const percent = job ? (job.totalSteps ? Math.round((job.doneSteps / job.totalSteps) * 100) : 0) : 0
  const provider = overview?.provider
  const real = provider?.name === 'wace'
  const warnings = useMemo(() => job?.warnings ?? [], [job])

  if (error && !overview) return <p className="p-3 text-danger">❌ {error}</p>

  return (
    <>
      <Row className="g-3 mb-3">
        <Col lg={7}>
          <Card className="h-100">
            <Card.Body className="d-flex align-items-start gap-3">
              <span className={`avatar-lg rounded-3 d-flex align-items-center justify-content-center fs-28 bg-${real && provider?.configured ? 'success' : 'warning'}-subtle text-${real && provider?.configured ? 'success' : 'warning'}`}>
                <IconifyIcon icon="ri:plug-2-line" />
              </span>
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h4 className="header-title mb-0">Connexion Wace</h4>
                  {!provider ? null : real ? (
                    provider.configured ? <Badge bg="success">Configurée</Badge> : <Badge bg="danger">Identifiants manquants</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">Simulée (développement)</Badge>
                  )}
                </div>
                <p className="text-muted mb-2">
                  {!provider
                    ? 'Chargement...'
                    : real
                      ? `Serveur : ${provider.host ?? 'adresse non renseignée'}`
                      : "Le fournisseur de paiement est simulé : l'import ne ramène pas de vraies données."}
                </p>
                <small className="text-muted">
                  {overview?.lastSync
                    ? `Dernière synchronisation : ${formatDateTime(overview.lastSync.at)}${overview.lastSync.actor ? ` par ${overview.lastSync.actor}` : ''}`
                    : 'Aucune synchronisation enregistrée.'}
                  {overview ? ` · ${overview.referenceValues} libellé(s) en base` : ''}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="h-100">
            <Card.Body>
              <h4 className="header-title mb-3">Lancer une synchronisation</h4>
              <Form.Select className="mb-3" value={scope} onChange={(e) => setScope(e.target.value)} disabled={running || starting}>
                <option value="">Tous les pays récepteurs</option>
                {(overview?.countries ?? []).map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Form.Select>
              <Button className="w-100" size="lg" disabled={running || starting || !overview} onClick={() => start(scope || undefined)}>
                <IconifyIcon icon="ri:refresh-line" className={`me-2 ${running ? 'spin' : ''}`} />
                {running ? 'Synchronisation en cours...' : starting ? 'Démarrage...' : 'Synchroniser maintenant'}
              </Button>
              <small className="text-muted d-block mt-2">L'import ajoute et met à jour, il ne supprime ni ne désactive jamais rien.</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {job && (
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <h4 className="header-title mb-0">{job.status === 'RUNNING' ? 'Synchronisation en cours' : 'Dernière synchronisation'}</h4>
                <Badge bg={JOB_STYLE[job.status].variant}>{JOB_STYLE[job.status].label}</Badge>
                {job.country && <Badge bg="light" text="dark">{job.country}</Badge>}
              </div>
              <small className="text-muted">
                Démarrée {formatDateTime(job.startedAt)} · durée {duration(job.startedAt, job.finishedAt, now)}
              </small>
            </div>

            <div className="d-flex align-items-end justify-content-between mb-1">
              <span className="text-muted">{job.status === 'FAILED' ? job.error : job.current}</span>
              <span className="fs-24 fw-bold lh-1">{job.status === 'RUNNING' && percent === 0 ? '…' : `${percent} %`}</span>
            </div>
            <ProgressBar
              now={job.status === 'RUNNING' && percent === 0 ? 4 : percent}
              variant={job.status === 'FAILED' ? 'danger' : job.status === 'SUCCEEDED' ? (warnings.length ? 'warning' : 'success') : 'primary'}
              animated={job.status === 'RUNNING'}
              striped={job.status === 'RUNNING'}
              style={{ height: 14, borderRadius: 8 }}
              className="mb-4"
            />

            <Row className="g-3 mb-4">
              <Col sm={6} xl={3}><Tile icon="ri:bank-line" value={job.banks} label="banques" variant="primary" /></Col>
              <Col sm={6} xl={3}><Tile icon="ri:smartphone-line" value={job.operators} label="opérateurs créés" variant="info" /></Col>
              <Col sm={6} xl={3}><Tile icon="ri:key-2-line" value={job.payerCodes} label="codes payeurs" variant="success" /></Col>
              <Col sm={6} xl={3}><Tile icon="ri:price-tag-3-line" value={job.referenceValues} label="libellés" variant="warning" /></Col>
            </Row>

            <div className="d-flex flex-wrap gap-2">
              {job.countries.map((c) => {
                const st = STEP_STYLE[c.status]
                return (
                  <div key={c.code} className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 border border-${st.variant}-subtle bg-${st.variant}-subtle`} title={`${st.label} · ${c.banks} banque(s), ${c.operators} opérateur(s), ${c.payerCodes} code(s)`}>
                    <IconifyIcon icon={st.icon} className={`text-${st.variant} fs-18 ${c.status === 'RUNNING' ? 'spin' : ''}`} />
                    <strong>{c.code}</strong>
                    {(c.status === 'OK' || c.status === 'PARTIAL') && <small className="text-muted">{c.banks} banque(s) · {c.operators} op.</small>}
                  </div>
                )
              })}
              {(() => {
                const st = STEP_STYLE[job.labels === 'PENDING' ? 'PENDING' : job.labels]
                return (
                  <div className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 border border-${st.variant}-subtle bg-${st.variant}-subtle`} title={st.label}>
                    <IconifyIcon icon={st.icon} className={`text-${st.variant} fs-18 ${job.labels === 'RUNNING' ? 'spin' : ''}`} />
                    <strong>Libellés</strong>
                  </div>
                )
              })()}
            </div>

            {warnings.length > 0 && (
              <Alert variant="warning" className="mt-4 mb-0">
                <strong>{warnings.length} avertissement{warnings.length > 1 ? 's' : ''} à traiter</strong>
                <ul className="mb-0 mt-2 ps-3">
                  {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="mb-3">
        <Card.Header className="border-bottom"><h4 className="header-title mb-0">Couverture par pays</h4></Card.Header>
        <div className="table-responsive">
          <Table className="table-hover text-nowrap mb-0 align-middle">
            <thead className="bg-light-subtle">
              <tr><th>Pays</th><th>Devise</th><th>Code payeur banque</th><th>Banques</th><th>Opérateurs mobiles</th><th className="text-end">Action</th></tr>
            </thead>
            <tbody>
              {overview && overview.countries.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">Aucun pays récepteur. Ajoutez-en un depuis la page Pays.</td></tr>
              )}
              {(overview?.countries ?? []).map((c) => (
                <tr key={c.code}>
                  <td className="fw-semibold">{c.name} <small className="text-muted">{c.code}</small></td>
                  <td>{c.currency}</td>
                  <td>{c.bankPayerCode ? <Badge bg="success">Renseigné</Badge> : <Badge bg="danger">Manquant</Badge>}</td>
                  <td>{c.banks > 0 ? c.banks : <Badge bg="warning" text="dark">Aucune</Badge>}</td>
                  <td>
                    {c.operators === 0 ? <Badge bg="warning" text="dark">Aucun</Badge> : c.operators}
                    {c.operatorsWithoutPayerCode > 0 && <Badge bg="danger" className="ms-2">{c.operatorsWithoutPayerCode} sans code payeur</Badge>}
                  </td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-primary" disabled={running || starting} onClick={() => start(c.code)}>Synchroniser</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <Card.Header className="border-bottom"><h4 className="header-title mb-0">Historique récent</h4></Card.Header>
        <div className="table-responsive">
          <Table className="table-hover text-nowrap mb-0 align-middle">
            <thead className="bg-light-subtle">
              <tr><th>Début</th><th>Portée</th><th>Durée</th><th>Banques</th><th>Opérateurs</th><th>Codes</th><th>Avertissements</th><th>Statut</th><th /></tr>
            </thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Aucune synchronisation depuis le dernier démarrage de l'API.</td></tr>}
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{formatDateTime(h.startedAt)}</td>
                  <td>{h.country ?? 'Tous les pays'}</td>
                  <td>{duration(h.startedAt, h.finishedAt, now)}</td>
                  <td>{h.banks}</td>
                  <td>{h.operators}</td>
                  <td>{h.payerCodes}</td>
                  <td>{h.warnings.length || '-'}</td>
                  <td><Badge bg={JOB_STYLE[h.status].variant}>{JOB_STYLE[h.status].label}</Badge></td>
                  <td className="text-end"><Button size="sm" variant="light" onClick={() => setJob(h)}>Détails</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Card.Footer className="text-muted small">L'historique est conservé en mémoire (10 derniers imports) ; la trace durable est dans la page Audits.</Card.Footer>
      </Card>

      <style jsx global>{`
        @keyframes sync-spin { to { transform: rotate(360deg); } }
        .spin { display: inline-block; animation: sync-spin 1s linear infinite; }
      `}</style>
    </>
  )
}

export default SyncCenter
