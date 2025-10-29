'use client';

import PageTitle from '@/components/PageTitle'
import DetailTransactionCard from "../components/DetailTransactionCard";
import { Spinner } from 'react-bootstrap';
import {useParams, useRouter} from 'next/navigation';
import React from "react";

const DetailTransactionPage = () => {
    const params = useParams(); // ✅ Récupère les paramètres dynamiques de l’URL
    const id = params?.id as string; // ex: /transactions/123 → id = "123"


    if (!id) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement du détail de la transaction...</p>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Détail de la transaction" subTitle="Informations complètes" />
            <DetailTransactionCard transactionId={id as string} />
        </>
    );
};

export default DetailTransactionPage;
