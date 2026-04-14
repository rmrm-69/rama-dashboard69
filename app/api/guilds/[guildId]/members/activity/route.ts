import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { messageCounts } from "@/lib/db";

type Params = { params: { guildId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await messageCounts(params.guildId);
  return NextResponse.json({ activity: rows });
}
