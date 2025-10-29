'use client';

import PageTitle from '@/components/PageTitle'
import { Spinner } from 'react-bootstrap';
import {useParams} from 'next/navigation';
import React from "react";
import EditSenderCard from "../components/EditSenderCard";

const EditCustomerPage = () => {
    const params = useParams();
    const id = params?.id as string;


    if (!id) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement de l'expediteur...</p>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Modifier l'expediteur" subTitle="Informations complètes" />
            <EditSenderCard customerId={id as string} />
        </>
    );
};

export default EditCustomerPage;
