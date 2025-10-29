const BASE_URL='https://wetransfercashapi.agensic.com'
//const BASE_URL='http://localhost:8000'
const API_ENDPOINTS = {
    AUTH:`${BASE_URL}/auth/login`,
    TRANSACTIONS: `${BASE_URL}/v3/transactions`,
    TRANSACTIONS_CREATE: `${BASE_URL}/v2/transferts`,
    RECHARGES: `${BASE_URL}/v3/recharges`,
    COUNTRIES: `${BASE_URL}/v2/countries`,
    CITIES: `${BASE_URL}/v2/cities`,
    BENEFICIARIES: `${BASE_URL}/v3/all_beneficiaries`,
    SENDERS: `${BASE_URL}/v3/all_senders`,
    WACEDATA: `${BASE_URL}/v2/wace_data`,
    BANKLIST: `${BASE_URL}/v2/banklists`,
    OPERATORS: `${BASE_URL}/v2/operatorslists`,
    TAUXEXCHANGE: `${BASE_URL}/v2/tauxechanges`,
    CUSTOMERS: `${BASE_URL}/v3/customers`,
    GRILLETARIFAIRES: `${BASE_URL}/v1/grilletarifaires`,
    ZONES: `${BASE_URL}/v1/zones`,
    BENEFICIARIES_V3: `${BASE_URL}/v3/beneficiaries`,
    SENDERS_V3: `${BASE_URL}/v3/senders`,
    USERS: `${BASE_URL}/v3/users`,
};

export default API_ENDPOINTS;