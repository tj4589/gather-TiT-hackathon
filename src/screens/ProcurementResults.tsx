import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { FulfillmentBar } from "../components/FulfillmentBar";
import { SupplierBreakdown } from "../components/SupplierBreakdown";
import { demoRequest, matchSuppliers } from "../lib/mockData";
import { useCountUp } from "../lib/useCountUp";
import type { ProcurementRequest } from "../lib/types";

const EXPANDED_RADIUS_KM = 100;

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">
        {label}
      </span>
      <span className="text-[15px] font-medium text-ink">{value}</span>
    </div>
  );
}

export function ProcurementResults() {
  const location = useLocation();
  const request = (location.state as ProcurementRequest) ?? demoRequest;

  const [radiusKm, setRadiusKm] = useState(request.radiusKm);
  const [searching, setSearching] = useState(false);

  const { matched, totalBags, gapBags, percentFulfilled } = matchSuppliers(
    request,
    radiusKm
  );

  const animatedTotal = useCountUp(totalBags, 600);
  const animatedPercent = useCountUp(percentFulfilled, 600);
  const fulfilled = gapBags === 0;
  const canExpand = radiusKm < EXPANDED_RADIUS_KM;

  function handleExpand() {
    setSearching(true);
    window.setTimeout(() => {
      setRadiusKm(EXPANDED_RADIUS_KM);
      setSearching(false);
    }, 900);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link
        to="/"
        className="text-[13px] font-medium text-neutral-500 hover:text-ink"
      >
        ← New request
      </Link>

      {/* what was asked for */}
      <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[10px] border border-neutral-200 bg-white/40 px-6 py-5">
        <SummaryItem
          label="Crop"
          value={`${request.crop} · ${request.grade}`}
        />
        <SummaryItem
          label="Quantity"
          value={`${request.quantityBags.toLocaleString()} bags`}
        />
        <SummaryItem label="Delivery to" value={request.buyerLocation} />
        <SummaryItem
          label="Needed within"
          value={`${request.deadlineDays} day${request.deadlineDays === 1 ? "" : "s"}`}
        />
      </div>

      {/* hero fulfillment metric */}
      <section className="mt-12">
        <div className="flex items-baseline gap-3">
          <span className="font-body text-[56px] font-bold leading-[1.05] tabular-nums text-ink">
            {animatedTotal.toLocaleString()}
          </span>
          <span className="text-[22px] tabular-nums text-neutral-400">
            / {request.quantityBags.toLocaleString()} bags
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="tabular-nums text-[17px] font-semibold text-green-800">
            {animatedPercent}%
          </span>
          <span className="text-[15px] text-neutral-500">fulfilled</span>
          {fulfilled && <Badge tone="green">Fulfilled</Badge>}
        </div>

        <div className="mt-5">
          <FulfillmentBar percent={percentFulfilled} />
        </div>

        {/* gap callout / expand action */}
        {!fulfilled && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-gold-tint-subtle px-5 py-4">
            <div>
              <p className="text-[15px] font-medium text-ink">
                <span className="tabular-nums">
                  {gapBags.toLocaleString()}
                </span>{" "}
                bags still needed
              </p>
              <p className="mt-0.5 text-[13px] text-neutral-500">
                Currently sourcing within{" "}
                <span className="tabular-nums">{radiusKm} km</span> of{" "}
                {request.buyerLocation}
                {searching && (
                  <span className="ml-2 inline-flex items-center gap-1.5 text-green-800">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
                    Searching wider network…
                  </span>
                )}
              </p>
            </div>
            {canExpand && (
              <Button
                variant="secondary"
                onClick={handleExpand}
                disabled={searching}
              >
                Expand to {EXPANDED_RADIUS_KM} km
              </Button>
            )}
          </div>
        )}
      </section>

      {/* supplier composition */}
      <section className="mt-12">
        <h2 className="text-[20px] font-semibold text-ink">
          Assembled from {matched.length} supplier
          {matched.length === 1 ? "" : "s"}
        </h2>
        <p className="mt-1 text-[14px] text-neutral-500">
          One buyer requirement, fragmented supply — matched suppliers within{" "}
          {radiusKm} km, {request.grade}.
        </p>
        <div className="mt-6">
          <SupplierBreakdown suppliers={matched} totalBags={totalBags} />
        </div>
      </section>
    </main>
  );
}
