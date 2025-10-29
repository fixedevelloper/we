'use client'
import React, {useRef, useState, useEffect, FormEvent} from "react";
import {Button, Card, Col, Form, InputGroup, ListGroup, ProgressBar, Row, Table} from "react-bootstrap";

import API_ENDPOINTS from "../../../(other)/api/Constant";
import {useFetchData} from "../../../../hooks/useFetchData";
import {useSession} from "next-auth/react";
import Feedback from "react-bootstrap/Feedback";
import Badge from "react-bootstrap/Badge";
import Image from "next/image";
import Links from "../../ui/links/page";
import Link from "next/link";
import TransactionReceipt from "../TransactionReceipt";
import TransactionReceiptModal from "../TransactionReceipt";
import IconifyIcon from "../../../../components/wrappers/IconifyIcon";

interface Customer {
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
    motif: string;
    expired_date_piece: string;
    status_account: string;
    piece_face_file: string;
    piece_recto_file: string;
}

const DetailCustomerCard: React.FC<{ customerId: string }> = ({ customerId }) => {
    const { data: session, status } = useSession();
    const loadingSession = status === "loading";
    const [showReceipt, setShowReceipt] = useState(false);

    const { data: customer_, isLoading } = useFetchData<{ data: Customer }>(
        customerId ? `${API_ENDPOINTS.CUSTOMERS}/${customerId}` : null
    );

    if (loadingSession || isLoading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 small text-muted">Chargement des détails du client...</p>
            </div>
        );
    }

    if (!customer_?.data) {
        return <p className="text-center text-muted mt-4">Aucun client trouvé.</p>;
    }

    const customer = customer_.data;

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case "accepted":
            case "verified":
            case "success":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
            case "failed":
                return "danger";
            default:
                return "secondary";
        }
    };

    return (
        <div className="transaction-detail">

            {/* 💰 Solde & Statut */}
            <Card className="mb-4 border-0 shadow-sm text-center py-4">
                <h4 className="fw-bold mb-1 text-primary">
                    {Number(customer.balance).toLocaleString()} XAF
                </h4>
                <p className="text-muted small mb-2">Solde du compte</p>

                <Badge
                    bg={getStatusVariant(customer.status_account)}
                    className="text-uppercase px-3 py-2 rounded-pill"
                >
                    {customer.status_account || "N/A"}
                </Badge>
            </Card>

            {/* 👤 Informations principales */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light fw-bold small py-2">
                    Informations personnelles
                </Card.Header>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={3} className="text-center">
                            <img
                                src={customer.photo || "/img/default-avatar.png"}
                                alt="photo client"
                                className="rounded-circle shadow-sm mb-2"
                                style={{ width: 100, height: 100, objectFit: "cover" }}
                            />
                            <p className="fw-semibold mt-2">{customer.name || "—"}</p>
                            <Badge bg="info">{customer.type || "Non défini"}</Badge>
                        </Col>
                        <Col md={9}>
                            <ListGroup variant="flush" className="small">
                                <ListGroup.Item>
                                    <strong>Email :</strong> {customer.email || "—"}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Téléphone :</strong> {customer.phone || "—"}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Pays :</strong> {customer.country_name || "—"}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Motif :</strong> {customer.motif || "—"}
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* 🪪 Identification */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-light fw-bold small py-2">
                    Informations d’identification
                </Card.Header>
                <ListGroup variant="flush" className="small">
                    <ListGroup.Item>
                        <strong>Type de pièce :</strong> {customer.type_identification || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Numéro de pièce :</strong> {customer.numero_piece || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>Date d’expiration :</strong>{" "}
                        {customer.expired_date_piece || "—"}
                    </ListGroup.Item>
                </ListGroup>

                {/* 🖼️ Fichiers d'identité */}
                {(customer.piece_face_file || customer.piece_recto_file) && (
                    <div className="p-3 d-flex flex-wrap gap-3 justify-content-center">
                        {customer.piece_face_file && (
                            <div className="text-center">
                                <img
                                    src={customer.piece_face_file}
                                    alt="Pièce Face"
                                    className="rounded shadow-sm"
                                    style={{ width: 180, height: "auto" }}
                                />
                                <p className="small mt-1 text-muted">Recto</p>
                            </div>
                        )}
                        {customer.piece_recto_file && (
                            <div className="text-center">
                                <img
                                    src={customer.piece_recto_file}
                                    alt="Pièce Verso"
                                    className="rounded shadow-sm"
                                    style={{ width: 180, height: "auto" }}
                                />
                                <p className="small mt-1 text-muted">Verso</p>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* ⚙️ Boutons d’action */}
            <div className="text-center mt-4">
                <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => window.print()}
                >
                    <IconifyIcon icon="ri:printer-line" className="me-1" />
                    Imprimer la fiche
                </Button>
                <Button href={`/customers/${customer.id}/edit`} variant="primary">
                    <IconifyIcon icon="ri:edit-2-line" className="me-1" />
                    Modifier le profil
                </Button>
            </div>
        </div>
    );
};

export default DetailCustomerCard;