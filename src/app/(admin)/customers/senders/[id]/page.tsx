'use client';

import PageTitle from '@/components/PageTitle'
import {useParams} from 'next/navigation';
import React from "react";
import PartyListCard from "@/components/parties/PartyListCard";

const Page = () => {
    const params = useParams();
    const id = params?.id as string;
    if (!id) return null;
    return (
        <>
            <PageTitle title="Expéditeurs du client" subTitle="Liste" />
            <PartyListCard role="SENDER" customerId={id} />
        </>
    );
};

export default Page;
