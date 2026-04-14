"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
  modOnly?: boolean;
}

function getSections(guildId: string, isAdmin: boolean, isMod: boolean): NavSection[] {
  const base = `/dashboard/${guildId}`;
  return [
    {
      label: "Overview",
      items: [
        { href: `${base}`,          icon: "🏠", label: "Overview" },
        { href: `${base}/members`,  icon: "👥", label: "Members" },
        { href: `${base}/invites`,  icon: "📨", label: "Invites" },
      ],
    },
    ...(isMod ? [{
      label: "Moderation",
      items: [
        { href: `${base}/moderation`, icon: "🛡️",  label: "Moderation",   modOnly: true },
        { href: `${base}/antiraid`,   icon: "⚔️",  label: "Anti-Raid",    modOnly: true },
        { href: `${base}/tickets`,    icon: "🎟️",  label: "Tickets",      modOnly: true },
      ],
    }] : []),
    {
      label: "Community",
      items: [
        { href: `${base}/giveaway`, icon: "🎉", label: "Giveaways" },
        { href: `${base}/xp`,       icon: "⭐", label: "XP & Levels" },
        { href: `${base}/economy`,  icon: "💰", label: "Economy" },
        { href: `${base}/games`,    icon: "🎮", label: "Games" },
      ],
    },
    {
      label: "Utility",
      items: [
        { href: `${base}/utility`, icon: "🔧", label: "Utility Tools" },
        { href: `${base}/ai`,      icon: "🤖", label: "AI Chat" },
        { href: `${base}/fun`,     icon: "😄", label: "Fun" },
      ],
    },
    ...(isAdmin ? [{
      label: "Server",
      items: [
        { href: `${base}/setup`, icon: "⚙️", label: "Setup",  adminOnly: true },
      ],
    }] : []),
  ];
}

interface Props {
  guildId:   string;
  guildName: string;
  guildIcon: string;
  isAdmin:   boolean;
  isMod:     boolean;
  username:  string;
  avatar?:   string;
  userId:    string;
  onClose?:  () => void;
}

export default function Sidebar({
  guildId, guildName, guildIcon, isAdmin, isMod, username, avatar, userId, onClose,
}: Props) {
  const pathname = usePathname();
  const sections = getSections(guildId, isAdmin, isMod);

  const avatarSrc = avatar
    ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.webp?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) % 6n)}.png`;

  const guildIconSrc = guildIcon
    ? `https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.webp?size=64`
    : null;

  return (
    <aside className="flex flex-col h-full" style={{ background: "rgba(2,12,27,0.95)", borderRight: "1px solid var(--border)", width: "100%", minHeight: "100vh" }}>
      {/* Server header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold"
            style={{ background: guildIconSrc ? "transparent" : "linear-gradient(135deg, #1d4ed8,#2563eb)" }}>
            {guildIconSrc
              ? <img src={guildIconSrc} alt="" className="w-full h-full object-cover" />
              : guildName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{guildName}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>← Switch server</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1.5"
              style={{ color: "var(--text-muted)" }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const exact  = item.href === `/dashboard/${guildId}`;
                const active = exact ? pathname === item.href : pathname.startsWith(item.href + "/") || pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <div className={clsx("nav-item", active && "active")}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.adminOnly && !active && (
                        <span className="ml-auto badge badge-yellow text-[10px]">Admin</span>
                      )}
                      {item.modOnly && !item.adminOnly && !active && (
                        <span className="ml-auto badge badge-blue text-[10px]">Mod</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 px-2">
          <img src={avatarSrc} alt="" className="w-8 h-8 rounded-full flex-shrink-0 ring-2" style={{ ringColor: "var(--border)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{username}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{isAdmin ? "Administrator" : isMod ? "Moderator" : "Member"}</p>
          </div>
          <Link href="/api/auth/logout" className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 group" title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:stroke-red-400" style={{ color: "var(--text-muted)" }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
