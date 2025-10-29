import { Modal, Button } from "react-bootstrap";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";

interface TransactionReceiptProps {
    transaction: any;
    show: boolean;
    onClose: () => void;
}

export default function TransactionReceiptModal({ transaction, show, onClose }: TransactionReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [qrCode, setQrCode] = useState<string>("");

    useEffect(() => {
        if (transaction?.numero_transaction) {
            QRCode.toDataURL(
                `https://wetransfercash.com/verify/${transaction.numero_transaction}`,
                { width: 150 }
            ).then(setQrCode);
        }
    }, [transaction]);

    const generatePDF = async () => {
        const element = receiptRef.current;
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`recu_transaction_${transaction.id}.pdf`);
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Reçu de transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="receipt-pro-container">
                    <div ref={receiptRef} className="receipt-card">
                        <div className="receipt-header">
                            <div>
                                <img src="/logo.png" alt="Logo" className="logo" />
                                <h2>Wetransfercash</h2>
                                <p>Reçu officiel de transaction</p>
                            </div>
                            <div className="receipt-info">
                                <p>Date : {transaction.date_transaction}</p>
                                <p>Réf : {transaction.numero_transaction}</p>
                            </div>
                        </div>

                        {qrCode && (
                            <div className="qr-container">
                                <img src={qrCode} alt="QR Code" />
                            </div>
                        )}

                        <div className="details-grid">
                            <div>
                                <h3>Expéditeur</h3>
                                <p><b>Nom :</b> {transaction.sender_name}</p>
                                <p><b>Pays :</b> {transaction.sender_country}</p>
                                <p><b>Ville :</b> {transaction.sender_city}</p>
                            </div>
                            <div>
                                <h3>Bénéficiaire</h3>
                                <p><b>Nom :</b> {transaction.beneficiary_name}</p>
                                <p><b>Pays :</b> {transaction.beneficiary_country}</p>
                                <p><b>Téléphone :</b> {transaction.beneficiary_phone}</p>
                            </div>
                        </div>

                        <table className="transaction-table">
                            <tbody>
                            <tr><td>Montant envoyé</td><td>{transaction.amount} {transaction.currency}</td></tr>
                            <tr><td>Frais</td><td>{transaction.rate} {transaction.currency}</td></tr>
                            <tr><td><b>Montant total</b></td><td><b>{transaction.amount_total} {transaction.currency}</b></td></tr>
                            <tr><td>Statut</td><td>{transaction.status}</td></tr>
                            </tbody>
                        </table>

                        <div className="receipt-footer">
                            <div>
                                <p>Ce reçu a été généré automatiquement.</p>
                                <p className="small">Wetransfercash © {new Date().getFullYear()}</p>
                            </div>
                            <div className="signature">
                                <p>Signature</p>
                                <div className="signature-line"></div>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
            .receipt-pro-container { padding: 10px; font-family: Arial, sans-serif; color: #333; }
            .receipt-card { background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .receipt-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 20px; }
            .logo { height: 50px; }
            .qr-container { text-align: right; margin-bottom: 10px; }
            .qr-container img { height: 80px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .transaction-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .transaction-table td { padding: 8px; border-bottom: 1px solid #eee; }
            .receipt-footer { display: flex; justify-content: space-between; margin-top: 30px; color: #666; font-size: 0.9rem; }
            .signature-line { border-bottom: 1px solid #999; width: 100px; height: 20px; }
          `}</style>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Fermer</Button>
                <Button variant="primary" onClick={generatePDF}>📄 Télécharger le PDF</Button>
            </Modal.Footer>
        </Modal>
    );
}
