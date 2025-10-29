'use client'
import React, {useRef, useState, useEffect, FormEvent} from "react";
import {Button, Card, Col, Form, InputGroup, ListGroup, ProgressBar, Row, Table} from "react-bootstrap";

import API_ENDPOINTS from "../../../(other)/api/Constant";
import {useFetchData} from "../../../../hooks/useFetchData";
import {useSession} from "next-auth/react";
import Feedback from "react-bootstrap/Feedback";
import Badge from "react-bootstrap/Badge";
import Image from "next/image";
import TransactionReceiptModal from "../TransactionReceipt";
import Spinner from "../../../../components/Spinner";

const DetailTransactionCard: React.FC<{ transactionId: string }> = ({ transactionId }) => {
    const { data: session, status } = useSession();
    const loadingSession = status === "loading";
    const [showReceipt, setShowReceipt] = useState(false);
    const url = transactionId ? `${API_ENDPOINTS.TRANSACTIONS}/detail/${transactionId}` : undefined;
    const requestUrl = url ?? "";
    const { data: transaction_, loading:isLoading } = useFetchData<any>(
        requestUrl
    );

    if (loadingSession || isLoading) {
        return (
            <div className="text-center my-5">
                <Spinner type="border" color="primary" />
                <p className="mt-3 small">Chargement des détails de la transaction...</p>
            </div>
        );
    }

    if (!transaction_?.data) {
        return <p className="text-center text-muted mt-4">Aucune transaction trouvée.</p>;
    }

    const transaction = transaction_.data;

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "success":
            case "terminée":
                return "success";
            case "pending":
            case "en attente":
                return "warning";
            case "failed":
            case "échec":
                return "danger";
            default:
                return "secondary";
        }
    };

    return (
        <div className="transaction-detail">
            {/* 🔹 Résumé principal */}
            <Card className="mb-3 border-0 shadow-sm text-center py-3">
                <h5 className="fw-bold mb-1 text-primary">
                    {transaction.amount_total} {transaction.currency || "XAF"}
                </h5>

                <p className="small text-muted mb-0">
                    Transaction #{transaction.numero_transaction || "-"} <br />
                    {transaction.date_transaction || "-"}
                </p>
                <Row className='justify-content-center'>
                    <Col md={4}>
                        <Badge bg={getStatusVariant(transaction.status)} className="text-uppercase small mb-1">
                            {transaction.status || "N/A"}
                        </Badge>
                    </Col>
                </Row>
                <Row className='justify-content-center'>
                    <Col md={4}>
                        <button className="btn btn-primary" onClick={() => setShowReceipt(true)}>
                            Voir le reçu
                        </button>
                    </Col>
                </Row>

            </Card>

            <Row className="g-3">
                {/* 🔹 Expéditeur */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light fw-bold small py-2">Expéditeur</Card.Header>
                        <ListGroup variant="flush" className="small">
                            <ListGroup.Item>
                                <div className="d-flex align-items-center gap-2">
                                    {transaction.country_sender_flag && (
                                        <Image
                                            src={transaction.country_sender_flag}
                                            alt="flag"
                                            width={24}
                                            height={16}
                                        />
                                    )}
                                    <strong>Pays :</strong> {transaction.sender_country || "-"}
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item><strong>Nom :</strong> {transaction.sender_name || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Ville :</strong> {transaction.sender_city || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Type opérateur :</strong> {transaction.type_operator || "-"}</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                {/* 🔹 Bénéficiaire */}
                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light fw-bold small py-2">Bénéficiaire</Card.Header>
                        <ListGroup variant="flush" className="small">
                            <ListGroup.Item>
                                <div className="d-flex align-items-center gap-2">
                                    {transaction.country_beneficiary_flag && (
                                        <Image
                                            src={transaction.country_beneficiary_flag}
                                            alt="flag"
                                            width={24}
                                            height={16}
                                        />
                                    )}
                                    <strong>Pays :</strong> {transaction.beneficiary_country || "-"}
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item><strong>Nom :</strong> {transaction.beneficiary_name || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Téléphone :</strong> {transaction.beneficiary_phone || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Ville :</strong> {transaction.beneficiary_city || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Relation :</strong> {transaction.relaction || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Motif :</strong> {transaction.motif || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Origine des fonds :</strong> {transaction.origin_fond || "-"}</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                {/* 🔹 Informations Transaction */}
                <Col xs={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light fw-bold small py-2">Détails de la transaction</Card.Header>
                        <ListGroup variant="flush" className="small">
                            <ListGroup.Item><strong>Montant :</strong> {transaction.amount} {transaction.currency || "XAF"}</ListGroup.Item>
                            <ListGroup.Item><strong>Frais :</strong> {transaction.rate} {transaction.currency || "XAF"}</ListGroup.Item>
                            <ListGroup.Item><strong>Total :</strong> {transaction.amount_total} {transaction.currency || "XAF"}</ListGroup.Item>
                            <ListGroup.Item><strong>Banque / Opérateur :</strong> {transaction.bank_name || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Numéro de compte :</strong> {transaction.account_number || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Type transaction :</strong> {transaction.type_transaction || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Service :</strong> {transaction.type_service || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Identifiant :</strong> {transaction.numero_identifiant || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Numéro de transaction :</strong> {transaction.numero_transaction || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Date :</strong> {transaction.date || "-"} à {transaction.time || "-"}</ListGroup.Item>
                            <ListGroup.Item><strong>Commentaire :</strong> {transaction.comment || "-"}</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>


            {/* Modale du reçu */}
            <TransactionReceiptModal
                transaction={transaction}
                show={showReceipt}
                onClose={() => setShowReceipt(false)}
            />


            <style jsx>{`
        .transaction-detail {
          padding: 0.5rem;
        }
        @media (min-width: 768px) {
          .transaction-detail {
            padding: 1rem 2rem;
          }
          h5 {
            font-size: 1.4rem;
          }
        }
      `}</style>
        </div>
    );
};

export default DetailTransactionCard;