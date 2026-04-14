"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ActivityRow { user_id: string; total: number; }

export default function MembersPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guilds/${guildId}/members/activity`)
      .then(r => r.json())
      .then(d => { setActivity(d.activity || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [guildId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--brand-500)" }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>👥 Members</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Member activity and engagement stats</p>
      </div>

      <div className="rounded-xl p-4" style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Use <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/serverinfo</code>,{" "}
          <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/user @member</code>,{" "}
          <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/activity</code>, and{" "}
          <code className="font-mono text-brand-300 bg-ocean-700/30 px-1 rounded">/invites</code> in Discord for detailed member info.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Most Active Members</h3>
        </div>
        {activity.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">💬</p>
            <p style={{ color: "var(--text-muted)" }}>No message activity data yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {activity.slice(0, 20).map((r, i) => (
              <div key={r.user_id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: i < 3 ? "rgba(245,158,11,0.2)" : "rgba(30,58,95,0.3)", color: i < 3 ? "#fcd34d" : "var(--text-muted)" }}>
                  {i + 1}
                </div>
                <code className="text-xs font-mono flex-1" style={{ color: "var(--brand-300)" }}>{r.user_id}</code>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block h-1.5 rounded-full overflow-hidden" style={{ width: 80, background: "rgba(30,58,95,0.5)" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (r.total / (activity[0]?.total || 1)) * 100)}%`, background: "linear-gradient(90deg,#1d4ed8,#60a5fa)" }} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{Number(r.total).toLocaleString()} msgs</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
