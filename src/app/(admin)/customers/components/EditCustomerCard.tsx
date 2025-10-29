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
import Select from "react-select";

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

const EditCustomerCard: React.FC<{ customerId: string }> = ({ customerId }) => {
    const { data: session, status } = useSession();
    const loadingSession = status === "loading";
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectTypeAccount, setSelectTypeAccount] =useState<any>(null);

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


    return (
        <div className="transaction-detail">


            {/* 👤 Informations principales */}
            <Card className="border-0 shadow-sm mb-4">

                <Card.Body>
                    <div className="mb-3">
                        <label htmlFor="example-select" className="form-label">Type de compte</label>
                        <Form.Select id="example-select" name='type'
                                     value={selectTypeAccount}
                       onChange={(type_account) => {
                            setSelectTypeAccount(type_account);
                        }}>
                            <option value='P'>Personnal</option>
                            <option value='B'>Bussiness</option>
                        </Form.Select>
                    </div>
                    <Row className="align-items-center">
                        <Col md={6}>
                            {selectTypeAccount=='P'?(<div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Nom </label>
                                <Form.Control type="text" id="simpleinput" name='first_name'/>
                            </div>):(<div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Nom du bissiness </label>
                                <Form.Control type="text" id="simpleinput" name='bussness_name'/>
                            </div>) }

                            <div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Telephone </label>
                                <Form.Control type="text" id="simpleinput" name='phone'/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Adresse </label>
                                <Form.Control type="text" id="simpleinput" name='address'/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="example-select" className="form-label">Type de compte</label>
                                <Form.Select id="example-select" name='type'>
                                    <option value='P'>Personnal</option>
                                    <option value='B'>Bussiness</option>
                                </Form.Select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="example-select" className="form-label">Sexe</label>
                                <Form.Select id="example-select" name='gender'>
                                    <option value='M'>Homme</option>
                                    <option value='F'>Femme</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col md={6}>
                            {selectTypeAccount=='P'?(<div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Prenom </label>
                                <Form.Control type="text" id="simpleinput" name='last_name'/>
                            </div>):(<div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Type de business </label>
                                <Form.Select id="example-select" name='business_type'>
                                    <option value='SARLU'>SARLU</option>
                                    <option value='SARL'>SARL</option>
                                    <option value='SAS'>SAS</option>
                                </Form.Select>
                            </div>) }
                            <div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Email </label>
                                <Form.Control type="text" id="simpleinput" name='email'/>
                            </div>
                            {selectTypeAccount=='P'?(<div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Date de naissance </label>
                                <Form.Control type="date" id="simpleinput" name='date_birth'/>
                            </div>):(<div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Date de creation </label>
                                <Form.Control type="date" id="simpleinput" name='registred_date'/>
                            </div>)}

                            <div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Occupation </label>
                                <Form.Control type="text" id="simpleinput" name='occupation'/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="example-select" className="form-label">Civility</label>
                                <Form.Select id="example-select" name='civility'>
                                    <option value='Maried'>Maried</option>
                                    <option value='Single'>Single</option>
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">

                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="mb-3">
                                <label htmlFor="example-select" className="form-label">Type de document</label>
                                <Form.Select id="example-select" name='type'>
                                    <option value='PP'>Passport</option>
                                    <option value='CN'>CNI</option>
                                </Form.Select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Date d'expiration </label>
                                <Form.Control type="date" id="simpleinput" name='expired_document'/>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mb-3">
                                <label htmlFor="simpleinput" className="form-label"> Numero du document </label>
                                <Form.Control type="text" id="simpleinput" name='id_number'/>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ⚙️ Boutons d’action */}
            <div className="text-center mt-4">
                <Button variant="primary">
                    <IconifyIcon icon="ri:edit-2-line" className="me-1" />
                    Modifier
                </Button>
            </div>
        </div>
    );
};

export default EditCustomerCard;