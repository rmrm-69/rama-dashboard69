import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserGuilds, hasAdminPermission } from "@/lib/discord";
import { guildGet, guildUpdate } from "@/lib/db";

type Params = { params: { guildId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const config = await guildGet(params.guildId);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user is admin in this guild
  try {
    const guilds = await getUserGuilds(session.accessToken);
    const guild  = guilds.find((g) => g.id === params.guildId);
    if (!guild || !hasAdminPermission(guild.permissions)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const patch = await req.json();
    // Sanitize: only allow known config keys
    const allowed: Record<string, unknown> = {};
    const allowedKeys = [
      "prefix","languages","setup_complete","mod_roles","admin_roles",
      "higher_admin_roles","lower_admin_roles","moderator_role_id",
      "mute_role_id","jail_role_id","jail_channel_id","log_channel_id",
      "welcome_channel_id","leave_channel_id","welcome_message","leave_message",
      "welcome_enabled","leave_enabled","economy_enabled","local_economy_enabled",
      "daily_amount","currency_name","currency_emoji","starting_balance",
      "xp_enabled","xp_per_message_min","xp_per_message_max","xp_cooldown",
      "level_up_message","level_up_channel_id","level_roles",
      "ticket_enabled","ticket_channel_id","ticket_category_id","ticket_support_role_id",
      "ticket_max_per_user","ticket_transcript_channel_id","ticket_button_label",
      "antiraid_enabled","antiraid_threshold","antiraid_window","antiraid_action","antiraid_lockdown",
      "ai_enabled","ai_channel_id","ai_gemini_key","ai_model",
      "games_enabled","game_channels","game_cooldowns",
      "afk_enabled","polls_enabled","embeds_enabled","announcements_enabled",
      "slowmode_enabled","slowmode_threshold","slowmode_duration",
      "confessional_enabled","confessional_channel_id","confessional_auto_delete_hours",
      "fakeban_enabled","lsd_enabled","lsd_role_id","lsd_channel_id",
      "milestone_enabled","milestone_channel_id","milestone_values",
      "custom_triggers_enabled","amnesia_enabled",
      "invites_enabled","invite_rewards",
      "warn_max","warn_action","warn_action_duration",
      "purge_max","lock_reason","hide_reason",
      "shop_items","giveaway_manager_role_id",
    ];
    for (const key of allowedKeys) {
      if (key in patch) allowed[key] = patch[key];
    }

    await guildUpdate(params.guildId, allowed);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Config PATCH error:", err);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
