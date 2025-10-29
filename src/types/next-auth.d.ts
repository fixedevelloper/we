import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: User & { id: string };
    }
    interface User {
        id?: string;
        token?:string
        roles?:string
        photoURL?:string
        otpSend?:string
        emailVerified?:string
    }
}
