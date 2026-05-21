import type { NextAuthConfig } from "next-auth";

// Edge-compatible config: no Prisma, no Node.js-only modules
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const protectedPaths = ["/board/new", "/videos/new", "/profile"];
      const isProtected = protectedPaths.some((p) =>
        request.nextUrl.pathname.startsWith(p)
      );
      if (isProtected) return !!auth;
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
