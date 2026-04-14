"use client";
import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";

interface CommandSectionProps {
  title:       string;
  description: string;
  icon:        string;
  enabled:     boolean;
  onToggle:    (v: boolean) => void;
  badge?:      string;
  badgeColor?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  children?:   React.ReactNode;
  collapsed?:  boolean;
  adminOnly?:  boolean;
}

export default function CommandSection({
  title, description, icon, enabled, onToggle, badge, badgeColor = "blue",
  children, collapsed = false, adminOnly = false,
}: CommandSectionProps) {
  const [open, setOpen] = useState(!collapsed);

  return (
    <div className="card overflow-hidden" style={{ borderColor: enabled ? "rgba(59,130,246,0.2)" : "var(--border)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: enabled ? "rgba(37,99,235,0.25)" : "rgba(30,58,95,0.3)" }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
            {badge && <span className={`badge badge-${badgeColor} text-[10px]`}>{badge}</span>}
            {adminOnly && <span className="badge badge-yellow text-[10px]">Admin only</span>}
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ToggleSwitch checked={enabled} onChange={onToggle} size="sm" />
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="transition-transform duration-200" style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Body */}
      {open && children && (
        <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
