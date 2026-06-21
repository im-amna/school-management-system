// Yeh "Middleware" hai - har request ke page load hone se PEHLE chalta hai
// Socho yeh ek security guard hai jo gate pe check karta hai

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Agar Admin route pe koi Admin nahi hai - block karo
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Agar Teacher route pe koi Teacher nahi hai - block karo
    if (pathname.startsWith("/teacher") && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Agar Student route pe koi Student nahi hai - block karo
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next(); // Sab theek hai, aage jaane do
  },
  {
    callbacks: {
      // Yeh check karta hai - user logged in hai ya nahi
      authorized: ({ token }) => !!token,
    },
  }
);

// Yeh batata hai middleware KAUN SI routes pe chalega
export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/dashboard"],
};