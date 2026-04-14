import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserGuilds, getBotGuilds, hasAdminPermission, hasModPermission } from "@/lib/discord";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [userGuilds, botGuildIds] = await Promise.all([
      getUserGuilds(session.accessToken),
      getBotGuilds(),
    ]);

    // Filter to only guilds where bot is present (if we have bot token)
    const filtered = botGuildIds.length > 0
      ? userGuilds.filter((g) => botGuildIds.includes(g.id))
      : userGuilds;

    const guilds = filtered.map((g) => ({
      id:          g.id,
      name:        g.name,
      icon:        g.icon,
      owner:       g.owner,
      permissions: g.permissions,
      isAdmin:     hasAdminPermission(g.permissions),
      isMod:       hasModPermission(g.permissions),
    }));

    return NextResponse.json({ guilds });
  } catch (err) {
    console.error("Guilds error:", err);
    return NextResponse.json({ guilds: [] });
  }
}
