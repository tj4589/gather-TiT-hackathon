import type { ReactNode } from "react";

/**
 * A Nokia-style feature phone. Deliberately not a smartphone —
 * the farmer's channel is a keypad and a small screen, no app.
 */
export function FeaturePhone({
  children,
  keypadGlow,
}: {
  children: ReactNode;
  keypadGlow?: boolean;
}) {
  return (
    <div className="mx-auto w-[280px] select-none">
      <div className="rounded-[28px] border border-neutral-300 bg-[#2b2f2c] p-4 pb-5 shadow-[0_4px_16px_rgba(26,34,28,0.10)]">
        {/* earpiece */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#4a504b]" />

        {/* screen */}
        <div className="relative h-[210px] overflow-hidden rounded-[6px] border border-[#4a504b] bg-[#c8d3bd] px-3 py-2.5">
          {children}
        </div>

        {/* keypad */}
        <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-2">
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
              className={`rounded-[5px] py-1 text-center transition-colors duration-300 ${
                keypadGlow ? "bg-[#4a504b]" : "bg-[#3a403b]"
              }`}
            >
              <div className="text-[13px] font-medium leading-none text-[#e8e4dc]">
                {digit}
              </div>
              {letters && (
                <div className="mt-0.5 text-[7px] leading-none tracking-[0.08em] text-[#9aa39b]">
                  {letters}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
