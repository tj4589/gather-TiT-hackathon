import type { ReactNode } from "react";

type Tone = "green" | "gold" | "neutral";

const toneClasses: Record<Tone, string> = {
  green: "bg-green-tint-soft text-green-800",
  gold: "bg-gold-tint-soft text-[#8a6423]",
  neutral: "bg-neutral-100 text-neutral-600",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[13px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
