import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BatteryFull, CalendarDays, Check, ChevronRight, CircleCheck,
  Coins, MapPin, Mic, MicOff, Package, Phone, Signal, Volume2, Wifi, X,
} from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { DEMO_TRANSCRIPT, apiBaseUrl, interpretSupply, supplyPayload, type SupplyDraft } from "../lib/supplyInterpreter";

type Screen = "entry" | "call" | "understood" | "success";
type SpeechRecognitionResult = { [index: number]: { transcript: string } };
type SpeechRecognizer = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [index: number]: SpeechRecognitionResult } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognizerConstructor = new () => SpeechRecognizer;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognizerConstructor;
    webkitSpeechRecognition?: SpeechRecognizerConstructor;
  }
}

function formatNaira(value: number) {
  return `NGN ${value.toLocaleString("en-NG")}`;
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 text-[11px] font-semibold text-ink">
      <span className="tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5 text-neutral-600"><Signal size={14} strokeWidth={1.8} /><Wifi size={14} strokeWidth={1.8} /><BatteryFull size={16} strokeWidth={1.8} /></div>
    </div>
  );
}

function CallHeader({ onEnd }: { onEnd: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6">
      <button aria-label="End call" onClick={onEnd} className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100"><X size={20} /></button>
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-neutral-500">Gather line</span>
      <span className="w-9" />
    </div>
  );
}

function CallAvatar() {
  return <div className="relative mx-auto mt-10 flex h-24 w-24 items-center justify-center rounded-full border border-green/20 bg-green-tint-soft"><div className="absolute inset-2 rounded-full border border-green/30" /><Logo variant="mark" height={40} /></div>;
}

function SupplyCard({ draft }: { draft: SupplyDraft }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const details = [
    { icon: Package, label: "Harvest", value: `${draft.quantity.toLocaleString()} ${draft.unit}` },
    { icon: MapPin, label: "Location", value: draft.location },
    { icon: Coins, label: "Price", value: `${formatNaira(draft.price_per_unit)} per ${draft.unit.replace(/s$/, "")}` },
    { icon: CalendarDays, label: "Ready", value: draft.available_date === tomorrow.toISOString().slice(0, 10) ? "Tomorrow" : draft.available_date },
  ];
  return (
    <div className="overflow-hidden rounded-[10px] border border-neutral-200 bg-cream">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[12px] font-medium uppercase tracking-[0.1em] text-neutral-500">Gather understood</p><h2 className="mt-1 font-display text-[27px] font-medium capitalize leading-tight text-ink">{draft.crop}</h2></div><CircleCheck className="text-green" size={26} strokeWidth={1.7} /></div>
      <div className="grid grid-cols-2 divide-x divide-y divide-neutral-200">{details.map(({ icon: Icon, label, value }) => <div key={label} className="flex min-h-[88px] flex-col justify-center gap-2 px-5 py-4"><div className="flex items-center gap-2 text-neutral-500"><Icon size={15} strokeWidth={1.7} /><span className="text-[12px] font-medium">{label}</span></div><span className="text-[16px] font-semibold capitalize tabular-nums text-ink">{value}</span></div>)}</div>
    </div>
  );
}

