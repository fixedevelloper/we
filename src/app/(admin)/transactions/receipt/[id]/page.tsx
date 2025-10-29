"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import TransactionReceipt from "../../TransactionReceipt";


const ReceiptPage = () => {
    const { id } = useParams();

    useEffect(() => {
        // Lance l'impression automatique après chargement
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="print-receipt-container">
            {transaction && <TransactionReceipt transaction={transaction} />}

        </div>
    );
};

export default ReceiptPage;
