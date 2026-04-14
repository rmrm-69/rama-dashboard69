import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-in-production-min-32-chars!!"
);

const COOKIE_NAME = "rama_session";
const MAX_AGE     = 60 * 60 * 24 * 7; // 7 days

export interface Session {
  userId:       string;
  username:     string;
  globalName?:  string;
  avatar?:      string;
  accessToken:  string;
  refreshToken: string;
  expiresAt:    number;
}

export async function createSession(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<Session | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string): Parameters<ReturnType<typeof cookies>["set"]>[1] {
  return {
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   MAX_AGE,
    path:     "/",
  };
}

export function clearSessionCookie() {
  return {
    name:    COOKIE_NAME,
    value:   "",
    maxAge:  0,
    path:    "/",
  };
}

export { COOKIE_NAME };
