import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-green text-cream hover:bg-green-700 active:bg-green-800 border border-transparent",
  secondary:
    "bg-transparent text-ink border border-neutral-300 hover:border-ink hover:bg-green-tint-subtle",
  ghost:
    "bg-transparent text-green hover:bg-green-tint-subtle border border-transparent",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-[15px] font-medium transition-colors duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
