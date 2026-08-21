export function Logo({
  variant = "nav",
  height = 28,
  className = "",
}: {
  variant?: "nav" | "mark" | "hero";
  height?: number;
  className?: string;
}) {
  if (variant === "mark") {
    return (
      <img
        src="/favicon.png"
        alt="gather"
        style={{ height, width: height }}
        className={`shrink-0 ${className}`}
      />
    );
  }

  if (variant === "hero") {
    return (
      <img
        src="/logo-lockup.png"
        alt="gather — small harvest. serious supply."
        style={{ height: height * 4 }}
        className={`shrink-0 ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <img src="/favicon.png" alt="" style={{ height, width: height }} />
      <span
        className="font-display font-light text-ink"
        style={{ fontSize: height * 0.82 }}
      >
        gather
      </span>
    </span>
  );
}
