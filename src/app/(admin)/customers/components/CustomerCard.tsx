'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import { Badge, Card, CardFooter, CardHeader, Dropdown, Form, DropdownItem, DropdownMenu, DropdownToggle, Table } from 'react-bootstrap'
import Link from 'next/link'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import Paginator from '@/components/Paginator'
import { CUSTOMER_STATUS_LABELS, formatDate, formatMoney, KYC_STATUS_LABELS } from '@/lib/api/format'
import { useCountryNames } from '@/hooks/useCountryNames'
import type { Money, Page } from '@/lib/api/types'

type CustomerRow = {
  id: string
  displayName: string
  kind: 'INDIVIDUAL' | 'BUSINESS'
  email?: string
  phone?: string
  countryCode?: string
  kycStatus: string
  status: string
  balance?: Money
  createdAt?: string
}

const PAGE_SIZE = 10

const CustomerCard: React.FC = () => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [kycStatus, setKycStatus] = useState('')
  const countryName = useCountryNames()

  // Debounce : une requête par pause de frappe, pas une par touche.
  useEffect(() => {
    const handler = debounce((value: string) => setDebouncedSearch(value), 500)
    handler(search)
    return () => handler.cancel()
  }, [search])

  useEffect(() => setPage(0), [debouncedSearch, status, kycStatus])

  const { data, loading, error } = useFetchData<Page<CustomerRow>>(API_ENDPOINTS.CUSTOMERS, {
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    status,
    kycStatus,
  })

  const customers = data?.content ?? []

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">Clients</h4>
          {data && (
            <p className="text-muted mb-0 small">
              {data.totalElements.toLocaleString('fr-FR')} client{data.totalElements > 1 ? 's' : ''}
              {(debouncedSearch || status || kycStatus) && ' correspondant aux filtres'}
            </p>
          )}
        </div>
        <Form.Select style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les comptes</option>
          {Object.entries(CUSTOMER_STATUS_LABELS).map(([code, o]) => (
            <option key={code} value={code}>
              {o.label}
            </option>
          ))}
        </Form.Select>
        <Form.Select style={{ width: 180 }} value={kycStatus} onChange={(e) => setKycStatus(e.target.value)}>
          <option value="">Toutes les identités</option>
          {Object.entries(KYC_STATUS_LABELS).map(([code, o]) => (
            <option key={code} value={code}>
              {o.label}
            </option>
          ))}
        </Form.Select>
        <div className="position-relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control ps-4"
            placeholder="Rechercher un client..."
          />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>

      <div className="table-responsive">
        {loading && !data ? (
          <p className="text-center p-3">Chargement...</p>
        ) : error ? (
          <p className="text-danger p-3">❌ {error.message}</p>
        ) : customers.length === 0 ? (
          <p className="text-center p-3 text-muted">Aucun client trouvé</p>
        ) : (
          <Table className="table-hover text-nowrap mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Téléphone</th>
                <th>Pays</th>
                <th>Solde</th>
                <th>Inscrit le</th>
                <th>Identité (KYC)</th>
                <th>Statut</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.displayName || '-'}</td>
                  <td>{c.kind === 'BUSINESS' ? 'Entreprise' : 'Particulier'}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{countryName(c.countryCode)}</td>
                  <td>{c.balance ? formatMoney(c.balance) : '-'}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    <Badge bg={KYC_STATUS_LABELS[c.kycStatus]?.variant ?? 'secondary'}>
                      {KYC_STATUS_LABELS[c.kycStatus]?.label ?? c.kycStatus}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={CUSTOMER_STATUS_LABELS[c.status]?.variant ?? 'secondary'}>{CUSTOMER_STATUS_LABELS[c.status]?.label ?? c.status}</Badge>
                  </td>
                  <td className="text-center pe-3">
                    <Dropdown>
                      <DropdownToggle className="btn btn-light btn-sm">⋮</DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem as={Link} href={`/customers/${c.id}`}>
                          Détails et identité
                        </DropdownItem>
                        <DropdownItem as={Link} href={`/customers/${c.id}/edit`}>
                          Statut du compte
                        </DropdownItem>
                        <DropdownItem as={Link} href={`/customers/senders/${c.id}`}>
                          Expéditeurs
                        </DropdownItem>
                        <DropdownItem as={Link} href={`/customers/beneficiaries/${c.id}`}>
                          Bénéficiaires
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {(data?.totalPages ?? 0) > 1 && (
        <CardFooter>
          <Paginator page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
        </CardFooter>
      )}
    </Card>
  )
}

export default CustomerCard
