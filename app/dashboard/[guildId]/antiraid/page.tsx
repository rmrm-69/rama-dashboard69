"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

export default function AntiRaidPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/config`).then(r => r.json()).then(c => { setConfig(c); setLoading(false); });
  }, [guildId]);

  const update = (key: string, value: unknown) => setConfig(p => ({ ...p, [key]: value }));
  const save = async () => {
    const res = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    if (!res.ok) throw new Error();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const enabled = !!config.antiraid_enabled;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>⚔️ Anti-Raid</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Protect your server from mass-join raids</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Master toggle */}
      <div className="card p-5 flex items-center justify-between gap-4" style={{ borderColor: enabled ? "rgba(59,130,246,0.3)" : "var(--border)", boxShadow: enabled ? "0 0 20px rgba(59,130,246,0.08)" : undefined }}>
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Anti-Raid Protection</p>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Automatically detect and stop join raids</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${enabled ? "badge-green" : "badge-gray"}`}>{enabled ? "Active" : "Inactive"}</span>
          <ToggleSwitch checked={enabled} onChange={v => update("antiraid_enabled", v)} />
        </div>
      </div>

      {/* Config cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Threshold */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👥</span>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Join Threshold</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Trigger when this many members join within the time window</p>
          <input type="number" min={2} max={100} value={String(config.antiraid_threshold || 10)} onChange={e => update("antiraid_threshold", Number(e.target.value))} className="input w-full" disabled={!enabled} />
        </div>

        {/* Window */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⏱️</span>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Time Window (seconds)</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Detection window for counting new joins</p>
          <input type="number" min={5} max={600} value={String(config.antiraid_window || 10)} onChange={e => update("antiraid_window", Number(e.target.value))} className="input w-full" disabled={!enabled} />
        </div>

        {/* Action */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚡</span>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Action on Raid</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>What to do to detected raiders</p>
          <select value={String(config.antiraid_action || "kick")} onChange={e => update("antiraid_action", e.target.value)} className="input w-full" disabled={!enabled}>
            <option value="kick">Kick</option>
            <option value="ban">Ban</option>
            <option value="timeout">Timeout (1 hour)</option>
            <option value="softban">Soft-ban (ban + unban)</option>
          </select>
        </div>

        {/* Lockdown */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔒</span>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Auto-Lockdown</h3>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Lock all channels when a raid is detected</p>
          <div className="flex items-center gap-3">
            <ToggleSwitch checked={!!config.antiraid_lockdown} onChange={v => update("antiraid_lockdown", v)} disabled={!enabled} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Enable server lockdown</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl p-4" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)" }}>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--brand-300)" }}>ℹ️ How Anti-Raid works</p>
        <ul className="text-sm space-y-1" style={{ color: "var(--text-muted)" }}>
          <li>• Monitors new member joins in real-time</li>
          <li>• If <strong style={{ color: "var(--text-secondary)" }}>{String(config.antiraid_threshold || 10)} or more</strong> members join within <strong style={{ color: "var(--text-secondary)" }}>{String(config.antiraid_window || 10)} seconds</strong>, a raid is detected</li>
          <li>• All detected raiders are automatically <strong style={{ color: "var(--text-secondary)" }}>{String(config.antiraid_action || "kicked")}</strong></li>
          {config.antiraid_lockdown && <li>• Server channels are <strong style={{ color: "var(--text-secondary)" }}>locked down</strong> automatically</li>}
        </ul>
      </div>
    </div>
  );
}
