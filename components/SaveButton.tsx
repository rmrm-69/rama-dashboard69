"use client";
import { useState } from "react";

interface SaveButtonProps {
  onSave:   () => Promise<void>;
  label?:   string;
  className?: string;
}

export default function SaveButton({ onSave, label = "Save Changes", className = "" }: SaveButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handle() {
    setState("loading");
    try {
      await onSave();
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={state === "loading"}
      className={`btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {state === "loading" && (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      )}
      {state === "success" && <span>✓</span>}
      {state === "error"   && <span>✗</span>}
      {state === "loading" ? "Saving..." : state === "success" ? "Saved!" : state === "error" ? "Error!" : label}
    </button>
  );
}
