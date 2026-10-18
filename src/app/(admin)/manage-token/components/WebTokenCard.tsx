'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Badge, Card, CardFooter, CardHeader, Table } from 'react-bootstrap'
import Link from 'next/link'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import Paginator from '@/components/Paginator'
import { formatDateTime, formatMoney, WEB_TOKEN_STATUS_LABELS } from '@/lib/api/format'
import { useCountryNames } from '@/hooks/useCountryNames'
import type { Money, Page } from '@/lib/api/types'

type WebToken = { id: number; amount: Money; countryCode: string; status: 'PENDING' | 'USED' | 'EXPIRED'; expiresAt: string; usedAt?: string; createdAt?: string }

/** Jetons à usage unique du service WhatsApp. Le jeton lui-même n'est montré qu'à sa création (seule son empreinte est stockée). */
const WebTokenCard: React.FC = () => {
  const countryName = useCountryNames()
  const [page, setPage] = useState(0)
  const { data, loading, error } = useFetchData<Page<WebToken>>(API_ENDPOINTS.WEB_TOKENS, { page, size: 10, sort: 'createdAt,desc' })
  const tokens = data?.content ?? []

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Jetons web</h4>
          {data && <small className="text-muted">{data.totalElements} jeton{data.totalElements > 1 ? 's' : ''}</small>}
        </div>
        <Link href="/manage-token/add" className="btn btn-primary">
          <IconifyIcon icon="ri:add-line" className="me-1" />
          Créer un jeton
        </Link>
      </CardHeader>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover text-nowrap mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Créé le</th>
                <th>Montant</th>
                <th>Pays</th>
                <th>Expire le</th>
                <th>Utilisé le</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Aucun jeton créé.
                  </td>
                </tr>
              )}
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td>{formatDateTime(t.createdAt)}</td>
                  <td>{formatMoney(t.amount)}</td>
                  <td>{countryName(t.countryCode)}</td>
                  <td>{formatDateTime(t.expiresAt)}</td>
                  <td>{t.usedAt ? formatDateTime(t.usedAt) : '-'}</td>
                  <td>
                    <Badge bg={WEB_TOKEN_STATUS_LABELS[t.status]?.variant}>{WEB_TOKEN_STATUS_LABELS[t.status]?.label ?? t.status}</Badge>
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

export default WebTokenCard
