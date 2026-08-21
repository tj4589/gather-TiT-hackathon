import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { FeaturePhone } from "../components/FeaturePhone";
import {
  callScript,
  rejectedCallScript,
  capturedSupply,
  verifiedFarmer,
  verifiedFarmerId,
  unverifiedFarmerId,
  type CallLine,
} from "../lib/farmerScript";

type CallState = "idle" | "dialing" | "ringing" | "connected" | "ended";
type Path = "verified" | "rejected";

function speakingDelay(text: string) {
  return Math.min(2500, Math.max(1000, 620 + text.length * 30));
}

function VoiceBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-5 items-center justify-center gap-[3px]">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-sm bg-[#3d4a38]"
          style={
            active
              ? {
                  height: `${9 + ((i * 7) % 12)}px`,
                  animation: "voice 0.6s ease-in-out infinite",
                  animationDelay: `${i * 80}ms`,
                }
              : { height: "3px" }
          }
        />
      ))}
    </div>
  );
}

export function FarmerIntake() {
  const [path, setPath] = useState<Path>("verified");
  const [callState, setCallState] = useState<CallState>("idle");
  const [lineIndex, setLineIndex] = useState(-1);
  const [speaker, setSpeaker] = useState<CallLine["speaker"] | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [dialed, setDialed] = useState("");

  const timeouts = useRef<number[]>([]);
  const interval = useRef<number | undefined>(undefined);
  const cancelled = useRef(false);

  const script = path === "verified" ? callScript : rejectedCallScript;

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

  function playLine(index: number, activeScript: CallLine[]) {
    if (cancelled.current) return;
    if (index >= activeScript.length) {
      const t = window.setTimeout(() => {
        if (cancelled.current) return;
        clearAllTimers();
        setCallState("ended");
        setSpeaker(null);
      }, 900);
      timeouts.current.push(t);
      return;
    }

    const line = activeScript[index];
    setLineIndex(index);
    setSpeaker(line.speaker);

    const hold = line.stage === "verifying" ? 1500 : speakingDelay(line.text);

    const t = window.setTimeout(() => {
      if (cancelled.current) return;
      setSpeaker(null);
      const gap = window.setTimeout(
        () => playLine(index + 1, activeScript),
        340
      );
      timeouts.current.push(gap);
    }, hold);
    timeouts.current.push(t);
  }

  function startCall(which: Path) {
    cancelled.current = false;
    setPath(which);
    setSeconds(0);
    setLineIndex(-1);
    setDialed("");
    setCallState("dialing");

    const number = "*247#";
    number.split("").forEach((_, i) => {
      const t = window.setTimeout(() => {
        if (cancelled.current) return;
        setDialed(number.slice(0, i + 1));
      }, 200 * (i + 1));
      timeouts.current.push(t);
    });

    const ring = window.setTimeout(() => {
      if (cancelled.current) return;
      setCallState("ringing");
    }, 200 * number.length + 380);
    timeouts.current.push(ring);

    const connect = window.setTimeout(() => {
      if (cancelled.current) return;
      setCallState("connected");
      interval.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      );
      playLine(0, which === "verified" ? callScript : rejectedCallScript);
    }, 200 * number.length + 1800);
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

  const currentLine = lineIndex >= 0 ? script[lineIndex] : null;
  const stage = currentLine?.stage;
  const reachedStage = (s: NonNullable<CallLine["stage"]>) =>
    script.slice(0, lineIndex + 1).some((l) => l.stage === s);

  const isRejected = path === "rejected" && reachedStage("rejected");
  const identityVerified = path === "verified" && reachedStage("verified");
  const registered = path === "verified" && reachedStage("registered");
  const screenTint = isRejected ? "red" : stage === "verifying" ? "amber" : "green";

  // supply fields resolve as the farmer answers each question
  const supplyRevealAt = { crop: 7, quantity: 7, location: 9, availability: 11 };
  const revealed = (at: number) =>
    path === "verified" && (callState === "ended" || lineIndex >= at);

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          Farmer intake
        </p>
        <h1 className="font-display mt-2 text-[34px] font-light leading-[1.15] text-ink">
          No smartphone required
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-[1.55] text-neutral-500">
          A farmer dials a short code from any phone. gather verifies their
          identity against the NDDF register, then captures their supply by
          voice.
        </p>
      </div>

      <div className="mt-14 grid items-start gap-14 md:grid-cols-[232px_1fr] md:justify-center">
        <FeaturePhone
          keypadGlow={callState === "dialing"}
          screenTint={screenTint}
        >
          {callState === "idle" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between text-[8px] font-medium text-[#3d4a38]">
                <span>▮▮▮</span>
                <span>MTN NG</span>
                <span>▮</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-1">
                <p className="text-[10px] text-[#3d4a38]">Dial</p>
                <p className="tabular-nums text-[20px] font-semibold tracking-[0.08em] text-[#26301f]">
                  *247#
                </p>
              </div>
              <p className="text-center text-[8px] text-[#4d5a48]">
                Standard call rates apply
              </p>
            </div>
          )}

          {callState === "dialing" && (
            <div className="flex h-full items-center justify-center">
              <p className="tabular-nums text-[23px] font-semibold tracking-[0.1em] text-[#26301f]">
                {dialed}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          )}

          {callState === "ringing" && (
            <div className="flex h-full flex-col items-center justify-center gap-1.5">
              <p className="text-[14px] font-semibold text-[#26301f]">gather</p>
              <p className="text-[10px] text-[#3d4a38]">Calling…</p>
            </div>
          )}

          {callState === "connected" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between text-[8px] font-medium text-[#3d4a38]">
                <span>gather</span>
                <span className="tabular-nums">{duration}</span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-0.5">
                {stage === "verifying" ? (
                  <>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#5b5433]">
                      NDDF
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5b5433]"
                          style={{ animationDelay: `${i * 140}ms` }}
                        />
                      ))}
                    </div>
                    <p className="text-center text-[11px] leading-[1.4] text-[#3f3a1f]">
                      Checking the register…
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-[0.1em] ${
                        isRejected ? "text-[#6d3b32]" : "text-[#4d5a48]"
                      }`}
                    >
                      {speaker === "farmer" ? "You" : "gather"}
                    </p>
                    <VoiceBars active={!!speaker} />
                    {currentLine && (
                      <p
                        className={`text-center text-[11px] leading-[1.45] ${
                          isRejected ? "text-[#4a221b]" : "text-[#26301f]"
                        }`}
                      >
                        {currentLine.text}
                      </p>
                    )}
                  </>
                )}
              </div>

              <p
                className={`text-center text-[8px] ${
                  isRejected ? "text-[#6d3b32]" : "text-[#4d5a48]"
                }`}
              >
                {isRejected ? "Not verified" : "Voice · English"}
              </p>
            </div>
          )}

          {callState === "ended" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between text-[8px] font-medium text-[#3d4a38]">
                <span>gather</span>
                <span className="tabular-nums">{duration}</span>
              </div>

              {path === "rejected" ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <p className="text-[10px] text-[#6d3b32]">Call ended</p>
                  <div className="w-full rounded-[4px] border border-[#a8776c] px-2 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6d3b32]">
                      Not verified
                    </p>
                    <p className="mt-1 text-[11px] leading-[1.35] text-[#4a221b]">
                      ID not on NDDF register
                    </p>
                  </div>
                  <p className="text-[8px] text-[#6d3b32]">No supply added</p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
                  <p className="text-[10px] text-[#3d4a38]">Call ended</p>
                  <div className="w-full rounded-[4px] border border-[#8fa382] px-2 py-1.5 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4d5a48]">
                      Supply added
                    </p>
                    <p className="tabular-nums mt-0.5 text-[12px] font-semibold text-[#26301f]">
                      {capturedSupply.bags} bags · {capturedSupply.crop}
                    </p>
                    <p className="text-[9px] text-[#3d4a38]">
                      {capturedSupply.location} · tomorrow
                    </p>
                  </div>
                  <p className="text-[8px] text-[#4d5a48]">
                    SMS confirmation sent
                  </p>
                </div>
              )}
            </div>
          )}
        </FeaturePhone>

        {/* side panel */}
        <div className="flex flex-col">
          {/* identity */}
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-400">
            Identity · NDDF
          </p>
          <div className="mt-4 rounded-[10px] border border-neutral-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-neutral-500">Farmer ID</span>
              <span className="tabular-nums text-[15px] font-medium text-ink">
                {callState === "idle"
                  ? "—"
                  : path === "verified"
                    ? verifiedFarmerId
                    : unverifiedFarmerId}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="text-[13px] text-neutral-500">Status</span>
              {isRejected ? (
                <span className="rounded-[6px] bg-[#f2e2dd] px-2.5 py-1 text-[13px] font-semibold text-[#8a3f30]">
                  Not on register
                </span>
              ) : identityVerified ? (
                <span className="rounded-[6px] bg-green-tint-soft px-2.5 py-1 text-[13px] font-semibold text-green-800">
                  Verified
                </span>
              ) : stage === "verifying" ? (
                <span className="rounded-[6px] bg-gold-tint-soft px-2.5 py-1 text-[13px] font-semibold text-[#8a6423]">
                  Checking…
                </span>
              ) : (
                <span className="text-[15px] text-neutral-300">—</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="text-[13px] text-neutral-500">
                Name on record
              </span>
              <span
                className={`text-[15px] font-medium transition-opacity duration-300 ${
                  identityVerified
                    ? "text-ink opacity-100"
                    : "text-neutral-300 opacity-50"
                }`}
              >
                {identityVerified ? verifiedFarmer.name : "—"}
              </span>
            </div>

            {registered && (
              <p className="mt-4 rounded-[6px] bg-green-tint-subtle px-3 py-2 text-[13px] text-green-800">
                gather farmer ID created for {verifiedFarmer.name}.
              </p>
            )}
            {isRejected && (
              <p className="mt-4 rounded-[6px] bg-[#faf0ed] px-3 py-2 text-[13px] text-[#8a3f30]">
                Cannot proceed — caller is not a registered farmer.
              </p>
            )}
          </div>

          {/* supply */}
          <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-400">
            Supply captured
          </p>
          <div
            className={`mt-4 flex flex-col divide-y divide-neutral-200 border-y border-neutral-200 transition-opacity duration-300 ${
              path === "rejected" && callState !== "idle"
                ? "opacity-35"
                : "opacity-100"
            }`}
          >
            {(
              [
                ["Crop", capturedSupply.crop, supplyRevealAt.crop],
                ["Quantity", `${capturedSupply.bags} bags`, supplyRevealAt.quantity],
                ["Location", capturedSupply.location, supplyRevealAt.location],
                [
                  "Availability",
                  capturedSupply.availability,
                  supplyRevealAt.availability,
                ],
              ] as const
            ).map(([label, value, at]) => {
              const show = revealed(at);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-[13px] text-neutral-500">{label}</span>
                  <span
                    className={`tabular-nums text-[15px] font-medium transition-opacity duration-300 ${
                      show ? "text-ink opacity-100" : "text-neutral-300 opacity-40"
                    }`}
                  >
                    {show ? value : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* controls */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {callState === "idle" && (
              <>
                <Button onClick={() => startCall("verified")}>
                  Play verified call
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => startCall("rejected")}
                >
                  Play unverified call
                </Button>
              </>
            )}
            {callState === "ended" && (
              <Button variant="secondary" onClick={resetCall}>
                Reset
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
