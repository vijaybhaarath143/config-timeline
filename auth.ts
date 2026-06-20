import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      status: "PENDING" | "APPROVED" | "BANNED";
    } & DefaultSession["user"];
  }
}

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [Google],
  pages: {
    // Use the default Auth.js sign-in screen but keep errors on home.
    error: "/",
  },
  callbacks: {
    // Surface role + status onto the session so server components can gate UI.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error -- role/status come from our extended User model
        session.user.role = user.role ?? "USER";
        // @ts-expect-error
        session.user.status = user.status ?? "PENDING";
      }
      return session;
    },
  },
  events: {
    // First time a user is created, auto-promote the configured admin.
    async createUser({ user }) {
      if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN", status: "APPROVED" },
        });
      }
    },
  },
});
