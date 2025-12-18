'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { Card, CardHeader, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "react-bootstrap";
import Link from "next/link";
import {useFetchData} from "../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../(other)/api/Constant";


interface Token {
  id: number;
  amount: number;
  token: string;
  phone: string;
  created_at: string;
  expires_at: string;
  status: "active" | "used" | "expired";
}



interface TokenResponse {
  data: Token[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


const WebTokenCard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = debounce((value: string) => setDebouncedSearch(value), 500);
    handler(search);
    return () => handler.cancel();
  }, [search]);

  const { data, loading, error, refetch } = useFetchData<TokenResponse>(
      API_ENDPOINTS.WEBTOKENS,
      { page, limit, search: debouncedSearch }
  );

  useEffect(() => {
    refetch?.({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch, refetch]);

  const response = data?.data;
  const tokens = Array.isArray(response?.data) ? response.data : [];
  const meta = response?.meta;


  const formatDate = (date?: string) =>
      date ? new Date(date).toLocaleString("fr-FR") : "-";
  const renderStatus = (status: Token["status"]) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success">Actif</span>;
      case "used":
        return <span className="badge bg-secondary">Utilisé</span>;
      case "expired":
        return <span className="badge bg-danger">Expiré</span>;
      default:
        return <span className="badge bg-light text-dark">-</span>;
    }
  };
  console.log("API response:", data);
  console.log("Tokens:", data?.data);

  return (
      <Card>
        <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1">
            <h4 className="header-title">Manage token</h4>
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
            <Link href="/manage-token/add" className="btn btn-primary">
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
                  <th className="fs-12 text-uppercase text-muted">Telephone</th>
                  <th className="fs-12 text-uppercase text-muted">Token</th>
                  <th className="fs-12 text-uppercase text-muted">Montant</th>
                  <th className="fs-12 text-uppercase text-muted">Date creation</th>
                  <th className="fs-12 text-uppercase text-muted">Expiration</th>
                  <th className="fs-12 text-uppercase text-muted">Status</th>
                  <th className="text-center fs-12 text-uppercase text-muted" style={{ width: 120 }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {tokens.map((t) => (
                    <tr key={t.id}>
                      <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
                      <td><span className="text-muted fw-semibold">#{t.id}</span></td>
                      <td><h6 className="fs-14 mb-0">{t.phone || "-"}</h6></td>
                      <td><h6 className="fs-14 mb-0">{t.token || "-"}</h6></td>
                      <td><h6 className="fs-14 mb-0">{t.amount || "-"}</h6></td>
                      <td><h6 className="fs-14 mb-0">{formatDate(t.created_at)}</h6></td>
                      <td><h6 className="fs-14 mb-0">{formatDate(t.expires_at)}</h6></td>

                      <td>{renderStatus(t.status)}</td>

                      <td className="pe-3">
                        <div className="hstack gap-1 justify-content-end">
                          <button
                              className="btn btn-sm btn-light"
                              onClick={() => navigator.clipboard.writeText(t.token)}
                          >
                            <IconifyIcon icon="mdi:content-copy" />
                          </button>

                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </Table>
          )}
        </div>
        <div className="d-flex justify-content-end p-3">
          <button
              className="btn btn-sm btn-outline-secondary me-2"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Précédent
          </button>
          <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPage(p => p + 1)}
          >
            Suivant
          </button>
        </div>

      </Card>
  );
};

export default WebTokenCard;