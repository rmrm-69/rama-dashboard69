import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserGuilds, hasAdminPermission } from "@/lib/discord";
import { guildUpdate } from "@/lib/db";

type Params = { params: { guildId: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guilds = await getUserGuilds(session.accessToken);
  const guild  = guilds.find((g) => g.id === params.guildId);
  if (!guild || !hasAdminPermission(guild.permissions))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  await guildUpdate(params.guildId, body);
  return NextResponse.json({ ok: true });
}
