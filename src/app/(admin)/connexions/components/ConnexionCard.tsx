'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { Card, CardHeader, Table, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Pagination, CardFooter, Button, Form, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import Link from "next/link";
import {useFetchData} from "../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../(other)/api/Constant";
import useModal from '@/hooks/useModal';
import ConnexionPdfModal from '../ConnexionPdf';


interface Connexion {
  id: number;
  name: string;
  message: string;
    status: string;
  date: string;
   ip_address: string;
  user: any;
}

interface ApiResponse {
  data: {
    results: Connexion[];
    totalPages: number;
    page: number;
  };
}

const ConnexionCard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showPdf, setShowPdf] = useState(false);
  // 🔹 États pour filtres
  const [beginDate, setBeginDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const { isOpen, className, toggleModal, openModalWithClass } = useModal();
  useEffect(() => {
    const handler = debounce((value: string) => setDebouncedSearch(value), 500);
    handler(search);
    return () => handler.cancel();
  }, [search]);

  const { data, loading, error, refetch } = useFetchData<ApiResponse>(
      API_ENDPOINTS.CONNEXIONS,
      { page, limit, search: debouncedSearch, begin_date: beginDate, end_date: endDate, }
  );

  useEffect(() => {
    refetch?.({ page, limit, search: debouncedSearch });
  }, [page, limit, debouncedSearch,beginDate, endDate,, refetch]);

  const connexions = data?.data?.results ?? [];
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
  const filterPro = () => {
    setPage(1); // on repart à la page 1
    refetch(); // recharge avec les nouveaux filtres
    toggleModal(); // fermer le modal
  };
  return (
    <>
      <Card>
        <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
          <div className="flex-grow-1">
            <h4 className="header-title">Connexions</h4>
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
            <button className="btn btn-outline-dark" onClick={() => setShowPdf(true)}>
                <IconifyIcon icon="ri:print-line" className="me-1" />
                Imprimer
              </button>
            <Button onClick={() => openModalWithClass('')} className="btn btn-soft-primary">
                <IconifyIcon icon="ri:filter-line" className="me-1" />
                Filtrer
              </Button>
          
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
                  <th className="fs-12 text-uppercase text-muted">#</th>
                  <th className="fs-12 text-uppercase text-muted">Date</th>
                  <th className="fs-12 text-uppercase text-muted">User</th>
                  <th className="fs-12 text-uppercase text-muted">Ip Address</th>
                  <th className="fs-12 text-uppercase text-muted">Status</th>
                    <th className="fs-12 text-uppercase text-muted">Message</th>
            
            
                </tr>
                </thead>
                <tbody>
                {connexions.map((t) => (
                    <tr key={t.id}>
                      <td className="ps-3"><input type="checkbox" className="form-check-input" /></td>
                      <td><span className="text-muted fw-semibold">#{t.id}</span></td>
                      <td><h6 className="fs-14 mb-0">{t.date || "-"}</h6></td>
                      <td><span className="fs-15 text-muted">{t.name || "-"}</span></td>
                      <td><span className="fs-15 text-muted">{t.ip_address || "-"}</span></td>
                      <td><span className="fs-15 text-muted">{t.status?'accepte':'echoue'}</span></td>
                      <td><span className="fs-15 text-muted">{t.message || "-"}</span></td>
                  
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
           <Modal show={isOpen} onHide={toggleModal} dialogClassName={className}>
          <ModalHeader onHide={toggleModal} closeButton>
            <h4 className="modal-title">Filtrer les connexions</h4>
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
        
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="secondary" onClick={toggleModal}>Annuler</Button>
            <Button variant="primary" onClick={filterPro}>Appliquer</Button>
          </ModalFooter>
        </Modal>
         <ConnexionPdfModal
                            audits={connexions}
                            show={showPdf}
                            onClose={() => setShowPdf(false)}
                            begin_date={beginDate}
                            end_date={endDate}
                        />
      </>
  );
};

export default ConnexionCard;