# WeTransfert Cash — back-office (Next.js)

Interface d'administration de l'API Spring Boot **wtc-spring** (contrat : `wtc-spring/api/openapi.yaml`).

## Démarrer

```bash
cp .env.example .env.local   # NEXTAUTH_SECRET, NEXT_PUBLIC_API_URL
npm install
npm run dev                  # http://localhost:3000
```

Côté API : `CORS_ALLOWED_ORIGINS=http://localhost:3000` (le navigateur appelle l'API directement).

## Architecture d'accès à l'API

- `src/lib/api/http.ts` : client unique (`/api`, jeton Bearer, erreurs `problem+json` -> `ApiError`, `Idempotency-Key`).
- `src/hooks/useFetchData.ts` (lectures, relues quand les paramètres changent) et `src/hooks/useApi.ts` (écritures).
- Authentification : NextAuth + API (`/api/auth/login`, **double authentification obligatoire pour le personnel**, `/api/auth/mfa/verify`). Le jeton d'accès (15 min) est renouvelé par le *refresh token à rotation* côté serveur NextAuth ; un refresh refusé déconnecte. Un compte sans 2FA est conduit à `/auth/mfa-setup`.
- Les droits sont appliqués par l'API (permissions) : l'interface affiche l'erreur 403 de l'API quand une action est refusée.

## Écrans

Transferts (liste, détail, remboursement, relecture Wace, saisie pour un client avec devis serveur), clients (identité KYC, portefeuilles, demande d'ajustement), ajustements de solde (double validation), recharges (preuves manuelles), expéditeurs/bénéficiaires, barème de frais et zones, pays (import Wace), jetons web WhatsApp, personnel, journal d'audit et connexions.

Pas encore d'écran : réconciliation Wace (non implémentée côté API), tableau de bord alimenté par l'API (les statistiques affichées sont des exemples).
