import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Radio,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FulfillmentBar } from "../components/FulfillmentBar";
import { SupplierBreakdown } from "../components/SupplierBreakdown";
import { createDemand, getDemandStatus, getOrder } from "../lib/api";
import { createDemoOrder, demoRequest, matchSuppliers } from "../lib/mockData";
import { useCountUp } from "../lib/useCountUp";
import type { OrderSummary, ProcurementRequest } from "../lib/types";

const EXPANDED_RADIUS_KM = 100;

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[110px] flex-col gap-1">
      <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">{label}</span>
      <span className="text-[15px] font-medium text-ink">{value}</span>
    </div>
  );
}

function JourneySteps({ fulfilled }: { fulfilled: boolean }) {
  return (
    <ol className="flex items-center gap-2 text-[12px] font-medium text-neutral-400 sm:gap-3">
      <li className="flex items-center gap-2 text-green-800 sm:gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-cream"><Check size={14} strokeWidth={2.2} /></span><span className="hidden sm:inline">Request</span></li>
      <span className="h-px w-5 bg-neutral-200 sm:w-10" />
      <li className={`flex items-center gap-2 sm:gap-3 ${fulfilled ? "text-green-800" : "text-ink"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${fulfilled ? "border-green bg-green text-cream" : "border-green bg-cream text-green"}`}>{fulfilled ? <Check size={14} strokeWidth={2.2} /> : <span className="tabular-nums">2</span>}</span><span className="hidden sm:inline">Gather supply</span></li>
      <span className="h-px w-5 bg-neutral-200 sm:w-10" />
      <li className={`flex items-center gap-2 sm:gap-3 ${fulfilled ? "text-ink" : ""}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${fulfilled ? "border-green bg-cream text-green" : "border-neutral-200"}`}>{fulfilled ? <span className="tabular-nums">3</span> : <span className="tabular-nums">3</span>}</span><span className="hidden sm:inline">Consolidated order</span></li>
    </ol>
  );
}

function OrderSummaryCard({ order, request }: { order: OrderSummary; request: ProcurementRequest }) {
  const [reviewing, setReviewing] = useState(false);

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10" aria-labelledby="order-summary-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-800"><PackageCheck size={18} strokeWidth={1.7} /><span className="text-[13px] font-medium uppercase tracking-[0.08em]">Ready to confirm</span></div>
          <h2 id="order-summary-heading" className="mt-3 font-display text-[32px] font-light leading-[1.15] text-ink">Consolidated order</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-[1.5] text-neutral-500">One dependable maize delivery, assembled from {order.suppliers.length} verified farmer contributions.</p>
        </div>
        <Badge tone="green"><CheckCircle2 size={14} strokeWidth={2} />Fulfilled</Badge>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[10px] border border-neutral-200 bg-white/30 p-5"><span className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">Total order</span><p className="mt-2 tabular-nums text-[26px] font-semibold text-ink">{order.totalBags.toLocaleString()} <span className="text-[15px] font-medium text-neutral-500">bags</span></p></div>
        <div className="rounded-[10px] border border-neutral-200 bg-white/30 p-5"><span className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">Delivery to</span><p className="mt-2 flex items-center gap-2 text-[17px] font-semibold text-ink"><MapPin size={17} className="text-green" strokeWidth={1.7} />{order.deliveryLocation}</p></div>
        <div className="rounded-[10px] border border-neutral-200 bg-white/30 p-5"><span className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">Ready within</span><p className="mt-2 flex items-center gap-2 text-[17px] font-semibold text-ink"><Clock3 size={17} className="text-green" strokeWidth={1.7} />{order.readyByDays} days</p></div>
      </div>

      <div className="mt-8 rounded-[10px] border border-neutral-200 bg-white/20 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div><h3 className="text-[17px] font-semibold text-ink">Farmer contributions</h3><p className="mt-1 text-[14px] text-neutral-500">Gather turns many smaller harvests into one buyer-ready load.</p></div>
          <span className="tabular-nums text-[14px] font-semibold text-green-800">{order.suppliers.length} suppliers · {order.totalBags.toLocaleString()} bags</span>
        </div>
        <div className="mt-6"><SupplierBreakdown suppliers={order.suppliers} totalBags={order.totalBags} /></div>
      </div>

      <Button className="mt-7 w-full sm:w-auto" onClick={() => setReviewing(true)} disabled={reviewing}>{reviewing ? "Order ready for confirmation" : "Review and confirm order"} {!reviewing && <ArrowRight size={17} strokeWidth={1.8} />}</Button>
      <p className="mt-3 text-[12px] text-neutral-400">Order reference <span className="tabular-nums">{order.id}</span> · {request.grade}</p>
    </section>
  );
}

