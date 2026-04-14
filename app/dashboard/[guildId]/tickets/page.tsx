"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Ticket { channel_id: string; user_id: string; created_at: string; status: string; }
interface Config { [k: string]: unknown; }

export default function TicketsPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig] = useState<Config>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"settings" | "active">("settings");

  useEffect(() => {
    Promise.all([
      fetch(`/api/guilds/${guildId}/config`).then(r => r.json()),
      fetch(`/api/guilds/${guildId}/tickets`).then(r => r.json()),
    ]).then(([c, t]) => { setConfig(c); setTickets(t.tickets || []); setLoading(false); });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));
  const save = async () => { const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); if (!r.ok) throw new Error(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const enabled = !!config.ticket_enabled;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🎟️ Tickets</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Support ticket system configuration and management</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(4,15,34,0.8)", border: "1px solid var(--border)" }}>
        {[{ id: "settings", label: "Settings", icon: "⚙️" }, { id: "active", label: `Active (${tickets.length})`, icon: "🎟️" }].map(t => (
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
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Ticket System</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Allow members to open support tickets</p>
            </div>
            <ToggleSwitch checked={enabled} onChange={v => update("ticket_enabled", v)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <label className="label">Ticket panel channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.ticket_channel_id || "")} onChange={e => update("ticket_channel_id", e.target.value)} className="input font-mono" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Ticket category ID</label>
              <input type="text" placeholder="Category ID" value={String(config.ticket_category_id || "")} onChange={e => update("ticket_category_id", e.target.value)} className="input font-mono" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Support role ID</label>
              <input type="text" placeholder="Role ID" value={String(config.ticket_support_role_id || "")} onChange={e => update("ticket_support_role_id", e.target.value)} className="input font-mono" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Transcript channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.ticket_transcript_channel_id || "")} onChange={e => update("ticket_transcript_channel_id", e.target.value)} className="input font-mono" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Max open tickets per user</label>
              <input type="number" min={1} max={10} value={String(config.ticket_max_per_user || 1)} onChange={e => update("ticket_max_per_user", Number(e.target.value))} className="input" disabled={!enabled} />
            </div>
            <div className="card p-4">
              <label className="label">Open ticket button label</label>
              <input type="text" placeholder="🎟️ Open Ticket" value={String(config.ticket_button_label || "")} onChange={e => update("ticket_button_label", e.target.value)} className="input" disabled={!enabled} />
            </div>
            <div className="card p-4 sm:col-span-2">
              <label className="label">Ticket welcome message</label>
              <textarea rows={3} placeholder="Welcome! A moderator will assist you shortly." value={String(config.ticket_welcome_message || "")} onChange={e => update("ticket_welcome_message", e.target.value)} className="input resize-none" disabled={!enabled} />
            </div>
          </div>
        </div>
      )}

      {tab === "active" && (
        <div className="animate-fade-up">
          {tickets.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>No open tickets</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Open Tickets</h3>
                <span className="badge badge-blue">{tickets.length} open</span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {tickets.map((t) => (
                  <div key={t.channel_id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "rgba(37,99,235,0.2)" }}>🎟️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Ticket by <code className="font-mono text-brand-300">{t.user_id}</code>
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Channel: <code className="font-mono">{t.channel_id}</code> · {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge badge-green">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
