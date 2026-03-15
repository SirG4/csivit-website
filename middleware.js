import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Check if the user is an admin
    const isAdmin = token?.role === "admin";

    // If trying to access admin or scanner pages and not an admin
    if ((pathname.startsWith("/admin") || pathname.startsWith("/scanner")) && !isAdmin) {
      console.log(`Middleware: Blocking user from ${pathname} - isAdmin: ${isAdmin}`);
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/scanner",
    "/scanner/:path*",
  ],
};
