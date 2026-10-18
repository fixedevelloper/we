'use client'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import { formatDateTime, formatMoney, TRANSFER_STATUS_LABELS } from '@/lib/api/format'
import type { Dashboard, Page, TransferSummary } from '@/lib/api/types'
import Link from 'next/link'
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from 'react-bootstrap'

const RECENT = { page: 0, size: 8 }

const RecentTransfers = ({ dashboard }: { dashboard: Dashboard }) => {
  const { data, loading, error } = useFetchData<Page<TransferSummary>>(API_ENDPOINTS.TRANSFERS, RECENT)
  const transfers = data?.content ?? []
  const byStatus = Object.entries(dashboard.transfersByStatus)

  return (
    <Row>
      <Col xs={12}>
        <Card>
          <CardHeader className="d-flex flex-wrap align-items-center gap-2">
            <h4 className="header-title me-auto">Derniers transferts</h4>
            <Link href="/transactions" className="btn btn-sm btn-light">
              Tout voir
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="bg-light bg-opacity-50 py-2 px-3 d-flex flex-wrap gap-3 justify-content-center">
              <span>
                <b>{dashboard.activeCustomers.toLocaleString('fr-FR')}</b> clients actifs sur{' '}
                <span className="fw-medium">{dashboard.customers.toLocaleString('fr-FR')}</span>
              </span>
              {dashboard.pendingTopUps > 0 && (
                <span>
                  <b>{dashboard.pendingTopUps}</b> recharge{dashboard.pendingTopUps > 1 ? 's' : ''} en attente
                </span>
              )}
              {byStatus.map(([status, n]) => (
                <Badge key={status} bg={TRANSFER_STATUS_LABELS[status]?.variant ?? 'secondary'}>
                  {TRANSFER_STATUS_LABELS[status]?.label ?? status} : {n.toLocaleString('fr-FR')}
                </Badge>
              ))}
            </div>
            <div className="table-responsive">
              {error ? (
                <p className="text-danger p-3">{error.message}</p>
              ) : loading && !data ? (
                <p className="text-center p-3">Chargement...</p>
              ) : transfers.length === 0 ? (
                <p className="text-center p-3 text-muted">Aucun transfert</p>
              ) : (
                <Table className="table-custom table-centered table-sm table-nowrap table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Client</th>
                      <th>Bénéficiaire</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => {
                      const status = TRANSFER_STATUS_LABELS[t.status]
                      return (
                        <tr key={t.id}>
                          <td>
                            <Link href={`/transactions/${t.id}`}>{t.reference}</Link>
                          </td>
                          <td>{t.customer?.displayName ?? t.senderName ?? '-'}</td>
                          <td>{t.beneficiaryName ?? '-'}</td>
                          <td>{formatMoney(t.sourceAmount)}</td>
                          <td>
                            <Badge bg={status?.variant ?? 'secondary'}>{status?.label ?? t.status}</Badge>
                          </td>
                          <td>{formatDateTime(t.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default RecentTransfers
