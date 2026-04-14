import { createClient } from "@libsql/client";

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    const url   = process.env.TURSO_URL!;
    const token = process.env.TURSO_TOKEN!;
    if (!url || !token) throw new Error("TURSO_URL and TURSO_TOKEN must be set");
    _client = createClient({ url, authToken: token });
  }
  return _client;
}

async function exec(sql: string, args: (string | number | null)[] = []) {
  const client = getClient();
  return client.execute({ sql, args });
}

// ── Guild Config ─────────────────────────────────────────────────────────────

export async function guildGet(guildId: string): Promise<Record<string, unknown>> {
  const rs = await exec(
    "SELECT config FROM guild_configs WHERE guild_id = ?",
    [guildId]
  );
  if (!rs.rows.length) return {};
  try { return JSON.parse(rs.rows[0].config as string); } catch { return {}; }
}

export async function guildSet(guildId: string, config: Record<string, unknown>) {
  await exec(
    `INSERT INTO guild_configs (guild_id, config, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(guild_id) DO UPDATE SET config = excluded.config, updated_at = excluded.updated_at`,
    [guildId, JSON.stringify(config)]
  );
}

export async function guildUpdate(guildId: string, patch: Record<string, unknown>) {
  const current = await guildGet(guildId);
  await guildSet(guildId, { ...current, ...patch });
}

// ── Warnings ─────────────────────────────────────────────────────────────────

export async function warningsGet(guildId: string, userId: string) {
  const rs = await exec(
    "SELECT * FROM user_warnings WHERE guild_id = ? AND user_id = ? ORDER BY warned_at DESC",
    [guildId, userId]
  );
  return rs.rows;
}

export async function warningsGetAll(guildId: string, limit = 50) {
  const rs = await exec(
    "SELECT * FROM user_warnings WHERE guild_id = ? ORDER BY warned_at DESC LIMIT ?",
    [guildId, limit]
  );
  return rs.rows;
}

export async function warningDelete(id: number) {
  await exec("DELETE FROM user_warnings WHERE id = ?", [id]);
}

export async function warningsClear(guildId: string, userId: string) {
  await exec("DELETE FROM user_warnings WHERE guild_id = ? AND user_id = ?", [guildId, userId]);
}

