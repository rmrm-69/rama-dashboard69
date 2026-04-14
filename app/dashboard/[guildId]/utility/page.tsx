"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommandSection from "@/components/CommandSection";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

export default function UtilityPage() {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🔧 Utility Tools</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Configure all utility features for your server</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      <div className="space-y-4">

        {/* AFK */}
        <CommandSection title="AFK System" description="Members can set an AFK status shown when mentioned"
          icon="💤" enabled={!!config.afk_enabled} onToggle={v => update("afk_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/afk [reason]</code> or{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">!afk [reason]</code> to set AFK.
            AFK is cleared automatically when the user sends a message.
          </p>
        </CommandSection>

        {/* Polls */}
        <CommandSection title="Polls" description="Create polls and voting with emoji reactions"
          icon="📊" enabled={!!config.polls_enabled} onToggle={v => update("polls_enabled", v)}>
          <div>
            <label className="label">Poll log channel ID (optional)</label>
            <input type="text" placeholder="Channel ID" value={String(config.poll_log_channel || "")} onChange={e => update("poll_log_channel", e.target.value)} className="input font-mono w-64" />
          </div>
        </CommandSection>

        {/* Embeds */}
        <CommandSection title="Embed Creator" description="Create and send custom rich embeds to any channel"
          icon="📝" enabled={!!config.embeds_enabled} onToggle={v => update("embeds_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/embed</code> to open the interactive embed builder.
            Requires Manage Messages permission.
          </p>
        </CommandSection>

        {/* Announcements */}
        <CommandSection title="Announcements / DM Blast" description="Send announcements to channels or DM all server members"
          icon="📢" enabled={!!config.announcements_enabled} onToggle={v => update("announcements_enabled", v)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Announcement channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.announcement_channel_id || "")} onChange={e => update("announcement_channel_id", e.target.value)} className="input font-mono" />
            </div>
          </div>
        </CommandSection>

        {/* Custom Triggers */}
        <CommandSection title="Custom Triggers / Auto-Responses" description="Auto-reply when specific keywords or phrases are detected"
          icon="⚡" enabled={!!config.custom_triggers_enabled} onToggle={v => update("custom_triggers_enabled", v)}>
          <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
            Manage triggers with slash commands: <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/custom add</code>,{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/custom remove</code>,{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/custom list</code>,{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/custom edit</code>
          </p>
          <div>
            <label className="label">Max triggers per server</label>
            <input type="number" min={1} max={100} value={String(config.custom_triggers_max || 25)} onChange={e => update("custom_triggers_max", Number(e.target.value))} className="input w-24" />
          </div>
        </CommandSection>

        {/* Smart Slowmode */}
        <CommandSection title="Smart Slowmode" description="Automatically apply slowmode when message rate is too high"
          icon="🐌" enabled={!!config.slowmode_enabled} onToggle={v => update("slowmode_enabled", v)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Trigger threshold (msgs/min)</label>
              <input type="number" min={5} max={200} value={String(config.slowmode_threshold || 30)} onChange={e => update("slowmode_threshold", Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Slowmode duration (seconds)</label>
              <input type="number" min={1} max={21600} value={String(config.slowmode_duration || 5)} onChange={e => update("slowmode_duration", Number(e.target.value))} className="input" />
            </div>
          </div>
        </CommandSection>

        {/* Amnesia Channels */}
        <CommandSection title="Amnesia Channels" description="Channels that auto-delete all messages after a set period"
          icon="🧠" enabled={!!config.amnesia_enabled} onToggle={v => update("amnesia_enabled", v)}>
          <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
            Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/amnesia create</code> in a channel to enable auto-deletion.
          </p>
          <div>
            <label className="label">Default delete interval (minutes)</label>
            <input type="number" min={1} max={10080} value={String(config.amnesia_interval_minutes || 60)} onChange={e => update("amnesia_interval_minutes", Number(e.target.value))} className="input w-32" />
          </div>
        </CommandSection>

        {/* Milestone */}
        <CommandSection title="Milestone Announcements" description="Announce when server member count hits milestone numbers"
          icon="🎯" enabled={!!config.milestone_enabled} onToggle={v => update("milestone_enabled", v)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Milestone channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.milestone_channel_id || "")} onChange={e => update("milestone_channel_id", e.target.value)} className="input font-mono" />
            </div>
            <div>
              <label className="label">Milestone values (comma-separated)</label>
              <input type="text" placeholder="100,500,1000,5000" value={String(config.milestone_values || "")} onChange={e => update("milestone_values", e.target.value)} className="input" />
            </div>
          </div>
        </CommandSection>

        {/* Regex Reminders */}
        <CommandSection title="Regex Reminders / Rate Limiter" description="Detect message patterns and respond or rate-limit accordingly"
          icon="🔍" enabled={!!config.regex_remind_enabled} onToggle={v => update("regex_remind_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Configure patterns with <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">!regex_remind</code> in Discord.
            Rate limiter runs in the background automatically when enabled.
          </p>
        </CommandSection>

        {/* Embassy */}
        <CommandSection title="Embassy System" description="Create cross-server communication bridges"
          icon="🏛️" enabled={!!config.embassy_enabled} onToggle={v => update("embassy_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Commands: <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/embassy request</code>,{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/embassy accept</code>,{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/embassy dissolve</code>
          </p>
        </CommandSection>

      </div>
    </div>
  );
}
