import type { ReactNode } from "react";

/**
 * A slim feature phone rendered with layered gradients + inset highlights
 * for dimensionality. Deliberately not a smartphone — the farmer's
 * channel is a keypad and a small screen, no app.
 */
export function FeaturePhone({
  children,
  keypadGlow,
  screenTint = "green",
}: {
  children: ReactNode;
  keypadGlow?: boolean;
  screenTint?: "green" | "amber" | "red";
}) {
  const screenBg =
    screenTint === "red"
      ? "linear-gradient(160deg,#d8c4bc 0%,#cbb5ac 100%)"
      : screenTint === "amber"
        ? "linear-gradient(160deg,#dbcfb0 0%,#cdbf9c 100%)"
        : "linear-gradient(160deg,#ccd8c0 0%,#bccbae 100%)";

  return (
    <div className="mx-auto w-[232px] select-none [perspective:1200px]">
      <div
        className="relative rounded-[22px] p-[3px] transition-transform duration-500"
        style={{
          background:
            "linear-gradient(150deg,#5e6660 0%,#2f3531 38%,#232824 62%,#454c47 100%)",
          boxShadow:
            "0 22px 40px -12px rgba(26,34,28,0.42), 0 6px 14px -4px rgba(26,34,28,0.30), inset 0 1px 0 rgba(255,255,255,0.22)",
          transform: "rotateX(4deg) rotateY(-7deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* body */}
        <div
          className="rounded-[19px] px-3 pb-4 pt-3"
          style={{
            background:
              "linear-gradient(165deg,#3c423d 0%,#2b302c 46%,#242925 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          {/* earpiece */}
          <div
            className="mx-auto mb-2.5 h-[3px] w-9 rounded-full"
            style={{
              background: "linear-gradient(180deg,#171a18 0%,#3d443f 100%)",
              boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6)",
            }}
          />

          {/* screen bezel */}
          <div
            className="rounded-[7px] p-[2px]"
            style={{
              background: "linear-gradient(160deg,#141715 0%,#2e332f 100%)",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.65)",
            }}
          >
            <div
              className="relative h-[176px] overflow-hidden rounded-[5px] px-2.5 py-2"
              style={{ background: screenBg }}
            >
              {/* glass sheen */}
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    "linear-gradient(118deg,rgba(255,255,255,0.30) 0%,rgba(255,255,255,0.07) 34%,rgba(255,255,255,0) 55%)",
                }}
              />
              <div className="relative h-full">{children}</div>
            </div>
          </div>

          {/* nav cluster */}
          <div className="mt-3 flex items-center justify-between px-1">
            <div
              className="h-[13px] w-7 rounded-[3px]"
              style={{
                background: "linear-gradient(180deg,#4e554f 0%,#313632 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.16), 0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
            <div
              className="h-[26px] w-[26px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 34% 30%,#5c635d 0%,#3a403b 58%,#282d29 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.20), 0 2px 4px rgba(0,0,0,0.45)",
              }}
            />
            <div
              className="h-[13px] w-7 rounded-[3px]"
              style={{
                background: "linear-gradient(180deg,#4e554f 0%,#313632 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.16), 0 1px 2px rgba(0,0,0,0.4)",
              }}
            />
          </div>

          {/* keypad */}
          <div className="mt-2.5 grid grid-cols-3 gap-x-2 gap-y-[5px]">
            {[
              ["1", ""],
              ["2", "ABC"],
              ["3", "DEF"],
              ["4", "GHI"],
              ["5", "JKL"],
              ["6", "MNO"],
              ["7", "PQRS"],
              ["8", "TUV"],
              ["9", "WXYZ"],
              ["*", ""],
              ["0", "+"],
              ["#", ""],
            ].map(([digit, letters]) => (
              <div
                key={digit}
                className="rounded-[4px] py-[3px] text-center transition-colors duration-300"
                style={{
                  background: keypadGlow
                    ? "linear-gradient(180deg,#5a615b 0%,#3d443f 100%)"
                    : "linear-gradient(180deg,#464d48 0%,#313632 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(0,0,0,0.42)",
                }}
              >
                <div className="text-[11px] font-medium leading-none text-[#eae7e0]">
                  {digit}
                </div>
                {letters && (
                  <div className="mt-[1px] text-[6px] leading-none tracking-[0.09em] text-[#9aa39b]">
                    {letters}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
