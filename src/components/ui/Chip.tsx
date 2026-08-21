import type { ReactNode } from "react";

export function Chip({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-[6px] border px-3 py-1.5 text-[14px] font-semibold tracking-[0.02em] uppercase transition-colors ${
        active
          ? "border-green bg-green-tint-soft text-green-800"
          : "border-neutral-200 bg-cream text-ink hover:border-green hover:bg-green-tint-subtle"
      }`}
    >
      {children}
    </button>
  );
}
