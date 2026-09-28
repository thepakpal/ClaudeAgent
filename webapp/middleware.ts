import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, expectedSessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// Paths reachable without the session cookie: the login page/API, and the
// cron sync endpoint (which is protected separately by CRON_SECRET).
const PUBLIC_PATHS = ["/login", "/api/login", "/api/sync"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const expected = await expectedSessionToken();

  if (!cookie || cookie !== expected) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
