// Yeh NextAuth ka main API endpoint hai
// URL: /api/auth/* (login, logout, session check — sab yahan se hoga)

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// NextAuth GET aur POST dono requests handle karta hai
export { handler as GET, handler as POST };