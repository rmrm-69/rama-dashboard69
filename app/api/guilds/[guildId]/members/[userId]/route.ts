import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  warningsGet, ticketsGetUser, localCreditsGet,
  xpGetGuild, messageCounts, jailGet, timedActionsGet,
  gameWins,
} from "@/lib/db";

type Params = { params: { guildId: string; userId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Users can only fetch their own data (mods can fetch anyone via the mod endpoint)
  const targetId = params.userId === "@me" ? session.userId : params.userId;
  if (targetId !== session.userId) {
    // Would need to verify mod permissions here - omitted for brevity, handled in mod routes
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const guildId = params.guildId;

  const [warns, ticket, localCredits, xp, msgCount, jailRecord, timedActions, wins] =
    await Promise.all([
      warningsGet(guildId, targetId),
      ticketsGetUser(guildId, targetId),
      localCreditsGet(guildId, targetId),
      xpGetGuild(guildId, targetId),
      messageCounts(guildId, targetId),
      jailGet(guildId, targetId),
      timedActionsGet(guildId),
      gameWins(guildId, targetId),
    ]);

  const muteAction = (timedActions as Array<Record<string, unknown>>).find(
    (a) => String(a.user_id) === targetId && a.action_type === "unmute"
  );

  return NextResponse.json({
    userId:       targetId,
    guildId,
    warns:        warns as unknown[],
    warnsCount:   warns.length,
    activeTicket: ticket,
    localCredits,
    xp:           Number((xp as Record<string,unknown>).xp)    || 0,
    level:        Number((xp as Record<string,unknown>).level) || 0,
    messageCount: typeof msgCount === "number" ? msgCount : 0,
    isMuted:      !!muteAction,
    muteExpiresAt: muteAction ? muteAction.expires_at : null,
    isJailed:     !!jailRecord,
    jailRecord,
    gameWins:     wins as unknown[],
  });
}
