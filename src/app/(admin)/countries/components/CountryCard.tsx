'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { Card, CardHeader, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "react-bootstrap";
import Link from "next/link";
import {useFetchData} from "../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../(other)/api/Constant";


interface Country {
  id: number;
  name: string;
  code_iso: string;
  code_iso2: string;
  currency: string;
}

interface CountryResponse {
  data: Country[];
}

const CountryCard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = debounce((value: string) => setDebouncedSearch(value), 500);
    handler(search);
    return () => handler.cancel();
  }, [search]);

  const { data, loading, error, refetch } = useFetchData<CountryResponse>(
      API_ENDPOINTS.COUNTRIES,
      { page, limit, search: debouncedSearch }
  );

  useEffect(() => {
    refetch?.({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch, refetch]);

  const countries = data?.data ?? [];

  return (
      <Card>
        <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1">
            <h4 className="header-title">Pays</h4>
          </div>
          <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
            <div className="flex-shrink-0 d-flex align-items-center gap-2">
              <div className="position-relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-control ps-4"
                    placeholder="Search Here..."
                />
                <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
              </div>
            </div>
            <Link href="/recharges/add-recharge" className="btn btn-primary">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Ajouter
            </Link>
          </div>
        </CardHeader>

        <div className="table-responsive">
          {loading ? (
              <p>Chargement...</p>
          ) : error ? (
              <p>❌ {error.message}</p>
          ) : (
              <Table className="table-hover text-nowrap mb-0">
                <thead className="bg-light-subtle">
                <tr>
                  <th className="ps-3" style={{ width: 50 }}><input type="checkbox" className="form-check-input" /></th>
                  <th className="fs-12 text-uppercase text-muted">ID</th>
                  <th className="fs-12 text-uppercase text-muted">Nom</th>
                  <th className="fs-12 text-uppercase text-muted">Code ISO</th>
                  <th className="fs-12 text-uppercase text-muted">Code ISO2</th>
                  <th className="fs-12 text-uppercase text-muted">Monaire</th>
                  <th className="text-center fs-12 text-uppercase text-muted" style={{ width: 120 }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {countries.map((t) => (
                    <tr key={t.id}>
                      <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
                      <td><span className="text-muted fw-semibold">#{t.id}</span></td>
                      <td><h6 className="fs-14 mb-0">{t.name || "-"}</h6></td>
                      <td><span className="fs-15 text-muted">{t.code_iso || "-"}</span></td>
                      <td><span className="fs-15 text-muted">{t.code_iso2 || "-"}</span></td>
                      <td><span className="fs-15 text-muted">{t.currency || "-"}</span></td>
                      <td className="pe-3">
                        <div className="hstack gap-1 justify-content-end">
                          <Dropdown>
                            <DropdownToggle className="btn btn-secondary" id="dropdownMenuLink" />
                            <DropdownMenu>
                              <DropdownItem as={Link} href={`/countries/cities/${t.id}`}>Villes</DropdownItem>
                              <DropdownItem as={Link} href={`/countries/banks/${t.id}`}>Banques</DropdownItem>
                              <DropdownItem as={Link} href={`/countries/operators/${t.id}`}>Opérateurs</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </Table>
          )}
        </div>
      </Card>
  );
};

export default CountryCard;