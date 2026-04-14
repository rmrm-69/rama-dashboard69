import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { xpTopGuild, xpTopGlobal } from "@/lib/db";

type Params = { params: { guildId: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const global_  = req.nextUrl.searchParams.get("global") === "1";
  const limit    = Math.min(Number(req.nextUrl.searchParams.get("limit") || "20"), 50);

  const top = global_
    ? await xpTopGlobal(limit)
    : await xpTopGuild(params.guildId, limit);

  return NextResponse.json({ top });
}
