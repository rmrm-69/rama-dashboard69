import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const loginUrl = `/api/auth/login${searchParams.redirect ? `?redirect=${encodeURIComponent(searchParams.redirect)}` : ""}`;

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--navy-950)" }}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-dot-grid bg-dot-lg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-glow-radial pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full pointer-events-none animate-pulse-slow"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(29,92,150,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 mx-auto"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L36 30H4L20 4Z" fill="white" opacity="0.9" />
              <path d="M20 12L30 28H10L20 12Z" fill="#1d4ed8" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #e2e8f0, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Rama Dashboard
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Manage your server — moderation, economy, XP &amp; more
          </p>
        </div>

        {/* Login card */}
        <div className="card-glow p-8 animate-fade-up">
          <div className="flex flex-col gap-3 mb-6">
            {[
              { icon: "🛡️", text: "Full moderation control panel" },
              { icon: "💰", text: "Economy & credits management" },
              { icon: "⭐", text: "XP & leveling configuration" },
              { icon: "🎟️", text: "Tickets, giveaways & more" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="text-base">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <Link href={loginUrl}>
            <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-base transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #5865f2, #4752c4)",
                color: "white",
                border: "1px solid rgba(88,101,242,0.5)",
                boxShadow: "0 4px 20px rgba(88,101,242,0.35)"
              }}>
              <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="white">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Continue with Discord
            </button>
          </Link>

          <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            By logging in you agree to our terms of service
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Powered by Rama Bot • Built for Discord communities
        </p>
      </div>
    </main>
  );
}