export function ProcurementResults() {
  const location = useLocation();
  const request = (location.state as ProcurementRequest) ?? demoRequest;
  const [radiusKm, setRadiusKm] = useState(request.radiusKm);
  const [searching, setSearching] = useState(false);
  const [demandId, setDemandId] = useState<string>();
  const [apiOrder, setApiOrder] = useState<OrderSummary>();
  const [showOrder, setShowOrder] = useState(false);

  const { matched, totalBags, gapBags, percentFulfilled } = matchSuppliers(request, radiusKm);
  const animatedTotal = useCountUp(totalBags, 650);
  const animatedPercent = useCountUp(percentFulfilled, 650);
  const fulfilled = gapBags === 0;
  const canExpand = radiusKm < EXPANDED_RADIUS_KM;
  const order = apiOrder ?? createDemoOrder(request, matched);

  useEffect(() => {
    let cancelled = false;
    createDemand(request)
      .then(({ id }) => {
        if (!cancelled) setDemandId(id);
        return getDemandStatus(id);
      })
      .then((status) => {
        const complete = (status.gathered ?? 0) >= request.quantityBags || status.remaining === 0 || status.status?.toLowerCase() === "fulfilled";
        if (!cancelled && complete) setRadiusKm(EXPANDED_RADIUS_KM);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [request]);

  useEffect(() => {
    if (!fulfilled || !demandId) return;
    let cancelled = false;
    getDemandStatus(demandId)
      .then((status) => status.orderId ? getOrder(status.orderId) : undefined)
      .then((remoteOrder) => {
        if (!cancelled && remoteOrder?.suppliers?.length) setApiOrder(remoteOrder);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [demandId, fulfilled]);

  function handleCheckProgress() {
    setSearching(true);
    const showFallbackResult = () => window.setTimeout(() => {
      setRadiusKm(EXPANDED_RADIUS_KM);
      setSearching(false);
    }, 900);

    if (!demandId) {
      showFallbackResult();
      return;
    }

    getDemandStatus(demandId)
      .then((status) => {
        const complete = (status.gathered ?? 0) >= request.quantityBags || status.remaining === 0 || status.status?.toLowerCase() === "fulfilled";
        if (complete) {
          setRadiusKm(EXPANDED_RADIUS_KM);
        }
        setSearching(false);
      })
      .catch(() => {
        showFallbackResult();
      });
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-neutral-500 transition-colors hover:text-ink"><ArrowLeft size={15} strokeWidth={1.8} />New request</Link>
        <JourneySteps fulfilled={fulfilled} />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[10px] border border-neutral-200 bg-white/30 px-5 py-5 sm:px-6">
        <SummaryItem label="Requirement" value={`${request.crop} · ${request.grade}`} />
        <SummaryItem label="Quantity" value={`${request.quantityBags.toLocaleString()} bags`} />
        <SummaryItem label="Delivery to" value={request.buyerLocation} />
        <SummaryItem label="Needed within" value={`${request.deadlineDays} day${request.deadlineDays === 1 ? "" : "s"}`} />
      </div>

      <section className="mt-12" aria-labelledby="fulfillment-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-green-800"><Radio size={16} strokeWidth={1.7} />Live sourcing progress</div>
            <h1 id="fulfillment-heading" className="mt-4 font-display text-[32px] font-light leading-[1.15] text-ink sm:text-[40px]">{fulfilled ? "Supply secured" : "Gathering your supply"}</h1>
          </div>
          {fulfilled && <Badge tone="green"><CheckCircle2 size={14} strokeWidth={2} />Supply secured</Badge>}
        </div>

        <div className="mt-8 rounded-[10px] border border-neutral-200 bg-white/25 p-6 sm:p-8">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="tabular-nums text-[56px] font-bold leading-[1.05] text-ink sm:text-[72px]">{animatedTotal.toLocaleString()}</span>
            <span className="tabular-nums pb-1 text-[20px] text-neutral-400 sm:text-[24px]">/ {request.quantityBags.toLocaleString()} bags</span>
          </div>
          <div className="mt-3 flex items-center gap-3"><span className="tabular-nums text-[17px] font-semibold text-green-800">{animatedPercent}%</span><span className="text-[15px] text-neutral-500">{fulfilled ? "gathered" : "of your requirement is covered"}</span></div>
          <div className="mt-6"><FulfillmentBar percent={percentFulfilled} /></div>

          {searching && (
            <div className="mt-6 flex items-start gap-3 rounded-[10px] border border-gold/30 bg-gold-tint-subtle px-5 py-4" role="status">
              <LoaderCircle className="mt-0.5 shrink-0 animate-spin text-gold" size={18} strokeWidth={1.8} />
              <div><p className="text-[15px] font-semibold text-ink">Expanding the farmer network</p><p className="mt-1 text-[13px] text-neutral-600">Reaching <span className="tabular-nums font-semibold">3 known farmers</span> with matching maize. New supply can arrive shortly.</p></div>
            </div>
          )}

          {!fulfilled && !searching && (
            <div className="mt-6 flex flex-col gap-4 rounded-[10px] bg-gold-tint-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="flex items-center gap-2 text-[15px] font-semibold text-ink"><span className="h-2 w-2 rounded-full bg-gold" /><span className="tabular-nums">{gapBags.toLocaleString()}</span> bags remaining</p><p className="mt-1 text-[13px] text-neutral-500">Gather found supply across verified small farmers.</p><p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-green-800"><Users size={14} strokeWidth={1.7} />Expanding the farmer network · 3 previous maize suppliers identified</p></div>
              {canExpand && <Button variant="secondary" onClick={handleCheckProgress}>Check progress <ArrowRight size={16} strokeWidth={1.8} /></Button>}
            </div>
          )}

          {fulfilled && <div className="mt-6 flex flex-col items-start gap-4 rounded-[10px] bg-green-tint-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-green" size={19} strokeWidth={1.8} /><div><p className="text-[15px] font-semibold text-ink">Supply secured</p><p className="mt-1 text-[13px] text-neutral-600">Three historical suppliers responded with the final <span className="tabular-nums font-semibold">310 bags</span>. Your full requirement is ready to consolidate.</p></div></div><Button variant="secondary" onClick={() => setShowOrder(true)} className="w-full shrink-0 sm:w-auto">View consolidated order <ArrowRight size={16} strokeWidth={1.8} /></Button></div>}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="supplier-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="supplier-heading" className="text-[20px] font-semibold text-ink">{fulfilled ? "Supply assembled" : "Supply found so far"}</h2><p className="mt-1 text-[14px] text-neutral-500">{fulfilled ? "Five verified contributions, one dependable bulk order." : `Four verified contributions within ${radiusKm} km. The gap is what Gather works to close.`}</p></div><span className="inline-flex items-center gap-2 text-[13px] text-neutral-500"><Users size={16} className="text-green" strokeWidth={1.7} />{matched.length} supplier{matched.length === 1 ? "" : "s"}</span></div>
        <div className="mt-6"><SupplierBreakdown suppliers={matched} totalBags={totalBags} /></div>
      </section>

      {fulfilled && showOrder && <OrderSummaryCard order={order} request={request} />}
    </main>
  );
}
