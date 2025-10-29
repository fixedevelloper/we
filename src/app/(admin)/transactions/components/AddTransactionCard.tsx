'use client'
import React, {useRef, useState, useEffect} from "react";
import {
    Button,
    Card,
    Col,
    Form,
    ListGroup,
    ProgressBar,
    Row,
    Table,
    Toast,
    ToastBody,
    ToastHeader
} from "react-bootstrap";
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
import Image from "next/image";
import useToggle from "../../../../hooks/useToggle";
import {useNotificationContext} from "../../../../context/useNotificationContext";
import Spinner from "../../../../components/Spinner";

type StepWizardInstance = {
    nextStep: () => void
    previousStep: () => void
    goToStep: (step: number) => void
}

// StepOne.tsx
interface StepOneProps {
    countries: any;
    senders: any;
    selectedCountry: any;
    setSelectedCountry: (country: any) => void;
    selectedSender: any;
    setSelectedSender: (sender: any) => void;
    selectedBeneficiary: any;
    setSelectedBeneficiary: (beneficiary: any) => void;
    stepOneData: any;
    setStepOneData: Function;
}

export const StepOne: React.FC<StepOneProps> = ({
                                                    countries,
                                                    senders,
                                                    selectedCountry,
                                                    setSelectedCountry,
                                                    selectedSender,
                                                    setSelectedSender,
                                                    selectedBeneficiary,
                                                    setSelectedBeneficiary,
                                                    stepOneData,
                                                    setStepOneData
                                                }) => {

    const citiesEndpoint = selectedCountry ? `${API_ENDPOINTS.CITIES}/${selectedCountry.value}` : null;
    const {data: cities = {data: []}, loading: citiesLoading, refetch: refetchCities} = useFetchData<any>(citiesEndpoint || "", {}, {});
    const [selectedRelaction, setSelectedRelaction] = useState<any>(null);
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [comment, setComment] = useState<any>(null);
    const shouldFetchRelations = selectedSender && selectedBeneficiary;
    const {data: relations = []} = useFetchData<any[]>(
        shouldFetchRelations ? API_ENDPOINTS.WACEDATA : "",
        shouldFetchRelations
            ? {sender_type: selectedSender.type, beneficiary_type: selectedBeneficiary.type, service: "relaction"}
            : {}
    );

    useEffect(() => {
        if (selectedCountry && refetchCities) refetchCities();
    }, [selectedCountry]);


    const beneficiantEndpoint = selectedSender
        ? `${API_ENDPOINTS.BENEFICIARIES}/${selectedSender.value}`
        : null;

    // ✅ Fetch des beneficiarie selon le pays sélectionné (seulement si country défini)
    const {
        data: beneficiaries = {data: []},
        loading: beneficiariesLoading,
        refetch: refetchBeneficiaries,
    } = useFetchData<any>(beneficiantEndpoint || "", {}, {});
    // ✅ Mettre à jour stepOneData à chaque changement
    useEffect(() => {
        setStepOneData({
            country: selectedCountry,
            sender: selectedSender,
            beneficiary: selectedBeneficiary,
        });
    }, [selectedCountry, selectedSender, selectedBeneficiary]);

    return (
        <div className="tab-pane" id="basictab1">
            <Row>
                {/* Pays */}
                <div className="mb-3">
                    <label className="form-label">Pays</label>
                    <Select
                        className="select2"
                        isClearable
                        options={[{
                            value: "",
                            label: "Sélectionner"
                        }, ...(countries?.data || []).map((c: any) => ({
                            value: c.id,
                            label: c.name,
                            currency: c.currency
                        }))]}
                        onChange={(option) => setSelectedCountry(option)}
                        value={selectedCountry}
                    />
                </div>

                {/* Ville */}
                <div className="mb-3">
                    <label className="form-label">Ville</label>
                    <Select
                        className="select2"
                        isDisabled={!selectedCountry || citiesLoading}
                        options={(cities?.data || []).map((city: any) => ({value: city.id, label: city.name}))}
                        placeholder={!selectedCountry ? "Choisissez d'abord un pays" : citiesLoading ? "Chargement..." : "Sélectionner une ville"}
                        onChange={(city) => {
                            setSelectedCity(city);
                            setStepOneData((prev: any) => ({...prev, selectCity: city}));
                        }}
                        value={selectedCity}
                    />
                </div>

                {/* Expéditeur */}
                <div className="mb-3">
                    <label className="form-label">Expéditeur</label>
                    <Select
                        className="select2"
                        options={(senders?.data || []).map((s: any) => ({
                            value: s.id,
                            label: `${s.name}`,
                            type: s.type
                        }))}
                        onChange={(option) => setSelectedSender(option)}
                        value={selectedSender}
                    />
                </div>

                {/* Bénéficiaire */}
                <div className="mb-3">
                    <label className="form-label">Bénéficiaire</label>
                    <Select
                        className="select2"
                        options={selectedSender ? (beneficiaries?.data || []).map((b: any) => ({
                            value: b.id,
                            label: `${b.name}`,
                            type: b.type
                        })) : []}
                        onChange={(option) => setSelectedBeneficiary(option)}
                        value={selectedBeneficiary}
                    />
                </div>

                {/* Relation */}
                <div className="mb-3">
                    <label className="form-label">Relation</label>
                    <Select
                        className="select2"
                        options={(relations?.data || relations || []).map((r: any) => ({value: r.id, label: r.name}))}
                        isDisabled={!shouldFetchRelations}
                        placeholder={shouldFetchRelations ? "Sélectionner une relation" : "Sélectionner expéditeur et bénéficiaire"}
                        value={selectedRelaction}
                        onChange={(relaction) => {
                            setSelectedRelaction(relaction);
                            setStepOneData((prev: any) => ({...prev, selectRelaction: relaction}));
                        }}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Commentaire</label>
                    <input className="form-control" value={comment} onChange={(e) => {
                        setComment(e.target.value);
                        setStepOneData((prev: any) => ({...prev, comment: e.target.value}));
                    }}/>
                </div>
            </Row>
        </div>
    );
};


