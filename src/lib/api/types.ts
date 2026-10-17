/** Types du contrat OpenAPI utilisés par le back-office (sous-ensemble). */

export type Role = 'CUSTOMER' | 'SUPPORT' | 'ADMIN' | 'SUPER_ADMIN'

export type Money = { amount: string; currency: string }

export type Page<T> = { page: number; size: number; totalElements: number; totalPages: number; content: T[] }

export type UserSummary = {
  id: string
  email: string
  displayName: string
  photoUrl?: string
  roles: Role[]
  customerId?: string
  mfaEnabled: boolean
}

export type TokenResponse = {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: UserSummary
}

export type MfaChallenge = { mfaRequired: true; mfaToken: string }

export type Country = {
  code: string
  name: string
  currencyCode: string
  callingCode?: string
  flagUrl?: string
  canSend?: boolean
  canReceive?: boolean
  [k: string]: unknown
}

export type CustomerSummary = {
  id: string
  kind: 'INDIVIDUAL' | 'BUSINESS'
  displayName: string
  email?: string
  phone?: string
  countryCode?: string
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED'
  createdAt?: string
  [k: string]: unknown
}

export type IdDocument = { type?: string; numberMasked?: string; expiresOn?: string }

export type Party = {
  id: string
  role: 'SENDER' | 'BENEFICIARY'
  kind: 'INDIVIDUAL' | 'BUSINESS'
  firstName?: string
  lastName?: string
  businessName?: string
  businessType?: string
  businessRegisteredOn?: string
  birthDate?: string
  nationality?: string
  occupation?: string
  gender?: 'M' | 'F' | 'OTHER'
  civility?: string
  addressLine?: string
  city?: string
  countryCode?: string
  phone?: string
  email?: string
  idDocument?: IdDocument
  createdAt?: string
  pep?: boolean
}

export type Destination = {
  id: string
  kind: 'BANK_ACCOUNT' | 'MOBILE_WALLET'
  countryCode: string
  bank?: { id: number; name: string; shortCode?: string }
  mobileOperator?: { id: number; name: string; shortCode?: string }
  accountHolderName?: string
  accountNumberMasked: string
  swiftCode?: string
  ifscCode?: string
  routingNumber?: string
  isDefault?: boolean
}

export type TransferStatus = 'CREATED' | 'PAYOUT_PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export type TransferSummary = {
  id: string
  reference: string
  kind: 'BANK_TRANSFER' | 'MOBILE_MONEY'
  status: TransferStatus
  senderName?: string
  beneficiaryName?: string
  sourceAmount: Money
  fee: Money
  totalDebit: Money
  destinationAmount?: Money
  createdAt: string
  completedAt?: string
  customer?: { id?: string; displayName?: string }
  providerReference?: string
  failureReason?: string
}
