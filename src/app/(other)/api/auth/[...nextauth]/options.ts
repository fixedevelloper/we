import type {NextAuthOptions} from 'next-auth'
import type {JWT} from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import {randomBytes} from 'crypto'
import API_ENDPOINTS from "../../Constant";
import {ApiError, apiFetch} from "@/lib/api/http";
import type {MfaChallenge, TokenResponse} from "@/lib/api/types";
import {isBackofficeUser} from "@/assets/data/route-roles";

import {MFA_REQUIRED_PREFIX} from "@/lib/api/auth-constants";

/** Marge avant l'expiration du jeton d'accès pour le renouveler (secondes). */
const REFRESH_MARGIN_SECONDS = 60;

const fromTokens = (tokens: TokenResponse) => ({
    id: tokens.user.id,
    name: tokens.user.displayName,
    email: tokens.user.email,
    roles: tokens.user.roles.join(","),
    photoURL: tokens.user.photoUrl,
    mfaEnabled: tokens.user.mfaEnabled,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpires: Date.now() + tokens.expiresIn * 1000,
});

/** Renouvelle le jeton d'accès (le refresh token tourne : l'ancien est invalidé). */
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const tokens = await apiFetch<TokenResponse>("/auth/refresh", {
            method: "POST",
            body: {refreshToken: token.refreshToken},
        });
        return {...token, ...fromTokens(tokens), error: undefined};
    } catch (e) {
        // Refresh refusé (expiré, rejoué, session révoquée) : il faut se reconnecter.
        return {...token, error: "RefreshTokenError"};
    }
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {label: "Email", type: "text"},
        password: {label: "Mot de passe", type: "password"},
        mfaToken: {label: "Jeton MFA", type: "text"},
        code: {label: "Code à 6 chiffres", type: "text"},
      },
      async authorize(credentials) {
        try {
          let tokens: TokenResponse;
          if (credentials?.mfaToken && credentials?.code) {
            // Seconde étape : code de l'application d'authentification.
            tokens = await apiFetch<TokenResponse>("/auth/mfa/verify", {
              method: "POST",
              body: {mfaToken: credentials.mfaToken, code: credentials.code},
            });
          } else {
            if (!credentials?.email || !credentials?.password) {
              throw new Error("Email et mot de passe requis");
            }
            const result = await apiFetch<TokenResponse | MfaChallenge>("/auth/login", {
              method: "POST",
              body: {email: credentials.email, password: credentials.password},
            });
            if ("mfaRequired" in result) {
              throw new Error(MFA_REQUIRED_PREFIX + result.mfaToken);
            }
            tokens = result;
          }
          if (!isBackofficeUser(tokens.user.roles)) {
            throw new Error("Accès réservé au personnel");
          }
          return fromTokens(tokens) as any;
        } catch (e) {
          if (e instanceof ApiError) {
            // Messages de l'API (INVALID_CREDENTIALS, INVALID_MFA_CODE, RATE_LIMITED...) montrés tels quels.
            throw new Error(e.message);
          }
          throw e;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/login",
    // Une erreur d'authentification revient sur l'écran de connexion (message dans ?error=) au lieu de la page anglaise de next-auth.
    error: "/auth/login",
  },

  callbacks: {
    async jwt({token, user}) {
      if (user) {
        // Première connexion : on garde les jetons côté serveur (cookie chiffré), jamais dans la session exposée.
        const u = user as any;
        return {
          ...token,
          id: u.id,
          name: u.name,
          email: u.email,
          roles: u.roles,
          photoURL: u.photoURL,
          mfaEnabled: u.mfaEnabled,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpires: u.accessTokenExpires,
        };
      }
      const expires = (token.accessTokenExpires as number | undefined) ?? 0;
      if (Date.now() < expires - REFRESH_MARGIN_SECONDS * 1000) {
        return token;
      }
      return refreshAccessToken(token);
    },

    async session({session, token}) {
      session.user = {
        id: String(token.id),
        name: token.name,
        email: token.email,
        roles: token.roles as string | undefined,
        photoURL: token.photoURL as string | undefined,
        mfaEnabled: token.mfaEnabled as boolean | undefined,
      };
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
    generateSessionToken: () => randomBytes(32).toString("hex"),
  },
};