// StepTwo.tsx
interface StepTwoProps {
    selectCountry?: any;
    selectedSender?: any;
    selectedBeneficiary?: any;
    stepTwoData: any;
    setStepTwoData: Function;
}

export const StepTwo: React.FC<StepTwoProps> = ({
                                                    selectCountry,
                                                    selectedSender,
                                                    selectedBeneficiary,
                                                    stepTwoData,
                                                    setStepTwoData
                                                }) => {
    const [amount, setAmount] = useState<number>(0);
    const [fees, setFees] = useState<string>("0.00");
    const [amountXAF, setAmountXAF] = useState<string>("0.00");
    const [accountNumber, setAccountNumber] = useState<string>("");
    const [swiftCode, setSwiftCode] = useState<string>("");
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [selectedRaison, setSelectedRaison] = useState<any>(null);
    const [selectedOriginFond, setSelectedOriginFond] = useState<any>(null);
    const shouldFetchRelations = selectedSender && selectedBeneficiary;

    const {data: banks = {data: []}, loading: banksLoading} = useFetchData<any>(selectCountry ? `${API_ENDPOINTS.BANKLIST}/${selectCountry.value}` : null);

    const {data: taux = {data: {}}, refetch} = useFetchData<any>(selectCountry ? `${API_ENDPOINTS.TAUXEXCHANGE}/${selectCountry.value}` : null, {amount});
    // 🔹 Fetch des relations
    const {data: origin_fonds = []} = useFetchData<any[]>(
        shouldFetchRelations ? API_ENDPOINTS.WACEDATA : "",
        shouldFetchRelations
            ? {
                sender_type: selectedSender.type,
                beneficiary_type: selectedBeneficiary.type,
                service: "origin_fonds",
            }
            : {}
    );

    const {data: raison = []} = useFetchData<any[]>(
        shouldFetchRelations ? API_ENDPOINTS.WACEDATA : "",
        shouldFetchRelations
            ? {
                sender_type: selectedSender.type,
                beneficiary_type: selectedBeneficiary.type,
                service: "raison",
            }
            : {}
    );
    // 🔹 Refetch à chaque changement de montant
    useEffect(() => {
        if (selectCountry?.value && refetch) refetch({amount});
    }, [amount, selectCountry, refetch]);

    // 🔹 Calcul frais et XAF
    useEffect(() => {
        if (!taux?.data) return;

        const tauxXafUsd = taux.data.taux_xaf_usd || 1;
        const tauxCountry = taux.data.taux_country || 1;
        const ratePercent = taux.data.rate || 0;

        const amount_send = (amount / tauxXafUsd) * tauxCountry;
        const rate = (ratePercent * amount) / 100;

        setAmountXAF(amount_send.toFixed(2));
        setFees(rate.toFixed(2));

        setStepTwoData((prev: any) => ({
            ...prev,
            amount,
            fees: rate.toFixed(2),
            amountXAF: amount_send.toFixed(2),
            selectedBank,
            accountNumber,
            swiftCode,

        }));
    }, [amount, taux, selectedBank, accountNumber, swiftCode]);

    return (
        <div className="tab-pane" id="basictab2">
            <Row>
                {/* Montant */}
                <Row className="mb-3">
                    <label className="col-md-3 col-form-label">Montant</label>
                    <Col md={12}>
                        <div className="input-group flex-nowrap">
                            <span className="input-group-text">FCFA</span>
                            <input type="number" className="form-control" value={amount}
                                   onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}/>
                        </div>
                    </Col>
                </Row>

                {/* Frais */}
                <Row className="mb-3">
                    <label className="col-md-3 col-form-label">Frais</label>
                    <Col md={12}>
                        <div className="input-group flex-nowrap">
                            <span className="input-group-text">FCFA</span>
                            <input readOnly className="form-control" value={fees}/>
                        </div>
                    </Col>
                </Row>

                {/* Montant XAF */}
                <Row className="mb-3">
                    <label className="col-md-3 col-form-label">Montant ({selectCountry?.currency || "XAF"})</label>
                    <Col md={12}>
                        <div className="input-group flex-nowrap">
                            <span className="input-group-text">{selectCountry?.currency || "XAF"}</span>
                            <input readOnly className="form-control" value={amountXAF}/>
                        </div>
                    </Col>
                </Row>

                {/* Banque */}
                <div className="mb-3">
                    <label className="form-label">Banque</label>
                    <Select
                        className="select2"
                        isDisabled={!selectCountry || banksLoading}
                        options={(banks?.data || []).map((b: any) => ({value: b.id, label: b.name}))}
                        value={selectedBank}
                        onChange={(bank) => {
                            setSelectedBank(bank);
                            setStepTwoData((prev: any) => ({...prev, selectedBank: bank}));
                        }}
                    />
                </div>

                {/* Compte */}
                <div className="mb-3">
                    <label className="form-label">N° compte</label>
                    <input className="form-control" value={accountNumber} onChange={(e) => {
                        setAccountNumber(e.target.value);
                        setStepTwoData((prev: any) => ({...prev, accountNumber: e.target.value}));
                    }}/>
                </div>

                {/* Swift */}
                <div className="mb-3">
                    <label className="form-label">Swift Code</label>
                    <input className="form-control" value={swiftCode} onChange={(e) => {
                        setSwiftCode(e.target.value);
                        setStepTwoData((prev: any) => ({...prev, swiftCode: e.target.value}));
                    }}/>
                </div>
                {/* Origine des fonds */}
                <div className="mb-3">
                    <label className="form-label">Origine des fonds</label>
                    <Select
                        className="select2"
                        isDisabled={!shouldFetchRelations}
                        options={(origin_fonds?.data || origin_fonds || []).map((r: any) => ({
                            value: r.id,
                            label: r.name
                        }))}
                        placeholder="Sélectionner une origine"
                        value={selectedOriginFond}
                        onChange={(origin) => {
                            setSelectedOriginFond(origin);
                            setStepTwoData((prev: any) => ({...prev, selectedOriginFond: origin}));
                        }}
                    />
                </div>

                {/* Raison */}
                <div className="mb-3">
                    <label className="form-label">Raison</label>
                    <Select
                        className="select2"
                        isDisabled={!shouldFetchRelations}
                        options={(raison?.data || raison || []).map((r: any) => ({value: r.id, label: r.name}))}
                        placeholder="Sélectionner une raison d'envoi"
                        value={selectedRaison}
                        onChange={(raison) => {
                            setSelectedRaison(raison);
                            setStepTwoData((prev: any) => ({...prev, selectRaison: raison}));
                        }}
                    />
                </div>
            </Row>
        </div>
    );
};


