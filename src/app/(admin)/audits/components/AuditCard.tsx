'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useState } from 'react'
import { Badge, Button, Card, CardFooter, CardHeader, Form, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import useModal from '@/hooks/useModal'
import Paginator from '@/components/Paginator'
import AuditPdfModal from '../AuditPdf'
import { AUDIT_ACTION_LABELS, AUDIT_ACTOR_TYPE_LABELS, AUDIT_ENTITY_LABELS, formatDateTime } from '@/lib/api/format'
import type { Page } from '@/lib/api/types'

type Entry = {
  id: number
  occurredAt: string
  actor?: string
  actorType: string
  action: string
  entityType: string
  entityId: string
  ipAddress?: string
}

const AuditCard: React.FC = () => {
  const [page, setPage] = useState(0)
  const [showPdf, setShowPdf] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [actor, setActor] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const { isOpen, className, toggleModal } = useModal()
  const { data, loading, error } = useFetchData<Page<Entry>>(API_ENDPOINTS.AUDIT_LOGS, { page, size: 20, sort: 'occurredAt,desc', from: from ? new Date(`${from}T00:00:00`).toISOString() : '', to: to ? new Date(`${to}T23:59:59.999`).toISOString() : '', actor, entityType, entityId })
  const audits = data?.content ?? []

  return (
    <div>
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Journal d'audit</h4>
          {data && <small className="text-muted">{data.totalElements} entrée{data.totalElements > 1 ? 's' : ''}</small>}
        </div>
        <Button variant="soft-primary" onClick={toggleModal}>
          <IconifyIcon icon="ri:filter-line" className="me-1" />
          Filtrer
        </Button>
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
              <tr><th>Date</th><th>Auteur</th><th>Action</th><th>Objet</th><th>IP</th></tr>
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
                    <td>{e.actor ?? AUDIT_ACTOR_TYPE_LABELS[e.actorType] ?? e.actorType}</td>
                    <td>{AUDIT_ACTION_LABELS[e.action] ?? e.action}</td>
                    <td>{AUDIT_ENTITY_LABELS[e.entityType] ?? e.entityType} <small className="text-muted">{e.entityId}</small></td>
                    <td>{e.ipAddress || '-'}</td>
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
      <Modal show={isOpen} onHide={toggleModal} dialogClassName={className}>
        <ModalHeader onHide={toggleModal} closeButton>
          <h4 className="modal-title">Filtrer</h4>
        </ModalHeader>
        <ModalBody>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Du</label>
              <Form.Control type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0) }} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Au</label>
              <Form.Control type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0) }} />
            </div>
            <div className="col-12">
              <label className="form-label">Auteur (e-mail)</label>
              <Form.Control value={actor} onChange={(e) => { setActor(e.target.value); setPage(0) }} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Type d'objet</label>
              <Form.Select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(0) }}>
                <option value="">Tous</option>
                {Object.entries(AUDIT_ENTITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Form.Select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Identifiant de l'objet</label>
              <Form.Control value={entityId} onChange={(e) => { setEntityId(e.target.value); setPage(0) }} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={toggleModal}>Fermer</Button>
        </ModalFooter>
      </Modal>
      <AuditPdfModal
        audits={audits.map((e) => ({ id: e.id, date: formatDateTime(e.occurredAt), name: e.actor ?? AUDIT_ACTOR_TYPE_LABELS[e.actorType] ?? e.actorType, action: AUDIT_ACTION_LABELS[e.action] ?? e.action, message: `${AUDIT_ENTITY_LABELS[e.entityType] ?? e.entityType} ${e.entityId}`, ip_address: e.ipAddress ?? '' })) as any}
        show={showPdf}
        onClose={() => setShowPdf(false)}
        begin_date={from}
        end_date={to}
      />
    </div>
  )
}

export default AuditCard
