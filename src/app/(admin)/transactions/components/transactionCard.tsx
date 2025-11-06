'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import debounce from "lodash.debounce";
import Link from 'next/link'
import {
  Button,
  Card,
  Form,
  CardFooter,
  CardHeader,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Col
} from 'react-bootstrap'
import { useFetchData } from '@/hooks/useFetchData'
import API_ENDPOINTS from "../../../(other)/api/Constant";
import React, { useEffect, useState } from "react";

import Pagination from "react-bootstrap/Pagination";
import useModal from "../../../../hooks/useModal";
import ChoicesFormInput from "../../../../components/form/ChoicesFormInput";
import TransactionReceiptModal from "../TransactionReceipt";
import TransactionPdfModal from "../TransactionPdf";

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
  const [limit,setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  // 🔹 États pour filtres
  const [beginDate, setBeginDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const { isOpen, className, toggleModal, openModalWithClass } = useModal();

  // 🔹 Debounce recherche
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(search), 500);
    handler();
    return () => handler.cancel();
  }, [search]);

  // 🔹 Requête API
  const { data, loading, error, refetch } = useFetchData<TransactionResponse>(
      API_ENDPOINTS.TRANSACTIONS,
      { page, limit, search: debouncedSearch, begin_date: beginDate, end_date: endDate, status }
  );

  const transactions = data?.data?.results ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  // 🔹 Rechargement auto si filtre change
  useEffect(() => {
    refetch();
  }, [page, debouncedSearch, beginDate, endDate, status, refetch]);

  const getPaginationItems = () => {
    const items = [];
    const delta = 2;
    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);

    if (start > 1) {
      items.push(<Pagination.Item key={1} onClick={() => setPage(1)}>1</Pagination.Item>);
      if (start > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    for (let number = start; number <= end; number++) {
      items.push(
          <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
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

  const handleDelete = (id: number) => {
    console.log("Supprimer", id);
  };

  // 🔹 Appliquer le filtre
  const filterPro = () => {
    setPage(1); // on repart à la page 1
    refetch(); // recharge avec les nouveaux filtres
    toggleModal(); // fermer le modal
  };

  return (
      <div>
        <Card>
          <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
            <div className="flex-grow-1">
              <h4 className="header-title">Transferts</h4>
            </div>
            <div className="d-flex flex-wrap flex-lg-nowrap gap-2">
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
            {loading ? (
                <p className="text-center">Chargement...</p>
            ) : error ? (
                <p className="text-danger">{error.message}</p>
            ) : (
                <Table className="table-hover text-nowrap mb-0">
                  <thead className="bg-light-subtle">
                  <tr>
                    <th className="ps-3"><input type="checkbox" className="form-check-input" /></th>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Bénéficiaire</th>
                    <th>Montant</th>
                    <th>Pays</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {transactions.length === 0 ? (
                      <tr><td colSpan={10} className="text-center text-muted">Aucune transaction trouvée.</td></tr>
                  ) : (
                      transactions.map((t) => (
                          <tr key={t.id}>
                            <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
                            <td>#{t.id}</td>
                            <td>{t.typetransaction || "-"}</td>
                            <td>
                              {t.datetransaction
                                  ? new Date(t.datetransaction).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                                  : "-"}
                            </td>
                            <td>{t.customer || "-"}</td>
                            <td>{t.beneficiare || "-"}</td>
                            <td>{t.montanttotal ? `${t.montanttotal.toLocaleString()} ${t.monaire || ""}` : "-"}</td>
                            <td>{t.country || "-"}</td>
                            <td>
                        <span className={`badge bg-${t.status === 'echoue' ? 'danger' : t.status === 'en validation' ? 'warning' : 'success'}-subtle text-capitalize`}>
                          {t.status}
                        </span>
                            </td>
                            <td className="text-center">
                              <div className="hstack gap-1 justify-content-end">
                                <Link href={`/transactions/${t.id}`} className="btn btn-soft-primary btn-sm btn-icon rounded-circle">
                                  <IconifyIcon icon="ri:eye-line" />
                                </Link>
                                <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle" onClick={() => handleDelete(t.id)}>
                                  <IconifyIcon icon="ri:delete-bin-line" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </Table>
            )}
          </div>

          <CardFooter>
            <Dropdown>
              <DropdownToggle
                  as={'button'}
                  className="btn btn-light dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false">
                X{limit}
              </DropdownToggle>
              <DropdownMenu aria-labelledby="dropdownMenuButton">
                <DropdownItem onClick={() => setLimit(10)}>10</DropdownItem>
                <DropdownItem onClick={() => setLimit(20)}>20</DropdownItem>
                <DropdownItem onClick={() => setLimit(50)}>50</DropdownItem>
                <DropdownItem onClick={() => setLimit(100)}>100</DropdownItem>
                <DropdownItem onClick={() => setLimit(500)}>500</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Pagination className="mb-0 justify-content-end">
              <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
              {getPaginationItems()}
              <Pagination.Next onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
              <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </CardFooter>
        </Card>

        {/* 🔹 MODAL FILTRE */}
        <Modal show={isOpen} onHide={toggleModal} dialogClassName={className}>
          <ModalHeader onHide={toggleModal} closeButton>
            <h4 className="modal-title">Filtrer les transferts</h4>
          </ModalHeader>

          <ModalBody>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Date début</label>
                <Form.Control type="date" value={beginDate} onChange={(e) => setBeginDate(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date fin</label>
                <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Statut</label>
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="effectue">Effectué</option>
                  <option value="validation">validation</option>
                  <option value="en validation">En validation</option>
                  <option value="annule">Annulé</option>
                  <option value="echoue">Échoué</option>
                </Form.Select>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="secondary" onClick={toggleModal}>Annuler</Button>
            <Button variant="primary" onClick={filterPro}>Appliquer</Button>
          </ModalFooter>
        </Modal>
        <TransactionPdfModal
            transactions={transactions}
            show={showPdf}
            onClose={() => setShowPdf(false)}
            begin_date={beginDate}
            end_date={endDate}
        />
      </div>
  );
};




export default TransactionsCard;