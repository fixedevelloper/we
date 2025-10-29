'use client';

import PageTitle from '@/components/PageTitle'
import { Spinner } from 'react-bootstrap';
import {useParams} from 'next/navigation';
import React from "react";
import EditBeneficiaryCard from "../../components/EditBeneficiaryCard";

const EditBeneficiaryPage = () => {
    const params = useParams();
    const id = params?.id as string;


    if (!id) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement du détail du beneficiare...</p>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Modifier le  beneficiare" subTitle="Informations complètes" />
            <EditBeneficiaryCard customerId={id as string} />
        </>
    );
};

export default EditBeneficiaryPage;
