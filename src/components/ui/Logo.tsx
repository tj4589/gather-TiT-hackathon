export function Logo({
  variant = "nav",
  height = 28,
}: {
  variant?: "nav" | "mark" | "hero";
  height?: number;
}) {
  if (variant === "mark") {
    return (
      <img
        src="/favicon.png"
        alt="gather"
        style={{ height, width: height }}
        className="shrink-0"
      />
    );
  }

  if (variant === "hero") {
    return (
      <img
        src="/logo-lockup.png"
        alt="gather — small harvest. serious supply."
        style={{ height: height * 4 }}
        className="shrink-0"
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2 shrink-0">
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
