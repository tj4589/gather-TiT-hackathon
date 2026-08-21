import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../components/ui/Logo";

export function Entry() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-75px)] max-w-6xl flex-col justify-center px-6 py-12 sm:py-20">
      <Logo variant="hero" height={30} />
      <p className="mt-10 max-w-sm font-display text-[28px] font-light leading-[1.2] text-ink sm:text-[36px]">Small harvests.<br /><span className="text-green">Serious supply.</span></p>
      <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link to="/buyer" className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-transparent bg-green px-5 py-3 text-[15px] font-medium text-cream transition-colors duration-150 hover:bg-green-700 sm:w-auto">I'm a Buyer <ArrowRight size={17} strokeWidth={1.8} /></Link>
        <Link to="/farmer" className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-green bg-cream px-5 py-3 text-[15px] font-medium text-green transition-colors duration-150 hover:bg-green-tint-subtle sm:w-auto">I'm a Farmer <ArrowRight size={17} strokeWidth={1.8} /></Link>
      </div>
    </main>
  );
}
