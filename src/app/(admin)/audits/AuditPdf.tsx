import { Modal, Button } from "react-bootstrap";
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
interface Audit {
  id: number;
  action: string;
  message: string;
  date: string;
   ip_address: string;
  name: string;
}
interface AudiPdfProps {
    audits: Audit[];
    show: boolean;
    onClose: () => void;
    begin_date?: string;
    end_date?: string;
}

export default function AuditPdfModal({
                                                audits,
                                                show,
                                                onClose,
                                                begin_date,
                                                end_date,
                                            }: AudiPdfProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    /** 🔹 Génération PDF avec pagination et total global */
    const generatePDF = async () => {
        const element = receiptRef.current;
        if (!element) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Capture du contenu de la div
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fff" });
        const imgData = canvas.toDataURL("image/png");

        // Dimensions de l’image dans le PDF
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // ✅ Pagination
        const totalPages = pdf.getNumberOfPages(); // <— CORRECTION
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text(`Page ${i} / ${totalPages}`, pageWidth - 35, pageHeight - 10);
        }

        pdf.save(`transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
    };


    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Rapport des Audits</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div ref={receiptRef} className="pdf-container">
                    {/* ===== HEADER ===== */}
                    <div className="pdf-header">
                        <div className="pdf-brand">
                            <h3>💸 Wetransfercash</h3>
                            <p className="text-muted">Audits</p>
                        </div>
                        <div className="pdf-date">
                            <p>
                                <strong>Période :</strong>{" "}
                                {begin_date && end_date
                                    ? `${new Date(begin_date).toLocaleDateString("fr-FR")} → ${new Date(
                                        end_date
                                    ).toLocaleDateString("fr-FR")}`
                                    : "Toutes les audits"}
                            </p>
                            <p className="text-muted">
                                Généré le {new Date().toLocaleDateString("fr-FR")}
                            </p>
                        </div>
                    </div>

                    {/* ===== TABLE ===== */}
                    <table className="pdf-table">
                        <thead>
                        <tr>
                        
                              <th className="fs-12 text-uppercase">#</th>
                  <th className="fs-12 text-uppercase ">Date</th>
                  <th className="fs-12 text-uppercase ">User</th>
                  <th className="fs-12 text-uppercase">Actions</th>
                  <th className="fs-12 text-uppercase">Message</th>
                        </tr>
                        </thead>
                        <tbody>
                        {audits.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="no-data">
                                    Aucune audits trouvée.
                                </td>
                            </tr>
                        ) : (
                            audits.map((t, i) => (
                                <tr key={t.id}>
                                    <td>{i + 1}</td>
                                    <td>{t.date || "-"}</td>
                                    <td>{t.name || "-"}</td>
                                    <td>{t.action || "-"}</td>
                                
                       <td>{t.message || "-"}</td>
                     
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

             

                    {/* ===== FOOTER ===== */}
                    <div className="pdf-footer">
                        <div>
                            <p className="small">© {new Date().getFullYear()} Wetransfercash</p>
                            <p className="text-muted small">Document généré automatiquement</p>
                        </div>
                        <div className="signature">
                            <p>Signature</p>
                            <div className="signature-line"></div>
                        </div>
                    </div>

                    {/* ===== STYLES ===== */}
                    <style jsx>{`
            .pdf-container {
              background: #fff;
              padding: 32px;
              font-family: "Inter", Arial, sans-serif;
              color: #222;
              border-radius: 12px;
            }

            .pdf-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #007bff20;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }

            .pdf-brand h3 {
              color: #007bff;
              font-weight: 700;
              margin: 0;
            }

            .pdf-brand p {
              margin: 0;
              font-size: 0.9rem;
              color: #666;
            }

            .pdf-date {
              text-align: right;
              font-size: 0.9rem;
            }

            .pdf-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;
              margin-top: 8px;
            }

            .pdf-table th {
              background: #007bff;
              color: #fff;
              text-align: left;
              padding: 10px;
              border: 1px solid #007bff20;
            }

            .pdf-table td {
              padding: 8px;
              border: 1px solid #eee;
            }

            .pdf-table tr:nth-child(even) {
              background: #f8f9fa;
            }

            .no-data {
              text-align: center;
              color: #999;
              padding: 20px;
            }

            .pdf-total {
              margin-top: 20px;
              text-align: right;
              font-size: 1rem;
              background: #f8f9fa;
              padding: 10px;
              border-radius: 8px;
              border: 1px solid #ddd;
            }

            .status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 0.8rem;
              font-weight: 600;
            }

            .status.effectue {
              background: #d1e7dd;
              color: #0f5132;
            }
            .status.en-validation {
              background: #fff3cd;
              color: #664d03;
            }
            .status.annulee,
            .status.echoue {
              background: #f8d7da;
              color: #842029;
            }

            .pdf-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #ddd;
              margin-top: 30px;
              padding-top: 12px;
              font-size: 0.85rem;
              color: #555;
            }

            .signature-line {
              border-bottom: 1px solid #333;
              width: 100px;
              height: 20px;
            }
          `}</style>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Fermer
                </Button>
                <Button variant="primary" onClick={generatePDF}>
                    📄 Télécharger le PDF
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
