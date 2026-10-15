import type {NextAuthOptions} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {randomBytes} from 'crypto'
import API_ENDPOINTS from "../../Constant";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Entrez votre email",
        },
        password: {
          label: "Mot de passe",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        // 🔹 Envoie les identifiants au format JSON
        const res = await fetch(API_ENDPOINTS.AUTH, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });
        if (!res.ok) {

          throw new Error("Échec de connexion");
        }

        const result = await res.json();

        // ✅ Vérifie le format attendu
        if (result.status === "success" && result.data?.token) {
          return {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            token: result.data.token,
            roles: result.data.roles,
            photoURL: result.data.photoURL,
            otpSend: result.data.otpSend,
            emailVerified: result.data.emailVerified,
          }; // Retourne l'objet user à NextAuth
        }

        throw new Error(result.message || "Identifiants invalides");
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // 🔹 Lors de la première connexion, on stocke les infos du user
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.token;
        token.roles = user.roles;
        token.photoURL = user.photoURL;
        token.otpSend = user.otpSend;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },

    async session({ session, token }) {
      // 🔹 On rattache le contenu du token à la session
      session.user = {
        id: String(token.id),
        name: token.name,
        email: token.email,
        roles: token.roles as string | undefined,
        photoURL: token.photoURL as string | undefined,
        otpSend: token.otpSend as string | undefined,
        emailVerified: token.emailVerified as string | undefined,
      };
      session.accessToken = token.accessToken  as string | undefined;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
    generateSessionToken: () => randomBytes(32).toString("hex"),
  },
};

