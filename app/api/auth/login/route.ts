import { NextRequest, NextResponse } from "next/server";
import { getOAuthURL } from "@/lib/discord";

export async function GET(req: NextRequest) {
  const redirect = req.nextUrl.searchParams.get("redirect") || "/dashboard";
  const state    = Buffer.from(JSON.stringify({ redirect, ts: Date.now() })).toString("base64url");
  const url      = getOAuthURL(state);
  return NextResponse.redirect(url);
}
