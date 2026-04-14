import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { creditsGet, xpGetGlobal } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [credits, xpData] = await Promise.all([
    creditsGet(session.userId),
    xpGetGlobal(session.userId),
  ]);

  return NextResponse.json({
    id:          session.userId,
    username:    session.username,
    globalName:  session.globalName,
    avatar:      session.avatar,
    credits,
    xp:          Number(xpData.xp)    || 0,
    level:       Number(xpData.level) || 0,
  });
}
