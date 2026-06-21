

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Hum "Credentials" provider use kar rahe hain
  // Matlab: email + password se login (Google/Facebook login nahi)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Yeh function chalega jab koi login try karega
      async authorize(credentials) {
        // Step 1: Check karo email/password diye gaye hain
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Step 2: Database mein user dhundo
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Step 3: Password match (bcrypt compare)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Step 4: all correct— user object return 
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],


  session: {
    strategy: "jwt",
  },

  // Custom login page ka path
  pages: {
    signIn: "/login",
  },

  // Yeh callbacks session/token mein extra data (role) daalte hain
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};