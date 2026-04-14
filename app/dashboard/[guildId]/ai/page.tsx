"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

export default function AIPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig]   = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/config`).then(r => r.json()).then(c => { setConfig(c); setLoading(false); });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));
  const save = async () => { const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); if (!r.ok) throw new Error(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const enabled = !!config.ai_enabled;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🤖 AI Chat</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Configure the Gemini-powered AI chat channel</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Master toggle */}
      <div className="card p-5 flex items-center justify-between" style={{ borderColor: enabled ? "rgba(59,130,246,0.3)" : "var(--border)" }}>
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>AI Chat System</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Enable Gemini AI to chat in a dedicated channel</p>
        </div>
        <ToggleSwitch checked={enabled} onChange={v => update("ai_enabled", v)} />
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>⚙️ AI Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="label">AI chat channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.ai_channel_id || "")} onChange={e => update("ai_channel_id", e.target.value)} className="input font-mono" disabled={!enabled} />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>The bot will respond to all messages in this channel</p>
            </div>

            <div>
              <label className="label">Gemini API Key</label>
              <div className="flex gap-2">
                <input type={showKey ? "text" : "password"} placeholder="AIza..." value={String(config.ai_gemini_key || "")} onChange={e => update("ai_gemini_key", e.target.value)} className="input font-mono flex-1" disabled={!enabled} />
                <button onClick={() => setShowKey(!showKey)} className="btn-secondary px-3 flex-shrink-0">
                  {showKey ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Get your free key at{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--brand-400)" }}>
                  aistudio.google.com
                </a>
              </p>
            </div>

            <div>
              <label className="label">AI Model</label>
              <select value={String(config.ai_model || "gemini-1.5-flash")} onChange={e => update("ai_model", e.target.value)} className="input" disabled={!enabled}>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>

            <div>
              <label className="label">AI Persona / System Prompt (optional)</label>
              <textarea rows={3} placeholder="You are a helpful assistant for this Discord server…" value={String(config.ai_system_prompt || "")} onChange={e => update("ai_system_prompt", e.target.value)} className="input resize-none" disabled={!enabled} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--brand-300)" }}>ℹ️ How AI Chat works</p>
          <ul className="text-sm space-y-1" style={{ color: "var(--text-muted)" }}>
            <li>• The bot listens to every message in the configured channel</li>
            <li>• Each message is sent to Gemini with conversation history</li>
            <li>• The bot remembers context across messages in the channel</li>
            <li>• User profiles are stored to personalize responses over time</li>
            <li>• Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/setup ai</code> in Discord to run the full AI setup wizard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
