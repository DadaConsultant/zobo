import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in the full user object is present — pull role/status directly
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.status = (user as any).status;
      }

      // If the token exists but role/status are missing (stale session or
      // first request after schema migration) — re-fetch from the database
      if (token.id && (!token.role || !token.status)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id)     session.user.id     = token.id     as string;
      if (token?.role)   session.user.role   = token.role   as "USER" | "ADMIN";
      if (token?.status) session.user.status = token.status as "PENDING" | "APPROVED" | "SUSPENDED";
      return session;
    },
  },
});
