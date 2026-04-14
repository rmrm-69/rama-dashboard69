"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { avatarURL, guildIconURL, hasAdminPermission, hasModPermission } from "@/lib/discord";

interface UserStats {
  id: string; username: string; globalName?: string;
  avatar?: string; credits: number; xp: number; level: number;
}

interface Guild {
  id: string; name: string; icon?: string;
  owner: boolean; permissions: string;
}

function xpForLevel(level: number) { return level * level * 100; }
function xpProgress(xp: number, level: number) {
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  const current = xp - xpForLevel(level);
  return Math.min(100, Math.round((current / needed) * 100));
}

export default function DashboardPage() {
  const [user, setUser]     = useState<UserStats | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [uRes, gRes] = await Promise.all([
          fetch("/api/guilds"),
          fetch("https://discord.com/api/v10/users/@me/guilds", {
            headers: { Authorization: `Bearer ${await getAccessToken()}` },
          }).catch(() => ({ ok: false, json: () => [] })),
        ]);
        if (uRes.ok) {
          const u = await uRes.json();
          setUser(u);
          sessionStorage.setItem("user_meta", JSON.stringify({ username: u.username, avatar: u.avatar, userId: u.id }));
        }
        // Guilds from session-stored data or a different endpoint
        const storedGuilds = sessionStorage.getItem("user_guilds");
        if (storedGuilds) setGuilds(JSON.parse(storedGuilds));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function getAccessToken() { return ""; } // token managed server-side via cookie

  // Instead of calling Discord directly, we'll show a "manage" button for any guild
  // In production, fetch bot guilds to filter. We'll simulate with an API call.
  useEffect(() => {
    fetch("/api/user/guilds").then(r => r.json()).then(data => {
      if (data.guilds) {
        setGuilds(data.guilds);
        sessionStorage.setItem("user_guilds", JSON.stringify(data.guilds));
      }
    }).catch(() => {});
  }, []);

  const progress = user ? xpProgress(user.xp, user.level) : 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-950)" }}>
      {/* Background */}
      <div className="fixed inset-0 bg-dot-grid bg-dot-lg opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-glow-radial pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold" style={{ background: "linear-gradient(135deg, #e2e8f0, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Rama Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Select a server to manage</p>
          </div>
          <Link href="/api/auth/logout">
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} />
          </div>
        ) : (
          <>
            {/* User Stats */}
            {user && (
              <div className="card-glow p-5 mb-8 animate-fade-up">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative">
                    <img
                      src={avatarURL({ id: user.id, avatar: user.avatar })}
                      alt="" className="w-16 h-16 rounded-2xl ring-2"
                      style={{ ringColor: "var(--brand-700)" }} />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: "var(--brand-600)", borderColor: "var(--navy-900)", color: "white" }}>
                      {user.level}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {user.globalName || user.username}
                    </h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>@{user.username}</p>
                    {/* XP bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                        <span>Level {user.level} → {user.level + 1}</span>
                        <span>{user.xp.toLocaleString()} XP</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,58,95,0.6)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1d4ed8, #60a5fa)" }} />
                      </div>
                    </div>
                  </div>
                  {/* Stat chips */}
                  <div className="flex flex-wrap gap-3 sm:flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.2)" }}>
                      <span className="text-sm">⭐</span>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Level</p>
                        <p className="text-base font-bold" style={{ color: "var(--brand-300)" }}>{user.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.2)" }}>
                      <span className="text-sm">💰</span>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Credits</p>
                        <p className="text-base font-bold" style={{ color: "#6ee7b7" }}>{user.credits.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <span className="text-sm">✨</span>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>XP</p>
                        <p className="text-base font-bold" style={{ color: "#c4b5fd" }}>{user.xp.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Server List */}
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
              Your Servers
            </h2>
            {guilds.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-4">🤖</p>
                <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No servers found</p>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  Make sure Rama Bot is in your server and you have the right permissions
                </p>
                <a href="https://discord.com/oauth2/authorize?client_id=1487025562705989692&scope=bot+applications.commands&permissions=8"
                  target="_blank" rel="noopener noreferrer">
                  <button className="btn-primary">Invite Rama Bot</button>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
                {guilds.map((guild) => {
                  const isAdmin = hasAdminPermission(guild.permissions);
                  const isMod   = hasModPermission(guild.permissions);
                  const iconSrc = guildIconURL(guild);
                  return (
                    <Link key={guild.id} href={`/dashboard/${guild.id}`}
                      onClick={() => sessionStorage.setItem(`guild_meta_${guild.id}`, JSON.stringify({ id: guild.id, name: guild.name, icon: guild.icon || "", isAdmin, isMod }))}>
                      <div className="card p-4 hover:border-brand-700 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
                        style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-bold"
                            style={{ background: iconSrc ? "transparent" : "linear-gradient(135deg,#1d4ed8,#2563eb)" }}>
                            {iconSrc
                              ? <img src={iconSrc} alt="" className="w-full h-full object-cover" />
                              : guild.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-brand-300 transition-colors" style={{ color: "var(--text-primary)" }}>{guild.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {guild.owner ? "Owner" : isAdmin ? "Admin" : isMod ? "Moderator" : "Member"}
                            </p>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform" style={{ color: "var(--text-muted)" }}>
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {guild.owner  && <span className="badge badge-yellow">👑 Owner</span>}
                          {isAdmin && !guild.owner && <span className="badge badge-blue">Admin</span>}
                          {isMod && !isAdmin   && <span className="badge badge-purple">Mod</span>}
                          {!isMod && !isAdmin  && <span className="badge badge-gray">Member</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
