import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { FeaturePhone } from "../components/FeaturePhone";
import { callScript, capturedSupply, type CallLine } from "../lib/farmerScript";

type CallState = "idle" | "dialing" | "ringing" | "connected" | "ended";

function speakingDelay(text: string) {
  return Math.min(2400, Math.max(1000, 600 + text.length * 32));
}

/** Animated voice level bars — the only "UI" during a voice call. */
function VoiceBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-6 items-end justify-center gap-[3px]">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm bg-[#3d4a38] transition-all duration-200 ${
            active ? "animate-[voice_0.6s_ease-in-out_infinite]" : "h-[3px]"
          }`}
          style={
            active
              ? {
                  animationDelay: `${i * 80}ms`,
                  height: `${8 + ((i * 7) % 16)}px`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

export function FarmerIntake() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [lineIndex, setLineIndex] = useState(-1);
  const [speaker, setSpeaker] = useState<CallLine["speaker"] | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [dialed, setDialed] = useState("");

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
        setLineIndex(-1);
      }, 900);
      timeouts.current.push(t);
      return;
    }

    const line = callScript[index];
    setLineIndex(index);
    setSpeaker(line.speaker);

    const t = window.setTimeout(() => {
      if (cancelled.current) return;
      setSpeaker(null);
      const gap = window.setTimeout(() => playLine(index + 1), 350);
      timeouts.current.push(gap);
    }, speakingDelay(line.text));
    timeouts.current.push(t);
  }

  function startCall() {
    cancelled.current = false;
    setSeconds(0);
    setLineIndex(-1);
    setDialed("");
    setCallState("dialing");

    // type the number out on the keypad
    const number = "*247#";
    number.split("").forEach((_, i) => {
      const t = window.setTimeout(() => {
        if (cancelled.current) return;
        setDialed(number.slice(0, i + 1));
      }, 220 * (i + 1));
      timeouts.current.push(t);
    });

    const ring = window.setTimeout(() => {
      if (cancelled.current) return;
      setCallState("ringing");
    }, 220 * number.length + 400);
    timeouts.current.push(ring);

    const connect = window.setTimeout(() => {
      if (cancelled.current) return;
      setCallState("connected");
      interval.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      );
      playLine(0);
    }, 220 * number.length + 1900);
    timeouts.current.push(connect);
  }

  function resetCall() {
    cancelled.current = true;
    clearAllTimers();
    setCallState("idle");
    setSpeaker(null);
    setLineIndex(-1);
    setSeconds(0);
    setDialed("");
  }

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

  const currentLine = lineIndex >= 0 ? callScript[lineIndex] : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="text-center">
        <h1 className="font-display text-[32px] font-light leading-[1.2] text-ink">
          No smartphone required
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-neutral-500">
          A farmer dials a short code from any phone and speaks. gather
          listens, confirms, and adds the supply to the network.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-12 md:grid-cols-[280px_1fr] md:justify-center">
        {/* the phone */}
        <FeaturePhone keypadGlow={callState === "dialing"}>
          {callState === "idle" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between text-[9px] font-medium text-[#3d4a38]">
                <span>▮▮▮</span>
                <span>gather</span>
                <span className="tabular-nums">▮</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-1">
                <p className="text-[11px] text-[#3d4a38]">Dial</p>
                <p className="tabular-nums text-[22px] font-semibold tracking-[0.08em] text-[#26301f]">
                  *247#
                </p>
              </div>
              <p className="text-center text-[9px] text-[#4d5a48]">
                Standard call rates apply
              </p>
            </div>
          )}

          {callState === "dialing" && (
            <div className="flex h-full flex-col items-center justify-center">
              <p className="tabular-nums text-[26px] font-semibold tracking-[0.1em] text-[#26301f]">
                {dialed}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          )}

          {callState === "ringing" && (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-[15px] font-semibold text-[#26301f]">gather</p>
              <p className="text-[11px] text-[#3d4a38]">Calling…</p>
            </div>
          )}

          {callState === "connected" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between text-[9px] font-medium text-[#3d4a38]">
                <span>gather</span>
                <span className="tabular-nums">{duration}</span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4d5a48]">
                  {speaker === "farmer" ? "You" : "gather"}
                </p>
                <VoiceBars active={!!speaker} />
                {currentLine && (
                  <p className="text-center text-[12px] leading-[1.45] text-[#26301f]">
                    {currentLine.speaker === "farmer" ? "" : ""}
                    {currentLine.text}
                  </p>
                )}
              </div>

              <p className="text-center text-[9px] text-[#4d5a48]">
                Voice · English
              </p>
            </div>
          )}

          {callState === "ended" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between text-[9px] font-medium text-[#3d4a38]">
                <span>gather</span>
                <span className="tabular-nums">{duration}</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <p className="text-[11px] text-[#3d4a38]">Call ended</p>
                <div className="w-full rounded-[4px] border border-[#8fa382] px-2 py-2 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4d5a48]">
                    Supply added
                  </p>
                  <p className="tabular-nums mt-1 text-[13px] font-semibold text-[#26301f]">
                    {capturedSupply.bags} bags · {capturedSupply.crop}
                  </p>
                  <p className="text-[10px] text-[#3d4a38]">
                    {capturedSupply.location} · tomorrow
                  </p>
                </div>
                <p className="text-[9px] text-[#4d5a48]">SMS confirmation sent</p>
              </div>
            </div>
          )}
        </FeaturePhone>

        {/* what gather captured, alongside */}
        <div className="flex flex-col">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-400">
            What gather captured
          </p>

          <div className="mt-4 flex flex-col divide-y divide-neutral-200 border-y border-neutral-200">
            {[
              ["Crop", capturedSupply.crop],
              ["Quantity", `${capturedSupply.bags} bags`],
              ["Location", capturedSupply.location],
              ["Availability", capturedSupply.availability],
            ].map(([label, value], i) => {
              // reveal each field as the call reaches it
              const revealedAt = [1, 1, 3, 5];
              const revealed =
                callState === "ended" || lineIndex >= revealedAt[i];
              return (
                <div
                  key={label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-[13px] text-neutral-500">{label}</span>
                  <span
                    className={`tabular-nums text-[15px] font-medium transition-opacity duration-300 ${
                      revealed
                        ? "text-ink opacity-100"
                        : "text-neutral-300 opacity-40"
                    }`}
                  >
                    {revealed ? value : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            {callState === "idle" && (
              <Button onClick={startCall}>Play the call</Button>
            )}
            {callState === "ended" && (
              <Button variant="secondary" onClick={resetCall}>
                Play again
              </Button>
            )}
            {callState !== "idle" && callState !== "ended" && (
              <p className="text-[13px] text-neutral-400">Call in progress…</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
