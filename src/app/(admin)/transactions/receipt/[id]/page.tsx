"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import TransactionReceipt from "../../TransactionReceipt";


const ReceiptPage = (transaction) => {
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
            {transaction && <TransactionReceipt transaction={transaction}  onClose={} show/>}

        </div>
    );
};

export default ReceiptPage;
