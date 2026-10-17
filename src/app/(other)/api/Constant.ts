import {API_BASE} from '@/lib/api/http'

/**
 * Points d'accès de l'API Spring (base unique `/api`, sans version). L'URL de l'API se règle par
 * NEXT_PUBLIC_API_URL (ex. http://localhost:8080). Contrat : wtc-spring/api/openapi.yaml.
 */
const API_ENDPOINTS = {
    // authentification
    LOGIN: `${API_BASE}/auth/login`,
    MFA_VERIFY: `${API_BASE}/auth/mfa/verify`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/me`,
    MFA_ENROLLMENT: `${API_BASE}/me/mfa/enrollment`,
    MFA_CONFIRMATION: `${API_BASE}/me/mfa/confirmation`,
    // référentiels publics
    COUNTRIES: `${API_BASE}/countries`,
    PURPOSES: `${API_BASE}/reference/transfer-purposes`,
    SOURCES_OF_FUNDS: `${API_BASE}/reference/sources-of-funds`,
    RELATIONSHIPS: `${API_BASE}/reference/relationships`,
    // administration
    CUSTOMERS: `${API_BASE}/admin/customers`,
    PARTIES: `${API_BASE}/admin/parties`,
    TRANSFERS: `${API_BASE}/admin/transfers`,
    TOP_UPS: `${API_BASE}/admin/top-ups`,
    BALANCE_ADJUSTMENTS: `${API_BASE}/admin/balance-adjustments`,
    USERS: `${API_BASE}/admin/users`,
    AUDIT_LOGS: `${API_BASE}/admin/audit-logs`,
    LOGIN_AUDITS: `${API_BASE}/admin/login-audits`,
    PRICING_ZONES: `${API_BASE}/admin/pricing-zones`,
    FEE_SCHEDULES: `${API_BASE}/admin/fee-schedules`,
    EXCHANGE_RATES: `${API_BASE}/admin/exchange-rates`,
    WEB_TOKENS: `${API_BASE}/admin/web-tokens`,
    SETTINGS: `${API_BASE}/admin/settings`,
    REFERENCE_SYNC: `${API_BASE}/admin/reference/sync`,
};

export default API_ENDPOINTS;
