'use client'
import {
    Button,
    Card,
    CardHeader,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row,
    Table
} from 'react-bootstrap'
import React, {useEffect, useMemo, useState} from "react";
import {useFetchData} from "../../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../../(other)/api/Constant";
import Link from "next/link";
import {useParams} from "next/navigation";
import IconifyIcon from "../../../../../components/wrappers/IconifyIcon";

interface Beneficiary {
    id: number;
    name: string;
    business_type: string;
    account_number: string;
    swift_code: string;
    ifscode: string;
    rounting_number: string;
}

interface BeneficiaryResponse {
    data: Beneficiary[];
}

const BeneficiaryPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const params = useParams(); // récupère l’ID du pays depuis l’URL
    const id = params?.id as string;

    const { data, loading, error } = useFetchData<BeneficiaryResponse>(
        id ? `${API_ENDPOINTS.BENEFICIARIES}/${id}` : null
    );

    const beneficiaries = data?.data ?? [];

    // Filtrage côté client
    const filteredBeneficiaries = useMemo(() => {
        if (!search) return beneficiaries;
        const lowerSearch = search.toLowerCase();
        return beneficiaries.filter((b) => b.name.toLowerCase().includes(lowerSearch));
    }, [beneficiaries, search]);

    return (
        <Card>
            <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
                <div className="flex-grow-1">
                    <h4 className="header-title">Beneficiares</h4>
                </div>
                <div className="flex-shrink-0 d-flex align-items-center gap-2">
                    <div className="position-relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-control ps-4"
                            placeholder="Rechercher une banque..."
                        />
                        <IconifyIcon icon="ti:search" className="ti position-absolute top-50 translate-middle-y start-0 ms-2" />
                    </div>
                </div>
            </CardHeader>

            <div className="table-responsive">
                {loading ? (
                    <p>Chargement...</p>
                ) : error ? (
                    <p>❌ {error.message}</p>
                ) : (
                    <Table className="table-hover text-nowrap mb-0">
                        <thead className="bg-light-subtle">
                        <tr>
                            <th className="ps-3" style={{ width: 50 }}>
                                <input type="checkbox" className="form-check-input" />
                            </th>
                            <th className="fs-12 text-uppercase text-muted">ID</th>
                            <th className="fs-12 text-uppercase text-muted">Nom</th>
                            <th className="fs-12 text-uppercase text-muted">N de compte</th>
                            <th className="fs-12 text-uppercase text-muted">Code Swift</th>
                            <th className="fs-12 text-uppercase text-muted">Code IFSc</th>
                            <th className="fs-12 text-uppercase text-muted">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBeneficiaries.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center text-muted">
                                    Aucune banque trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredBeneficiaries.map((t) => (
                                <tr key={t.id}>
                                    <td className="ps-3">
                                        <input type="checkbox" className="form-check-input" />
                                    </td>
                                    <td>
                                        <span className="text-muted fw-semibold">#{t.id}</span>
                                    </td>
                                    <td>
                                        <h6 className="fs-14 mb-0">{t.name || "-"}</h6>
                                    </td>
                                    <td>
                                        <h6 className="fs-14 mb-0">{t.account_number || "-"}</h6>
                                    </td>
                                    <td>
                                        <h6 className="fs-14 mb-0">{t.swift_code || "-"}</h6>
                                    </td>
                                    <td>
                                        <h6 className="fs-14 mb-0">{t.ifscode || "-"}</h6>
                                    </td>
                                    <td className="pe-3">
                                        <div className="hstack gap-1 justify-content-end">
                                            <Link
                                                href={`/customers/beneficiaries/${t.id}/edit`} // ✅ utilisation correcte des backticks
                                                className="btn btn-soft-primary btn-sm btn-icon rounded-circle"
                                            >
                                                <IconifyIcon icon="ri:eye-line" />
                                            </Link>

                                            <Button
                                                variant="soft-danger"
                                                size="sm"
                                                className="btn-icon rounded-circle"
                                                onClick={() => handleDelete(t.id)} // si tu veux gérer la suppression
                                            >
                                                <IconifyIcon icon="ri:delete-bin-line" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </Table>
                )}
            </div>
        </Card>
    );
};

export default BeneficiaryPage;