'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import debounce from 'lodash.debounce'
import Link from 'next/link'
import { Button, Card, CardFooter, CardHeader, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '../../../(other)/api/Constant'
import React, { useEffect, useState } from 'react'
import useModal from '../../../../hooks/useModal'
import Paginator from '@/components/Paginator'
import TransactionPdfModal from '../TransactionPdf'
import { formatDateTime, formatMoney, TRANSFER_KIND_LABELS, TRANSFER_STATUS_LABELS } from '@/lib/api/format'
import type { Page, TransferSummary } from '@/lib/api/types'

const TransactionsCard: React.FC = () => {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showPdf, setShowPdf] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const { isOpen, className, toggleModal, openModalWithClass } = useModal()

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(search), 500)
    handler()
    return () => handler.cancel()
  }, [search])

  const { data, loading, error } = useFetchData<Page<TransferSummary>>(API_ENDPOINTS.TRANSFERS, { page, size, search: debouncedSearch, from, to, status, sort: 'createdAt,desc' })
  useEffect(() => setPage(0), [debouncedSearch, from, to, status, size])

  const transactions = data?.content ?? []

  return (
    <div>
      <Card>
        <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1">
            <h4 className="header-title">Transferts</h4>
            {data && (
              <p className="text-muted mb-0 small">
                {data.totalElements.toLocaleString('fr-FR')} transfert{data.totalElements > 1 ? 's' : ''}
                {(debouncedSearch || from || to || status) && ' correspondant aux filtres'}
              </p>
            )}
          </div>
          <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
            <div className="position-relative">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Référence, nom..." />
              <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
            </div>
            <button className="btn btn-outline-dark" onClick={() => setShowPdf(true)}>
              <IconifyIcon icon="ri:print-line" className="me-1" />
              Imprimer
            </button>
            <Button onClick={() => openModalWithClass('')} className="btn btn-soft-primary">
              <IconifyIcon icon="ri:filter-line" className="me-1" />
              Filtrer
            </Button>
            <Link href="/transactions/add-transaction" className="btn btn-primary">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Ajouter
            </Link>
          </div>
        </CardHeader>

        <div className="table-responsive">
          {loading && !data ? (
            <p className="text-center p-3">Chargement...</p>
          ) : error ? (
            <p className="text-danger p-3">{error.message}</p>
          ) : (
            <Table className="table-hover text-nowrap mb-0">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Référence</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Client</th>
                  <th>Bénéficiaire</th>
                  <th>Montant envoyé</th>
                  <th>Total débité</th>
                  <th>Reçu</th>
                  <th>Statut</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-muted">
                      Aucun transfert trouvé.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.reference}</td>
                      <td>{formatDateTime(t.createdAt)}</td>
                      <td>{TRANSFER_KIND_LABELS[t.kind] ?? t.kind}</td>
                      <td>{t.customer?.displayName || t.senderName || '-'}</td>
                      <td>{t.beneficiaryName || '-'}</td>
                      <td>{formatMoney(t.sourceAmount)}</td>
                      <td>{formatMoney(t.totalDebit)}</td>
                      <td>{formatMoney(t.destinationAmount)}</td>
                      <td>
                        <span className={`badge bg-${TRANSFER_STATUS_LABELS[t.status]?.variant ?? 'secondary'}-subtle text-${TRANSFER_STATUS_LABELS[t.status]?.variant ?? 'secondary'}`}>
                          {TRANSFER_STATUS_LABELS[t.status]?.label ?? t.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="hstack gap-1 justify-content-end">
                          <Link href={`/transactions/${t.id}`} className="btn btn-soft-primary btn-sm btn-icon rounded-circle">
                            <IconifyIcon icon="ri:eye-line" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </div>

        <CardFooter className="d-flex justify-content-between align-items-center">
          <Dropdown>
            <DropdownToggle as={'button'} className="btn btn-light dropdown-toggle" type="button">
              X{size}
            </DropdownToggle>
            <DropdownMenu>
              {[10, 20, 50, 100].map((n) => (
                <DropdownItem key={n} onClick={() => setSize(n)}>
                  {n}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Paginator page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
        </CardFooter>
      </Card>

      <Modal show={isOpen} onHide={toggleModal} dialogClassName={className}>
        <ModalHeader onHide={toggleModal} closeButton>
          <h4 className="modal-title">Filtrer les transferts</h4>
        </ModalHeader>
        <ModalBody>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Du</label>
              <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Au</label>
              <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label">Statut</label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Tous</option>
                {Object.entries(TRANSFER_STATUS_LABELS).map(([code, s]) => (
                  <option key={code} value={code}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setFrom('')
              setTo('')
              setStatus('')
              toggleModal()
            }}
          >
            Réinitialiser
          </Button>
          <Button variant="primary" onClick={toggleModal}>
            Fermer
          </Button>
        </ModalFooter>
      </Modal>

      <TransactionPdfModal transactions={transactions} show={showPdf} onClose={() => setShowPdf(false)} begin_date={from} end_date={to} />
    </div>
  )
}

export default TransactionsCard