export async function warningAdd(guildId: string, userId: string, reason: string, moderator: string) {
  const rs = await exec(
    "INSERT INTO user_warnings (guild_id, user_id, reason, moderator, warned_at) VALUES (?, ?, ?, ?, datetime('now'))",
    [guildId, userId, reason, moderator]
  );
  return rs.lastInsertRowid;
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export async function ticketsListOpen(guildId: string) {
  const rs = await exec(
    "SELECT * FROM tickets WHERE guild_id = ? AND status = 'open' ORDER BY created_at DESC",
    [guildId]
  );
  return rs.rows;
}

export async function ticketsGetUser(guildId: string, userId: string) {
  const rs = await exec(
    "SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open' LIMIT 1",
    [guildId, userId]
  );
  return rs.rows[0] || null;
}

// ── Credits ───────────────────────────────────────────────────────────────────

export async function creditsGet(userId: string): Promise<number> {
  const rs = await exec("SELECT credits FROM user_credits WHERE user_id = ?", [userId]);
  if (!rs.rows.length) return 0;
  return Number(rs.rows[0].credits) || 0;
}

export async function creditsTop(limit = 10) {
  const rs = await exec(
    "SELECT user_id, credits FROM user_credits ORDER BY credits DESC LIMIT ?",
    [limit]
  );
  return rs.rows;
}

export async function transactionsGet(userId: string, limit = 20) {
  const rs = await exec(
    `SELECT * FROM transactions
     WHERE from_user = ? OR to_user = ?
     ORDER BY ts DESC LIMIT ?`,
    [userId, userId, limit]
  );
  return rs.rows;
}

// ── Local Credits (per-server economy) ──────────────────────────────────────

export async function localCreditsGet(guildId: string, userId: string): Promise<number> {
  const rs = await exec(
    "SELECT credits FROM local_credits WHERE guild_id = ? AND user_id = ?",
    [guildId, userId]
  );
  if (!rs.rows.length) return 0;
  return Number(rs.rows[0].credits) || 0;
}

export async function localCreditsTop(guildId: string, limit = 10) {
  const rs = await exec(
    "SELECT user_id, credits FROM local_credits WHERE guild_id = ? ORDER BY credits DESC LIMIT ?",
    [guildId, limit]
  );
  return rs.rows;
}

// ── XP ────────────────────────────────────────────────────────────────────────

export async function xpGetGlobal(userId: string) {
  const rs = await exec("SELECT * FROM xp_global WHERE user_id = ?", [userId]);
  return rs.rows[0] || { xp: 0, level: 0 };
}

export async function xpGetGuild(guildId: string, userId: string) {
  const rs = await exec(
    "SELECT * FROM xp_guild WHERE guild_id = ? AND user_id = ?",
    [guildId, userId]
  );
  return rs.rows[0] || { xp: 0, level: 0 };
}

export async function xpTopGlobal(limit = 10) {
  const rs = await exec(
    "SELECT user_id, xp, level FROM xp_global ORDER BY xp DESC LIMIT ?",
    [limit]
  );
  return rs.rows;
}

export async function xpTopGuild(guildId: string, limit = 10) {
  const rs = await exec(
    "SELECT user_id, xp, level FROM xp_guild WHERE guild_id = ? ORDER BY xp DESC LIMIT ?",
    [guildId, limit]
  );
  return rs.rows;
}

// ── Jail ──────────────────────────────────────────────────────────────────────

export async function jailGet(guildId: string, userId: string) {
  const rs = await exec(
    "SELECT * FROM jailed_users WHERE guild_id = ? AND user_id = ?",
    [guildId, userId]
  );
  return rs.rows[0] || null;
}

export async function jailList(guildId: string) {
  const rs = await exec(
    "SELECT * FROM jailed_users WHERE guild_id = ? ORDER BY jailed_at DESC",
    [guildId]
  );
  return rs.rows;
}

// ── Timed Actions (mutes etc.) ───────────────────────────────────────────────

export async function timedActionsGet(guildId: string) {
  const rs = await exec(
    "SELECT * FROM timed_actions WHERE guild_id = ? ORDER BY expires_at ASC",
    [guildId]
  );
  return rs.rows;
}

// ── Message Counts ────────────────────────────────────────────────────────────

export async function messageCounts(guildId: string, userId?: string) {
  if (userId) {
    const rs = await exec(
      "SELECT SUM(msg_count) as total FROM guild_message_counts WHERE guild_id = ? AND user_id = ?",
      [guildId, userId]
    );
    return Number(rs.rows[0]?.total) || 0;
  }
  const rs = await exec(
    `SELECT user_id, SUM(msg_count) as total
     FROM guild_message_counts WHERE guild_id = ?
     GROUP BY user_id ORDER BY total DESC LIMIT 20`,
    [guildId]
  );
  return rs.rows;
}

// ── Game Wins ─────────────────────────────────────────────────────────────────

export async function gameWins(guildId: string, userId?: string) {
  if (userId) {
    const rs = await exec(
      "SELECT game_name, wins FROM game_wins WHERE guild_id = ? AND user_id = ?",
      [guildId, userId]
    );
    return rs.rows;
  }
  const rs = await exec(
    "SELECT user_id, game_name, wins FROM game_wins WHERE guild_id = ? ORDER BY wins DESC",
    [guildId]
  );
  return rs.rows;
}

// ── Guild Stats ───────────────────────────────────────────────────────────────

export async function guildStats(guildId: string) {
  const rs = await exec(
    "SELECT * FROM guild_stats WHERE guild_id = ?",
    [guildId]
  );
  return rs.rows[0] || null;
}
