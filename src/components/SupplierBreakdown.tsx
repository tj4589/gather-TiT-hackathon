import type { Supplier } from "../lib/types";

const SEGMENT_COLORS = [
  "bg-green",
  "bg-[#7a9a80]",
  "bg-[#a9c2ad]",
  "bg-gold",
  "bg-[#d9b878]",
  "bg-[#4b6551]",
];

export function SupplierBreakdown({
  suppliers,
  totalBags,
}: {
  suppliers: Supplier[];
  totalBags: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* segmented composition bar */}
      <div className="flex h-8 w-full overflow-hidden rounded-[8px]">
        {suppliers.map((s, i) => (
          <div
            key={s.id}
            className={`${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} h-full transition-[width] duration-500 ease-out first:rounded-l-[8px] last:rounded-r-[8px]`}
            style={{
              width: `${(s.availableBags / totalBags) * 100}%`,
            }}
            title={`${s.name} — ${s.availableBags} bags`}
          />
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-neutral-200 rounded-[10px] border border-neutral-200">
        {suppliers.map((s, i) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`}
              />
              <div>
                <p className="text-[15px] font-medium text-ink">{s.name}</p>
                <p className="text-[13px] text-neutral-500">
                  {s.location} · {s.distanceKm} km · ready in {s.readyInDays}{" "}
                  day{s.readyInDays === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <p className="tabular-nums shrink-0 text-[15px] font-semibold text-ink">
              {s.availableBags.toLocaleString()} bags
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
