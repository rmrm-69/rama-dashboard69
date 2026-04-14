"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface MemberData {
  warnsCount: number; warns: WarnEntry[]; activeTicket: unknown;
  localCredits: number; xp: number; level: number;
  messageCount: number; isMuted: boolean; muteExpiresAt: string | null;
  isJailed: boolean;
}
interface WarnEntry { id: number; reason: string; moderator: string; warned_at: string; }

function xpForLevel(l: number) { return l * l * 100; }
function xpProgress(xp: number, level: number) {
  const n = xpForLevel(level + 1) - xpForLevel(level);
  const c = xp - xpForLevel(level);
  return Math.min(100, Math.round((c / n) * 100));
}

export default function ServerOverviewPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [data, setData]   = useState<MemberData | null>(null);
  const [guild, setGuild] = useState<{ name: string; isAdmin: boolean; isMod: boolean; localEconEnabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meta = sessionStorage.getItem(`guild_meta_${guildId}`);
    if (meta) {
      const g = JSON.parse(meta);
      setGuild({ name: g.name, isAdmin: g.isAdmin, isMod: g.isMod, localEconEnabled: false });
    }

    Promise.all([
      fetch(`/api/guilds/${guildId}/members/@me`).then(r => r.json()),
      fetch(`/api/guilds/${guildId}/config`).then(r => r.json()),
    ]).then(([member, config]) => {
      setData(member);
      if (guild) setGuild(prev => prev ? { ...prev, localEconEnabled: !!config.local_economy_enabled } : prev);
    }).catch(console.error).finally(() => setLoading(false));
  }, [guildId]);

  const progress = data ? xpProgress(data.xp, data.level) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} />
    </div>
  );

  const quickLinks = [
    { href: `/dashboard/${guildId}/moderation`, icon: "🛡️", label: "Moderation",  desc: "Warns, bans, mutes",       show: guild?.isMod  },
    { href: `/dashboard/${guildId}/tickets`,    icon: "🎟️", label: "Tickets",     desc: "Support tickets",          show: guild?.isMod  },
    { href: `/dashboard/${guildId}/antiraid`,   icon: "⚔️", label: "Anti-Raid",   desc: "Raid protection",          show: guild?.isMod  },
    { href: `/dashboard/${guildId}/giveaway`,   icon: "🎉", label: "Giveaways",   desc: "Active giveaways",         show: true          },
    { href: `/dashboard/${guildId}/xp`,         icon: "⭐", label: "XP & Levels", desc: "Leaderboard & settings",   show: true          },
    { href: `/dashboard/${guildId}/economy`,    icon: "💰", label: "Economy",     desc: "Credits & shop",           show: true          },
    { href: `/dashboard/${guildId}/games`,      icon: "🎮", label: "Games",       desc: "Game stats & settings",    show: true          },
    { href: `/dashboard/${guildId}/utility`,    icon: "🔧", label: "Utility",     desc: "AFK, polls, triggers",     show: true          },
    { href: `/dashboard/${guildId}/ai`,         icon: "🤖", label: "AI Chat",     desc: "Gemini AI configuration",  show: guild?.isAdmin },
    { href: `/dashboard/${guildId}/setup`,      icon: "⚙️", label: "Setup",       desc: "Server configuration",     show: guild?.isAdmin },
  ];

  return (
    <div className="space-y-6 animate-stagger">
      {/* Status banners */}
      {data?.isMuted && (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <span className="text-xl">🔇</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#fcd34d" }}>You are currently muted</p>
            {data.muteExpiresAt && <p className="text-xs" style={{ color: "var(--text-muted)" }}>Expires: {new Date(data.muteExpiresAt).toLocaleString()}</p>}
          </div>
        </div>
      )}
      {data?.isJailed && (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)" }}>
          <span className="text-xl">🔒</span>
          <p className="font-semibold text-sm" style={{ color: "#fca5a5" }}>You are currently jailed in this server</p>
        </div>
      )}

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
          {guild?.isMod ? "Server Overview" : "My Stats"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {guild?.name} {guild?.isAdmin ? "· Administrator" : guild?.isMod ? "· Moderator" : "· Member"}
        </p>
      </div>

      {/* Stats grid */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Warnings",    value: data.warnsCount,    icon: "⚠️",  color: data.warnsCount > 0 ? "#fcd34d" : "#6ee7b7",  bg: data.warnsCount > 0 ? "rgba(245,158,11,0.1)" : "rgba(5,150,105,0.1)" },
            { label: "Messages",    value: data.messageCount,  icon: "💬",  color: "var(--brand-300)",  bg: "rgba(37,99,235,0.1)" },
            { label: "Server XP",   value: data.xp,            icon: "⭐",  color: "#c4b5fd",           bg: "rgba(139,92,246,0.1)" },
            { label: "Level",       value: data.level,         icon: "🏆",  color: "var(--brand-400)",  bg: "rgba(37,99,235,0.15)" },
            ...(data.localCredits !== undefined ? [{ label: "Local Credits", value: data.localCredits, icon: "💎", color: "#6ee7b7", bg: "rgba(5,150,105,0.1)" }] : []),
            { label: "Ticket",      value: data.activeTicket ? "Active" : "None", icon: "🎟️", color: data.activeTicket ? "#6ee7b7" : "var(--text-muted)", bg: data.activeTicket ? "rgba(5,150,105,0.1)" : "rgba(30,58,95,0.3)" },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{s.icon}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: s.color }}>
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* XP Progress */}
      {data && (
        <div className="card p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>XP Progress</span>
            <span style={{ color: "var(--text-muted)" }}>Level {data.level} → {data.level + 1}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(30,58,95,0.6)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1d4ed8, #60a5fa)" }} />
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
            <span>{data.xp.toLocaleString()} XP</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* Warns list (if any) */}
      {data && data.warns.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Your Warnings ({data.warnsCount})</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {data.warns.slice(0, 5).map((w) => (
              <div key={w.id} className="px-5 py-3 flex items-start gap-3">
                <span className="text-base mt-0.5">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{w.reason}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    by {w.moderator} · {new Date(w.warned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.filter(l => l.show !== false).map((l) => (
            <Link key={l.href} href={l.href}>
              <div className="card p-4 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group">
                <span className="text-2xl block mb-2">{l.icon}</span>
                <p className="text-sm font-semibold group-hover:text-brand-300 transition-colors" style={{ color: "var(--text-primary)" }}>{l.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{l.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
