'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import debounce from "lodash.debounce";
import Link from 'next/link'
import { Button, Card, CardFooter, CardHeader, Table } from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from "../../../(other)/api/Constant";
import React, { useEffect, useState } from "react";

import Pagination from "react-bootstrap/Pagination";

interface Transaction {
  id: number;
  typetransaction: string;
  datetransaction: string;
  beneficiare?: string;
  customer?: string;
  montanttotal?: number;
  monaire?: string;
  country?: string;
  status?: string;
}

interface TransactionResponse {
  status: string;
  code: number;
  message: string;
  data: {
    results: Transaction[];
    totalPages: number;
    page: number;
  };
}



const TransactionsCard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(search), 500);
    handler();
    return () => handler.cancel();
  }, [search]);

  const { data, loading, error, refetch } = useFetchData<TransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS,
      { page, limit, search: debouncedSearch }
  );

  const transactions = data?.data?.results ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  useEffect(() => {
    refetch();
  }, [page, debouncedSearch, refetch]);

  // Générer les items de pagination avec "fenêtre" autour de la page courante
  const getPaginationItems = () => {
    const items = [];
    const delta = 2; // nombre de pages avant et après la page courante

    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);

    if (start > 1) {
      items.push(
          <Pagination.Item key={1} onClick={() => setPage(1)}>
            1
          </Pagination.Item>
      );
      if (start > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    for (let number = start; number <= end; number++) {
      items.push(
          <Pagination.Item
              key={number}
              active={number === page}
              onClick={() => setPage(number)}
          >
            {number}
          </Pagination.Item>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      items.push(
          <Pagination.Item key={totalPages} onClick={() => setPage(totalPages)}>
            {totalPages}
          </Pagination.Item>
      );
    }

    return items;
  };

  function handleDelete(id: any) {

  }

  return (
      <Card>
        {/* CardHeader avec search */}
        <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1">
            <h4 className="header-title">Transferts</h4>
          </div>
          <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
            <div className="flex-shrink-0 d-flex align-items-center gap-2">
              <div className="position-relative">
                <input type="text"
                       value={search}
                       onChange={(e) => setSearch(e.target.value)} className="form-control ps-4" placeholder="Search Here..." />
                <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
              </div>
            </div>
            <Link href="/transactions/add-transaction" className="btn btn-primary">
              <IconifyIcon icon="ri:add-line " className="me-1" />
              Ajouter
            </Link>
          </div>
        </CardHeader>

        {/* Table */}
        <div className="table-responsive">
          {loading ? (
              <p>Chargement...</p>
          ) : error ? (
              <p>❌ {error.message}</p>
          ) : (
              <Table className="table-hover text-nowrap mb-0">
                <thead className="bg-light-subtle">
                <tr>
                  <th className="ps-3" style={{ width: 50 }}>
                    <input type="checkbox" className="form-check-input" id="customCheck1" />
                  </th>
                  <th className="fs-12 text-uppercase text-muted">ID</th>
                  <th className="fs-12 text-uppercase text-muted">Type</th>
                  <th className="fs-12 text-uppercase text-muted">Date</th>
                  <th className="fs-12 text-uppercase text-muted">Client</th>
                  <th className="fs-12 text-uppercase text-muted">Bénéficiaire</th>
                  <th className="fs-12 text-uppercase text-muted">Montant</th>
                  <th className="fs-12 text-uppercase text-muted">Pays</th>
                  <th className="fs-12 text-uppercase text-muted">Status</th>
                  <th className="text-center fs-12 text-uppercase text-muted" style={{ width: 120 }}>
                    Action
                  </th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="ps-3">
                        <input type="checkbox" className="form-check-input" id="customCheck2" />
                      </td>
                      <td><span className="text-muted fw-semibold">#{t.id}</span></td>
                      <td>{t.typetransaction || "-"}</td>
                      <td>
                      <span className="fs-15 text-muted">  {t.datetransaction
                            ? new Date(t.datetransaction).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}</span>
                      </td>
                      <td> <h6 className="fs-14 mb-0">{t.customer || "-"}</h6></td>
                      <td> <h6 className="fs-14 mb-0">{t.beneficiare || "-"}</h6></td>
                      <td><span className="fs-15 text-muted">{t.montanttotal != null ? t.montanttotal.toLocaleString() : "-"} {t.monaire || ""}</span></td>
                      <td><span className="fs-15 text-muted">{t.country || "-"}</span></td>
                      <td>
                        <span
                            className={`badge bg-${t.status == 'en validation' ? 'warning' : t.status == 'en attente' ? 'primary' : t.status == 'echoue' ? 'danger' : 'success'}-subtle text-${t.status == 'en validation' ? 'warning' : t.status == 'Pending' ? 'primary' : t.status == 'echoue' ? 'danger' : 'success'} fs-12 p-1`}>
                      {t.status}
                    </span>
                      </td>
                      <td className="pe-3">
                        <div className="hstack gap-1 justify-content-end">
                          <Link
                              href={`/transactions/${t.id}`} // ✅ utilisation correcte des backticks
                              className="btn btn-soft-primary btn-sm btn-icon rounded-circle"
                          >
                            <IconifyIcon icon="ri:eye-line" />
                          </Link>

                          <Button
                              variant="soft-danger"
                              size="sm"
                              className="btn-icon rounded-circle"
                              onClick={() => handleDelete(t.id)} // si tu veux gérer la suppression
                          >
                            <IconifyIcon icon="ri:delete-bin-line" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                ))}
                </tbody>
              </Table>
          )}
        </div>
        {/* Pagination personnalisée */}
        <CardFooter>
          <Pagination className="mb-0 justify-content-end">
            <Pagination.First
                onClick={() => setPage(1)}
                disabled={page === 1}
            />
            <Pagination.Prev
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
            />

            {getPaginationItems()}

            <Pagination.Next
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            />
            <Pagination.Last
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
            />
          </Pagination>
        </CardFooter>
      </Card>
  );
};



export default TransactionsCard;