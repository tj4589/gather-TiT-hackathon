export function FulfillmentBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const fulfilled = clamped >= 100;

  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
      <div
        className="h-full rounded-l-full bg-green transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, borderRadius: fulfilled ? 9999 : undefined }}
      />
      {!fulfilled && (
        <div
          className="h-full bg-gold-tint-soft transition-[width] duration-500 ease-out"
          style={{ width: `${100 - clamped}%` }}
        />
      )}
    </div>
  );
}
