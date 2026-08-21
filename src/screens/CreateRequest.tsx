import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { demoRequest } from "../lib/mockData";
import type { Crop, Grade, ProcurementRequest } from "../lib/types";

const CROPS: Crop[] = ["Maize", "Rice", "Tomatoes", "Cassava", "Soybeans"];
const GRADES: Grade[] = ["Grade A", "Grade B"];
const LOCATIONS = ["Kaduna", "Kano", "Benue", "Ogun", "Oyo", "Niger"];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium tracking-[0.01em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-[10px] border border-neutral-200 bg-cream px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-green";

export function CreateRequest() {
  const navigate = useNavigate();
  const [request, setRequest] = useState<ProcurementRequest>(demoRequest);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate("/results", { state: request });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display font-light text-[40px] leading-[1.1] text-ink">
        What do you want to buy?
      </h1>
      <p className="mt-3 text-[17px] text-neutral-500">
        Tell us what you need. We'll assemble it from fragmented supply
        across the network.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Crop">
            <select
              className={inputClass}
              value={request.crop}
              onChange={(e) =>
                setRequest({ ...request, crop: e.target.value as Crop })
              }
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Grade">
            <select
              className={inputClass}
              value={request.grade}
              onChange={(e) =>
                setRequest({ ...request, grade: e.target.value as Grade })
              }
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Quantity (bags)">
          <input
            type="number"
            min={1}
            className={`${inputClass} tabular-nums`}
            value={request.quantityBags}
            onChange={(e) =>
              setRequest({
                ...request,
                quantityBags: Number(e.target.value),
              })
            }
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Delivery location">
            <select
              className={inputClass}
              value={request.buyerLocation}
              onChange={(e) =>
                setRequest({ ...request, buyerLocation: e.target.value })
              }
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Needed within (days)">
            <input
              type="number"
              min={1}
              className={`${inputClass} tabular-nums`}
              value={request.deadlineDays}
              onChange={(e) =>
                setRequest({
                  ...request,
                  deadlineDays: Number(e.target.value),
                })
              }
            />
          </Field>
        </div>

        <Field label={`Sourcing radius: ${request.radiusKm} km`}>
          <input
            type="range"
            min={10}
            max={150}
            step={10}
            value={request.radiusKm}
            onChange={(e) =>
              setRequest({ ...request, radiusKm: Number(e.target.value) })
            }
            className="w-full accent-green"
          />
        </Field>

        <Button type="submit" className="mt-4 self-start">
          Find supply
        </Button>
      </form>
    </main>
  );
}
