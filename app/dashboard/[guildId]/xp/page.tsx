"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }
interface LevelRole { level: number; role_id: string; }

export default function XPPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig]   = useState<Config>({});
  const [top, setTop]         = useState<{ user_id: string; xp: number; level: number }[]>([]);
  const [tab, setTab]         = useState<"settings" | "leaderboard">("settings");
  const [loading, setLoading] = useState(true);
  const [levelRoles, setLevelRoles] = useState<LevelRole[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/guilds/${guildId}/config`).then(r => r.json()),
      fetch(`/api/guilds/${guildId}/xp?limit=20`).then(r => r.json()),
    ]).then(([c, x]) => {
      setConfig(c);
      setTop(x.top || []);
      setLevelRoles((c.level_roles as LevelRole[]) || []);
      setLoading(false);
    });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));
  const save = async () => { const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...config, level_roles: levelRoles }) }); if (!r.ok) throw new Error(); };
  const addLevelRole = () => setLevelRoles(p => [...p, { level: 5, role_id: "" }]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const enabled = !!config.xp_enabled;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>⭐ XP & Levels</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Experience points, leveling, and role rewards</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(4,15,34,0.8)", border: "1px solid var(--border)" }}>
        {[{ id: "settings", label: "Settings", icon: "⚙️" }, { id: "leaderboard", label: "Leaderboard", icon: "🏆" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={tab === t.id ? { background: "var(--brand-600)", color: "white" } : { color: "var(--text-muted)" }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl animate-fade-up">
          {/* Master toggle */}
          <div className="card p-5 flex items-center justify-between" style={{ borderColor: enabled ? "rgba(59,130,246,0.3)" : "var(--border)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>XP & Leveling System</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Award XP for messages and track member progress</p>
            </div>
            <ToggleSwitch checked={enabled} onChange={v => update("xp_enabled", v)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <label className="label">Min XP per message</label>
              <input type="number" min={1} max={100} value={String(config.xp_per_message_min || 5)} onChange={e => update("xp_per_message_min", Number(e.target.value))} className="input" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Max XP per message</label>
              <input type="number" min={1} max={100} value={String(config.xp_per_message_max || 15)} onChange={e => update("xp_per_message_max", Number(e.target.value))} className="input" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">XP cooldown (seconds)</label>
              <input type="number" min={5} max={300} value={String(config.xp_cooldown || 60)} onChange={e => update("xp_cooldown", Number(e.target.value))} className="input" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Level-up channel ID</label>
              <input type="text" placeholder="Channel ID (blank = same channel)" value={String(config.level_up_channel_id || "")} onChange={e => update("level_up_channel_id", e.target.value)} className="input font-mono" disabled={!enabled} />
            </div>
            <div className="card p-4 sm:col-span-2">
              <label className="label">Level-up message template</label>
              <input type="text" placeholder="🎉 {user} reached level {level}!" value={String(config.level_up_message || "")} onChange={e => update("level_up_message", e.target.value)} className="input" disabled={!enabled} />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Variables: {"{"+"user}"}, {"{"+"level}"}, {"{"+"xp}"}</p>
            </div>
          </div>

          {/* Level roles */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>🏅 Level Role Rewards</h3>
              <button onClick={addLevelRole} className="btn-secondary text-xs px-3 py-1.5">+ Add Reward</button>
            </div>
            {levelRoles.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No level roles configured</p>
            ) : (
              <div className="space-y-2">
                {levelRoles.map((lr, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm w-14 flex-shrink-0" style={{ color: "var(--text-muted)" }}>Level</span>
                      <input type="number" min={1} value={lr.level} onChange={e => setLevelRoles(p => p.map((x, j) => j === i ? { ...x, level: Number(e.target.value) } : x))} className="input w-20" />
                      <span className="text-sm flex-shrink-0" style={{ color: "var(--text-muted)" }}>→ Role ID</span>
                      <input type="text" placeholder="Role ID" value={lr.role_id} onChange={e => setLevelRoles(p => p.map((x, j) => j === i ? { ...x, role_id: e.target.value } : x))} className="input font-mono flex-1" />
                    </div>
                    <button onClick={() => setLevelRoles(p => p.filter((_, j) => j !== i))} className="text-xs btn-danger px-2 py-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Server XP Leaderboard</h3>
          </div>
          {top.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-3xl mb-3">⭐</p>
              <p style={{ color: "var(--text-muted)" }}>No XP data yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {top.map((r, i) => {
                const progress = Math.min(100, Math.round(((r.xp - r.level * r.level * 100) / ((r.level + 1) * (r.level + 1) * 100 - r.level * r.level * 100)) * 100));
                return (
                  <div key={r.user_id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: i === 0 ? "rgba(245,158,11,0.2)" : i === 1 ? "rgba(148,163,184,0.15)" : i === 2 ? "rgba(180,83,9,0.15)" : "rgba(30,58,95,0.3)", color: i === 0 ? "#fcd34d" : i === 1 ? "#e2e8f0" : i === 2 ? "#fbbf24" : "var(--text-muted)" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono" style={{ color: "var(--brand-300)" }}>{r.user_id}</code>
                      <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "rgba(30,58,95,0.5)" }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#1d4ed8,#60a5fa)" }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Lv.{r.level}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{Number(r.xp).toLocaleString()} XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
