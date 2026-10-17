'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import { Card, CardFooter, CardHeader, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Table } from 'react-bootstrap'
import Link from 'next/link'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import Paginator from '@/components/Paginator'
import { formatDate, partyName } from '@/lib/api/format'
import type { Page, Party } from '@/lib/api/types'

type AdminParty = Party & { customer?: { id?: string; displayName?: string } }

const PAGE_SIZE = 10

/**
 * Liste des expéditeurs (SENDER) ou des bénéficiaires (BENEFICIARY), de tous les clients ou d'un seul (`customerId`).
 * Les numéros de pièce sont toujours masqués par l'API.
 */
const PartyListCard: React.FC<{ role: 'SENDER' | 'BENEFICIARY'; customerId?: string }> = ({ role, customerId }) => {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const base = role === 'SENDER' ? 'senders' : 'beneficiaries'

  useEffect(() => {
    const handler = debounce((value: string) => setDebouncedSearch(value), 500)
    handler(search)
    return () => handler.cancel()
  }, [search])
  useEffect(() => setPage(0), [debouncedSearch])

  const { data, loading, error } = useFetchData<Page<AdminParty>>(API_ENDPOINTS.PARTIES, { page, size: PAGE_SIZE, search: debouncedSearch, role, customerId })

  const parties = data?.content ?? []

  return (
    <Card>
      <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
        <div className="flex-grow-1">
          <h4 className="header-title">{role === 'SENDER' ? 'Expéditeurs' : 'Bénéficiaires'}</h4>
        </div>
        <div className="position-relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control ps-4"
            placeholder="Rechercher..."
          />
          <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
        </div>
      </CardHeader>

      <div className="table-responsive">
        {loading && !data ? (
          <p className="text-center p-3">Chargement...</p>
        ) : error ? (
          <p className="text-danger p-3">❌ {error.message}</p>
        ) : parties.length === 0 ? (
          <p className="text-center p-3 text-muted">Aucun résultat</p>
        ) : (
          <Table className="table-hover text-nowrap mb-0">
            <thead className="bg-light-subtle">
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Téléphone</th>
                <th>Pays</th>
                <th>Pièce</th>
                <th>Expiration</th>
                <th>Client</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((p) => (
                <tr key={p.id}>
                  <td>{partyName(p)}</td>
                  <td>{p.kind === 'BUSINESS' ? 'Entreprise' : 'Particulier'}</td>
                  <td>{p.phone || '-'}</td>
                  <td>{p.countryCode || '-'}</td>
                  <td>
                    {p.idDocument?.type || '-'} {p.idDocument?.numberMasked ?? ''}
                  </td>
                  <td>{formatDate(p.idDocument?.expiresOn)}</td>
                  <td>
                    {p.customer?.id ? (
                      <Link href={`/customers/${p.customer.id}`}>{p.customer.displayName ?? 'Voir'}</Link>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="text-center pe-3">
                    <Dropdown>
                      <DropdownToggle className="btn btn-light btn-sm">⋮</DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem as={Link} href={`/${base}/${p.id}`}>
                          Détails et modification
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

export default PartyListCard
