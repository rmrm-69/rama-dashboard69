"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ToggleSwitch from "@/components/ToggleSwitch";
import SaveButton from "@/components/SaveButton";

interface Config { [k: string]: unknown; }
interface LeaderRow { user_id: string; credits: number; }
interface ShopItem { id: string; name: string; price: number; role_id?: string; description?: string; }

export default function EconomyPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [config, setConfig]   = useState<Config>({});
  const [top, setTop]         = useState<LeaderRow[]>([]);
  const [tab, setTab]         = useState<"settings" | "leaderboard" | "shop">("settings");
  const [loading, setLoading] = useState(true);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", price: 100, role_id: "", description: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/guilds/${guildId}/config`).then(r => r.json()),
      fetch(`/api/guilds/${guildId}/economy?type=local`).then(r => r.json()),
    ]).then(([c, e]) => {
      setConfig(c);
      setTop(e.top || []);
      setShopItems((c.shop_items as ShopItem[]) || []);
      setLoading(false);
    });
  }, [guildId]);

  const update = (k: string, v: unknown) => setConfig(p => ({ ...p, [k]: v }));
  const save = async () => {
    const r = await fetch(`/api/guilds/${guildId}/config`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...config, shop_items: shopItems }) });
    if (!r.ok) throw new Error();
  };

  const addItem = () => {
    if (!newItem.name) return;
    const item: ShopItem = { id: Date.now().toString(), ...newItem };
    setShopItems(p => [...p, item]);
    setNewItem({ name: "", price: 100, role_id: "", description: "" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  const localEnabled = !!config.local_economy_enabled;
  const currency = String(config.currency_emoji || "💎");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>💰 Economy</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Credits, daily rewards, shop, and local economy</p>
        </div>
        <SaveButton onSave={save} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(4,15,34,0.8)", border: "1px solid var(--border)" }}>
        {[{ id: "settings", label: "Settings", icon: "⚙️" }, { id: "leaderboard", label: "Leaderboard", icon: "🏆" }, { id: "shop", label: "Shop Items", icon: "🛒" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={tab === t.id ? { background: "var(--brand-600)", color: "white" } : { color: "var(--text-muted)" }}>
            <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── SETTINGS ── */}
      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl animate-fade-up">
          {/* Global economy notice */}
          <div className="rounded-xl p-4" style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#6ee7b7" }}>🌐 Global Credits</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Global credits are shared across all servers. Commands: <code className="font-mono text-brand-300">daily</code>, <code className="font-mono text-brand-300">credits</code>, <code className="font-mono text-brand-300">transfer</code>
            </p>
          </div>

          {/* Local economy toggle */}
          <div className="card p-5 flex items-center justify-between gap-4" style={{ borderColor: localEnabled ? "rgba(59,130,246,0.3)" : "var(--border)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Local Server Economy</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Separate credit balance for this server only</p>
            </div>
            <ToggleSwitch checked={localEnabled} onChange={v => update("local_economy_enabled", v)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <label className="label">Currency name</label>
              <input type="text" placeholder="Credits" value={String(config.currency_name || "")} onChange={e => update("currency_name", e.target.value)} className="input" />
            </div>
            <div className="card p-4">
              <label className="label">Currency emoji</label>
              <input type="text" placeholder="💎" value={String(config.currency_emoji || "")} onChange={e => update("currency_emoji", e.target.value)} className="input" />
            </div>
            <div className="card p-4">
              <label className="label">Daily reward amount</label>
              <input type="number" min={1} value={String(config.daily_amount || 100)} onChange={e => update("daily_amount", Number(e.target.value))} className="input" />
            </div>
            <div className="card p-4">
              <label className="label">Starting balance (new members)</label>
              <input type="number" min={0} value={String(config.starting_balance || 0)} onChange={e => update("starting_balance", Number(e.target.value))} className="input" disabled={!localEnabled} />
            </div>
            <div className="card p-4">
              <label className="label">Transfer fee (%)</label>
              <input type="number" min={0} max={50} value={String(config.transfer_fee_percent || 0)} onChange={e => update("transfer_fee_percent", Number(e.target.value))} className="input" />
            </div>
            <div className="card p-4">
              <label className="label">Max balance cap</label>
              <input type="number" min={0} placeholder="0 = no cap" value={String(config.balance_cap || 0)} onChange={e => update("balance_cap", Number(e.target.value))} className="input" disabled={!localEnabled} />
            </div>
          </div>

          {/* Commands reference */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>📋 Economy Commands</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { cmd: "daily / reward",      desc: "Claim daily credits" },
                { cmd: "credits / balance",   desc: "Check your balance" },
                { cmd: "transfer / pay",      desc: "Send credits to someone" },
                { cmd: "transactions",        desc: "View transaction history" },
                { cmd: "shop",                desc: "Browse the server shop" },
                { cmd: "buy <item>",          desc: "Purchase a shop item" },
              ].map(({ cmd, desc }) => (
                <div key={cmd} className="flex items-start gap-2">
                  <code className="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(37,99,235,0.15)", color: "var(--brand-300)" }}>{cmd}</code>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab === "leaderboard" && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Top Earners — {String(config.currency_name || "Credits")}</h3>
          </div>
          {top.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p style={{ color: "var(--text-muted)" }}>No economy data yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {top.map((r, i) => (
                <div key={r.user_id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: i === 0 ? "rgba(245,158,11,0.2)" : i === 1 ? "rgba(148,163,184,0.15)" : i === 2 ? "rgba(180,83,9,0.15)" : "rgba(30,58,95,0.3)", color: i === 0 ? "#fcd34d" : i === 1 ? "#e2e8f0" : i === 2 ? "#fbbf24" : "var(--text-muted)" }}>
                    {i + 1}
                  </div>
                  <code className="text-xs font-mono flex-1" style={{ color: "var(--brand-300)" }}>{r.user_id}</code>
                  <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{currency} {Number(r.credits).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SHOP ── */}
      {tab === "shop" && (
        <div className="space-y-4 animate-fade-up">
          {/* Add item form */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>➕ Add Shop Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input type="text" placeholder="Item name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} className="input" />
              <input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: Number(e.target.value) }))} className="input" />
              <input type="text" placeholder="Role ID (optional)" value={newItem.role_id} onChange={e => setNewItem(p => ({ ...p, role_id: e.target.value }))} className="input font-mono" />
              <input type="text" placeholder="Description" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} className="input" />
            </div>
            <button onClick={addItem} className="btn-primary">Add Item</button>
          </div>

          {/* Items list */}
          {shopItems.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-3xl mb-2">🛒</p>
              <p style={{ color: "var(--text-muted)" }}>No shop items yet</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {shopItems.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "rgba(37,99,235,0.15)" }}>🏷️</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                      {item.description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.description}</p>}
                      {item.role_id && <code className="text-xs font-mono" style={{ color: "var(--brand-300)" }}>Role: {item.role_id}</code>}
                    </div>
                    <span className="font-bold" style={{ color: "#6ee7b7" }}>{currency} {item.price.toLocaleString()}</span>
                    <button onClick={() => setShopItems(p => p.filter(i => i.id !== item.id))} className="text-xs btn-danger px-2 py-1">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <SaveButton onSave={save} label="Save Shop Items" />
        </div>
      )}
    </div>
  );
}
