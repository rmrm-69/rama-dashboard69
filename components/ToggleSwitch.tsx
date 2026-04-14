"use client";

interface ToggleSwitchProps {
  checked:  boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function ToggleSwitch({ checked, onChange, disabled, size = "md" }: ToggleSwitchProps) {
  return (
    <label className={`toggle ${size === "sm" ? "!w-9 !h-5" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={size === "sm" ? { width: "36px", height: "20px" } : undefined}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-slider" style={size === "sm" ? { borderRadius: "10px" } : undefined} />
    </label>
  );
}
