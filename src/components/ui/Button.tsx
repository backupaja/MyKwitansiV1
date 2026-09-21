import { tokens } from "../../styles/tokens";

const { color } = tokens;

interface ButtonBaseProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/** Primary filled button — brand red, solid background. Main action per surface. */
export function PrimaryBtn({
  onClick, children, className = "", disabled = false, type = "button",
}: ButtonBaseProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 text-white text-sm font-semibold
        px-4 py-2.5 rounded-lg border border-transparent
        shadow-sm transition-all duration-150 active:scale-[0.98]
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
      style={{ background: color.brand }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = color.brandDark; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = color.brand; }}
    >
      {children}
    </button>
  );
}

/** Outline button — brand red border, transparent fill. Secondary actions. */
export function OutlineBtn({
  onClick, children, className = "", disabled = false, type = "button",
}: ButtonBaseProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 text-sm font-semibold
        px-4 py-2.5 rounded-lg border
        transition-all duration-150 active:scale-[0.98]
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
      style={{ color: color.brand, borderColor: color.brand, background: "transparent" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = color.brandSoft; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}
