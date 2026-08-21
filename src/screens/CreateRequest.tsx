import { ArrowRight, CalendarDays, Check, MapPin, Sprout, Wheat } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { demoRequest } from "../lib/mockData";
import type { Crop, Grade, ProcurementRequest } from "../lib/types";

const CROPS: Crop[] = ["Maize", "Rice", "Tomatoes", "Cassava", "Soybeans"];
const GRADES: Grade[] = ["Grade A", "Grade B"];
const LOCATIONS = ["Kaduna", "Kano", "Benue", "Ogun", "Oyo", "Niger"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium tracking-[0.01em] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-[10px] border border-neutral-200 bg-cream px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-green focus:ring-2 focus:ring-green/10";

const steps = [
  "Find verified harvests nearby",
  "Reach trusted farmers when there is a gap",
  "Consolidate every contribution into one order",
];

export function CreateRequest() {
  const navigate = useNavigate();
  const [request, setRequest] = useState<ProcurementRequest>(demoRequest);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/results", { state: request });
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20 lg:py-20">
      <section>
        <div className="mb-10 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-green-800"><Sprout size={16} strokeWidth={1.6} />Buyer workspace</div>
          <h1 className="font-display text-[40px] font-light leading-[1.1] text-ink sm:text-[48px]">What do you want to buy?</h1>
          <p className="mt-4 max-w-lg text-[17px] leading-[1.5] text-neutral-500">Tell us what you need. Gather turns fragmented harvests into dependable bulk supply.</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl rounded-[10px] border border-neutral-200 bg-white/30 p-6 sm:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-5">
            <div><p className="text-[15px] font-semibold text-ink">Start with a requirement</p><p className="mt-1 text-[13px] text-neutral-500">Or jump straight into the judge demo.</p></div>
            <button type="button" onClick={() => setRequest(demoRequest)} className="text-[13px] font-semibold text-green-800 underline decoration-green/30 underline-offset-4 transition-colors hover:text-green-700">Use demo request</button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Crop">
              <select className={inputClass} value={request.crop} onChange={(e) => setRequest({ ...request, crop: e.target.value as Crop })}>
                {CROPS.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
              </select>
            </Field>
            <Field label="Grade">
              <select className={inputClass} value={request.grade} onChange={(e) => setRequest({ ...request, grade: e.target.value as Grade })}>
                {GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Quantity (bags)">
                <div className="relative">
                  <Wheat className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={1.6} />
                  <input type="number" min={1} className={`${inputClass} pl-11 tabular-nums`} value={request.quantityBags} onChange={(e) => setRequest({ ...request, quantityBags: Number(e.target.value) })} />
                </div>
              </Field>
            </div>
            <Field label="Delivery location">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={1.6} />
                <select className={`${inputClass} pl-11`} value={request.buyerLocation} onChange={(e) => setRequest({ ...request, buyerLocation: e.target.value })}>
                  {LOCATIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Required date">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={1.6} />
                <input type="date" className={`${inputClass} pl-11 tabular-nums`} value={request.requiredDate} onChange={(e) => setRequest({ ...request, requiredDate: e.target.value })} />
              </div>
            </Field>
          </div>

          <div className="mt-7 border-t border-neutral-200 pt-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[13px] font-medium tracking-[0.01em] text-neutral-500">Starting sourcing radius</span>
              <span className="tabular-nums text-[15px] font-semibold text-ink">{request.radiusKm} km</span>
            </div>
            <input aria-label="Starting sourcing radius in kilometers" type="range" min={10} max={150} step={10} value={request.radiusKm} onChange={(e) => setRequest({ ...request, radiusKm: Number(e.target.value) })} className="mt-4 w-full accent-green" />
            <div className="mt-2 flex justify-between text-[12px] text-neutral-400"><span>10 km</span><span>150 km</span></div>
          </div>

          <Button type="submit" className="mt-8 w-full sm:w-auto">Find my supply <ArrowRight size={17} strokeWidth={1.8} /></Button>
        </form>
      </section>

      <aside className="self-start rounded-[10px] border border-neutral-200 bg-green-tint-subtle p-6 sm:p-7 lg:mt-14">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-green"><Sprout size={21} strokeWidth={1.5} /></div>
        <h2 className="mt-6 font-display text-[28px] font-light leading-[1.2] text-ink">Serious supply, assembled.</h2>
        <p className="mt-3 text-[15px] leading-[1.5] text-neutral-600">You set the requirement. Gather does the work of finding the right harvests and making them one dependable order.</p>
        <ol className="mt-7 flex flex-col gap-5">
          {steps.map((step, index) => <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green/30 text-[12px] font-semibold tabular-nums text-green-800">{index + 1}</span><span className="pt-0.5 text-[14px] leading-[1.4] text-neutral-600">{step}</span></li>)}
        </ol>
        <div className="mt-8 flex items-center gap-2 border-t border-green/15 pt-5 text-[13px] text-neutral-500"><Check size={15} className="text-green" strokeWidth={2} />Verified farmer network</div>
      </aside>
    </main>
  );
}
