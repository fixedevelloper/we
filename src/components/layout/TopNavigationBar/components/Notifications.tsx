'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Badge, Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useSession } from 'next-auth/react'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { apiFetch } from '@/lib/api/http'
import type { Page } from '@/lib/api/types'

/** Ce qui attend une action du personnel : chaque ligne est un compte réel (`totalElements`) lu sur la liste filtrée. */
const TASKS = [
  { key: 'topups', endpoint: API_ENDPOINTS.TOP_UPS, params: { status: 'PENDING' }, href: '/recharges', icon: 'ri:wallet-3-line', variant: 'warning', one: 'recharge en attente', many: 'recharges en attente' },
  { key: 'adjustments', endpoint: API_ENDPOINTS.BALANCE_ADJUSTMENTS, params: { status: 'PENDING' }, href: '/adjustments', icon: 'ri:scales-3-line', variant: 'warning', one: 'ajustement de solde à approuver', many: 'ajustements de solde à approuver' },
  { key: 'kyc', endpoint: API_ENDPOINTS.CUSTOMERS, params: { kycStatus: 'PENDING' }, href: '/customers', icon: 'ri:id-card-line', variant: 'info', one: "pièce d'identité à examiner", many: "pièces d'identité à examiner" },
  { key: 'failed', endpoint: API_ENDPOINTS.TRANSFERS, params: { status: 'FAILED' }, href: '/transactions', icon: 'ri:error-warning-line', variant: 'danger', one: 'transfert échoué', many: 'transferts échoués' },
] as const

const REFRESH_MS = 60_000

const Notifications = () => {
  const { data: session } = useSession()
  const token = session?.accessToken
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    // Une liste refusée (403 : permission absente pour ce rôle) ou en erreur est simplement omise.
    const results = await Promise.all(
      TASKS.map((t) =>
        apiFetch<Page<unknown>>(t.endpoint, { token, params: { ...t.params, page: 0, size: 1 } })
          .then((p): [string, number] | null => [t.key, p.totalElements])
          .catch((): [string, number] | null => null),
      ),
    )
    setCounts(Object.fromEntries(results.filter((r): r is [string, number] => r !== null)))
    setLoaded(true)
  }, [token])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  const pending = TASKS.filter((t) => (counts[t.key] ?? 0) > 0)
  const total = pending.reduce((sum, t) => sum + counts[t.key], 0)

  return (
    <div className="topbar-item">
      <Dropdown align={'end'} onToggle={(open) => open && load()}>
        <DropdownToggle as={'button'} className="topbar-link drop-arrow-none" aria-haspopup="false" aria-expanded="false" title="À traiter">
          <Bell className="fs-22" />
          {total > 0 && <span className="noti-icon-badge" />}
        </DropdownToggle>
        <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-lg">
          <div className="p-2 border-bottom border-dashed d-flex align-items-center justify-content-between">
            <h6 className="m-0 fs-16 fw-semibold">À traiter</h6>
            {total > 0 && <Badge bg="danger">{total}</Badge>}
          </div>
          {!loaded ? (
            <p className="p-3 mb-0 text-muted">Chargement...</p>
          ) : pending.length === 0 ? (
            <div className="text-center py-4 px-3">
              <IconifyIcon icon="ri:checkbox-circle-line" className="fs-48 text-success" />
              <p className="fw-semibold mb-0 mt-2">Rien à traiter</p>
              <small className="text-muted">Aucune demande en attente.</small>
            </div>
          ) : (
            pending.map((t) => (
              <Link key={t.key} href={t.href} className="dropdown-item py-2 text-wrap d-flex align-items-center">
                <span className={`avatar-sm flex-shrink-0 me-3 d-flex align-items-center justify-content-center rounded-circle bg-${t.variant}-subtle text-${t.variant} fs-20`}>
                  <IconifyIcon icon={t.icon} />
                </span>
                <span className="flex-grow-1">
                  <strong>{counts[t.key]}</strong> {counts[t.key] > 1 ? t.many : t.one}
                </span>
              </Link>
            ))
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default Notifications
