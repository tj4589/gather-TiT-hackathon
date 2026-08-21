import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Logo } from "./components/ui/Logo";
import { BuyerHome } from "./screens/BuyerHome";
import { CreateRequest } from "./screens/CreateRequest";
import { Entry } from "./screens/Entry";
import { FarmerIntake } from "./screens/FarmerIntake";
import { ProcurementResults } from "./screens/ProcurementResults";

function Nav() {
  return (
    <header className="border-b border-neutral-200 bg-cream/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Gather home"><Logo variant="nav" height={26} /></Link>
        <div className="flex items-center gap-5">
          <span className="hidden text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400 sm:inline">Small harvest. serious supply.</span>
          <Link to="/farmer" className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-ink">Farmer call</Link>
        </div>
      </div>
    </header>
  );
}

function App() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-cream">
      {!isLanding && <Nav />}
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/buyer" element={<BuyerHome />} />
        <Route path="/request" element={<CreateRequest />} />
        <Route path="/results" element={<ProcurementResults />} />
        <Route path="/farmer" element={<FarmerIntake />} />
      </Routes>
    </div>
  );
}

export default App;
