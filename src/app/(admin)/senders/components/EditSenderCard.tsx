'use client'
import React, {useRef, useState, useEffect, FormEvent} from "react";
import {Button, Card, Col, Form, InputGroup, ListGroup, ProgressBar, Row, Table} from "react-bootstrap";

import API_ENDPOINTS from "../../../(other)/api/Constant";
import {useFetchData} from "../../../../hooks/useFetchData";
import {useSession} from "next-auth/react";
import IconifyIcon from "../../../../components/wrappers/IconifyIcon";
import Select from "react-select";
import {useNotificationContext} from "../../../../context/useNotificationContext";
import Spinner from "../../../../components/Spinner";


type Customer = {
    id: number;
    country_id: number;
    city_id: number;
    type: string;
    first_name: string;
    last_name: string;
    business_name?: string;
    business_type?: string;
    addresse: string;
    phone: string;
    gender: string;
    email: string;
    date_born?: string;
    register_business_date?: string;
    occupation?: string;
    civility?: string;
    document_number?: string;
    document_expired?: string;
    document_id?: string;
};

const EditSenderCard: React.FC<{ customerId: string }> = ({ customerId }) => {
    const { data: session, status } = useSession();
    const { showNotification } = useNotificationContext();
    const loadingSession = status === "loading";

    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectTypeAccount, setSelectTypeAccount] = useState<string>("P");
    const [formData, setFormData] = useState<any>({});
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [showGlobalLoader, setShowGlobalLoader] = useState(false);

    const citiesEndpoint = selectedCountry
        ? `${API_ENDPOINTS.CITIES}/${selectedCountry.value}`
        : null;

    const { data: cities = { data: [] }, loading: citiesLoading, refetch: refetchCities } =
        useFetchData<any>(citiesEndpoint || "", {}, {});
    const url = customerId ? `${API_ENDPOINTS.SENDERS_V3}/${customerId}/one` : undefined;
    const requestUrl = url ?? "";
    const { data: customer_, loading:isLoading } = useFetchData<{ data: Customer }>(
        requestUrl
    );

    const { data: countries = [] } = useFetchData<any[]>(API_ENDPOINTS.COUNTRIES);

    useEffect(() => {
        if (selectedCountry && refetchCities) refetchCities();
    }, [selectedCountry]);

    // 🧩 Remplissage automatique du formulaire
    useEffect(() => {
        if (countries?.data && customer_?.data) {
            const c = customer_.data;

            const country = countries.data.find((x: any) => x.id === c.country_id);
            const city = c.city_id
                ? { value: c.city_id, label: cities?.data?.find((ci: any) => ci.id === c.city_id)?.name || "" }
                : null;

            setSelectedCountry(country ? { value: country.id, label: country.name } : null);
            setSelectedCity(city);
            setSelectTypeAccount(c.type || "P");

            setFormData({
                first_name: c.first_name || "",
                last_name: c.last_name || "",
                business_name: c.business_name || "",
                business_type: c.business_type || "",
                phone: c.phone || "",
                address: c.addresse || "",
                gender: c.gender || "",
                email: c.email || "",
                date_birth: c.date_born || "",
                register_business_date: c.register_business_date || "",
                occupation: c.occupation || "",
                civility: c.civility || "",
                document_number: c.document_number || "",
                expired_document: c.document_expired || "",
                document_id: c.document_id || "",
                type: c.type || "P",
                country_id: c.country_id,
                city_id: c.city_id,
            });
        }
    }, [customer_, countries]);

    // 🌀 Loader initial
    if (loadingSession || isLoading) {
        return (
            <div
                style={{
                    height: "70vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Spinner type="border" color="primary" style={{ width: "3rem", height: "3rem" }} />
                <p className="mt-3 text-muted">Chargement des détails du client...</p>
            </div>
        );
    }

    if (!customer_?.data) {
        return <p className="text-center text-muted mt-4">Aucun client trouvé.</p>;
    }

    // 🧠 Fonction de mise à jour
    const handleUpdate = async () => {
        setLoadingSubmit(true);
        setShowGlobalLoader(true);

        try {
            const res = await fetch(`${API_ENDPOINTS.SENDERS_V3}/${customerId}/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                showNotification({
                    title: "Succès ✅",
                    message: "Les informations du client ont été mises à jour avec succès.",
                    variant: "success",
                });
            } else {
                const apiMessage =
                    data?.error?.details || data?.message || "Erreur lors de la mise à jour.";
                throw new Error(apiMessage);
            }
        } catch (err: any) {
            console.error("Erreur API:", err.message);
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

    return (
        <div className="position-relative">
            {/* 🔄 Loader Overlay */}
            {showGlobalLoader && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255, 255, 255, 0.7)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                    }}
                >
                    <Spinner type="border" color="primary" style={{ width: "3rem", height: "3rem" }} />
                    <p className="mt-3 text-muted fw-semibold">Mise à jour en cours...</p>
                </div>
            )}

            <div className="transaction-detail">
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        {/* Type de compte */}
                        <div className="mb-3">
                            <label className="form-label">Type de compte</label>
                            <Form.Select
                                name="type"
                                value={selectTypeAccount}
                                onChange={(e) => {
                                    setSelectTypeAccount(e.target.value);
                                    setFormData({ ...formData, type: e.target.value });
                                }}
                            >
                                <option value="P">Personnel</option>
                                <option value="B">Business</option>
                            </Form.Select>
                        </div>

                        {/* Pays */}
                        <div className="mb-3">
                            <label className="form-label">Pays</label>
                            <Select
                                isClearable
                                value={selectedCountry}
                                options={(countries?.data || []).map((c: any) => ({
                                    value: c.id,
                                    label: c.name,
                                }))}
                                onChange={(opt) => {
                                    setSelectedCountry(opt);
                                    setFormData({ ...formData, country_id: opt?.value || null });
                                }}
                            />
                        </div>

                        {/* Ville */}
                        <div className="mb-3">
                            <label className="form-label">Ville</label>
                            <Select
                                isDisabled={!selectedCountry || citiesLoading}
                                value={selectedCity}
                                options={(cities?.data || []).map((c: any) => ({
                                    value: c.id,
                                    label: c.name,
                                }))}
                                placeholder={!selectedCountry ? "Choisissez un pays" : "Sélectionnez une ville"}
                                onChange={(opt) => {
                                    setSelectedCity(opt);
                                    setFormData({ ...formData, city_id: opt?.value || null });
                                }}
                            />
                        </div>

                        {/* Infos de base */}
                        <Row>
                            <Col md={6}>
                                {selectTypeAccount === "P" ? (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nom</Form.Label>
                                            <Form.Control
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Téléphone</Form.Label>
                                            <Form.Control
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Adresse</Form.Label>
                                            <Form.Control
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sexe</Form.Label>
                                            <Form.Select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            >
                                                <option value="">-- Choisir --</option>
                                                <option value="M">Homme</option>
                                                <option value="F">Femme</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </>
                                ) : (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Nom du business</Form.Label>
                                            <Form.Control
                                                value={formData.business_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, business_name: e.target.value })
                                                }
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Type de business</Form.Label>
                                            <Form.Select
                                                value={formData.business_type}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, business_type: e.target.value })
                                                }
                                            >
                                                <option value="">-- Choisir --</option>
                                                <option value="SARL">SARL</option>
                                                <option value="SARLU">SARLU</option>
                                                <option value="SAS">SAS</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </>
                                )}
                            </Col>

                            <Col md={6}>
                                {selectTypeAccount === "P" ? (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Prénom</Form.Label>
                                            <Form.Control
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date de naissance</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.date_birth}
                                                onChange={(e) => setFormData({ ...formData, date_birth: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                        <label htmlFor="simpleinput" className="form-label"> Occupation </label>
                                        <Form.Control type="text" id="simpleinput" name='occupation'
                                                      value={formData.occupation}
                                                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                        />
                                    </Form.Group>
                                    </>
                                ) : (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date d’enregistrement</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.register_business_date}
                                            onChange={(e) =>
                                                setFormData({ ...formData, register_business_date: e.target.value })
                                            }
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Form.Group>

                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={6}>
                                {selectTypeAccount ==='P'?(
                                    <div className="mb-3">
                                        <label htmlFor="example-select" className="form-label">Type de document</label>
                                        <Form.Select id="example-select" name='document_id'
                                                     value={formData.document_id}
                                                     onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                                        >
                                            <option value='PP'>Passport</option>
                                            <option value='CN'>CNI</option>
                                        </Form.Select>
                                    </div> ):(
                                    <div className="mb-3">
                                        <label htmlFor="example-select" className="form-label">Type de document</label>
                                        <Form.Select id="example-select" name='document_id'
                                                     value={formData.document_id}
                                                     onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                                        >
                                            <option value='RCCM'>RCCM</option>
                                            <option value='Others'>Others</option>
                                        </Form.Select>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label htmlFor="simpleinput" className="form-label"> Date d'expiration </label>
                                    <Form.Control type="date" id="simpleinput" name='expired_document'
                                                  value={formData.expired_document}
                                                  onChange={(e) => setFormData({ ...formData, expired_document: e.target.value })}/>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="mb-3">
                                    <label htmlFor="example-select" className="form-label">Civility</label>
                                    <Form.Select id="example-select" name='civility'
                                                 value={formData.civility}
                                                 onChange={(e) => setFormData({ ...formData, civility: e.target.value })}>
                                        <option value='Maried'>Maried</option>
                                        <option value='Single'>Single</option>
                                    </Form.Select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="simpleinput" className="form-label"> Numero du document </label>
                                    <Form.Control type="text" id="simpleinput" name='document_number'
                                                  value={formData.document_number}
                                                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <div className="text-center mt-4">
                    <Button variant="primary" onClick={handleUpdate} disabled={loadingSubmit}>
                        {loadingSubmit ? (
                            <>
                                <Spinner size="sm" type="border" className="me-2" /> Mise à jour...
                            </>
                        ) : (
                            <>
                                <IconifyIcon icon="ri:edit-2-line" className="me-1" /> Modifier
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};




export default EditSenderCard;