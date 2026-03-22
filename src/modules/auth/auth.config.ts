import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Role } from "./permissions";

// Demo users for development (will be replaced with DB lookup)
const DEMO_USERS: Array<{
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  ministryId: string;
}> = [
  {
    id: "usr_minister_01",
    email: "admin@gov.vg",
    passwordHash: bcrypt.hashSync("password", 10),
    name: "Hon. Minister Demo",
    role: "minister",
    ministryId: "min_premier_office",
  },
  {
    id: "usr_permsec_01",
    email: "secretary@gov.vg",
    passwordHash: bcrypt.hashSync("password", 10),
    name: "Jane Secretary",
    role: "permanent_secretary",
    ministryId: "min_premier_office",
  },
  {
    id: "usr_legal_01",
    email: "legal@gov.vg",
    passwordHash: bcrypt.hashSync("password", 10),
    name: "John Legal",
    role: "legal_advisor",
    ministryId: "min_attorney_general",
  },
  {
    id: "usr_auditor_01",
    email: "auditor@gov.vg",
    passwordHash: bcrypt.hashSync("password", 10),
    name: "Sarah Auditor",
    role: "auditor",
    ministryId: "min_audit",
  },
];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      ministryId: string;
    };
  }

  interface User {
    role: Role;
    ministryId: string;
  }
}

// JWT type extension is handled via type assertions in callbacks
// since next-auth v5 beta uses bundler module resolution

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = DEMO_USERS.find((u) => u.email === email);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ministryId: user.ministryId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.ministryId = user.ministryId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.ministryId = token.ministryId as string;
      return session;
    },
  },
};
