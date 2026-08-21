import { ArrowRight, Check, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";

export function BuyerHome() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-75px)] max-w-6xl flex-col justify-center px-6 py-12 sm:py-20">
      <div className="max-w-xl">
        <div className="mb-8 lg:hidden"><Logo variant="hero" height={28} /></div>
        <div className="mb-5 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-green-800"><Sprout size={16} strokeWidth={1.6} />Buyer workspace</div>
        <h1 className="font-display text-[44px] font-light leading-[1.05] text-ink sm:text-[60px]">Small harvests.<br /><span className="text-green">Serious supply.</span></h1>
        <p className="mt-6 max-w-md text-[17px] leading-[1.5] text-neutral-500">Tell Gather what you need. We assemble dependable bulk supply from verified farmers, even when no single farm has enough.</p>
        <Link to="/request" className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-transparent bg-green px-5 py-3 text-[15px] font-medium text-cream transition-colors duration-150 hover:bg-green-700 sm:w-auto">Request supply <ArrowRight size={17} strokeWidth={1.8} /></Link>
        <div className="mt-8 flex items-center gap-2 text-[13px] text-neutral-500"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-tint-soft text-green"><Check size={13} strokeWidth={2.2} /></span>Verified farmer network</div>
      </div>
    </main>
  );
}
