import type { Money } from './types'

/** « 10 500 XAF », avec la précision de la devise (le serveur envoie des chaînes décimales, jamais des flottants). */
export const formatMoney = (m?: Money | null): string => {
  if (!m) return '-'
  const n = Number(m.amount)
  if (Number.isNaN(n)) return `${m.amount} ${m.currency}`
  let digits = 2
  try {
    digits = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: m.currency }).resolvedOptions().maximumFractionDigits ?? 2
  } catch {
    // devise inconnue d'Intl : deux décimales
  }
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${m.currency}`
}

export const formatDateTime = (iso?: string | null): string =>
  iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '-'

export const formatDate = (iso?: string | null): string => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '-')

/** Nom lisible d'une partie (personne ou entreprise). */
export const partyName = (p?: { kind?: string; firstName?: string; lastName?: string; businessName?: string } | null): string => {
  if (!p) return '-'
  if (p.kind === 'BUSINESS') return p.businessName ?? '-'
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || '-'
}

export const TRANSFER_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  CREATED: { label: 'Créé', variant: 'secondary' },
  PAYOUT_PENDING: { label: 'En attente d\'envoi', variant: 'info' },
  PROCESSING: { label: 'En cours', variant: 'warning' },
  COMPLETED: { label: 'Payé', variant: 'success' },
  FAILED: { label: 'Échoué', variant: 'danger' },
  REFUNDED: { label: 'Remboursé', variant: 'dark' },
  CANCELLED: { label: 'Annulé', variant: 'secondary' },
}

export const KYC_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  NOT_SUBMITTED: { label: 'Non soumis', variant: 'secondary' },
  PENDING: { label: 'À examiner', variant: 'warning' },
  VERIFIED: { label: 'Vérifié', variant: 'success' },
  REJECTED: { label: 'Refusé', variant: 'danger' },
  EXPIRED: { label: 'Expiré', variant: 'dark' },
}

export const TRANSFER_KIND_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile money',
}

/** Qui a provoqué un changement de statut (historique d'un transfert). */
export const ACTOR_LABELS: Record<string, string> = {
  CUSTOMER: 'Client',
  ADMIN: 'Personnel',
  SYSTEM: 'Système',
  PROVIDER: 'Fournisseur',
}

/** Résultat de la création d'un ordre chez le fournisseur (`payout_attempts`). */
export const ATTEMPT_OUTCOME_LABELS: Record<string, { label: string; variant: string }> = {
  ACCEPTED: { label: 'Accepté', variant: 'success' },
  REJECTED: { label: 'Refusé', variant: 'danger' },
  ERROR: { label: 'Erreur', variant: 'warning' },
  AMBIGUOUS: { label: 'Incertain', variant: 'warning' },
}

export const ID_TYPE_LABELS: Record<string, string> = {
  PP: 'Passeport',
  PASSPORT: 'Passeport',
  CNI: "Carte d'identité",
  NATIONAL_ID: "Carte d'identité",
  ID_CARD: "Carte d'identité",
  RCCM: 'RCCM',
}

export const TOPUP_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  PROCESSING: { label: 'En cours', variant: 'info' },
  COMPLETED: { label: 'Terminée', variant: 'success' },
  FAILED: { label: 'Échouée', variant: 'danger' },
  CANCELLED: { label: 'Annulée', variant: 'secondary' },
  REJECTED: { label: 'Refusée', variant: 'danger' },
}

export const TOPUP_METHOD_LABELS: Record<string, string> = {
  WACE_MOBILE_MONEY: 'Mobile money (Wace)',
  MANUAL_PROOF: 'Preuve de paiement',
  LEGACY: 'Ancien système',
}

export const ADJUSTMENT_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'À approuver', variant: 'warning' },
  APPROVED: { label: 'Approuvé', variant: 'success' },
  REJECTED: { label: 'Refusé', variant: 'danger' },
}

export const CUSTOMER_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  ACTIVE: { label: 'Actif', variant: 'success' },
  SUSPENDED: { label: 'Suspendu', variant: 'warning' },
  CLOSED: { label: 'Clos', variant: 'danger' },
}

export const KYC_DOCUMENT_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'À examiner', variant: 'warning' },
  APPROVED: { label: 'Approuvé', variant: 'success' },
  REJECTED: { label: 'Refusé', variant: 'danger' },
  EXPIRED: { label: 'Expiré', variant: 'dark' },
}

export const WALLET_STATUS_LABELS: Record<string, string> = { ACTIVE: 'Actif', FROZEN: 'Gelé', CLOSED: 'Clos' }

export const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Client',
  SUPPORT: 'Support',
  ADMIN: 'Administrateur',
  SUPER_ADMIN: 'Super administrateur',
}

export const STAFF_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  PENDING_VERIFICATION: { label: 'Invitation en attente', variant: 'secondary' },
  ACTIVE: { label: 'Actif', variant: 'success' },
  SUSPENDED: { label: 'Suspendu', variant: 'danger' },
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  PARTY_CREATED: 'Expéditeur/bénéficiaire créé',
  PARTY_UPDATED: 'Expéditeur/bénéficiaire modifié',
  DESTINATION_CREATED: 'Destination créée',
  TRANSFER_CREATED: 'Transfert créé',
  MFA_ENABLED: 'Double authentification activée',
  USER_REGISTERED: 'Inscription',
  REFRESH_TOKEN_REUSE_DETECTED: 'Réutilisation de jeton détectée',
  SUPER_ADMIN_BOOTSTRAPPED: 'Super administrateur initialisé',
  ADJUSTMENT_REQUESTED: 'Ajustement de solde demandé',
  ADJUSTMENT_APPROVED: 'Ajustement de solde approuvé',
  ADJUSTMENT_REJECTED: 'Ajustement de solde refusé',
  KYC_DOCUMENT_UPLOADED: "Pièce d'identité déposée",
  KYC_DOCUMENT_APPROVED: "Pièce d'identité approuvée",
  KYC_DOCUMENT_REJECTED: "Pièce d'identité refusée",
  WEB_TOKEN_CREATED: "Jeton d'accès créé",
  SETTING_UPDATED: 'Paramètre modifié',
  COUNTRY_CREATED: 'Pays ajouté',
  CITY_CREATED: 'Ville ajoutée',
  REFERENCE_SYNCED: 'Import des référentiels Wace',
}

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  PARTY: 'Expéditeur/bénéficiaire',
  DESTINATION: 'Destination',
  TRANSFER: 'Transfert',
  USER: 'Utilisateur',
  BALANCE_ADJUSTMENT: 'Ajustement de solde',
  KYC_DOCUMENT: "Pièce d'identité",
  WEB_TOKEN: 'Jeton',
  SETTING: 'Paramètre',
  COUNTRY: 'Pays',
  CITY: 'Ville',
  REFERENCE: 'Référentiels',
  CUSTOMER: 'Client',
  TOP_UP: 'Recharge',
}

export const AUDIT_ACTOR_TYPE_LABELS: Record<string, string> = { USER: 'Utilisateur', SYSTEM: 'Système', PROVIDER: 'Prestataire' }

export const LOGIN_OUTCOME_LABELS: Record<string, { label: string; variant: string }> = {
  SUCCESS: { label: 'Connecté', variant: 'success' },
  MFA_REQUIRED: { label: 'Code 2FA demandé', variant: 'info' },
  MFA_FAILED: { label: 'Code 2FA erroné', variant: 'danger' },
  BAD_CREDENTIALS: { label: 'Identifiants incorrects', variant: 'danger' },
  LOCKED: { label: 'Compte verrouillé', variant: 'warning' },
  SUSPENDED: { label: 'Compte suspendu', variant: 'warning' },
}

export const WEB_TOKEN_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Disponible', variant: 'warning' },
  USED: { label: 'Utilisé', variant: 'success' },
  EXPIRED: { label: 'Expiré', variant: 'secondary' },
}
