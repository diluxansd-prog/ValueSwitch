import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * NOTE: We deliberately do NOT use PrismaAdapter here.
 * With `session: { strategy: "jwt" }` + Credentials-only, the adapter
 * is not required and causes hangs in NextAuth v5 (it tries to create
 * Account/Session records the Credentials provider doesn't need).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[auth] missing credentials");
            return null;
          }

          const email = (credentials.email as string).toLowerCase().trim();
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.hashedPassword) {
            console.log(`[auth] no user or no password hash for ${email}`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (!isValid) {
            console.log(`[auth] bad password for ${email}`);
            return null;
          }

          console.log(`[auth] ✅ authorized ${email} (role: ${user.role})`);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          } as {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
            role: string;
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only provided on initial sign-in; persist role on token
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) {
        (session.user as unknown as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
});
