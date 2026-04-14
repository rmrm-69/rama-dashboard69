const DISCORD_API = "https://discord.com/api/v10";

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  banner?: string;
  accent_color?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
}

export function getOAuthURL(state?: string): string {
  const params = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID!,
    redirect_uri:  process.env.DISCORD_REDIRECT_URI!,
    response_type: "code",
    scope:         "identify guilds",
    prompt:        "none",
  });
  if (state) params.set("state", state);
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type:    "authorization_code",
      code,
      redirect_uri:  process.env.DISCORD_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json();
}

export async function getMe(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`getMe failed: ${res.status}`);
  return res.json();
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`getUserGuilds failed: ${res.status}`);
  return res.json();
}

export async function getBotGuilds(): Promise<string[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];
  const res = await fetch(`${DISCORD_API}/users/@me/guilds?limit=200`, {
    headers: { Authorization: `Bot ${token}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const guilds: { id: string }[] = await res.json();
  return guilds.map((g) => g.id);
}

export async function getGuildMember(guildId: string, userId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export function avatarURL(user: { id: string; avatar?: string }, size = 128): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=${size}`;
  }
  const index = Number(BigInt(user.id) >> 22n) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function guildIconURL(guild: { id: string; icon?: string }, size = 64): string {
  if (guild.icon) {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=${size}`;
  }
  return "";
}

// Check if a user has admin/mod permissions in a guild
// MANAGE_GUILD permission = bit 5 (32), ADMINISTRATOR = bit 3 (8)
export function hasAdminPermission(permissions: string): boolean {
  const perms = BigInt(permissions);
  const ADMINISTRATOR = 8n;
  const MANAGE_GUILD  = 32n;
  return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
}

export function hasModPermission(permissions: string): boolean {
  const perms = BigInt(permissions);
  const BAN_MEMBERS    = 4n;
  const KICK_MEMBERS   = 2n;
  const MANAGE_ROLES   = 268435456n;
  const MANAGE_MESSAGES = 8192n;
  return hasAdminPermission(permissions) ||
    (perms & BAN_MEMBERS) === BAN_MEMBERS ||
    (perms & KICK_MEMBERS) === KICK_MEMBERS ||
    (perms & MANAGE_ROLES) === MANAGE_ROLES ||
    (perms & MANAGE_MESSAGES) === MANAGE_MESSAGES;
}
