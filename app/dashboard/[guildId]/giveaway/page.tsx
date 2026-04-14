"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

export default function GiveawayPage() {
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
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🎉 Giveaways</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Configure and manage server giveaways</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Info card */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
        <span className="text-xl">💡</span>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          <p className="font-medium mb-1" style={{ color: "var(--brand-300)" }}>Starting Giveaways</p>
          <p>Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/giveaway</code> in Discord to start a new giveaway. Configure defaults and manager permissions below.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>⚙️ Giveaway Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Giveaway manager role ID</label>
              <input type="text" placeholder="Role ID (optional)" value={String(config.giveaway_manager_role_id || "")} onChange={e => update("giveaway_manager_role_id", e.target.value)} className="input font-mono" />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Members with this role can manage giveaways</p>
            </div>
            <div>
              <label className="label">Default winner count</label>
              <input type="number" min={1} max={20} value={String(config.giveaway_default_winners || 1)} onChange={e => update("giveaway_default_winners", Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Minimum account age (days)</label>
              <input type="number" min={0} max={365} placeholder="0 = no restriction" value={String(config.giveaway_min_age || 0)} onChange={e => update("giveaway_min_age", Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Required role to enter (ID)</label>
              <input type="text" placeholder="Role ID (optional)" value={String(config.giveaway_required_role || "")} onChange={e => update("giveaway_required_role", e.target.value)} className="input font-mono" />
            </div>
          </div>
        </div>

        {/* Commands reference */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>📋 Giveaway Commands</h3>
          <div className="space-y-2">
            {[
              { cmd: "/giveaway",        desc: "Start a new interactive giveaway" },
              { cmd: "!giveaway end",    desc: "End a giveaway early and pick winner" },
              { cmd: "!giveaway reroll", desc: "Re-roll winners for a ended giveaway" },
              { cmd: "!giveaway list",   desc: "List all active giveaways" },
            ].map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center gap-3 py-2">
                <code className="text-xs font-mono px-2 py-1 rounded" style={{ background: "rgba(37,99,235,0.15)", color: "var(--brand-300)" }}>{cmd}</code>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
