'use client';

import PageTitle from '@/components/PageTitle'
import {useParams} from 'next/navigation';
import React from "react";
import PartyEditCard from "@/components/parties/PartyEditCard";

const Page = () => {
    const params = useParams();
    const id = params?.id as string;
    if (!id) return null;
    return (
        <>
            <PageTitle title="Bénéficiaire" subTitle="Détails et modification" />
            <PartyEditCard partyId={id} />
        </>
    );
};

export default Page;
