import { useEffect, useRef, useState } from "react";
import { Phone, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { callScript, capturedSupply, type CallLine } from "../lib/farmerScript";

type CallState = "idle" | "ringing" | "connected" | "ended";

function speakingDelay(text: string) {
  return Math.min(2200, Math.max(900, 500 + text.length * 30));
}

export function FarmerIntake() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [visibleLines, setVisibleLines] = useState<CallLine[]>([]);
  const [speaker, setSpeaker] = useState<CallLine["speaker"] | null>(null);
  const [seconds, setSeconds] = useState(0);

  const timeouts = useRef<number[]>([]);
  const interval = useRef<number | undefined>(undefined);
  const cancelled = useRef(false);

  function clearAllTimers() {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
    if (interval.current) window.clearInterval(interval.current);
  }

  useEffect(() => {
    return () => {
      cancelled.current = true;
      clearAllTimers();
    };
  }, []);

  function playLine(index: number) {
    if (cancelled.current) return;
    if (index >= callScript.length) {
      const t = window.setTimeout(() => {
        if (cancelled.current) return;
        clearAllTimers();
        setCallState("ended");
        setSpeaker(null);
      }, 800);
      timeouts.current.push(t);
      return;
    }

    const line = callScript[index];
    setSpeaker(line.speaker);

    const t = window.setTimeout(() => {
      if (cancelled.current) return;
      setVisibleLines((prev) => [...prev, line]);
      setSpeaker(null);
      const gap = window.setTimeout(() => playLine(index + 1), 450);
      timeouts.current.push(gap);
    }, speakingDelay(line.text));
    timeouts.current.push(t);
  }

  function startCall() {
    cancelled.current = false;
    setVisibleLines([]);
    setSeconds(0);
    setCallState("ringing");

    const ringTimeout = window.setTimeout(() => {
      if (cancelled.current) return;
      setCallState("connected");
      interval.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      );
      playLine(0);
    }, 1100);
    timeouts.current.push(ringTimeout);
  }

  function resetCall() {
    cancelled.current = true;
    clearAllTimers();
    setCallState("idle");
    setVisibleLines([]);
    setSpeaker(null);
    setSeconds(0);
  }

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col items-center px-6 py-14 text-center">
      <Logo variant="mark" height={44} />

      <h1 className="font-display mt-6 text-[28px] font-light leading-[1.2] text-ink">
        Add supply by phone
      </h1>
      <p className="mt-2 text-[15px] text-neutral-500">
        No app required — a farmer just calls and talks.
      </p>

      {/* idle */}
      {callState === "idle" && (
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-tint-soft">
            <Phone size={26} strokeWidth={1.5} className="text-green-800" />
          </div>
          <Button onClick={startCall}>Call gather</Button>
        </div>
      )}

      {/* ringing / connected / ended */}
      {callState !== "idle" && (
        <div className="mt-10 w-full">
          <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-neutral-500">
            {callState === "ringing" && <span>Calling gather…</span>}
            {callState === "connected" && (
              <>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
                <span>gather</span>
                <span className="tabular-nums">· {duration}</span>
              </>
            )}
            {callState === "ended" && <span>Call ended · {duration}</span>}
          </div>

          {/* transcript */}
          <div className="mt-8 flex flex-col gap-5 text-left">
            {visibleLines.map((line, i) => (
              <div key={i}>
                <p
                  className={`text-[12px] font-semibold uppercase tracking-[0.04em] ${
                    line.speaker === "gather"
                      ? "text-green-800"
                      : "text-neutral-400"
                  }`}
                >
                  {line.speaker === "gather" ? "gather" : "Farmer"}
                </p>
                <p className="mt-1 text-[17px] leading-[1.5] text-ink">
                  {line.text}
                </p>
              </div>
            ))}

            {speaker && (
              <div>
                <p
                  className={`text-[12px] font-semibold uppercase tracking-[0.04em] ${
                    speaker === "gather" ? "text-green-800" : "text-neutral-400"
                  }`}
                >
                  {speaker === "gather" ? "gather" : "Farmer"}
                </p>
                <div className="mt-2 flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* supply added */}
          {callState === "ended" && (
            <div className="mt-10 rounded-[10px] border border-neutral-200 px-6 py-6">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <CheckCircle2 size={20} strokeWidth={1.5} />
                <span className="text-[15px] font-semibold">Supply added</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">
                    Crop
                  </p>
                  <p className="text-[15px] font-medium text-ink">
                    {capturedSupply.crop}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">
                    Quantity
                  </p>
                  <p className="tabular-nums text-[15px] font-medium text-ink">
                    {capturedSupply.bags} bags
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">
                    Location
                  </p>
                  <p className="text-[15px] font-medium text-ink">
                    {capturedSupply.location}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-neutral-400">
                    Availability
                  </p>
                  <p className="text-[15px] font-medium text-ink">
                    {capturedSupply.availability}
                  </p>
                </div>
              </div>
            </div>
          )}

          {callState === "ended" && (
            <div className="mt-8">
              <Button variant="secondary" onClick={resetCall}>
                Simulate another call
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
