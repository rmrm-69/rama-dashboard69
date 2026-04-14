"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SaveButton from "@/components/SaveButton";
import ToggleSwitch from "@/components/ToggleSwitch";

interface Config { [k: string]: unknown; }

export default function SetupPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"general" | "roles" | "welcome" | "logging">("general");

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/config`).then(r => r.json()).then(c => { setConfig(c); setLoading(false); });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));
  const save = async () => { const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); if (!r.ok) throw new Error(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const tabs = [
    { id: "general",  label: "General",    icon: "🌐" },
    { id: "roles",    label: "Roles",      icon: "🎭" },
    { id: "welcome",  label: "Welcome",    icon: "👋" },
    { id: "logging",  label: "Logging",    icon: "📋" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>⚙️ Server Setup</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Core server configuration — admin access only</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Admin notice */}
      <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <span>🔒</span>
        <p className="text-sm" style={{ color: "#fcd34d" }}>
          You can also run the interactive setup wizard in Discord with <code className="font-mono bg-black/20 px-1 rounded">!setup</code>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "rgba(4,15,34,0.8)", border: "1px solid var(--border)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            style={tab === t.id ? { background: "var(--brand-600)", color: "white" } : { color: "var(--text-muted)" }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {tab === "general" && (
        <div className="space-y-4 max-w-2xl animate-fade-up">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>General Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bot command prefix</label>
                <input type="text" placeholder="!" value={String(config.prefix || "!")} onChange={e => update("prefix", e.target.value)} className="input w-20" maxLength={5} />
              </div>
              <div>
                <label className="label">Server language</label>
                <select value={String((config.languages as string[])?.[0] || "en")} onChange={e => update("languages", [e.target.value])} className="input">
                  <option value="en">English</option>
                  <option value="ar">Arabic (عربي)</option>
                  <option value="both">Both (Bilingual)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Quick Setup Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Setup complete",        key: "setup_complete",          icon: "✅" },
                { label: "Moderation enabled",    key: "mod_log_enabled",         icon: "🛡️" },
                { label: "Economy enabled",       key: "local_economy_enabled",   icon: "💰" },
                { label: "XP system enabled",     key: "xp_enabled",              icon: "⭐" },
                { label: "Tickets enabled",       key: "ticket_enabled",          icon: "🎟️" },
                { label: "AI chat enabled",       key: "ai_enabled",              icon: "🤖" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "rgba(30,58,95,0.3)" }}>
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                  </div>
                  <ToggleSwitch checked={!!config[item.key]} onChange={v => update(item.key, v)} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ROLES ── */}
      {tab === "roles" && (
        <div className="space-y-4 max-w-2xl animate-fade-up">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>🎭 Role Configuration</h3>
            <div className="space-y-4">
              {[
                { label: "Higher Admin Role IDs",    key: "higher_admin_roles",  desc: "Full admin access",          array: true },
                { label: "Lower Admin Role IDs",     key: "lower_admin_roles",   desc: "Limited admin access",       array: true },
                { label: "Moderator Role ID",        key: "moderator_role_id",   desc: "Moderation commands access", array: false },
                { label: "Mute Role ID",             key: "mute_role_id",        desc: "Applied when muted",         array: false },
                { label: "Jail Role ID",             key: "jail_role_id",        desc: "Applied when jailed",        array: false },
              ].map(item => (
                <div key={item.key}>
                  <label className="label">{item.label}</label>
                  <input type="text"
                    placeholder={item.array ? "Role IDs separated by commas" : "Role ID"}
                    value={item.array
                      ? ((config[item.key] as string[]) || []).join(", ")
                      : String(config[item.key] || "")}
                    onChange={e => {
                      if (item.array) update(item.key, e.target.value.split(",").map(s => s.trim()).filter(Boolean));
                      else update(item.key, e.target.value);
                    }}
                    className="input font-mono" />
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WELCOME ── */}
      {tab === "welcome" && (
        <div className="space-y-4 max-w-2xl animate-fade-up">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>👋 Welcome Messages</h3>
              <ToggleSwitch checked={!!config.welcome_enabled} onChange={v => update("welcome_enabled", v)} size="sm" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Welcome channel ID</label>
                <input type="text" placeholder="Channel ID" value={String(config.welcome_channel_id || "")} onChange={e => update("welcome_channel_id", e.target.value)} className="input font-mono" />
              </div>
              <div>
                <label className="label">Welcome message</label>
                <textarea rows={3} placeholder="Welcome {user} to {server}! You are member #{count}" value={String(config.welcome_message || "")} onChange={e => update("welcome_message", e.target.value)} className="input resize-none" />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Variables: {"{"+"user}"}, {"{"+"server}"}, {"{"+"count}"}, {"{"+"id}"}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>👋 Leave Messages</h3>
              <ToggleSwitch checked={!!config.leave_enabled} onChange={v => update("leave_enabled", v)} size="sm" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Leave channel ID</label>
                <input type="text" placeholder="Channel ID" value={String(config.leave_channel_id || "")} onChange={e => update("leave_channel_id", e.target.value)} className="input font-mono" />
              </div>
              <div>
                <label className="label">Leave message</label>
                <textarea rows={3} placeholder="{user} has left the server." value={String(config.leave_message || "")} onChange={e => update("leave_message", e.target.value)} className="input resize-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGGING ── */}
      {tab === "logging" && (
        <div className="space-y-4 max-w-2xl animate-fade-up">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>📋 Logging Channels</h3>
            <div className="space-y-4">
              {[
                { label: "Mod action log channel",    key: "log_channel_id",             desc: "Bans, kicks, mutes, warns" },
                { label: "Message delete log",        key: "msg_delete_log_channel_id",  desc: "Deleted message logs" },
                { label: "Member join/leave log",     key: "member_log_channel_id",      desc: "Join/leave events" },
                { label: "Server audit log",          key: "audit_log_channel_id",       desc: "Role/channel changes" },
              ].map(item => (
                <div key={item.key}>
                  <label className="label">{item.label}</label>
                  <input type="text" placeholder="Channel ID" value={String(config[item.key] || "")} onChange={e => update(item.key, e.target.value)} className="input font-mono" />
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
