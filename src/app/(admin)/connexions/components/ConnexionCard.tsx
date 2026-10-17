'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Badge, Button, Card, CardFooter, CardHeader, Form, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import useModal from '@/hooks/useModal'
import Paginator from '@/components/Paginator'
import ConnexionPdfModal from '../ConnexionPdf'
import { formatDateTime } from '@/lib/api/format'
import type { Page } from '@/lib/api/types'

type Entry = {
  id: number
  email: string
  outcome: string
  ipAddress?: string
  userAgent?: string
  occurredAt: string
}

const ConnexionCard: React.FC = () => {
  const [page, setPage] = useState(0)
  const [showPdf, setShowPdf] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { isOpen, className, toggleModal } = useModal()
  const { data, loading, error } = useFetchData<Page<Entry>>(API_ENDPOINTS.LOGIN_AUDITS, { page, size: 20, sort: 'occurredAt,desc' })
  const audits = data?.content ?? []

  return (
    <div>
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Connexions</h4>
        </div>
        <button className="btn btn-outline-dark" onClick={() => setShowPdf(true)}>
          <IconifyIcon icon="ri:print-line" className="me-1" />
          Imprimer
        </button>
      </CardHeader>
      <div className="table-responsive">
        {loading && !data ? (
          <p className="p-3">Chargement...</p>
        ) : error ? (
          <p className="p-3 text-danger">❌ {error.message}</p>
        ) : (
          <Table className="table-hover mb-0">
            <thead className="bg-light-subtle">
              <tr><th>Date</th><th>E-mail</th><th>Résultat</th><th>IP</th><th>Navigateur</th></tr>
            </thead>
            <tbody>
              {audits.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    Aucune entrée.
                  </td>
                </tr>
              )}
              {audits.map((e) => (
                <tr key={e.id}>
                    <td className="text-nowrap">{formatDateTime(e.occurredAt)}</td>
                    <td>{e.email}</td>
                    <td><Badge bg={e.outcome === 'SUCCESS' ? 'success' : 'danger'}>{e.outcome}</Badge></td>
                    <td>{e.ipAddress || '-'}</td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: 260 }}>{e.userAgent || '-'}</td>
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
      <ConnexionPdfModal
        audits={audits.map((e) => ({ id: e.id, date: formatDateTime(e.occurredAt), name: e.email, status: e.outcome === 'SUCCESS' ? 'ok' : '', message: e.outcome, ip_address: e.ipAddress ?? '', user: null })) as any}
        show={showPdf}
        onClose={() => setShowPdf(false)}
        begin_date={from}
        end_date={to}
      />
    </div>
  )
}

export default ConnexionCard
