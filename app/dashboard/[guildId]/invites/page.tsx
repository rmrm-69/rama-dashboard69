"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

export default function InvitesPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/config`).then(r => r.json()).then(c => { setConfig(c); setLoading(false); });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));
  const save = async () => { const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); if (!r.ok) throw new Error(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>📨 Invites</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Track invite usage, rewards, and leaderboards</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      <div className="card p-5 flex items-center justify-between" style={{ borderColor: config.invites_enabled ? "rgba(59,130,246,0.3)" : "var(--border)" }}>
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Invite Tracking</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Track who invited who and reward top inviters</p>
        </div>
        <ToggleSwitch checked={!!config.invites_enabled} onChange={v => update("invites_enabled", v)} />
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>🎁 Invite Rewards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Credits per invite</label>
              <input type="number" min={0} value={String(config.invite_credits_reward || 0)} onChange={e => update("invite_credits_reward", Number(e.target.value))} className="input" disabled={!config.invites_enabled} />
            </div>
            <div>
              <label className="label">XP per invite</label>
              <input type="number" min={0} value={String(config.invite_xp_reward || 0)} onChange={e => update("invite_xp_reward", Number(e.target.value))} className="input" disabled={!config.invites_enabled} />
            </div>
            <div>
              <label className="label">Top inviter role ID (monthly)</label>
              <input type="text" placeholder="Role ID" value={String(config.invite_top_role_id || "")} onChange={e => update("invite_top_role_id", e.target.value)} className="input font-mono" disabled={!config.invites_enabled} />
            </div>
          </div>
        </div>

        {/* Commands */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>📋 Invite Commands</h3>
          <div className="space-y-2">
            {[
              { cmd: "/invites",          desc: "View your invite stats" },
              { cmd: "/invites @user",    desc: "View another member&apos;s invite stats" },
              { cmd: "/activity",         desc: "Most active members list" },
              { cmd: "!invites top",      desc: "Invite leaderboard" },
            ].map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center gap-3 py-1.5">
                <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(37,99,235,0.15)", color: "var(--brand-300)" }}>{cmd}</code>
                <span className="text-sm" style={{ color: "var(--text-muted)" }} dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
