'use client'
import { Metadata } from 'next'
import {
    Badge,
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
import {useEffect, useMemo, useState} from "react";
import {useFetchData} from "../../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../../(other)/api/Constant";
import Link from "next/link";
import {useParams} from "next/navigation";
import IconifyIcon from "../../../../../components/wrappers/IconifyIcon";

interface Sender {
    id: number;
    name: string;
    country_name: string;
    type: string;
    balance: string;
    phone: string;
    type_identification: string;
    numero_piece: string;
    email: string;
    photo: string;
    motif: string;
    expired_date_piece: string;
    status_account: string;
    piece_face_file: string;
    piece_recto_file: string;
}

interface SenderResponse {
    data: Sender[];
}

const SenderPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const params = useParams();
    const id = params?.id as string;
    const url = id ? `${API_ENDPOINTS.CUSTOMERS}/senders/${id}` : undefined;
    const requestUrl = url ?? "";
    const { data, loading, error } = useFetchData<SenderResponse>(
        requestUrl
    );

    const senders = data?.data ?? [];

    // Filtrage côté client
    const filteredSenders = useMemo(() => {
        if (!search) return senders;
        const lowerSearch = search.toLowerCase();
        return senders.filter((s) => s.name.toLowerCase().includes(lowerSearch));
    }, [senders, search]);

    return (
        <Card>
            <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
                <div className="flex-grow-1">
                    <h4 className="header-title">Expéditeurs</h4>
                </div>
                <div className="flex-shrink-0 d-flex align-items-center gap-2">
                    <div className="position-relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-control ps-4"
                            placeholder="Rechercher un expéditeur..."
                        />
                        <IconifyIcon
                            icon="ti:search"
                            className="ti position-absolute top-50 translate-middle-y start-0 ms-2"
                        />
                    </div>
                </div>
            </CardHeader>

            <div className="table-responsive">
                {loading ? (
                    <p className="text-center my-3">Chargement...</p>
                ) : error ? (
                    <p className="text-center text-danger my-3">❌ {error.message}</p>
                ) : (
                    <Table className="table-hover text-nowrap mb-0 align-middle">
                        <thead className="bg-light-subtle">
                        <tr>
                            <th className="ps-3"><input type="checkbox" className="form-check-input" /></th>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Téléphone</th>
                            <th>Pays</th>
                            <th>Type Identification</th>
                            <th>Numéro Pièce</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredSenders.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="text-center text-muted">
                                    Aucun expéditeur trouvé.
                                </td>
                            </tr>
                        ) : (
                            filteredSenders.map((s) => (
                                <tr key={s.id}>
                                    <td className="ps-3">
                                        <input type="checkbox" className="form-check-input" />
                                    </td>
                                    <td>#{s.id}</td>
                                    <td className="d-flex align-items-center gap-2">
                                        {s.photo ? (
                                            <img
                                                src={s.photo}
                                                alt="avatar"
                                                width={35}
                                                height={35}
                                                style={{ borderRadius: "50%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                        {s.name || "-"}
                                    </td>
                                    <td>{s.type || "-"}</td>
                                    <td>{s.phone || "-"}</td>
                                    <td>{s.country_name || "-"}</td>
                                    <td>{s.type_identification || "-"}</td>
                                    <td>{s.numero_piece || "-"}</td>
                                    <td>
                                        <Badge
                                            bg={s.status_account === "ACCEPTED" ? "success" : "warning"}
                                            className="text-uppercase small"
                                        >
                                            {s.status_account}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Dropdown>
                                            <DropdownToggle className="btn btn-light btn-sm">⋮</DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem as={Link} href={`/customers/${s.id}`}>
                                                    Détails
                                                </DropdownItem>
                                                <DropdownItem as={Link} href={`/customers/edit/${s.id}`}>
                                                    Modifier
                                                </DropdownItem>
                                                {s.piece_face_file && (
                                                    <DropdownItem as={Link} href={s.piece_face_file} target="_blank">
                                                        Voir pièce (face)
                                                    </DropdownItem>
                                                )}
                                                {s.piece_recto_file && (
                                                    <DropdownItem as={Link} href={s.piece_recto_file} target="_blank">
                                                        Voir pièce (recto)
                                                    </DropdownItem>
                                                )}
                                            </DropdownMenu>
                                        </Dropdown>
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


export default SenderPage;