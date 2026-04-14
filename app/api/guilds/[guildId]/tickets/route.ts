import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserGuilds, hasModPermission } from "@/lib/discord";
import { ticketsListOpen } from "@/lib/db";

type Params = { params: { guildId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guilds = await getUserGuilds(session.accessToken);
  const guild  = guilds.find((g) => g.id === params.guildId);
  if (!guild || !hasModPermission(guild.permissions))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tickets = await ticketsListOpen(params.guildId);
  return NextResponse.json({ tickets });
}