export function FarmerIntake() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [seconds, setSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedResponse, setTypedResponse] = useState("");
  const [draft, setDraft] = useState<SupplyDraft | null>(null);
  const [error, setError] = useState("");
  const [submissionMode, setSubmissionMode] = useState<"backend" | "demo" | null>(null);
  const recognitionRef = useRef<SpeechRecognizer | null>(null);
  const recognitionAvailable = useMemo(() => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition), []);

  useEffect(() => {
    if (screen !== "call") return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance("Welcome to Gather. Tell me what produce you have available for sale."));
    return () => { window.clearInterval(timer); window.speechSynthesis?.cancel(); };
  }, [screen]);

  function beginCall() { setSeconds(0); setTranscript(""); setTypedResponse(""); setDraft(null); setError(""); setSubmissionMode(null); setScreen("call"); }
  function endCall() { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); setIsListening(false); setScreen("entry"); }
  function interpret(transcriptValue: string) {
    setTranscript(transcriptValue);
    const interpreted = interpretSupply(transcriptValue);
    if (!interpreted) { setError("I could not catch all the details. Try the demo response or say the whole harvest again."); return; }
    setError(""); setDraft(interpreted); setScreen("understood");
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance("I have understood your harvest. Please check the details."));
  }
  function useDemoResponse() { interpret(DEMO_TRANSCRIPT); }
  function startListening() {
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) { setError("Speech recognition is not available in this browser. Use the demo response below."); return; }
    const recognition = new Constructor();
    recognition.lang = "en-NG"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onresult = (event) => { const result = event.results[0][0].transcript; setIsListening(false); interpret(result); };
    recognition.onerror = () => { setIsListening(false); setError("I could not hear that. Try again or use the demo response."); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition; setError(""); setIsListening(true); recognition.start();
  }
  function useTypedResponse() { interpret(typedResponse); }
  async function confirmHarvest() {
    if (!draft) return;
    const payload = supplyPayload(draft);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/supplies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`Supply API returned ${response.status}`);
      setSubmissionMode("backend");
    } catch { setSubmissionMode("demo"); }
    setScreen("success");
  }

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <main className="min-h-[calc(100vh-65px)] bg-cream px-4 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[10px] border border-neutral-200 bg-[#fffaf3] sm:min-h-[720px]"><StatusBar />
        {screen === "entry" && <section className="px-5 pb-8 pt-9"><div className="flex items-center justify-between"><Logo variant="nav" height={29} /><span className="rounded-[6px] bg-green-tint-soft px-2.5 py-1 text-[12px] font-medium text-green-800">Farmer line</span></div><div className="mt-16"><p className="text-[13px] font-medium uppercase tracking-[0.12em] text-green">Gather voice</p><h1 className="mt-3 font-display text-[40px] font-light leading-[1.08] text-ink">Sell what you have.</h1><p className="mt-4 max-w-[330px] text-[17px] leading-[1.5] text-neutral-500">Tell Gather about your harvest in your own words. We turn it into supply buyers can find.</p></div><div className="mt-10 rounded-[10px] border border-neutral-200 bg-cream px-5 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-cream"><Phone size={18} fill="currentColor" /></div><div><p className="font-semibold text-ink">Gather line</p><p className="text-[13px] text-neutral-500">A simple conversation, no forms</p></div></div><div className="mt-5 flex items-center gap-2 border-t border-neutral-200 pt-4 text-[13px] text-neutral-600"><Volume2 size={15} className="text-green" /> Speak naturally, or use the demo response.</div></div><Button onClick={beginCall} className="mt-7 h-14 w-full text-[16px]"><Phone size={18} fill="currentColor" /> Call Gather</Button><p className="mt-4 text-center text-[12px] text-neutral-400">small harvests. serious supply.</p></section>}

        {screen === "call" && <section className="px-5 pb-8"><CallHeader onEnd={endCall} /><CallAvatar /><div className="mt-5 text-center"><h1 className="font-display text-[28px] font-medium text-ink">Gather</h1><p className="mt-1 text-[13px] tabular-nums text-neutral-500">{timer} | Connected</p></div><div className="mt-10 rounded-[10px] border border-neutral-200 bg-cream px-5 py-5 text-center"><p className="text-[12px] font-medium uppercase tracking-[0.1em] text-neutral-500">Gather is listening</p><p className="mt-3 text-[18px] leading-[1.45] text-ink">Tell me what produce you have available for sale.</p><div className={`mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-full ${isListening ? "bg-green text-cream" : "bg-green-tint-soft text-green"}`}>{isListening ? <Mic size={22} /> : <Volume2 size={22} />}</div></div><div className="mt-5 flex flex-col gap-3"><button onClick={startListening} className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-green bg-transparent text-[15px] font-medium text-green transition-colors hover:bg-green-tint-subtle">{isListening ? <MicOff size={18} /> : <Mic size={18} />}{isListening ? "Listening..." : recognitionAvailable ? "Speak your harvest" : "Speak (browser unavailable)"}</button><button onClick={useDemoResponse} className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-green text-[15px] font-medium text-cream transition-colors hover:bg-green-700"><ChevronRight size={18} /> Use demo response</button></div><div className="mt-5 border-t border-neutral-200 pt-5"><label className="text-[12px] font-medium text-neutral-500" htmlFor="typed-response">Or type what you have</label><div className="mt-2 flex gap-2"><input id="typed-response" value={typedResponse} onChange={(event) => setTypedResponse(event.target.value)} placeholder="I have 310 bags of maize..." className="min-w-0 flex-1 rounded-[10px] border border-neutral-200 bg-cream px-3 py-2.5 text-[13px] outline-none focus:border-green" /><button onClick={useTypedResponse} aria-label="Interpret typed response" className="rounded-[10px] border border-neutral-300 px-3 text-green hover:bg-green-tint-subtle"><ArrowLeft className="rotate-180" size={17} /></button></div></div>{error && <p className="mt-4 text-center text-[13px] text-neutral-600">{error}</p>}</section>}

        {screen === "understood" && draft && <section className="px-5 pb-8 pt-6"><CallHeader onEnd={endCall} /><div className="mt-8"><p className="text-[12px] font-medium uppercase tracking-[0.12em] text-green">Your harvest</p><h1 className="mt-2 font-display text-[32px] font-light leading-tight text-ink">Does this sound right?</h1></div><div className="mt-6 rounded-[10px] border border-neutral-200 bg-green-tint-subtle px-5 py-4"><p className="text-[12px] font-medium uppercase tracking-[0.1em] text-neutral-500">You said</p><p className="mt-2 text-[16px] italic leading-[1.45] text-ink">"{transcript}"</p></div><div className="mt-5"><SupplyCard draft={draft} /></div><Button onClick={confirmHarvest} className="mt-7 h-14 w-full text-[16px]"><Check size={19} /> Confirm harvest</Button><button onClick={beginCall} className="mt-4 flex w-full items-center justify-center gap-2 py-2 text-[14px] font-medium text-green hover:text-green-800"><ArrowLeft size={16} /> Say it again</button></section>}

        {screen === "success" && draft && <section className="px-5 pb-8 pt-16 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green text-cream"><Check size={30} strokeWidth={2} /></div><h1 className="mt-7 font-display text-[34px] font-light leading-tight text-ink">Harvest shared.</h1><p className="mx-auto mt-3 max-w-[310px] text-[16px] leading-[1.5] text-neutral-500">Gather has your {draft.quantity} bags of {draft.crop}. Buyers can now count it as available supply.</p><div className="mt-8 text-left"><SupplyCard draft={draft} /></div><div className="mt-5 flex items-start gap-3 rounded-[10px] border border-neutral-200 bg-cream px-4 py-4 text-left"><CircleCheck size={18} className="mt-0.5 shrink-0 text-green" /><p className="text-[13px] leading-[1.45] text-neutral-600">{submissionMode === "backend" ? "Saved to Gather supply." : "Demo saved on this device. Connect the Gather API to publish it to the live supply network."}</p></div><Button variant="secondary" onClick={beginCall} className="mt-8 h-12 w-full"><Phone size={17} /> Call again</Button></section>}
      </div>
    </main>
  );
}
