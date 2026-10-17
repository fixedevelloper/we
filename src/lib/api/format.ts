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
