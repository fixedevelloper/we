'use client';

import PageTitle from '@/components/PageTitle'
import { Spinner } from 'react-bootstrap';
import {useParams} from 'next/navigation';
import React from "react";
import DetailCustomerCard from "../components/DetailCustomerCard";

const DetailCustomerPage = () => {
    const params = useParams();
    const id = params?.id as string;


    if (!id) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement du détail du client...</p>
            </div>
        );
    }

    return (
        <>
            <PageTitle title="Détail du client" subTitle="Informations complètes" />
            <DetailCustomerCard customerId={id as string} />
        </>
    );
};

export default DetailCustomerPage;
