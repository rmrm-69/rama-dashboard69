"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import CommandSection from "@/components/CommandSection";
import SaveButton from "@/components/SaveButton";
import ToggleSwitch from "@/components/ToggleSwitch";

interface Warn { id: number; user_id: string; reason: string; moderator: string; warned_at: string; }
interface JailedUser { user_id: string; reason: string; jailed_at: string; duration: string | null; jailed_by: string; }
interface Config { [k: string]: unknown; }

export default function ModerationPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig] = useState<Config>({});
  const [warns, setWarns]   = useState<Warn[]>([]);
  const [jailed, setJailed] = useState<JailedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnSearch, setWarnSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "warns" | "jailed">("settings");

  const load = useCallback(async () => {
    setLoading(true);
    const [cfgRes, modRes] = await Promise.all([
      fetch(`/api/guilds/${guildId}/config`).then(r => r.json()),
      fetch(`/api/guilds/${guildId}/moderation?type=warns`).then(r => r.json()),
    ]);
    setConfig(cfgRes);
    setWarns(modRes.warns || []);
    const jailRes = await fetch(`/api/guilds/${guildId}/moderation?type=jailed`).then(r => r.json());
    setJailed(jailRes.jailed || []);
    setLoading(false);
  }, [guildId]);

  useEffect(() => { load(); }, [load]);

  const update = (key: string, value: unknown) => setConfig(prev => ({ ...prev, [key]: value }));

  async function saveConfig() {
    const res = await fetch(`/api/guilds/${guildId}/config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Save failed");
  }

  async function deleteWarn(warnId: number) {
    await fetch(`/api/guilds/${guildId}/moderation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_warn", warnId }),
    });
    setWarns(prev => prev.filter(w => w.id !== warnId));
  }

  async function clearWarns(userId: string) {
    if (!confirm("Clear all warns for this user?")) return;
    await fetch(`/api/guilds/${guildId}/moderation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear_warns", userId }),
    });
    setWarns(prev => prev.filter(w => w.user_id !== userId));
  }

  const filteredWarns = warns.filter(w =>
    !warnSearch || w.user_id.includes(warnSearch) || w.reason.toLowerCase().includes(warnSearch.toLowerCase())
  );

  const tabs = [
    { id: "settings", label: "Settings",  icon: "⚙️" },
    { id: "warns",    label: `Warnings (${warns.length})`, icon: "⚠️" },
    { id: "jailed",   label: `Jailed (${jailed.length})`,  icon: "🔒" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🛡️ Moderation</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Configure moderation commands and review active punishments</p>
        </div>
        <SaveButton onSave={saveConfig} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(4,15,34,0.8)", border: "1px solid var(--border)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === t.id ? "text-white" : ""}`}
            style={activeTab === t.id ? { background: "var(--brand-600)", color: "white" } : { color: "var(--text-muted)" }}>
            <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── SETTINGS TAB ── */}
      {activeTab === "settings" && (
        <div className="space-y-4 animate-fade-up">

          {/* Warn */}
          <CommandSection title="Warn" description="Issue warnings to members with optional auto-actions" icon="⚠️"
            enabled={true} onToggle={() => {}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Max warnings before action</label>
                <input type="number" min={1} max={20} value={String(config.warn_max || 3)} onChange={e => update("warn_max", Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Auto-action on max warns</label>
                <select value={String(config.warn_action || "none")} onChange={e => update("warn_action", e.target.value)} className="input">
                  <option value="none">None</option>
                  <option value="mute">Mute</option>
                  <option value="kick">Kick</option>
                  <option value="ban">Ban</option>
                  <option value="jail">Jail</option>
                </select>
              </div>
              {config.warn_action && config.warn_action !== "none" && (
                <div>
                  <label className="label">Auto-action duration (e.g. 1h, 1d)</label>
                  <input type="text" placeholder="1d" value={String(config.warn_action_duration || "")} onChange={e => update("warn_action_duration", e.target.value)} className="input" />
                </div>
              )}
            </div>
          </CommandSection>

          {/* Ban */}
          <CommandSection title="Ban" description="Permanently or temporarily ban members from the server" icon="🔨"
            enabled={true} onToggle={() => {}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Default ban reason template</label>
                <input type="text" placeholder="Violated server rules" value={String(config.ban_default_reason || "")} onChange={e => update("ban_default_reason", e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Delete message history</label>
                <select value={String(config.ban_delete_days || 0)} onChange={e => update("ban_delete_days", Number(e.target.value))} className="input">
                  <option value={0}>Don&apos;t delete</option>
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                </select>
              </div>
            </div>
          </CommandSection>

          {/* Kick */}
          <CommandSection title="Kick" description="Remove members from the server (they can rejoin)" icon="👢"
            enabled={true} onToggle={() => {}}>
            <div>
              <label className="label">Default kick reason template</label>
              <input type="text" placeholder="Kicked by moderator" value={String(config.kick_default_reason || "")} onChange={e => update("kick_default_reason", e.target.value)} className="input" />
            </div>
          </CommandSection>

          {/* Mute / Timeout */}
          <CommandSection title="Mute / Timeout" description="Temporarily silence members using Discord timeout or mute role" icon="🔇"
            enabled={!!config.mute_enabled} onToggle={v => update("mute_enabled", v)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Mute role ID</label>
                <input type="text" placeholder="Role ID (optional)" value={String(config.mute_role_id || "")} onChange={e => update("mute_role_id", e.target.value)} className="input font-mono" />
              </div>
              <div>
                <label className="label">Default mute duration</label>
                <input type="text" placeholder="10m" value={String(config.mute_default_duration || "")} onChange={e => update("mute_default_duration", e.target.value)} className="input" />
              </div>
            </div>
          </CommandSection>

          {/* Jail */}
          <CommandSection title="Jail" description="Jail members — remove all roles and restrict to a jail channel" icon="⛓️"
            enabled={!!config.jail_enabled} onToggle={v => update("jail_enabled", v)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Jail channel ID</label>
                <input type="text" placeholder="Channel ID" value={String(config.jail_channel_id || "")} onChange={e => update("jail_channel_id", e.target.value)} className="input font-mono" />
              </div>
              <div>
                <label className="label">Jail role ID</label>
                <input type="text" placeholder="Role ID" value={String(config.jail_role_id || "")} onChange={e => update("jail_role_id", e.target.value)} className="input font-mono" />
              </div>
            </div>
          </CommandSection>

          {/* Purge */}
          <CommandSection title="Purge / Delete Messages" description="Bulk delete messages from a channel" icon="🗑️"
            enabled={true} onToggle={() => {}}>
            <div>
              <label className="label">Maximum messages per purge (1–200)</label>
              <input type="number" min={1} max={200} value={String(config.purge_max || 100)} onChange={e => update("purge_max", Number(e.target.value))} className="input w-32" />
            </div>
          </CommandSection>

          {/* Lock / Unlock */}
          <CommandSection title="Lock / Unlock Channels" description="Prevent or allow members from sending messages in channels" icon="🔐"
            enabled={true} onToggle={() => {}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Default lock reason</label>
                <input type="text" placeholder="Channel locked by moderator" value={String(config.lock_reason || "")} onChange={e => update("lock_reason", e.target.value)} className="input" />
              </div>
            </div>
          </CommandSection>

          {/* Hide / Unhide */}
          <CommandSection title="Hide / Unhide Channels" description="Toggle channel visibility for everyone" icon="👁️"
            enabled={true} onToggle={() => {}}>
            <div>
              <label className="label">Default hide reason</label>
              <input type="text" placeholder="Channel hidden" value={String(config.hide_reason || "")} onChange={e => update("hide_reason", e.target.value)} className="input" />
            </div>
          </CommandSection>

          {/* Role Management */}
          <CommandSection title="Role Management" description="Add or remove roles from members via command" icon="🎭"
            enabled={true} onToggle={() => {}}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Use <code className="font-mono text-brand-300 bg-brand-950/30 px-1 rounded">/role @member @role</code> to toggle roles.
              No extra configuration needed.
            </p>
          </CommandSection>

          {/* Mod Log */}
          <CommandSection title="Mod Log Channel" description="Log all moderation actions to a dedicated channel" icon="📋"
            enabled={!!config.mod_log_enabled} onToggle={v => update("mod_log_enabled", v)}>
            <div>
              <label className="label">Log channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.log_channel_id || "")} onChange={e => update("log_channel_id", e.target.value)} className="input font-mono" />
            </div>
          </CommandSection>
        </div>
      )}

      {/* ── WARNINGS TAB ── */}
      {activeTab === "warns" && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex gap-3">
            <input className="input flex-1" placeholder="Search by user ID or reason…" value={warnSearch} onChange={e => setWarnSearch(e.target.value)} />
          </div>
          {filteredWarns.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>No warnings found</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(4,15,34,0.8)", borderBottom: "1px solid var(--border)" }}>
                      {["#", "User ID", "Reason", "By", "Date", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {filteredWarns.map((w, i) => (
                      <tr key={w.id} className="hover:bg-brand-950/20 transition-colors">
                        <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>#{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--brand-300)" }}>{w.user_id}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--text-primary)" }}>{w.reason}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{w.moderator}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(w.warned_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => deleteWarn(w.id)} className="text-xs px-2 py-1 rounded btn-danger">Delete</button>
                            <button onClick={() => clearWarns(w.user_id)} className="text-xs px-2 py-1 rounded btn-secondary">Clear All</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── JAILED TAB ── */}
      {activeTab === "jailed" && (
        <div className="space-y-4 animate-fade-up">
          {jailed.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-3xl mb-3">🔓</p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>No jailed members</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(4,15,34,0.8)", borderBottom: "1px solid var(--border)" }}>
                      {["User ID", "Reason", "Jailed By", "Duration", "Date"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {jailed.map((j) => (
                      <tr key={j.user_id} className="hover:bg-brand-950/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--brand-300)" }}>{j.user_id}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{j.reason}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{j.jailed_by}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{j.duration || "Permanent"}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(j.jailed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
