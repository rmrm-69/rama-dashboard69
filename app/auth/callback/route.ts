import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getMe } from "@/lib/discord";
import { createSession, setSessionCookie, COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=oauth_denied", req.url));
  }

  let redirectTo = "/dashboard";
  try {
    if (state) {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
      if (decoded.redirect) redirectTo = decoded.redirect;
    }
  } catch {}

  try {
    const tokens  = await exchangeCode(code);
    const user    = await getMe(tokens.access_token);

    const token = await createSession({
      userId:       user.id,
      username:     user.username,
      globalName:   user.global_name,
      avatar:       user.avatar,
      accessToken:  tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt:    Date.now() + tokens.expires_in * 1000,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res    = NextResponse.redirect(new URL(redirectTo, appUrl));
    const opts   = setSessionCookie(token);
    res.cookies.set(COOKIE_NAME, opts.value, {
      httpOnly: opts.httpOnly,
      secure:   opts.secure,
      sameSite: opts.sameSite as "lax",
      maxAge:   opts.maxAge,
      path:     opts.path,
    });
    return res;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
