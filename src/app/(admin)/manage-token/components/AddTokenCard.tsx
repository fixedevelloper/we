'use client'
import React, {useRef, useState, useEffect, FormEvent} from "react";
import {Button, Card, Col, Form, InputGroup, ListGroup, ProgressBar, Row, Table} from "react-bootstrap";
import Link from "next/link";
import StepWizard from "react-step-wizard";
import ComponentContainerCard from "../../../../components/ComponentContainerCard";
import Select from "react-select";
import API_ENDPOINTS from "../../../(other)/api/Constant";
import {useFetchData} from "../../../../hooks/useFetchData";
import {useSession} from "next-auth/react";
import Feedback from "react-bootstrap/Feedback";
import {Country, ResponseApi} from "../../../../types/data";
import {useNotificationContext} from "../../../../context/useNotificationContext";




const AddTokenCard: React.FC = () => {

    const {data: session, status} = useSession(); //


    // si ton hook renvoie un état de chargement
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [phone, setPhone] = useState<any>(null);
    const [amount, setAmount] = useState<any>(null);
    const [validated, setValidated] = useState(false)
    const userId = session?.user?.id;
    const { showNotification } = useNotificationContext();
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [showGlobalLoader, setShowGlobalLoader] = useState(false);
    const { data: countriesResponse } = useFetchData<ResponseApi<Country>>(API_ENDPOINTS.COUNTRIES);

    const countries = countriesResponse?.data ?? [];


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        // Validation manuelle
        if (!selectedCountry || !phone || !amount) {
            setValidated(true);
            showNotification({
                title: "Erreur ⚠️",
                message: "Veuillez remplir tous les champs obligatoires.",
                variant: "danger",
            });
            return;
        }

        setValidated(true);
        setLoadingSubmit(true);
        setShowGlobalLoader(true);

        try {
            const payload = {
                country_id: selectedCountry.value,
                phone,
                amount,
                user_id: userId,
            };

            const res = await fetch(API_ENDPOINTS.WEBTOKENS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.error?.details || data?.message || "Erreur lors de la création du token."
                );
            }

            showNotification({
                title: "Succès ✅",
                message: "Le token a été créé avec succès.",
                variant: "success",
            });

            // reset
            setSelectedCountry(null);
            setPhone("");
            setAmount("");

        } catch (err: any) {
            showNotification({
                title: "Échec ⚠️",
                message: err.message || "Une erreur s’est produite.",
                variant: "danger",
            });
        } finally {
            setLoadingSubmit(false);
            setShowGlobalLoader(false);
        }
    };



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
                <ComponentContainerCard title="Ajouter un token">
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
                            <label className="form-label">Telephone</label>
                            <input placeholder='237677586923' className="form-control" value={phone} onChange={(e) => { setPhone(e.target.value) }} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Montant (FCFA)</label>
                            <input className="form-control" value={amount} onChange={(e) => { setAmount(e.target.value) }} />
                        </div>
                        <Button type="submit" disabled={loadingSubmit}>
                            {loadingSubmit ? "Création..." : "Créer le token"}
                        </Button>


                    </Row></Form>
                </ComponentContainerCard>
            </Col>
        </Row>
    );
};


export default AddTokenCard