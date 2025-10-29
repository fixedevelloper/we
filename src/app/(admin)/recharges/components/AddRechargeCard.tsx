'use client'
import React, {useRef, useState, useEffect, FormEvent} from "react";
import {Button, Card, Col, Form, InputGroup, ListGroup, ProgressBar, Row, Table} from "react-bootstrap";
import Link from "next/link";
import StepWizard from "react-step-wizard";
import ComponentContainerCard from "../../../../components/ComponentContainerCard";
import TextFormInput from '@/components/form/TextFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {yupResolver} from '@hookform/resolvers/yup'
import Select from "react-select";
import API_ENDPOINTS from "../../../(other)/api/Constant";
import {useFetchData} from "../../../../hooks/useFetchData";
import {useSession} from "next-auth/react";
import Feedback from "react-bootstrap/Feedback";
import {Country, ResponseApi} from "../../../../types/data";




const AddRechargeCard: React.FC = () => {

    const {data: session, status} = useSession(); //


    // si ton hook renvoie un état de chargement
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectedSender, setSelectedSender] = useState<any>(null);
    const [amount, setAmount] = useState<any>(null);
    const [validated, setValidated] = useState(false)
    const userId = session?.user?.id;

    const { data: countriesResponse } = useFetchData<ResponseApi<Country>>(API_ENDPOINTS.COUNTRIES);

    const countries = countriesResponse?.data ?? [];
    const url = userId ? `${API_ENDPOINTS.SENDERS}/${userId}` : undefined;
    const requestUrl = url ?? "";
    const { data: sendersResponse } = useFetchData<ResponseApi<any>>(
        requestUrl
    );

    const senders = sendersResponse?.data ?? [];

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget
        if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
        }
        setValidated(true)
    }


    const loading = status === "loading";

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!session) {
        return <p className="text-center">Vous devez être connecté pour accéder à ce formulaire.</p>;
    }

    return (
        <Row className="justify-content-center">
            <Col lg={8}>
                <ComponentContainerCard title="Ajouter une transaction">
                    <Form className="needs-validation" noValidate validated={validated} onSubmit={handleSubmit}>
                    <Row>
                        {/* Pays */}
                        <div className="mb-3">
                            <label className="form-label">Pays</label>
                            <Select
                                required
                                className="select2"
                                isClearable
                                options={[{ value: "", label: "Sélectionner" }, ...(countries || []).map((c: any) => ({ value: c.id, label: c.name, currency: c.currency }))]}
                                onChange={(option) => setSelectedCountry(option)}
                                value={selectedCountry}
                            />
                            <Feedback type="invalid">Please choose a username.</Feedback>
                        </div>


                        {/* Expéditeur */}
                        <div className="mb-3">
                            <label className="form-label">Client</label>
                            <Select
                                className="select2"
                                options={(senders || []).map((s: any) => ({ value: s.id, label: `${s.first_name} ${s.last_name}`, type: s.type }))}
                                onChange={(option) => setSelectedSender(option)}
                                value={selectedSender}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Montant</label>
                            <input className="form-control" value={amount} onChange={(e) => { setAmount(e.target.value) }} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Mode</label>
                            <Form.Select className="mb-3">
                                <option >Choisr ...</option>
                                <option value={1}>Manuelle</option>
                                <option value={2}>Automatique</option>
                            </Form.Select>
                        </div>
                        <Button>
                            Valider la recharge
                        </Button>

                    </Row></Form>
                </ComponentContainerCard>
            </Col>
        </Row>
    );
};


export default AddRechargeCard