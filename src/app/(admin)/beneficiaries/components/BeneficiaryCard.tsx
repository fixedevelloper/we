'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

import React, {useState, useEffect, useMemo} from "react";
import debounce from "lodash.debounce";
import {
  Card,
  CardHeader,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem, CardFooter,
} from "react-bootstrap";
import Link from "next/link";
import {useFetchData} from "../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../(other)/api/Constant";
import Pagination from "react-bootstrap/Pagination";

interface Sender {
  id: number;
  name: string;
  country_name: string;
  type: string;
  balance: string;
  phone: string;
  type_identification: string;
  numero_piece: string;
  email: string;
  photo: string;
  civility?: string;
  document_number?: string;
  document_expired?: string;
  document_id?: string;
  account_number?: string;
  swift_code?: string;
  if_code?: string;
  routing_number?: string;
}

interface SenderResponse {
  data: {
    results: Sender[];
    totalPages: number;
    page: number;
  };
}

const BeneficiaryCard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔹 Debounce pour éviter les requêtes trop fréquentes
  useEffect(() => {
    const handler = debounce((value: string) => setDebouncedSearch(value), 500);
    handler(search);
    return () => handler.cancel();
  }, [search]);

  // 🔹 Récupération des données depuis l’API
  const { data, loading, error, refetch } = useFetchData<SenderResponse>(
      API_ENDPOINTS.BENEFICIARIES_V3,
      { page, limit, search: debouncedSearch }
  );

  useEffect(() => {
    refetch?.({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch, refetch]);

  const customers = data?.data?.results ?? [];
  const totalPages = data?.data.totalPages ?? 1;

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

  return (
      <Card>
        <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1">
            <h4 className="header-title">Beneficiares</h4>
          </div>

          <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
            <div className="position-relative">
              <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control ps-4"
                  placeholder="Rechercher un client..."
              />
              <IconifyIcon
                  icon="ti:search"
                  className="ti position-absolute top-50 translate-middle-y start-0 ms-2"
              />
            </div>
            <Link href="/customers/add" className="btn btn-primary">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              Ajouter
            </Link>
          </div>
        </CardHeader>

        {/* TABLEAU */}
        <div className="table-responsive">
          {loading ? (
              <p className="text-center p-3">Chargement...</p>
          ) : error ? (
              <p className="text-danger p-3">❌ {error.message}</p>
          ) : customers.length === 0 ? (
              <p className="text-center p-3 text-muted">Aucun client trouvé</p>
          ) : (
              <Table className="table-hover text-nowrap mb-0">
                <thead className="bg-light-subtle">
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Type Compte</th>
                  <th>Téléphone</th>
                  <th>Pays</th>
                  <th>Pièce ID</th>
                  <th>Pièce Number</th>
                  <th>Pièce Expired</th>
                  <th>Client</th>
                  <th className="text-center">Action</th>
                </tr>
                </thead>
                <tbody>
                {customers.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td className="d-flex align-items-center gap-2">
                        {c.photo ? (
                            <img
                                src={c.photo}
                                alt="avatar"
                                width={40}
                                height={40}
                                style={{
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  background: "#eee",
                                }}
                            />
                        )}
                        {c.name || "-"}
                      </td>
                      <td>{c.type || "-"}</td>
                      <td>{c.phone || "-"}</td>
                      <td>{c.country_name || "-"}</td>
                      <td>{c.document_id || "-"}</td>
                      <td>{c.document_number || "-"}</td>
                      <td>{c.document_expired || "-"}</td>
                      <td>{c.civility || "-"}</td>
                      <td className="text-center pe-3">
                        <Dropdown>
                          <DropdownToggle className="btn btn-light btn-sm">
                            ⋮
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem as={Link} href={`/beneficiaries/${c.id}/edit`}>
                              Modifier
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

        {/* PAGINATION */}
        {totalPages > 1 && (
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
        )}
      </Card>
  );
};


export default BeneficiaryCard;