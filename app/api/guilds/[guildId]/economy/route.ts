import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { creditsTop, localCreditsTop, transactionsGet } from "@/lib/db";

type Params = { params: { guildId: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type  = req.nextUrl.searchParams.get("type") || "local";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || "20"), 50);

  if (type === "global") {
    const top = await creditsTop(limit);
    return NextResponse.json({ top });
  }

  if (type === "transactions") {
    const txs = await transactionsGet(session.userId, 20);
    return NextResponse.json({ transactions: txs });
  }

  const top = await localCreditsTop(params.guildId, limit);
  return NextResponse.json({ top });
}
