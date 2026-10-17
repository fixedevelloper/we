import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        /** « RefreshTokenError » : la session API est terminée, il faut se reconnecter. */
        error?: string;
        user: User & { id: string };
    }
    interface User {
        id?: string;
        /** Rôles de l'API séparés par des virgules (ADMIN,SUPPORT...). */
        roles?: string
        photoURL?: string
        /** Faux pour un membre du personnel qui doit encore activer la double authentification. */
        mfaEnabled?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        roles?: string;
        photoURL?: string;
        mfaEnabled?: boolean;
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: string;
    }
}
