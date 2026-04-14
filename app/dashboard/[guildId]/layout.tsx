"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface GuildMeta {
  id: string;
  name: string;
  icon: string;
  isAdmin: boolean;
  isMod: boolean;
}

interface UserMeta {
  username: string;
  avatar?: string;
  userId: string;
}

export default function GuildLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ guildId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guild, setGuild]   = useState<GuildMeta | null>(null);
  const [user, setUser]     = useState<UserMeta | null>(null);

  useEffect(() => {
    // Load guild + user meta from sessionStorage cache or fetch
    const cacheKey = `guild_meta_${params.guildId}`;
    const cached   = sessionStorage.getItem(cacheKey);
    if (cached) { try { setGuild(JSON.parse(cached)); } catch {} }

    const userCached = sessionStorage.getItem("user_meta");
    if (userCached) { try { setUser(JSON.parse(userCached)); } catch {} }
  }, [params.guildId]);

  const guildId = params.guildId;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--navy-950)" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: 260 }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <Sidebar
            guildId={guildId}
            guildName={guild?.name || "…"}
            guildIcon={guild?.icon || ""}
            isAdmin={guild?.isAdmin ?? false}
            isMod={guild?.isMod ?? false}
            username={user?.username || "…"}
            avatar={user?.avatar}
            userId={user?.userId || "0"}
          />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 260 }}>
        <Sidebar
          guildId={guildId}
          guildName={guild?.name || "…"}
          guildIcon={guild?.icon || ""}
          isAdmin={guild?.isAdmin ?? false}
          isMod={guild?.isMod ?? false}
          username={user?.username || "…"}
          avatar={user?.avatar}
          userId={user?.userId || "0"}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30" style={{ background: "rgba(2,12,27,0.95)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ background: "rgba(30,58,95,0.4)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)" }}>
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{guild?.name || "Dashboard"}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
