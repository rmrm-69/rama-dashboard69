"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommandSection from "@/components/CommandSection";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

export default function FunPage() {
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
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>😄 Fun</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Fun and entertainment features for your community</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      <div className="space-y-4">

        <CommandSection title="Confessional" description="Anonymous confession channel — members can confess anonymously"
          icon="🤫" enabled={!!config.confessional_enabled} onToggle={v => update("confessional_enabled", v)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Confessional channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.confessional_channel_id || "")} onChange={e => update("confessional_channel_id", e.target.value)} className="input font-mono" />
            </div>
            <div>
              <label className="label">Auto-delete after (hours, 0 = never)</label>
              <input type="number" min={0} max={168} value={String(config.confessional_auto_delete_hours || 0)} onChange={e => update("confessional_auto_delete_hours", Number(e.target.value))} className="input" />
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/confessional setup</code> in Discord to configure the confession panel.
          </p>
        </CommandSection>

        <CommandSection title="Fake Ban" description="Prank-ban members — looks real but does nothing"
          icon="🔨" enabled={!!config.fakeban_enabled} onToggle={v => update("fakeban_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">!fakeban @user [reason]</code> to fake-ban.
            Only admins/mods can use this. The target receives a realistic ban message.
          </p>
        </CommandSection>

        <CommandSection title="LSD Visual Mode" description="Psychedelic visual effect mode for a designated channel"
          icon="🌀" enabled={!!config.lsd_enabled} onToggle={v => update("lsd_enabled", v)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">LSD channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.lsd_channel_id || "")} onChange={e => update("lsd_channel_id", e.target.value)} className="input font-mono" />
            </div>
            <div>
              <label className="label">LSD role ID (required to use)</label>
              <input type="text" placeholder="Role ID (optional)" value={String(config.lsd_role_id || "")} onChange={e => update("lsd_role_id", e.target.value)} className="input font-mono" />
            </div>
          </div>
        </CommandSection>

        <CommandSection title="Advice Bot" description="Post unsolicited random advice at configurable intervals"
          icon="💡" enabled={!!config.advice_enabled} onToggle={v => update("advice_enabled", v)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Advice channel ID</label>
              <input type="text" placeholder="Channel ID" value={String(config.advice_channel_id || "")} onChange={e => update("advice_channel_id", e.target.value)} className="input font-mono" />
            </div>
            <div>
              <label className="label">Frequency (times per day)</label>
              <input type="number" min={1} max={24} value={String(config.advice_frequency || 3)} onChange={e => update("advice_frequency", Number(e.target.value))} className="input" />
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Commands: <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/advice enable</code>,{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/advice add</code> to add custom advice
          </p>
        </CommandSection>

        <CommandSection title="Jinx" description="Jinx a member — they can&apos;t send messages until unjinxed"
          icon="🤐" enabled={!!config.jinx_enabled} onToggle={v => update("jinx_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Members with the right role can jinx others. Configure with{" "}
            <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">!jinx @user</code>.
          </p>
          <div className="mt-3">
            <label className="label">Jinx role ID (who can use jinx)</label>
            <input type="text" placeholder="Role ID" value={String(config.jinx_role_id || "")} onChange={e => update("jinx_role_id", e.target.value)} className="input font-mono w-64" />
          </div>
        </CommandSection>

        <CommandSection title="Joke Command" description="Get a random joke on demand"
          icon="😂" enabled={true} onToggle={() => {}}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Always available. Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/joke</code> to get a random joke.
          </p>
        </CommandSection>

        <CommandSection title="Poll Battle" description="Head-to-head voting battles between two options"
          icon="⚔️" enabled={!!config.pollbattle_enabled} onToggle={v => update("pollbattle_enabled", v)}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">!pollbattle option1 vs option2</code> to start a battle.
          </p>
        </CommandSection>

      </div>
    </div>
  );
}