// StepThree.tsx
interface StepThreeProps {
    stepOneData: any;
    stepTwoData: any;
}


export const StepThree: React.FC<StepThreeProps> = ({ stepOneData, stepTwoData }) => {
    const [loading, setLoading] = useState(false);
    const { isTrue: isOpen, toggle: hide } = useToggle();
    const { showNotification } = useNotificationContext();
    const { data: session } = useSession();
    const [error, setError] = useState<string | null>(null);

    /** 🔹 Construction du payload */
    const buildPayload = () => ({
        sender_id: stepOneData.sender?.value,
        beneficiary_id: stepOneData.beneficiary?.value,
        amount: stepTwoData.amount,
        rate: stepTwoData.fees,
        acount_number: stepTwoData.accountNumber,
        origin_fond: stepTwoData.selectedOriginFond?.value,
        relaction: stepOneData.selectRelaction?.value,
        motif: stepTwoData.selectRaison?.value,
        comment: stepOneData.comment,
        bank_name: stepTwoData.selectedBank?.label,
        operator_id: stepTwoData.selectedBank?.value,
        wallet: "WACEPAY",
        type: "B",
        country_id: stepOneData.country?.value,
        city_id: stepOneData.selectCity?.value,
        swiftCode: stepTwoData.swiftCode,
        ifscCode: stepTwoData.ifscode,
        total_amount: stepTwoData.amountXAF,
    });

    /** 🔹 Envoi de la transaction */
    const sendTransfert = async () => {
        setError(null);
        setLoading(true);

        try {
            const payload = buildPayload();
            console.log("⚙️ Payload envoyé :", payload);

            const res = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/bank`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                console.log("✅ Transaction réussie :", data);

                showNotification({
                    title: "Succès 🎉",
                    message: "Le transfert a été envoyé avec succès.",
                    variant: "success",
                });

                // Exemple si tu veux rediriger plus tard
                // navigate("/connexion-client/attente-paiement", { state: { referenceId: data.referenceId } });
            } else {
                // ⚠️ Gestion d’erreurs précises
                const apiMessage =
                    data?.error?.details ||
                    data?.message ||
                    data?.error ||
                    "Erreur lors du paiement.";

                throw new Error(apiMessage);
            }
        } catch (err: any) {
            console.error("❌ Erreur API:", err.message);
            setError(err.message);

            showNotification({
                title: "Échec du transfert ⚠️",
                message: err.message || "Une erreur s’est produite lors de l’envoi.",
                variant: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-pane" id="basictab3">
            {/* ✅ Titre principal */}
            <Row className="text-center mb-4">
                <Col xs={12}>
                    <h2>
                        <IconifyIcon icon="bi:check2-all" />
                    </h2>
                    <h4>Récapitulatif de la transaction</h4>
                </Col>
            </Row>

            {/* ✅ Informations sur l'expéditeur / bénéficiaire */}
            <Row className="g-3">
                <Col md={6}>
                    <Card>
                        <Card.Header>Expéditeur & Pays</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Pays :</strong> {stepOneData.country?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Ville :</strong> {stepOneData.selectCity?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Expéditeur :</strong> {stepOneData.sender?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Bénéficiaire :</strong> {stepOneData.beneficiary?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Relation :</strong> {stepOneData.selectRelaction?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Raison :</strong> {stepTwoData.selectRaison?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Origine des fonds :</strong> {stepTwoData.selectedOriginFond?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Commentaire :</strong> {stepOneData.comment || "-"}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>

                {/* ✅ Informations sur la transaction */}
                <Col md={6}>
                    <Card>
                        <Card.Header>Transaction</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Montant :</strong> {stepTwoData.amount} FCFA
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Frais :</strong> {stepTwoData.fees} FCFA
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Montant ({stepOneData.country?.currency}) :</strong> {stepTwoData.amountXAF}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Banque :</strong> {stepTwoData.selectedBank?.label || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>N° Compte :</strong> {stepTwoData.accountNumber || "-"}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Swift Code :</strong> {stepTwoData.swiftCode || "-"}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
            {/* ✅ Bouton d’envoi avec loader */}
            <Row className="mt-4">
                <Col className="text-center">
                    <Button
                        variant="primary"
                        disabled={loading}
                        onClick={sendTransfert}
                    >
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Envoi en cours...
                            </>
                        ) : (
                            "Envoyer le transfert"
                        )}
                    </Button>

                    {error && <div className="text-danger mt-2">⚠️ {error}</div>}
                </Col>
            </Row>
        </div>
    );
};


const AddTransactionCard: React.FC = () => {
    const wizardRef = useRef<StepWizardInstance | null>(null);
    const [activeStep, setActiveStep] = useState(1);
    const {data: session, status} = useSession(); //
    const [stepOneData, setStepOneData] = useState({
        senderName: "",
        senderEmail: "",
        // Ajouter d'autres champs StepOne si nécessaire
    });

    const [stepTwoData, setStepTwoData] = useState({
        amount: 0,
        fees: "0.00",
        amountXAF: "0.00",
        selectedBank: null,
        accountNumber: "",
        swiftCode: "",
        originFond: null,
        raison: null,
    });

    // si ton hook renvoie un état de chargement
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectedSender, setSelectedSender] = useState<any>(null);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
    // 🔹 Si la session n’est pas encore disponible, on ne fait pas d’appel API
    const userId = session?.user?.id;

    const {data: countries = []} = useFetchData<any[]>(
        API_ENDPOINTS.COUNTRIES
    );

    const {data: senders = []} = useFetchData<any[]>(
        userId ? `${API_ENDPOINTS.SENDERS}/${userId}` : null
    );


    const nextStep = () => {
        if (wizardRef.current) {
            wizardRef.current.nextStep();
            setActiveStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (wizardRef.current) {
            wizardRef.current.previousStep();
            setActiveStep((prev) => prev - 1);
        }
    };

    const goToStep = (step: number) => {
        if (wizardRef.current) {
            wizardRef.current.goToStep(step);
            setActiveStep(step);
        }
    };

    const steps = [1, 2, 3];


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

                    <ul className="nav nav-pills nav-justified form-wizard-header mb-4 justify-content-center">
                        {["Information générales", "Détail de la transaction", "Récapitulatif"].map((label, idx) => (
                            <li className="nav-item" key={idx}>
                                <a
                                    href={`#basictab${idx + 1}`}
                                    className={`nav-link rounded-0 py-2 ${activeStep === idx + 1 ? "active" : ""}`}
                                    onClick={() => goToStep(idx + 1)}
                                >
                                    <IconifyIcon
                                        icon={["bi:person-circle", "bi:emoji-smile", "bi:check2-circle"][idx]}
                                        className="fs-18 align-middle me-1"
                                    />
                                    <span className="d-none d-sm-inline">{label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Wizard Body */}
                    <div className="tab-content b-0 mb-0 d-flex flex-column align-items-center">
                        <ProgressBar
                            style={{height: 7, width: "100%"}}
                            animated
                            striped
                            variant="success"
                            now={(activeStep / steps.length) * 100}
                            className="mb-3 progress-sm"
                        />

                        <StepWizard
                            instance={(wizard: any) => {
                                wizardRef.current = wizard;
                            }}
                            onStepChange={(stats) => setActiveStep(stats.activeStep)}
                        >
                            <StepOne
                                countries={countries}
                                senders={senders}
                                selectedCountry={selectedCountry}
                                setSelectedCountry={setSelectedCountry}
                                selectedSender={selectedSender}
                                setSelectedSender={setSelectedSender}
                                selectedBeneficiary={selectedBeneficiary}
                                setSelectedBeneficiary={setSelectedBeneficiary}
                                stepOneData={stepOneData}
                                setStepOneData={setStepOneData}
                            />
                            <StepTwo
                                selectCountry={selectedCountry}
                                selectedSender={selectedSender}
                                selectedBeneficiary={selectedBeneficiary}
                                stepTwoData={stepTwoData}
                                setStepTwoData={setStepTwoData}
                            />
                            <StepThree stepOneData={stepOneData} stepTwoData={stepTwoData}/>
                        </StepWizard>


                        {/* Navigation Buttons */}
                        <div className="d-flex wizard justify-content-center flex-wrap gap-2 mt-3">
                            <Button className="btn btn-primary" onClick={() => goToStep(1)} disabled={activeStep === 1}>
                                First
                            </Button>
                            <Button className="btn btn-primary" onClick={prevStep} disabled={activeStep === 1}>
                                <IconifyIcon icon="bx-left-arrow-alt" className="me-2"/>
                                Back
                            </Button>
                            <Button className="btn btn-primary" onClick={nextStep} disabled={activeStep === 3}>
                                Next
                                <IconifyIcon icon="bx-right-arrow-alt" className="ms-2"/>
                            </Button>
                            <Button className="btn btn-primary" onClick={() => goToStep(3)} disabled={activeStep === 3}>
                                Finish
                            </Button>
                        </div>
                    </div>
                </ComponentContainerCard>
            </Col>
        </Row>
    );
};


export default AddTransactionCard