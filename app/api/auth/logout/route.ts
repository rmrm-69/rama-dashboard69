import { NextResponse } from "next/server";
import { clearSessionCookie, COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL!));
  const c   = clearSessionCookie();
  res.cookies.set(COOKIE_NAME, c.value, { maxAge: c.maxAge, path: c.path });
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  const c   = clearSessionCookie();
  res.cookies.set(COOKIE_NAME, c.value, { maxAge: c.maxAge, path: c.path });
  return res;
}
