import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserGuilds, hasModPermission } from "@/lib/discord";
import { warningsGetAll, warningAdd, warningDelete, warningsClear, jailList } from "@/lib/db";

type Params = { params: { guildId: string } };

async function checkMod(session: { accessToken: string } | null, guildId: string): Promise<boolean> {
  if (!session) return false;
  const guilds = await getUserGuilds(session.accessToken);
  const guild  = guilds.find((g) => g.id === guildId);
  return !!(guild && hasModPermission(guild.permissions));
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!(await checkMod(session, params.guildId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "warns";

  if (type === "warns") {
    const warns = await warningsGetAll(params.guildId, 100);
    return NextResponse.json({ warns });
  }

  if (type === "jailed") {
    const jailed = await jailList(params.guildId);
    return NextResponse.json({ jailed });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!(await checkMod(session, params.guildId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  if (action === "add_warn") {
    const { userId, reason } = body;
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const id = await warningAdd(params.guildId, userId, reason || "—", session!.username);
    return NextResponse.json({ ok: true, id });
  }

  if (action === "delete_warn") {
    const { warnId } = body;
    if (!warnId) return NextResponse.json({ error: "Missing warnId" }, { status: 400 });
    await warningDelete(Number(warnId));
    return NextResponse.json({ ok: true });
  }

  if (action === "clear_warns") {
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    await warningsClear(params.guildId, userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
