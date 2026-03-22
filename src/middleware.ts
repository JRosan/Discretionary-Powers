import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/modules/auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/decisions/new",
  "/reports",
  "/judicial-reviews",
  "/admin",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/v1).*)"],
};
