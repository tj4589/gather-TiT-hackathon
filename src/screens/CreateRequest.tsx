import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { Logo } from "../components/ui/Logo";
import { clearActiveDemoSession } from "../lib/demoSession";
import { parseRequest, toProcurementRequest, type ParsedRequest } from "../lib/parseRequest";

const DEMO_SENTENCE = "I need 1,030 bags of maize in Kaduna by Monday.";
const CROPS = ["Maize", "Rice", "Tomatoes", "Cassava", "Soybeans"] as const;
const LOCATIONS = ["Kaduna", "Kano", "Benue", "Ogun", "Oyo", "Niger"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type EditingField = "crop" | "quantity" | "location" | "deadline" | null;

export function CreateRequest() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function interpret(sentence: string) {
    const result = parseRequest(sentence);
    if (!result) {
      setError("Couldn't quite catch that — mention a crop, a quantity, and a location.");
      return;
    }
    setError(null);
    setParsed(result);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim()) interpret(text);
  }

  function useDemoRequest() {
    setText(DEMO_SENTENCE);
    interpret(DEMO_SENTENCE);
  }

  function updateParsed(patch: Partial<ParsedRequest>) {
    if (!parsed) return;
    setParsed({ ...parsed, ...patch });
    setEditingField(null);
  }

  function setDeadlineFromWeekday(weekday: string) {
    const idx = WEEKDAYS.findIndex((w) => w === weekday);
    const today = new Date();
    const days = (idx - today.getDay() + 7) % 7;
    updateParsed({ deadlineDays: days, deadlineLabel: weekday });
  }

  function handleConfirm() {
    if (parsed) {
      clearActiveDemoSession();
      navigate("/results", { state: toProcurementRequest(parsed) });
    }
  }

  if (parsed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <Logo variant="hero" height={26} />
        <h1 className="mt-8 font-display text-[32px] font-light leading-[1.2] text-ink">Here&apos;s what we heard</h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {editingField === "crop" ? (
            <select autoFocus className="rounded-[6px] border border-green bg-cream px-3 py-1.5 text-[14px] font-semibold uppercase text-ink outline-none" value={parsed.crop} onChange={(e) => updateParsed({ crop: e.target.value as ParsedRequest["crop"] })} onBlur={() => setEditingField(null)}>
              {CROPS.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
            </select>
          ) : <Chip onClick={() => setEditingField("crop")}>{parsed.crop}</Chip>}

          {editingField === "quantity" ? (
            <input autoFocus type="number" min={1} className="tabular-nums w-32 rounded-[6px] border border-green bg-cream px-3 py-1.5 text-[14px] font-semibold text-ink outline-none" defaultValue={parsed.quantityBags} onBlur={(e) => updateParsed({ quantityBags: Number(e.target.value) || parsed.quantityBags })} />
          ) : <Chip onClick={() => setEditingField("quantity")}><span className="tabular-nums">{parsed.quantityBags.toLocaleString()}</span>&nbsp;bags</Chip>}

          {editingField === "location" ? (
            <select autoFocus className="rounded-[6px] border border-green bg-cream px-3 py-1.5 text-[14px] font-semibold uppercase text-ink outline-none" value={parsed.buyerLocation} onChange={(e) => updateParsed({ buyerLocation: e.target.value })} onBlur={() => setEditingField(null)}>
              {LOCATIONS.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
          ) : <Chip onClick={() => setEditingField("location")}>{parsed.buyerLocation}</Chip>}

          {editingField === "deadline" ? (
            <select autoFocus className="rounded-[6px] border border-green bg-cream px-3 py-1.5 text-[14px] font-semibold uppercase text-ink outline-none" value={parsed.deadlineLabel} onChange={(e) => setDeadlineFromWeekday(e.target.value)} onBlur={() => setEditingField(null)}>
              <option value="today">Today</option><option value="tomorrow">Tomorrow</option>
              {WEEKDAYS.map((weekday) => <option key={weekday} value={weekday}>{weekday}</option>)}
            </select>
          ) : <Chip onClick={() => setEditingField("deadline")}>by {parsed.deadlineLabel}</Chip>}
        </div>

        <p className="mt-6 text-[13px] text-neutral-500">Grade A · sourcing within 50 km — tap anything above to change it</p>
        <div className="mt-10 flex items-center gap-3"><Button variant="secondary" onClick={() => setParsed(null)}>Start over</Button><Button onClick={handleConfirm}>Find supply</Button></div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <Logo variant="hero" height={30} />
      <h1 className="mt-10 font-display text-[40px] font-light leading-[1.08] text-ink sm:text-[48px]">What do you want to buy?</h1>
      <p className="mt-4 text-[17px] font-medium text-neutral-600">Tell us in plain language. We&apos;ll assemble it from fragmented supply across the network.</p>

      <form onSubmit={handleSubmit} className="mt-10 w-full">
        <input ref={inputRef} type="text" value={text} onChange={(e) => { setText(e.target.value); if (error) setError(null); }} placeholder="I need 500 bags of maize in Kaduna by Monday." className="w-full rounded-[10px] border border-neutral-200 bg-white/60 px-6 py-5 text-[18px] font-normal text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-green" />
        <div className="mt-3 flex justify-center"><button type="button" onClick={useDemoRequest} className="text-[13px] font-semibold text-green-800 underline decoration-green/30 underline-offset-4 transition-colors hover:text-green-700">Use demo sentence</button></div>
        {error && <p className="mt-3 text-[13px] font-medium text-[#8a6423]">{error}</p>}
        <div className={`mt-6 transition-opacity duration-150 ${text.trim() ? "opacity-100" : "pointer-events-none opacity-0"}`}><Button type="submit">Continue</Button></div>
      </form>
    </main>
  );
}
