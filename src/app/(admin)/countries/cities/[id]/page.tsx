'use client'
import { Metadata } from 'next'
import {Card, CardHeader, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Table} from 'react-bootstrap'
import {useEffect, useMemo, useState} from "react";
import {useFetchData} from "../../../../../hooks/useFetchData";
import API_ENDPOINTS from "../../../../(other)/api/Constant";
import {useParams} from "next/navigation";
import IconifyIcon from "../../../../../components/wrappers/IconifyIcon";

interface City {
    id: number;
    name: string;
}

interface CityResponse {
    data: City[];
}

const CitiesPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const params = useParams();
    const id = params?.id as string;

    const { data, loading, error } = useFetchData<CityResponse>(
        id ? `${API_ENDPOINTS.CITIES}/${id}` : null
    );

    const cities = data?.data ?? [];

    // Filtrage côté client
    const filteredCities = useMemo(() => {
        if (!search) return cities;
        const lowerSearch = search.toLowerCase();
        return cities.filter((c) => c.name.toLowerCase().includes(lowerSearch));
    }, [cities, search]);

    return (
        <Card>
            <CardHeader className="border-bottom card-tabs d-flex flex-wrap align-items-center gap-2">
                <div className="flex-grow-1">
                    <h4 className="header-title">Villes</h4>
                </div>
                <div className="flex-shrink-0 d-flex align-items-center gap-2">
                    <div className="position-relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-control ps-4"
                            placeholder="Rechercher une ville..."
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
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCities.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center text-muted">
                                    Aucune ville trouvée.
                                </td>
                            </tr>
                        ) : (
                            filteredCities.map((t) => (
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

export default CitiesPage;