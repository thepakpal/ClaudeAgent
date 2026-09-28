import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, expectedSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") || "");

  const ok = await checkPassword(password);
  if (!ok) {
    const url = new URL("/login?error=1", req.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await expectedSessionToken();
  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
