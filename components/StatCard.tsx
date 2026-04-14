interface StatCardProps {
  label:     string;
  value:     string | number;
  icon:      string;
  sublabel?: string;
  color?:    "blue" | "green" | "yellow" | "red" | "purple";
  delay?:    number;
}

const gradients: Record<string, string> = {
  blue:   "linear-gradient(135deg, #1d4ed8, #2563eb)",
  green:  "linear-gradient(135deg, #047857, #059669)",
  yellow: "linear-gradient(135deg, #b45309, #d97706)",
  red:    "linear-gradient(135deg, #b91c1c, #dc2626)",
  purple: "linear-gradient(135deg, #6d28d9, #7c3aed)",
};

export default function StatCard({ label, value, icon, sublabel, color = "blue", delay = 0 }: StatCardProps) {
  return (
    <div className="card p-5 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: gradients[color], boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}>
          {icon}
        </div>
        <p className="text-xs font-medium text-right" style={{ color: "var(--text-muted)" }}>{label}</p>
      </div>
      <p className="stat-value text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sublabel && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
    </div>
  );
}
