"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }

const GAMES = [
  { id: "coinflip",    name: "Coin Flip",            icon: "🪙", desc: "Flip a coin and bet credits" },
  { id: "dice",        name: "Dice Roll",             icon: "🎲", desc: "Roll dice and compare results" },
  { id: "rps",         name: "Rock Paper Scissors",   icon: "✊", desc: "Play RPS against the bot" },
  { id: "guess",       name: "Guess the Number",      icon: "🔢", desc: "Guess a random number (1-100)" },
  { id: "blackjack",   name: "Blackjack",             icon: "🃏", desc: "Classic blackjack card game" },
  { id: "slots",       name: "Slot Machine",          icon: "🎰", desc: "Spin the slot machine" },
  { id: "mafia",       name: "Mafia Game",            icon: "🕵️", desc: "Multi-player social deduction game" },
  { id: "hide_seek",   name: "Hide & Seek",           icon: "🙈", desc: "Hide and seek channel game" },
  { id: "lsd",         name: "LSD Visual Mode",       icon: "🌀", desc: "Psychedelic visual channel effect" },
  { id: "wheel",       name: "Wheel Spin",            icon: "🎡", desc: "Spin the wheel for prizes" },
  { id: "pollbattle",  name: "Poll Battle",           icon: "⚔️", desc: "Head-to-head voting battles" },
  { id: "steal",       name: "Emoji/Sticker Steal",   icon: "😈", desc: "Steal emojis from other servers" },
  { id: "fakeban",     name: "Fake Ban",              icon: "🔨", desc: "Prank ban a user (fake)" },
];

export default function GamesPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/config`).then(r => r.json()).then(c => { setConfig(c); setLoading(false); });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));

  const getGameEnabled = (id: string): boolean => {
    const cooldowns = (config.game_cooldowns as Record<string, number>) || {};
    return cooldowns[id] !== -1;
  };
  const toggleGame = (id: string, v: boolean) => {
    const cooldowns = { ...((config.game_cooldowns as Record<string, number>) || {}) };
    if (!v) cooldowns[id] = -1;
    else delete cooldowns[id];
    update("game_cooldowns", cooldowns);
  };
  const getCooldown = (id: string): number => {
    const cooldowns = (config.game_cooldowns as Record<string, number>) || {};
    return cooldowns[id] > 0 ? cooldowns[id] : 30;
  };
  const setCooldown = (id: string, v: number) => {
    const cooldowns = { ...((config.game_cooldowns as Record<string, number>) || {}) };
    cooldowns[id] = v;
    update("game_cooldowns", cooldowns);
  };

  const save = async () => { const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) }); if (!r.ok) throw new Error(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const masterEnabled = !!config.games_enabled;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🎮 Games</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Configure available games and per-game cooldowns</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Master toggle */}
      <div className="card p-5 flex items-center justify-between" style={{ borderColor: masterEnabled ? "rgba(59,130,246,0.3)" : "var(--border)" }}>
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Games System</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Enable or disable all games at once</p>
        </div>
        <ToggleSwitch checked={masterEnabled} onChange={v => update("games_enabled", v)} />
      </div>

      {/* Game channels */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>📺 Game Channel Restrictions</h3>
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>Restrict games to specific channels (comma-separated IDs)</p>
        <input type="text" placeholder="Channel IDs separated by commas (blank = all channels)" value={String(config.game_channels || "")} onChange={e => update("game_channels", e.target.value)} className="input" disabled={!masterEnabled} />
      </div>

      {/* Individual games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GAMES.map((game) => {
          const on = getGameEnabled(game.id);
          return (
            <div key={game.id} className="card p-4" style={{ borderColor: on && masterEnabled ? "rgba(59,130,246,0.15)" : "var(--border)", opacity: masterEnabled ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{game.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{game.desc}</p>
                  </div>
                </div>
                <ToggleSwitch checked={on} onChange={v => toggleGame(game.id, v)} disabled={!masterEnabled} size="sm" />
              </div>
              {on && (
                <div className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>Cooldown (s):</span>
                  <input type="number" min={0} max={3600} value={getCooldown(game.id)} onChange={e => setCooldown(game.id, Number(e.target.value))} className="input flex-1 text-xs py-1" disabled={!masterEnabled || !on} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
